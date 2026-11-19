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

  'landing.headline': { en: 'Building Smarter Cities. Together.', ta: 'புத்திசாலி நகரங்களை உருவாக்குவோம். ஒன்றாக.' },
  'landing.reportsSubmitted': { en: 'Reports submitted', ta: 'பதிவான புகார்கள்' },
  'landing.resolved': { en: 'Issues resolved', ta: 'தீர்க்கப்பட்ட பிரச்சனைகள்' },
  'landing.categories': { en: 'Civic categories', ta: 'குடிமை வகைகள்' },
  'landing.avgResponse': { en: 'Avg. triage time', ta: 'சராசரி பரிசீலனை நேரம்' },

  'dashboard.total': { en: 'Total reports', ta: 'மொத்த புகார்கள்' },
  'dashboard.open': { en: 'Open reports', ta: 'திறந்த புகார்கள்' },
  'dashboard.review': { en: 'Under review', ta: 'பரிசீலனையில்' },
  'dashboard.resolved': { en: 'Resolved', ta: 'தீர்க்கப்பட்டவை' },
  'dashboard.mine': { en: 'My reports', ta: 'எனது புகார்கள்' },
  'dashboard.recent': { en: 'Recent activity', ta: 'சமீபத்திய செயல்பாடு' },
  'dashboard.impact': { en: 'Community impact', ta: 'சமூக தாக்கம்' },

  'scanner.title': { en: 'AI Problem Scanner', ta: 'AI பிரச்சனை ஸ்கேனர்' },
  'scanner.upload': { en: 'Upload a civic problem photo', ta: 'பிரச்சனை புகைப்படத்தை பதிவேற்று' },
  'scanner.analyze': { en: 'Analyze with AI', ta: 'AI மூலம் பரிசோதி' },
  'scanner.replace': { en: 'Replace image', ta: 'படத்தை மாற்று' },
  'scanner.remove': { en: 'Remove', ta: 'நீக்கு' },

  'assistant.title': { en: 'PulseWard Assistant', ta: 'PulseWard உதவியாளர்' },
  'assistant.placeholder': { en: 'Ask about civic issues, reports or the dashboard…', ta: 'குடிமை பிரச்சனைகள், புகார்கள் பற்றி கேளுங்கள்…' },
  'assistant.clear': { en: 'Clear chat', ta: 'அரட்டையை அழி' },
};

export function translate(key: string, lang: Language): string {
  const entry = t[key];
  if (!entry) return key;
  return entry[lang] ?? entry.en;
}
