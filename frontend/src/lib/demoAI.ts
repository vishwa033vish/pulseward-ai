import type { AiAnalysis, Category, ChatMessage, Language, Report, Severity } from '../types';
import { CATEGORIES, CATEGORY_MAP, priorityOrder } from './categories';
import { PRIORITY_DISCLAIMER } from './priority';

/** ---------------------------------------------------------------- *
 *  Demo vision analyzer
 *  ----------------------------------------------------------------
 *  When the FastAPI + Gemini backend is not configured, this local
 *  heuristic inspects the actual uploaded pixels (brightness, contrast,
 *  edge density, colour saturation) plus the filename for hints, and
 *  produces a clearly-labelled *estimate*. It never claims certainty.
 *  ---------------------------------------------------------------- */

export interface PixelStats {
  width: number;
  height: number;
  brightness: number;
  contrast: number;
  edgeDensity: number;
  saturation: number;
  greyRatio: number;
  warmRatio: number;
  darkRatio: number;
  greenRatio: number;
  blueRatio: number;
}

const MAX_ANALYSIS_DIMENSION = 96;

export async function imageToStats(dataUrl: string): Promise<PixelStats | null> {
  try {
    const img = await loadImage(dataUrl);
    const scale = Math.min(1, MAX_ANALYSIS_DIMENSION / Math.max(img.width, img.height));
    const w = Math.max(8, Math.round(img.width * scale));
    const h = Math.max(8, Math.round(img.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);

    let sum = 0;
    let sumSq = 0;
    let satSum = 0;
    let grey = 0;
    let warm = 0;
    let dark = 0;
    let green = 0;
    let blue = 0;
    const lum: number[] = [];

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      lum.push(l);
      sum += l;
      sumSq += l * l;
      satSum += max === 0 ? 0 : (max - min) / max;
      if (max - min < 0.08) grey++;
      if (r > g + 0.08 && r > b + 0.05) warm++;
      if (l < 0.22) dark++;
      if (g > r + 0.05 && g > b + 0.02) green++;
      if (b > r + 0.06 && b > g + 0.02) blue++;
    }

    const count = data.length / 4;
    const mean = sum / count;
    const variance = Math.max(0, sumSq / count - mean * mean);

    // Sobel-lite horizontal gradient density
    let edges = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 1; x < w; x++) {
        const idx = y * w + x;
        if (Math.abs(lum[idx] - lum[idx - 1]) > 0.16) edges++;
      }
    }

    return {
      width: img.width,
      height: img.height,
      brightness: mean,
      contrast: Math.sqrt(variance),
      edgeDensity: edges / Math.max(1, (w - 1) * h),
      saturation: satSum / count,
      greyRatio: grey / count,
      warmRatio: warm / count,
      darkRatio: dark / count,
      greenRatio: green / count,
      blueRatio: blue / count,
    };
  } catch {
    return null;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const KEYWORD_HINTS: Record<Category, string[]> = {
  road_damage: ['pothole', 'road', 'crack', 'asphalt', 'street', 'சாலை', 'பள்ளம்'],
  garbage: ['garbage', 'trash', 'waste', 'bin', 'dump', 'குப்பை'],
  water_leak: ['water', 'leak', 'pipe', 'tap', 'நீர்', 'கசிவு'],
  streetlight: ['light', 'lamp', 'pole', 'dark', 'விளக்கம்', 'விளக்கு'],
  drainage: ['drain', 'sewer', 'manhole', 'flood', 'வடிகால்'],
  infrastructure: ['wall', 'bench', 'bridge', 'sign', 'structure'],
};

function pickCategory(stats: PixelStats, filename: string): { category: Category; reason: string } {
  const name = filename.toLowerCase();
  for (const cat of CATEGORIES) {
    const hit = KEYWORD_HINTS[cat.id].find((k) => name.includes(k.toLowerCase()));
    if (hit) {
      return {
        category: cat.id,
        reason: `The filename mentions "${hit}", which guided the category guess.`,
      };
    }
  }

  // Heuristic fallback based on image character
  if (stats.darkRatio > 0.45 && stats.saturation < 0.22) {
    return {
      category: 'road_damage',
      reason: 'Large dark, low-saturation surface area with texture is consistent with asphalt damage.',
    };
  }
  if (stats.greenRatio > 0.3 && stats.contrast > 0.16) {
    return {
      category: 'infrastructure',
      reason: 'A vegetated environment with mixed structures was detected; public infrastructure is the closest match.',
    };
  }
  if (stats.blueRatio > 0.28 && stats.brightness > 0.42) {
    return {
      category: 'water_leak',
      reason: 'A bright, blue-dominant reflective surface is consistent with standing or flowing water.',
    };
  }
  if (stats.saturation > 0.34 && stats.contrast > 0.2) {
    return {
      category: 'garbage',
      reason: 'High colour variance and dense clutter patterns often correspond to accumulated waste.',
    };
  }
  if (stats.darkRatio > 0.55 && stats.brightness < 0.3) {
    return {
      category: 'streetlight',
      reason: 'The frame is mostly low-light, which can indicate an unlit street area.',
    };
  }
  return {
    category: 'road_damage',
    reason: 'No strong visual signal was detected, so the most common civic category was used as a starting guess.',
  };
}

function severityFrom(stats: PixelStats): Severity {
  const damageSignal = stats.edgeDensity * 1.5 + (1 - stats.brightness) * 0.6 + stats.contrast;
  if (damageSignal > 1.25) return 'Severe';
  if (damageSignal > 0.9) return 'Moderate';
  if (damageSignal > 0.65) return 'Low';
  return 'Low';
}

export async function demoAnalyzeImage(
  file: File,
  dataUrl: string,
): Promise<AiAnalysis> {
  const stats = await imageToStats(dataUrl);
  // Small artificial delay so the loading state is meaningful in the demo.
  await new Promise((r) => setTimeout(r, 750));

  const fallbackStats: PixelStats = {
    width: 0,
    height: 0,
    brightness: 0.42,
    contrast: 0.18,
    edgeDensity: 0.12,
    saturation: 0.25,
    greyRatio: 0.5,
    warmRatio: 0.1,
    darkRatio: 0.4,
    greenRatio: 0.1,
    blueRatio: 0.1,
  };
  const s = stats ?? fallbackStats;
  const { category, reason } = pickCategory(s, file.name);
  const meta = CATEGORY_MAP[category];
  const severity = severityFrom(s);

  const evidence: string[] = [];
  if (stats) {
    evidence.push(
      `Framing ${s.width}×${s.height}px, mean brightness ${(s.brightness * 100).toFixed(0)}% with ${(s.contrast * 100).toFixed(0)}% tonal spread.`,
    );
    evidence.push(
      `Surface texture: ${(s.edgeDensity * 100).toFixed(1)}% edge density with ${(s.saturation * 100).toFixed(0)}% average saturation.`,
    );
    evidence.push(
      `Region mix: ${(s.darkRatio * 100).toFixed(0)}% shadow, ${(s.greyRatio * 100).toFixed(0)}% neutral, ${(s.blueRatio * 100).toFixed(0)}% blue-dominant.`,
    );
  } else {
    evidence.push('The image could not be sampled in this browser; assessment is based on metadata only.');
  }

  const priority =
    severity === 'Critical' ? 'Urgent' : severity === 'Severe' ? 'High' : severity === 'Moderate' ? 'Medium' : 'Low';

  const descriptions: Record<Category, string> = {
    road_damage:
      'Visible road-surface irregularity that may indicate a pothole, crack or failed patch. The surrounding surface appears worn.',
    garbage:
      'Accumulated loose material consistent with uncollected waste. Debris appears to extend beyond a designated bin area.',
    water_leak:
      'A reflective, water-like region that may indicate a leaking pipe or standing water. The source is not visible in the frame.',
    streetlight:
      'Low-light scene with a street fixture in frame. It is not possible to confirm from the image alone whether the lamp is faulty.',
    drainage:
      'Ground-level opening or channel consistent with a drain. Blockage or overflow cannot be confirmed visually.',
    infrastructure:
      'Damage to a public structure or civic asset. The exact structural condition needs an on-site inspection.',
  };

  return {
    category,
    description: descriptions[category],
    evidence: [reason, ...evidence],
    severity,
    suggestedPriority: priority,
    recommendedAction: `Escalate to ${meta.department} for an on-site inspection and maintenance assessment.`,
    confidence: stats ? 0.46 + Math.min(0.18, s.edgeDensity) : 0.35,
    isEstimate: true,
    source: { engine: 'demo', model: 'pulseward-local-heuristic' },
    disclaimer:
      'Demo analyzer: this estimate is derived from local image statistics, not a verified model assessment. Confirm the category before submitting.',
    createdAt: new Date().toISOString(),
  };
}

/** ---------------------------------------------------------------- *
 *  Local bilingual assistant (fallback when backend AI is offline)
 *  ---------------------------------------------------------------- */

const hasTamil = (text: string) => /[\u0B80-\u0BFF]/.test(text);

interface AssistantContext {
  reports: Report[];
  language: Language;
}

export function demoAssistantReply(
  message: string,
  history: ChatMessage[],
  ctx: AssistantContext,
): string {
  const q = message.toLowerCase().trim();
  const lang: Language = hasTamil(message) || /tanglish|tamil/.test(q) ? 'ta' : ctx.language;
  const ta = lang === 'ta';
  const reports = ctx.reports;
  const sample = reports.filter((r) => r.is_sample);
  const open = reports.filter((r) => r.status !== 'Resolved');
  const urgent = reports.filter((r) => r.priority === 'Urgent' && r.status !== 'Resolved');
  const resolved = reports.filter((r) => r.status === 'Resolved');

  const catCount = new Map<string, number>();
  reports.forEach((r) => catCount.set(r.category, (catCount.get(r.category) ?? 0) + 1));
  const topCat = [...catCount.entries()].sort((a, b) => b[1] - a[1])[0];

  const wrap = (en: string, taText: string) => (ta ? taText : en);

  if (/^(hi|hello|hey|vanakkam|வணக்கம்)/.test(q)) {
    return wrap(
      `Hello! I'm the PulseWard assistant. I can explain civic issues, walk you through reporting with a photo, summarise current reports, or explain how priority is estimated. Currently there are ${open.length} open reports in this demo workspace.`,
      `வணக்கம்! நான் PulseWard உதவியாளர். குடிமை பிரச்சனைகளை விளக்கவும், புகைப்படத்துடன் புகார் அளிக்கவும், தற்போதைய புகார்களை சுருக்கவும், முன்னுரிமை எவ்வாறு கணக்கிடப்படுகிறது என்பதை விளக்கவும் முடியும். இந்த டெமோவில் ${open.length} திறந்த புகார்கள் உள்ளன.`,
    );
  }

  if (/how.*(report|submit)|report.*how|புகார்.*எப்படி|எப்படி.*புகார்/.test(q)) {
    return wrap(
      `Reporting takes four steps:\n1. Open **AI Scanner** and upload a clear photo of the problem.\n2. Run **Analyze** — you'll get a suggested category, severity and priority (marked as an estimate).\n3. The Smart Report Generator opens prefilled: adjust the title, description, category and location. You can pick the location on the map.\n4. Submit. You'll receive a report ID you can track under **Track Reports**.\n\nIn demo mode the submission is stored locally and clearly labelled as demo — it is not sent to a government department.`,
      `புகார் அளிக்க 4 படிகள்:\n1. **AI ஸ்கேனர்** திறந்து பிரச்சனையின் தெளிவான புகைப்படத்தை பதிவேற்றுங்கள்.\n2. **பரிசோதி** என்பதை அழுத்துங்கள் — வகை, தீவிரம், முன்னுரிமை பரிந்துரை (மதிப்பீடு என குறிக்கப்படும்) கிடைக்கும்.\n3. ஸ்மார்ட் புகார் படிவம் தானாக நிரம்பும்: தலைப்பு, விவரம், வகை, இடத்தை சரிசெய்யலாம். வரைபடத்தில் இடத்தை தேர்ந்தெடுக்கலாம்.\n4. சமர்ப்பிக்கவும். **புகார்களை கண்காணிக்க** பக்கத்தில் கண்காணிக்கக்கூடிய புகார் ID கிடைக்கும்.\n\nடெமோ பயன்முறையில் புகார் உங்கள் சாதனத்தில் மட்டுமே சேமிக்கப்படும்; அரசு துறைக்கு அனுப்பப்படாது.`,
    );
  }

  if (/summar|overview|status of|சுருக்க|நிலை என்ன/.test(q)) {
    const lines = [...catCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([c, n]) => `• ${CATEGORY_MAP[c as keyof typeof CATEGORY_MAP].label}: ${n}`)
      .join('\n');
    return wrap(
      `Here's the current demo snapshot:\n• Total reports: **${reports.length}** (${sample.length} sample)\n• Open: **${open.length}** · Resolved: **${resolved.length}** · Urgent open: **${urgent.length}**\n\nTop categories:\n${lines}\n\n${
        urgent[0]
          ? `The most urgent open item is "${urgent[0].title}" at ${urgent[0].area}.`
          : 'There are no urgent open items right now.'
      }`,
      `தற்போதைய டெமோ நிலை:\n• மொத்த புகார்கள்: **${reports.length}** (${sample.length} மாதிரி)\n• திறந்தவை: **${open.length}** · தீர்க்கப்பட்டவை: **${resolved.length}** · அவசர திறந்தவை: **${urgent.length}**\n\nமுக்கிய வகைகள்:\n${lines}\n\n${
        urgent[0]
          ? `மிக அவசரமானது: "${urgent[0].title}" — ${urgent[0].area}.`
          : 'இப்போது அவசர புகார்கள் இல்லை.'
      }`,
    );
  }

  if (/priorit|urgent|score|முன்னுரிமை|அவசர/.test(q)) {
    return wrap(
      `Priority is a transparent estimate on a 0–100 scale, produced from five signals:\n• Category baseline risk (drainage and roads weigh highest)\n• Visible severity from the image analysis\n• Public-safety context in the description (schools, night, accidents)\n• Number of similar reports within ~750 m\n• Essential-infrastructure proximity\n\nScores map to Low (<40), Medium (40–61), High (62–79) and Urgent (80+). Open **Priority AI** to see each factor broken down for a report. This is not a verified danger assessment.`,
      `முன்னுரிமை என்பது 0–100 அளவில் ஒரு வெளிப்படையான மதிப்பீடு. ஐந்து காரணிகள்:\n• வகையின் அடிப்படை ஆபத்து (வடிகால், சாலைகள் அதிக எடை)\n• படத்திலிருந்து கணக்கிடப்பட்ட தீவிரம்\n• விவரத்தில் உள்ள பாதுகாப்பு சூழல் (பள்ளி, இரவு, விபத்து)\n• ~750 மீட்டருக்குள் ஒரே மாதிரியான புகார்கள்\n• அத்தியாவசிய உட்கட்டமைப்பு அருகாமை\n\nமதிப்பெண்: குறைவு (<40), நடுத்தரம் (40–61), அதிகம் (62–79), அவசரம் (80+). இது உண்மையான ஆபத்து சரிபார்ப்பு அல்ல.`,
    );
  }

  if (/pothole|road|சாலை|பள்ளம்/.test(q)) {
    return wrap(
      `Road damage like potholes is one of the highest-volume civic issues. For a strong report: photograph the defect with something for scale, note the nearest landmark, and mention night-time or two-wheeler risk if relevant — that context legitimately raises the estimated priority. In this demo, the road category is currently the ${
        reports.filter((r) => r.category === 'road_damage').length
      }-report group.`,
      `சாலை பள்ளம் போன்ற சேதங்கள் அதிகம் பதிவாகும் குடிமை பிரச்சனைகள். நல்ல புகாருக்கு: அளவுக்கு ஒரு பொருளுடன் படம் எடுங்கள், அருகிலுள்ள அடையாளத்தை குறிப்பிடுங்கள், இரவு/இருசக்கர வாகன ஆபத்தை குறிப்பிடுங்கள். இந்த டெமோவில் சாலை பிரச்சனைகள் ${reports.filter((r) => r.category === 'road_damage').length} உள்ளன.`,
    );
  }

  if (/garbage|waste|குப்பை/.test(q)) {
    return wrap(
      `For garbage complaints, include how long waste has been uncollected, whether it blocks a footpath, and any odour or mosquito concerns. Those details route more accurately to Solid Waste Management and can raise priority when public health is affected.`,
      `குப்பை புகாருக்கு: எத்தனை நாட்களாக அள்ளப்படவில்லை, நடைபாதையை மறைக்கிறதா, துர்நாற்றம்/கொசு பிரச்சனை உள்ளதா என்பதை குறிப்பிடுங்கள். இது திடக்கழிவு துறைக்கு சரியாக செல்ல உதவும்.`,
    );
  }

  if (/water|leak|நீர்|கசிவு/.test(q)) {
    return wrap(
      `Water leak reports should mention whether it's drinking water, how long it has been flowing, and whether it is damaging the road. If it is near a school or hospital, say so — essential-infrastructure proximity is one of the priority inputs.`,
      `நீர் கசிவு புகாரில்: குடிநீரா, எவ்வளவு நேரமாக ஓடுகிறது, சாலை சேதமாகிறதா என்பதை கூறுங்கள். பள்ளி/மருத்துவமனை அருகில் இருந்தால் குறிப்பிடுங்கள்.`,
    );
  }

  if (/streetlight|light|dark|விளக்கு|இருள்/.test(q)) {
    return wrap(
      `Streetlight reports are strongest with the pole number (usually printed on it), the stretch affected, and who is impacted after dark. Night-time safety context increases the estimated priority.`,
      `தெரு விளக்கு புகாரில் கம்பி எண், பாதிக்கப்பட்ட தூரம், இரவில் யார் பாதிக்கப்படுகிறார்கள் என்பதை கூறுங்கள். இரவு பாதுகாப்பு சூழல் முன்னுரிமையை உயர்த்தும்.`,
    );
  }

  if (/admin|dashboard|command|நிர்வாக|பலகை/.test(q)) {
    return wrap(
      `The Admin Command Center lets an administrator search and filter every report, open details, update status through the workflow (Submitted → Under Review → Assigned → In Progress → Resolved), assign a demo department, and see hotspots and recurrence analytics. Admin actions here are demo-only and do not notify any real department.`,
      `நிர்வாக மையத்தில் அனைத்து புகார்களையும் தேடி வடிகட்டலாம், விவரங்களை பார்க்கலாம், நிலையை மாற்றலாம் (சமர்ப்பிப்பு → பரிசீலனை → ஒதுக்கீடு → செயலில் → தீர்க்கப்பட்டது), டெமோ துறைக்கு ஒதுக்கலாம், ஹாட்ஸ்பாட் பகுப்பாய்வை பார்க்கலாம். இவை அனைத்தும் டெமோ மட்டுமே; உண்மையான துறைக்கு அறிவிப்பு செல்லாது.`,
    );
  }

  if (/thank|நன்றி/.test(q)) {
    return wrap(
      'Happy to help. If you want, I can summarise the open urgent reports or walk through submitting your first report.',
      'மகிழ்ச்சி. விரும்பினால் அவசர திறந்த புகார்களை சுருக்கலாம் அல்லது முதல் புகாரை பதிவு செய்வதை விளக்கலாம்.',
    );
  }

  if (/demo|sample|real|government|அரசு|உண்மை/.test(q)) {
    return wrap(
      `This workspace runs in demo mode: sample reports (${sample.length}) are clearly tagged, and reports you create are stored in this browser only. Nothing is transmitted to a real municipality, and no status here reflects real-world resolution. To go live you connect Supabase + the FastAPI backend and set a Gemini API key server-side.`,
      `இந்த பணியிடம் டெமோ பயன்முறையில் உள்ளது: மாதிரி புகார்கள் (${sample.length}) தெளிவாக குறிக்கப்பட்டுள்ளன, நீங்கள் உருவாக்கும் புகார்கள் இந்த உலாவியில் மட்டுமே சேமிக்கப்படும். உண்மையான நகராட்சிக்கு எதுவும் அனுப்பப்படாது. நேரடி பயன்பாட்டுக்கு Supabase + FastAPI backend மற்றும் சர்வர் பக்க Gemini API key தேவை.`,
    );
  }

  if (/who are you|what can you do|உங்களை|என்ன செய்ய/.test(q)) {
    return wrap(
      `I'm the PulseWard assistant — a civic-tech helper for this dashboard. I can explain issues, guide reporting, summarise reports and explain priority scoring, in English or Tamil. I work offline with a rule-based fallback; with the Gemini backend configured I answer more flexibly.`,
      `நான் PulseWard உதவியாளர். பிரச்சனைகளை விளக்க, புகார் அளிக்க வழிகாட்ட, புகார்களை சுருக்க, முன்னுரிமையை விளக்க உதவுவேன் — ஆங்கிலம் அல்லது தமிழில்.`,
    );
  }

  const lastUser = history.filter((m) => m.role === 'user').at(-2)?.content;
  return wrap(
    `I don't have a specific answer for that in offline demo mode.${
      lastUser ? '' : ''
    } I can help with: how to report a problem, summarising current reports, explaining priority, or guidance for potholes, garbage, water leaks, streetlights and drainage. For a broader answer, connect the FastAPI backend with a Gemini API key.\n\nYou asked: "${message.slice(0, 140)}"`,
    `இந்த கேள்விக்கு ஆஃப்லைன் டெமோவில் துல்லியமான பதில் இல்லை. உதவக்கூடியவை: புகார் அளிப்பது எப்படி, தற்போதைய புகார்களின் சுருக்கம், முன்னுரிமை விளக்கம், சாலை/குப்பை/நீர்/விளக்கு/வடிகால் வழிகாட்டுதல். முழுமையான பதிலுக்கு Gemini backend இணைக்கவும்.\n\nநீங்கள் கேட்டது: "${message.slice(0, 140)}"`,
  );
}

export function priorityRank(p: string): number {
  return priorityOrder.indexOf(p as (typeof priorityOrder)[number]);
}
