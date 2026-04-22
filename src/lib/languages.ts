export type Language = { code: string; name: string; flag: string };

export const LANGUAGES: Language[] = [
  { code: "auto", name: "Auto-detect", flag: "🌐" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", flag: "🇮🇳" },
  { code: "te", name: "Telugu", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", flag: "🇮🇳" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "zh", name: "Mandarin", flag: "🇨🇳" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "pt", name: "Portuguese", flag: "🇧🇷" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "sw", name: "Swahili", flag: "🇰🇪" },
  { code: "ur", name: "Urdu", flag: "🇵🇰" },
  { code: "th", name: "Thai", flag: "🇹🇭" },
];

export const getLang = (code: string): Language =>
  LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];

export const DOMAINS = [
  { value: "general", label: "General", icon: "💬" },
  { value: "legal", label: "Legal", icon: "⚖️" },
  { value: "medical", label: "Medical", icon: "🩺" },
  { value: "technical", label: "Technical", icon: "⚙️" },
  { value: "business", label: "Business", icon: "💼" },
  { value: "academic", label: "Academic", icon: "🎓" },
  { value: "casual", label: "Casual/Chat", icon: "💭" },
  { value: "literary", label: "Literary", icon: "📖" },
  { value: "news", label: "News/Media", icon: "📰" },
];
