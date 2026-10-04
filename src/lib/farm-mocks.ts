import {
  CloudRain,
  Sprout,
  Leaf,
  AlertTriangle,
  TrendingUp,
  ListChecks,
  Camera,
  CloudSun,
  Droplets,
  FlaskConical,
  LineChart,
  Landmark,
  Bell,
  ShieldAlert,
  Cloud,
} from "lucide-react";

import type { Language } from "@/context/LanguageContext";

export const FARM_SUMMARY = [
  {
    key: "weather",
    label: "Today's Weather",
    value: "29°C · Cloudy",
    hint: "Rain likely tomorrow",
    icon: CloudRain,
    tone: "sky",
  },
  {
    key: "crop",
    label: "Current Crop",
    value: "Tomato",
    hint: "4.5 acres · Hosakote",
    icon: Sprout,
    tone: "emerald",
  },
  {
    key: "stage",
    label: "Crop Stage",
    value: "Flowering",
    hint: "Day 42 of 95",
    icon: Leaf,
    tone: "lime",
  },
  {
    key: "risk",
    label: "Risk Level",
    value: "Moderate",
    hint: "Leaf curl detected nearby",
    icon: AlertTriangle,
    tone: "amber",
  },
  {
    key: "market",
    label: "Market Trend",
    value: "₹24/kg ▲",
    hint: "+8.4% this week",
    icon: TrendingUp,
    tone: "emerald",
  },
  {
    key: "tasks",
    label: "Today's Tasks",
    value: "3 pending",
    hint: "Irrigate · Scout · Log yield",
    icon: ListChecks,
    tone: "violet",
  },
] as const;

export const QUICK_ACTIONS = [
  {
    icon: Camera,
    label: "Diagnose Crop",
    prompt:
      "I want to diagnose a crop disease. Guide me through uploading a photo of the affected leaves.",
  },
  {
    icon: CloudSun,
    label: "Weather Advice",
    prompt:
      "Give me a weather-based farming advisory for my tomato field for the next 3 days.",
  },
  {
    icon: Droplets,
    label: "Irrigation Advice",
    prompt:
      "Should I irrigate my tomato field today given the soil moisture and weather forecast?",
  },
  {
    icon: FlaskConical,
    label: "Fertilizer Recommendation",
    prompt:
      "Recommend the best fertilizer schedule for my tomato crop at the flowering stage.",
  },
  {
    icon: LineChart,
    label: "Market Prices",
    prompt:
      "Show me today's mandi prices for tomato in Karnataka and the trend over the last 7 days.",
  },
  {
    icon: Landmark,
    label: "Government Schemes",
    prompt:
      "Which government schemes and subsidies am I eligible for as a small tomato farmer in Karnataka?",
  },
] as const;

export const SUGGESTED_QUESTIONS = [
  "Why are my tomato leaves turning yellow?",
  "When is the best time to spray pesticide this week?",
  "How much water does my crop need today?",
  "What's the mandi price for tomato in Bengaluru?",
];

export const RECENT_REPORTS = [
  {
    title: "Leaf spot diagnosis",
    date: "Yesterday",
    status: "Resolved",
  },
  {
    title: "Soil moisture report",
    date: "2 days ago",
    status: "Healthy",
  },
  {
    title: "Fertilizer plan — July",
    date: "5 days ago",
    status: "Active",
  },
];

export const TODAYS_TASKS = [
  {
    title: "Irrigate east block for 45 min",
    time: "6:00 PM",
    done: false,
  },
  {
    title: "Scout for whitefly on tomato rows 4-7",
    time: "9:00 AM",
    done: true,
  },
  {
    title: "Log yield from harvest bin #3",
    time: "5:30 PM",
    done: false,
  },
  {
    title: "Check drip line pressure",
    time: "7:00 AM",
    done: true,
  },
];

/* -------------------------------------------------------------------------- */
/* Notifications                                                              */
/* -------------------------------------------------------------------------- */

const NOTIFICATION_TRANSLATIONS = {
  en: [
    {
      title: "Rain Alert",
      body: "12mm rainfall expected tomorrow, 6 AM–11 AM. Postpone pesticide spraying.",
      time: "2h ago",
    },
    {
      title: "Disease Risk",
      body: "Early blight risk rising in your district. Inspect tomato leaves for dark rings.",
      time: "5h ago",
    },
    {
      title: "Market Change",
      body: "Tomato mandi price up 8.4% this week in Bengaluru. Good window to sell.",
      time: "Yesterday",
    },
    {
      title: "Government Scheme",
      body: "PM-KUSUM solar pump subsidy now open for Karnataka farmers. Deadline Aug 15.",
      time: "2d ago",
    },
  ],

  hi: [
    {
      title: "बारिश चेतावनी",
      body: "कल सुबह 6 बजे से 11 बजे तक 12 मिमी बारिश की संभावना है। कीटनाशक का छिड़काव टालें।",
      time: "2 घंटे पहले",
    },
    {
      title: "रोग जोखिम",
      body: "आपके जिले में अर्ली ब्लाइट का जोखिम बढ़ रहा है। टमाटर की पत्तियों पर गहरे छल्लों की जांच करें।",
      time: "5 घंटे पहले",
    },
    {
      title: "बाजार में बदलाव",
      body: "बेंगलुरु में इस सप्ताह टमाटर की मंडी कीमत 8.4% बढ़ी है। बिक्री के लिए अच्छा समय हो सकता है।",
      time: "कल",
    },
    {
      title: "सरकारी योजना",
      body: "कर्नाटक के किसानों के लिए PM-KUSUM सोलर पंप सब्सिडी उपलब्ध है। अंतिम तिथि 15 अगस्त है।",
      time: "2 दिन पहले",
    },
  ],

  kn: [
    {
      title: "ಮಳೆ ಎಚ್ಚರಿಕೆ",
      body: "ನಾಳೆ ಬೆಳಿಗ್ಗೆ 6 ರಿಂದ 11 ಗಂಟೆಯವರೆಗೆ 12 ಮಿಮೀ ಮಳೆಯ ಸಾಧ್ಯತೆಯಿದೆ. ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸುವುದನ್ನು ಮುಂದೂಡಿ.",
      time: "2 ಗಂಟೆಗಳ ಹಿಂದೆ",
    },
    {
      title: "ರೋಗದ ಅಪಾಯ",
      body: "ನಿಮ್ಮ ಜಿಲ್ಲೆಯಲ್ಲಿ ಆರಂಭಿಕ ಬ್ಲೈಟ್ ಅಪಾಯ ಹೆಚ್ಚುತ್ತಿದೆ. ಟೊಮ್ಯಾಟೊ ಎಲೆಗಳಲ್ಲಿ ಕಪ್ಪು ವಲಯಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
      time: "5 ಗಂಟೆಗಳ ಹಿಂದೆ",
    },
    {
      title: "ಮಾರುಕಟ್ಟೆ ಬದಲಾವಣೆ",
      body: "ಬೆಂಗಳೂರಿನಲ್ಲಿ ಈ ವಾರ ಟೊಮ್ಯಾಟೊ ಮಂಡಿ ಬೆಲೆ 8.4% ಹೆಚ್ಚಾಗಿದೆ. ಮಾರಾಟಕ್ಕೆ ಉತ್ತಮ ಸಮಯವಾಗಿರಬಹುದು.",
      time: "ನಿನ್ನೆ",
    },
    {
      title: "ಸರ್ಕಾರಿ ಯೋಜನೆ",
      body: "ಕರ್ನಾಟಕ ರೈತರಿಗೆ PM-KUSUM ಸೌರ ಪಂಪ್ ಸಬ್ಸಿಡಿ ಲಭ್ಯವಿದೆ. ಕೊನೆಯ ದಿನಾಂಕ ಆಗಸ್ಟ್ 15.",
      time: "2 ದಿನಗಳ ಹಿಂದೆ",
    },
  ],

  ta: [
    {
      title: "மழை எச்சரிக்கை",
      body: "நாளை காலை 6 மணி முதல் 11 மணி வரை 12 மிமீ மழை பெய்ய வாய்ப்புள்ளது. பூச்சிக்கொல்லி தெளிப்பதைத் தள்ளிவைக்கவும்.",
      time: "2 மணி நேரத்திற்கு முன்",
    },
    {
      title: "நோய் அபாயம்",
      body: "உங்கள் மாவட்டத்தில் ஆரம்பகால ப்ளைட் நோய் அபாயம் அதிகரித்து வருகிறது. தக்காளி இலைகளில் கருப்பு வளையங்களைச் சரிபார்க்கவும்.",
      time: "5 மணி நேரத்திற்கு முன்",
    },
    {
      title: "சந்தை மாற்றம்",
      body: "பெங்களூரில் இந்த வாரம் தக்காளி மண்டி விலை 8.4% உயர்ந்துள்ளது. விற்பனைக்கு நல்ல நேரமாக இருக்கலாம்.",
      time: "நேற்று",
    },
    {
      title: "அரசுத் திட்டம்",
      body: "கர்நாடக விவசாயிகளுக்கு PM-KUSUM சோலார் பம்ப் மானியம் கிடைக்கிறது. கடைசி தேதி ஆகஸ்ட் 15.",
      time: "2 நாட்களுக்கு முன்",
    },
  ],
} satisfies Record<
  Language,
  readonly {
    title: string;
    body: string;
    time: string;
  }[]
>;

const NOTIFICATION_META = [
  {
    icon: CloudRain,
    tone: "sky",
  },
  {
    icon: ShieldAlert,
    tone: "amber",
  },
  {
    icon: TrendingUp,
    tone: "emerald",
  },
  {
    icon: Landmark,
    tone: "violet",
  },
] as const;

export function getNotificationTranslations(language: Language) {
  return NOTIFICATION_TRANSLATIONS[language] ?? NOTIFICATION_TRANSLATIONS.en;
}

export function getNotifications(language: Language) {
  const translated = getNotificationTranslations(language);

  return translated.map((notification, index) => ({
    ...NOTIFICATION_META[index],
    ...notification,
  }));
}

/* English fallback for older components */

export const NOTIFICATIONS = getNotifications("en");

export const toneClass: Record<string, string> = {
  sky: "text-sky-300 bg-sky-500/10",
  emerald: "text-emerald-300 bg-emerald-500/10",
  lime: "text-lime-300 bg-lime-500/10",
  amber: "text-amber-300 bg-amber-500/10",
  violet: "text-violet-300 bg-violet-500/10",
};

export { Bell, Cloud };