import type { Language } from '../types';

type Dict = Record<string, { en: string; ta: string }>;

export const t: Dict = {
  'nav.landing': { en: 'Home', ta: 'முகப்பு' },
  'nav.dashboard': { en: 'Citizen Dashboard', ta: 'குடிமகர் பலகை' },
  'nav.scanner': { en: 'AI Scanner', ta: 'AI ஸ்கேனர்' },
  'nav.map': { en: 'City Map', ta: 'நகர வரைபடம்' },
  'nav.tracking': { en: 'Track Reports', ta: 'புகார்களை கண்காணிக்க' },
  'nav.priority': { en: 'Priority AI', ta: 'முன்னுரிமை AI' },
  'nav.admin': { en: 'Admin Command', ta: 'நிர்வாக மையம்' },
  'nav.assistant': { en: 'AI Assistant', ta: 'AI உதவியாளர்' },

  'app.report': { en: 'Report a Problem', ta: 'பிரச்சனையை பதிவு செய்' },
  'app.explore': { en: 'Explore City Dashboard', ta: 'நகர பலகையை பார்' },
  'app.demoMode': { en: 'Demo mode', ta: 'டெமோ பயன்முறை' },
  'app.sampleData': { en: 'Sample data', ta: 'மாதிரி தரவு' },
  'app.signIn': { en: 'Sign in', ta: 'உள்நுழை' },
  'app.signOut': { en: 'Sign out', ta: 'வெளியேறு' },
  'app.language': { en: 'Language', ta: 'மொழி' },
  'app.workspace': { en: 'Workspace', ta: 'பணியிடம்' },
  'app.demoEnvironment': { en: 'Demo environment', ta: 'டெமோ சூழல்' },
  'app.reportsStayHere': {
    en: 'Reports are stored in this browser. No agency is notified.',
    ta: 'புகார்கள் இந்த உலாவியில் சேமிக்கப்படும். எந்த அமைப்புக்கும் தெரிவிக்கப்படுவதில்லை.',
  },
  'app.askPulseward': { en: 'Ask PulseWard AI', ta: 'PulseWard AI-யிடம் கேள்' },

  'common.search': { en: 'Search', ta: 'தேடு' },
  'common.filters': { en: 'Filters', ta: 'வடிகட்டிகள்' },
  'common.category': { en: 'Category', ta: 'வகை' },
  'common.status': { en: 'Status', ta: 'நிலை' },
  'common.priority': { en: 'Priority', ta: 'முன்னுரிமை' },
  'common.location': { en: 'Location', ta: 'இடம்' },
  'common.date': { en: 'Date', ta: 'தேதி' },
  'common.all': { en: 'All', ta: 'அனைத்தும்' },
  'common.cancel': { en: 'Cancel', ta: 'ரத்து' },
  'common.save': { en: 'Save', ta: 'சேமி' },
  'common.close': { en: 'Close', ta: 'மூடு' },
  'common.viewDetails': { en: 'View details', ta: 'விவரங்களை பார்' },
  'common.noResults': { en: 'No reports match these filters.', ta: 'இந்த வடிகட்டிகளுக்கு புகார்கள் இல்லை.' },
  'common.loading': { en: 'Loading', ta: 'ஏற்றுகிறது' },
  'common.tryAgain': { en: 'Try again', ta: 'மீண்டும் முயற்சி' },
  'common.allStatuses': { en: 'All statuses', ta: 'அனைத்து நிலைகளும்' },
  'common.allCategories': { en: 'All categories', ta: 'அனைத்து வகைகளும்' },
  'common.viewAll': { en: 'View all', ta: 'அனைத்தையும் பார்' },

  /* Language coverage notice ------------------------------------------ */
  'notice.title': { en: 'Tamil coverage', ta: 'தமிழ் பயன்பாடு' },
  'notice.body': {
    en: 'Navigation, page headings and key labels switch to Tamil. Report titles, descriptions, AI output and demo seed data stay in the language they were written in.',
    ta: 'வழிசெலுத்தல், பக்க தலைப்புகள் மற்றும் முக்கிய லேபிள்கள் தமிழில் மாறும். புகார் தலைப்புகள், விவரங்கள், AI வெளியீடு மற்றும் டெமோ தரவு எழுதப்பட்ட மொழியிலேயே இருக்கும்.',
  },
  'notice.dismiss': { en: 'Dismiss', ta: 'மூடு' },
  'notice.toggleTitle': {
    en: 'Interface language — Tamil covers navigation, headings and key labels',
    ta: 'இடைமுக மொழி — தமிழ் வழிசெலுத்தல், தலைப்புகள், முக்கிய லேபிள்களை உள்ளடக்கும்',
  },

  /* Landing ------------------------------------------------------------ */
  'landing.heroHeadline': { en: 'Building Smarter Cities. Together.', ta: 'புத்திசாலி நகரங்களை உருவாக்குவோம். ஒன்றாக.' },
  'landing.heroSub': {
    en: 'PulseWard AI turns a photo of a civic problem into a structured, map-located report — then helps communities and city teams understand, prioritise and track it.',
    ta: 'PulseWard AI உங்கள் புகைப்படத்தை ஒரு தெளிவான குடிமை புகாராக மாற்றி, அதை நகர வரைபடத்தில் காட்டி, தீவிரத்தின் அடிப்படையில் முன்னுரிமை அளிக்கிறது.',
  },
  'landing.barRoad': { en: 'Road damage', ta: 'சாலை சேதம்' },
  'landing.barDrainage': { en: 'Drainage', ta: 'வடிகால்' },
  'landing.barGarbage': { en: 'Garbage', ta: 'குப்பை' },
  'landing.barStreetlights': { en: 'Streetlights', ta: 'தெரு விளக்குகள்' },
  'landing.badge': {
    en: 'AI civic intelligence · demo build for the Smart City track',
    ta: 'AI குடிமை நுண்ணறிவு · ஸ்மார்ட் சிட்டி பிரிவுக்கான டெமோ பதிப்பு',
  },
  'landing.navHow': { en: 'How it works', ta: 'இது எப்படி வேலை செய்கிறது' },
  'landing.navFeatures': { en: 'Features', ta: 'அம்சங்கள்' },
  'landing.navImpact': { en: 'Impact', ta: 'தாக்கம்' },
  'landing.navMap': { en: 'City map', ta: 'நகர வரைபடம்' },
  'landing.openDashboard': { en: 'Open dashboard', ta: 'பலகையைத் திற' },
  'landing.noKeys': { en: 'No API keys needed to demo', ta: 'டெமோவுக்கு API விசை தேவையில்லை' },
  'landing.tryCitizen': { en: 'Try the demo citizen account', ta: 'டெமோ குடிமகர் கணக்கை முயற்சி செய்' },
  'landing.explore': { en: 'Explore the platform', ta: 'தளத்தை ஆராயுங்கள்' },
  'landing.stat1': { en: 'Reports submitted (demo)', ta: 'பதிவான புகார்கள் (டெமோ)' },
  'landing.stat2': { en: 'Issues resolved (demo)', ta: 'தீர்க்கப்பட்ட பிரச்சனைகள் (டெமோ)' },
  'landing.stat3': { en: 'Civic categories', ta: 'குடிமை வகைகள்' },
  'landing.stat4': { en: 'Avg. triage time (mock)', ta: 'சராசரி பரிசீலனை நேரம் (மாதிரி)' },
  'landing.statsNote': {
    en: 'Figures above are illustrative demo metrics, not real municipal statistics.',
    ta: 'மேலே உள்ள எண்கள் விளக்க டெமோ அளவீடுகள்; உண்மையான மாநகராட்சி புள்ளிவிவரங்கள் அல்ல.',
  },
  'landing.howTitle': {
    en: 'From a single photo to a prioritised civic signal.',
    ta: 'ஒரு புகைப்படத்திலிருந்து முன்னுரிமை பெற்ற குடிமை சைகை வரை.',
  },
  'landing.howSub': {
    en: 'Four steps, all visible in the product. Nothing is hidden behind a mockup.',
    ta: 'நான்கு படிகள், அனைத்தும் தயாரிப்பில் நேரடியாகத் தெரியும். மாக்அப் பின்னால் எதுவும் மறைக்கப்படவில்லை.',
  },
  'landing.step1.title': { en: 'Capture', ta: 'படம் எடு' },
  'landing.step1.body': {
    en: 'Take a photo of the pothole, garbage pile, leak or broken light. Add a short note in English or Tamil.',
    ta: 'சாலைக் குழி, குப்பைக் குவியல், கசிவு அல்லது பழுதான விளக்கின் புகைப்படம் எடுங்கள். ஆங்கிலம் அல்லது தமிழில் சிறு குறிப்பு சேர்க்கவும்.',
  },
  'landing.step2.title': { en: 'AI analysis', ta: 'AI பரிசோதனை' },
  'landing.step2.body': {
    en: 'The vision model suggests a category, visible evidence, severity and a recommended action — labeled as an estimate.',
    ta: 'பட மாதிரி ஒரு வகை, தெரியும் ஆதாரம், தீவிரம் மற்றும் பரிந்துரைக்கப்பட்ட நடவடிக்கையை முன்மொழிகிறது — மதிப்பீடாகக் குறிக்கப்பட்டது.',
  },
  'landing.step3.title': { en: 'Priority intelligence', ta: 'முன்னுரிமை நுண்ணறிவு' },
  'landing.step3.body': {
    en: 'An explainable score weighs severity, safety context, recurring reports nearby and essential-infrastructure proximity.',
    ta: 'தீவிரம், பாதுகாப்பு சூழல், அருகிலுள்ள மீள்வரவு புகார்கள் மற்றும் அத்தியாவசிய உள்கட்டமைப்பு அருகாமையை எடைபோட்டு விளக்கக்கூடிய மதிப்பெண்.',
  },
  'landing.step4.title': { en: 'Map & track', ta: 'வரைபடம் & கண்காணிப்பு' },
  'landing.step4.body': {
    en: 'The report lands on the city map. Citizens track status; admins triage, assign and update progress.',
    ta: 'புகார் நகர வரைபடத்தில் இடம்பெறும். குடிமக்கள் நிலையைக் கண்காணிக்கலாம்; நிர்வாகிகள் பரிசீலித்து ஒதுக்கி முன்னேற்றத்தைப் பதிவு செய்வார்கள்.',
  },
  'landing.metaBuilt': { en: 'Built by', ta: 'உருவாக்கியவர்' },
  'landing.metaStack': { en: 'Stack', ta: 'தொழில்நுட்பம்' },
  'landing.metaData': { en: 'Data', ta: 'தரவு' },
  'landing.metaDataValue': {
    en: 'Demo dataset in your browser — no agency is notified',
    ta: 'உங்கள் உலாவியில் டெமோ தரவு — எந்த அமைப்புக்கும் தெரிவிக்கப்படுவதில்லை',
  },
  'landing.featuresEyebrow': { en: 'Capabilities', ta: 'திறன்கள்' },
  'landing.featuresTitle': {
    en: 'A civic operating layer for the whole city.',
    ta: 'முழு நகரத்திற்குமான குடிமை இயக்க அடுக்கு.',
  },
  'landing.seeLive': { en: 'See it live →', ta: 'நேரடியாகப் பார் →' },
  'landing.feat1.title': { en: 'Multimodal problem analysis', ta: 'பல்வகை பிரச்சனை பரிசோதனை' },
  'landing.feat1.body': {
    en: 'Structured, validated JSON from image analysis: category, evidence, severity, confidence and action.',
    ta: 'படப் பரிசோதனையிலிருந்து கட்டமைக்கப்பட்ட, சரிபார்க்கப்பட்ட JSON: வகை, ஆதாரம், தீவிரம், நம்பகத்தன்மை, நடவடிக்கை.',
  },
  'landing.feat2.title': { en: 'Explainable priority', ta: 'விளக்கக்கூடிய முன்னுரிமை' },
  'landing.feat2.body': {
    en: 'Every Low → Urgent rating shows the five factors behind it. No black-box scores.',
    ta: 'ஒவ்வொரு Low → Urgent தரப்படுத்தலும் அதற்குப் பின்னால் உள்ள ஐந்து காரணிகளைக் காட்டுகிறது. கருப்புப் பெட்டி மதிப்பெண்கள் இல்லை.',
  },
  'landing.feat3.title': { en: 'Live city map', ta: 'நேரடி நகர வரைபடம்' },
  'landing.feat3.body': {
    en: 'Leaflet + OpenStreetMap with clustering, category and status filters, and click-through report details.',
    ta: 'Leaflet + OpenStreetMap, க்ளஸ்டரிங், வகை மற்றும் நிலை வடிகட்டிகள், புகார் விவரங்களுக்கு நேரடி இணைப்பு.',
  },
  'landing.feat4.title': { en: 'Smart report drafting', ta: 'ஸ்மார்ட் புகார் வரைவு' },
  'landing.feat4.body': {
    en: 'AI analysis pre-fills a structured report you can edit, save as draft, or submit in seconds.',
    ta: 'AI பரிசோதனை கட்டமைக்கப்பட்ட புகாரை முன்கூட்டியே நிரப்புகிறது — திருத்தலாம், வரைவாகச் சேமிக்கலாம், நொடிகளில் சமர்ப்பிக்கலாம்.',
  },
  'landing.feat5.title': { en: 'Citizen + admin views', ta: 'குடிமகர் + நிர்வாகி காட்சிகள்' },
  'landing.feat5.body': {
    en: 'A friendly reporting flow for residents, and a command center with triage, assignments and hotspots.',
    ta: 'குடியிருப்பாளர்களுக்கு எளிய புகார் பாதை; நிர்வாகிகளுக்கு பரிசீலனை, ஒதுக்கீடு மற்றும் ஹாட்ஸ்பாட் மையம்.',
  },
  'landing.feat6.title': { en: 'Tamil + English', ta: 'தமிழ் + ஆங்கிலம்' },
  'landing.feat6.body': {
    en: 'Navigation, headings and key labels in Tamil, and an assistant that understands Tamil and Tanglish input. Report text is never machine-translated.',
    ta: 'வழிசெலுத்தல், தலைப்புகள், முக்கிய லேபிள்கள் தமிழில்; தமிழ் மற்றும் தங்கிலீஷ் புரியும் உதவியாளர். புகார் உரை இயந்திர மொழிபெயர்ப்பு செய்யப்படுவதில்லை.',
  },
  'landing.impactEyebrow': { en: 'Why it matters', ta: 'ஏன் முக்கியம்' },
  'landing.impactTitle': {
    en: 'Small issues compound. Visibility changes outcomes.',
    ta: 'சிறு பிரச்சனைகள் குவிகின்றன. வெளிச்சம் முடிவுகளை மாற்றுகிறது.',
  },
  'landing.impactBody': {
    en: 'A single pothole is a nuisance; fifty unreported potholes on the same stretch are a safety pattern. PulseWard AI turns scattered complaints into a shared, prioritised picture so residents and city teams argue less about what happened and more about what to fix first.',
    ta: 'ஒரு குழி தொல்லை; அதே சாலையில் ஐம்பது குழிகள் பாதுகாப்பு பிரச்சனை. PulseWard AI சிதறிய புகார்களை ஒரே முன்னுரிமை படமாக மாற்றுகிறது — என்ன நடந்தது என்பதை விட எதை முதலில் சரிசெய்வது என்பதில் கவனம் செல்லும்.',
  },
  'landing.impact1.k': { en: 'Faster triage', ta: 'விரைவான பரிசீலனை' },
  'landing.impact1.v': { en: 'Structured reports with severity and location', ta: 'தீவிரம் மற்றும் இருப்பிடத்துடன் கட்டமைக்கப்பட்ட புகார்கள்' },
  'landing.impact2.k': { en: 'Recurrence detection', ta: 'மீள்வரவு கண்டறிதல்' },
  'landing.impact2.v': { en: 'Nearby duplicates surfaced, not buried', ta: 'அருகிலுள்ள நகல்கள் மூழ்காமல் வெளிக்கொணரப்படும்' },
  'landing.impact3.k': { en: 'Safety-first weighting', ta: 'பாதுகாப்பு முதன்மை எடை' },
  'landing.impact3.v': { en: 'Schools, hospitals and night-time risk', ta: 'பள்ளிகள், மருத்துவமனைகள், இரவு நேர ஆபத்து' },
  'landing.impact4.k': { en: 'Zero-key demo', ta: 'விசை தேவையில்லா டெமோ' },
  'landing.impact4.v': { en: 'Runs end-to-end without any API credentials', ta: 'API சான்றுகள் இல்லாமல் முழுமையாக இயங்கும்' },
  'landing.panelTitle': { en: 'Illustrative municipal signal', ta: 'விளக்க நகராட்சி சைகை' },
  'landing.panelBody': {
    en: 'How much more likely an issue is to be attended when it includes a photo, a precise location and a safety context',
    ta: 'புகைப்படம், துல்லியமான இருப்பிடம் மற்றும் பாதுகாப்பு சூழல் இருந்தால் ஒரு பிரச்சனை கவனிக்கப்படும் வாய்ப்பு எத்தனை மடங்கு அதிகம்',
  },
  'landing.panelNote': { en: 'a design hypothesis, not a measured outcome.', ta: 'இது ஒரு வடிவமைப்பு கருதுகோள், அளந்த முடிவு அல்ல.' },
  'landing.panelDisclaimer': {
    en: 'PulseWard AI is a hackathon prototype. It does not claim to send reports to real departments or to verify danger. Demo data is always labelled.',
    ta: 'PulseWard AI ஒரு ஹேக்கத்தான் முன்மாதிரி. உண்மையான துறைகளுக்கு புகார்களை அனுப்புகிறது என்றோ ஆபத்தை உறுதிப்படுத்துகிறது என்றோ கூறவில்லை. டெமோ தரவு எப்போதும் குறிக்கப்படும்.',
  },
  'landing.ctaTitle1': { en: 'Your street already has the evidence.', ta: 'உங்கள் தெருவில் ஆதாரம் ஏற்கனவே உள்ளது.' },
  'landing.ctaTitle2': { en: 'Give it a voice.', ta: 'அதற்கு குரல் கொடுங்கள்.' },
  'landing.ctaBody': {
    en: 'Upload one photo and watch the full pipeline — analysis, priority, map placement, tracking and admin triage.',
    ta: 'ஒரு புகைப்படத்தைப் பதிவேற்றி முழு பாதையையும் பாருங்கள் — பரிசோதனை, முன்னுரிமை, வரைபடம், கண்காணிப்பு, நிர்வாக பரிசீலனை.',
  },
  'landing.ctaScanner': { en: 'Open the AI Scanner', ta: 'AI ஸ்கேனரைத் திற' },
  'landing.ctaAccounts': { en: 'Explore demo accounts', ta: 'டெமோ கணக்குகளைப் பார்' },
  'landing.footerNote': {
    en: 'Smart-city civic intelligence. Demo environment — reports stay in your browser and no agency is notified.',
    ta: 'ஸ்மார்ட் சிட்டி குடிமை நுண்ணறிவு. டெமோ சூழல் — புகார்கள் உங்கள் உலாவியிலேயே இருக்கும், எந்த அமைப்புக்கும் தெரிவிக்கப்படுவதில்லை.',
  },
  'landing.footerCredit': { en: 'Designed & built by Vishwa S.', ta: 'வடிவமைத்து உருவாக்கியவர் Vishwa S.' },
  'landing.footerAdmin': { en: 'Admin', ta: 'நிர்வாகம்' },
  'landing.footerMapData': { en: 'Map data', ta: 'வரைபட தரவு' },

  /* Dashboard ---------------------------------------------------------- */
  'dash.eyebrow': { en: 'Civic overview', ta: 'குடிமை மேலோட்டம்' },
  'dash.hello': { en: 'Good to see you, {name}.', ta: 'மீண்டும் வருக, {name}.' },
  'dash.pulse': { en: 'City pulse, right now.', ta: 'நகர துடிப்பு, இப்போது.' },
  'dash.sub': {
    en: '{open} open issues across Chennai in this demo workspace — {urgent} flagged urgent by AI.',
    ta: 'இந்த டெமோ பணியிடத்தில் சென்னை முழுவதும் {open} திறந்த பிரச்சனைகள் — {urgent} AI ஆல் அவசரமாகக் குறிக்கப்பட்டவை.',
  },
  'dash.newScan': { en: 'New AI scan', ta: 'புதிய AI ஸ்கேன்' },
  'dash.total': { en: 'Total reports', ta: 'மொத்த புகார்கள்' },
  'dash.open': { en: 'Open reports', ta: 'திறந்த புகார்கள்' },
  'dash.review': { en: 'Under review', ta: 'பரிசீலனையில்' },
  'dash.resolved': { en: 'Resolved', ta: 'தீர்க்கப்பட்டவை' },
  'dash.samples': { en: '{n} sample reports included', ta: '{n} மாதிரி புகார்கள் அடங்கும்' },
  'dash.notResolved': { en: 'Not yet resolved', ta: 'இன்னும் தீர்க்கப்படவில்லை' },
  'dash.awaitingTriage': { en: 'Awaiting triage decision', ta: 'பரிசீலனை முடிவுக்காகக் காத்திருக்கிறது' },
  'dash.rate': { en: '{n}% resolution rate (demo)', ta: '{n}% தீர்வு விகிதம் (டெமோ)' },
  'dash.volume': { en: 'Report volume', ta: 'புகார் அளவு' },
  'dash.volumeSub': { en: 'Last 14 days · reported vs resolved', ta: 'கடந்த 14 நாட்கள் · பதிவு vs தீர்க்கப்பட்டவை' },
  'dash.reported': { en: 'Reported', ta: 'பதிவு' },
  'dash.categoryMix': { en: 'Category mix', ta: 'வகை கலவை' },
  'dash.categoryMixSub': { en: 'Where issues concentrate', ta: 'பிரச்சனைகள் எங்கு குவிகின்றன' },
  'dash.topCategory': { en: 'Top category:', ta: 'முதன்மை வகை:' },
  'dash.reportsCount': { en: '{n} reports', ta: '{n} புகார்கள்' },
  'dash.recent': { en: 'Recent activity', ta: 'சமீபத்திய செயல்பாடு' },
  'dash.recentSub': { en: 'Newest reports across the city', ta: 'நகரம் முழுவதும் புதிய புகார்கள்' },
  'dash.impact': { en: 'Community impact', ta: 'சமூக தாக்கம்' },
  'dash.citizens': { en: 'Citizens engaged', ta: 'பங்கேற்ற குடிமக்கள்' },
  'dash.urgentOpen': { en: 'Urgent open', ta: 'திறந்த அவசரம்' },
  'dash.resolvedDemo': { en: 'Resolved (demo)', ta: 'தீர்க்கப்பட்டது (டெமோ)' },
  'dash.areas': { en: 'Areas covered', ta: 'உள்ளடங்கிய பகுதிகள்' },
  'dash.mine': { en: 'My reports', ta: 'எனது புகார்கள்' },
  'dash.recentCount': { en: '{n} recent', ta: '{n} சமீபத்திய' },
  'dash.emptyMine': { en: "You haven't submitted a report in this session.", ta: 'இந்த அமர்வில் நீங்கள் இன்னும் புகார் சமர்ப்பிக்கவில்லை.' },
  'dash.firstScan': { en: 'Run your first AI scan →', ta: 'உங்கள் முதல் AI ஸ்கேனை இயக்கு →' },
  'dash.statusDist': { en: 'Status distribution', ta: 'நிலை பரவல்' },
  'dash.priorityRadar': { en: 'Priority radar', ta: 'முன்னுரிமை ரேடார்' },
  'dash.priorityRadarSub': { en: 'Highest estimated-risk open reports', ta: 'அதிக மதிப்பிடப்பட்ட ஆபத்துள்ள திறந்த புகார்கள்' },
  'dash.openPriority': { en: 'Open Priority AI', ta: 'முன்னுரிமை AI திற' },
  'dash.footnote': {
    en: 'All metrics are computed from the demo dataset in this browser. Sample reports are tagged, and no data is transmitted to a municipality.',
    ta: 'அனைத்து அளவீடுகளும் இந்த உலாவியில் உள்ள டெமோ தரவிலிருந்து கணக்கிடப்படுகின்றன. மாதிரி புகார்கள் குறிக்கப்படுகின்றன; எந்த தரவும் மாநகராட்சிக்கு அனுப்பப்படவில்லை.',
  },

  /* Page headings ------------------------------------------------------ */
  'scan.eyebrow': { en: 'Step 1 · capture', ta: 'படி 1 · படமெடு' },
  'scan.title': { en: 'AI Problem Scanner', ta: 'AI பிரச்சனை ஸ்கேனர்' },
  'scan.description': {
    en: 'Upload a photo of a civic problem. The vision model suggests a category, visible evidence, severity and a recommended action. Everything is an estimate you can correct in the next step.',
    ta: 'குடிமை பிரச்சனையின் புகைப்படத்தைப் பதிவேற்றுங்கள். பட மாதிரி வகை, தெரியும் ஆதாரம், தீவிரம் மற்றும் பரிந்துரைக்கப்பட்ட நடவடிக்கையை முன்மொழிகிறது. அனைத்தும் மதிப்பீடு — அடுத்த படியில் திருத்தலாம்.',
  },
  'composer.eyebrow': { en: 'Step 2 · structure', ta: 'படி 2 · வடிவமைப்பு' },
  'composer.title': { en: 'Smart Report Generator', ta: 'ஸ்மார்ட் புகார் உருவாக்கி' },
  'composer.description': {
    en: 'Edit anything before submitting. AI suggestions are estimates — correct them where your own eyes disagree.',
    ta: 'சமர்ப்பிக்கும் முன் எதையும் திருத்தலாம். AI பரிந்துரைகள் மதிப்பீடுகள் — உங்கள் கண்ணுக்குத் தெரிவதற்கு மாறாக இருந்தால் திருத்துங்கள்.',
  },
  'track.eyebrow': { en: 'Accountability', ta: 'பொறுப்புணர்வு' },
  'track.title': { en: 'Report Tracking', ta: 'புகார் கண்காணிப்பு' },
  'track.description': {
    en: 'Follow each report through the civic workflow. Status updates here are demo actions — they do not reflect real municipal progress.',
    ta: 'ஒவ்வொரு புகாரையும் குடிமை பணிப்பாதையில் பின்தொடருங்கள். இங்குள்ள நிலை மாற்றங்கள் டெமோ செயல்கள் — உண்மையான மாநகராட்சி முன்னேற்றத்தைக் காட்டுவதில்லை.',
  },
  'map.eyebrow': { en: 'Geospatial view', ta: 'புவியியல் காட்சி' },
  'map.title': { en: 'Interactive City Map', ta: 'ஊடாடும் நகர வரைபடம்' },
  'map.description': {
    en: 'Every report on an OpenStreetMap base. Markers are coloured by category, urgent open issues pulse, and nearby reports cluster as you zoom out.',
    ta: 'ஒவ்வொரு புகாரும் OpenStreetMap அடிப்படையில். குறிகள் வகை வண்ணத்தில், திறந்த அவசர புகார்கள் துடிக்கும், வெளியே ஜூம் செய்யும்போது அருகிலுள்ளவை க்ளஸ்டராகும்.',
  },
  'priority.eyebrow': { en: 'Explainable scoring', ta: 'விளக்கக்கூடிய மதிப்பீடு' },
  'priority.title': { en: 'AI Priority Intelligence', ta: 'AI முன்னுரிமை நுண்ணறிவு' },
  'priority.description': {
    en: 'A transparent, deterministic model that turns report signals into a Low → Urgent estimate — with the reasoning shown, not hidden.',
    ta: 'புகார் சைகைகளை Low → Urgent மதிப்பீடாக மாற்றும் வெளிப்படையான, நிலையான மாதிரி — காரணங்கள் மறைக்கப்படாமல் காட்டப்படும்.',
  },
  'admin.eyebrow': { en: 'Municipal operations (demo)', ta: 'மாநகராட்சி செயல்பாடுகள் (டெமோ)' },
  'admin.title': { en: 'Admin Command Center', ta: 'நிர்வாக மையம்' },
  'admin.description': {
    en: "Triage every report, assign demo departments, move statuses and read the city's issue patterns. All actions are simulated in this browser.",
    ta: 'ஒவ்வொரு புகாரையும் பரிசீலித்து, டெமோ துறைகளை ஒதுக்கி, நிலைகளை மாற்றி, நகரத்தின் பிரச்சனை முறைகளைப் படியுங்கள். அனைத்து செயல்களும் இந்த உலாவியில் உருவகப்படுத்தப்படுகின்றன.',
  },
  'assistant.eyebrow': { en: 'Conversational civic help', ta: 'உரையாடல் குடிமை உதவி' },
  'assistant.pageTitle': { en: 'PulseWard AI Assistant', ta: 'PulseWard AI உதவியாளர்' },
  'assistant.description': {
    en: "Natural-language help for residents and staff. Supports English, Tamil and Tanglish input, and knows this dashboard's report data.",
    ta: 'குடியிருப்பாளர்களுக்கும் பணியாளர்களுக்கும் இயற்கை மொழி உதவி. ஆங்கிலம், தமிழ், தங்கிலீஷ் உள்ளீடுகளை ஆதரிக்கிறது; இந்த பலகையின் புகார் தரவை அறிந்துள்ளது.',
  },
};

export function translate(key: string, lang: Language): string {
  const entry = t[key];
  if (!entry) return key;
  return entry[lang] ?? entry.en;
}

export function translateWith(key: string, lang: Language, vars: Record<string, string | number>): string {
  return translate(key, lang).replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}
