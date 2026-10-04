import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type CommandLanguage = "en" | "hi" | "kn" | "ta";

const LANGUAGE_NAMES: Record<CommandLanguage, string> = {
  en: "English",
  hi: "Hindi",
  kn: "Kannada",
  ta: "Tamil",
};

export interface CommandInput {
  farmerName: string;
  village: string;
  district: string;
  state: string;
  landSizeAcres: number;
  crop: string;
  soil: string;
  water: string;
  sowingDate?: string;
  language?: CommandLanguage;
}

export type AlertType =
  | "disease"
  | "weather"
  | "market"
  | "irrigation"
  | "fertilizer"
  | "harvest"
  | "scheme";

export type AlertSeverity =
  | "critical"
  | "warning"
  | "info"
  | "success";

export interface SmartAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  action: string;
  dueDate?: string;
}

export interface TimelineEvent {
  date: string;
  title: string;
  category: string;
  detail: string;
}

export interface Recommendation {
  title: string;
  detail: string;
  impact: "High" | "Medium" | "Low";
  category: string;
}

export interface DailyBrief {
  farmHealth: string;
  weather: string;
  crop: string;
  diseaseRisk: string;
  irrigation: string;
  fertilizer: string;
  market: string;
  scheme: string;
  topPriority: string;
}

export interface HealthScoreBreakdown {
  cropHealth: number;
  irrigation: number;
  diseaseRisk: number;
  planner: number;
  weather: number;
}

export interface CommandCenterReport {
  headline: string;
  generatedAt: string;
  score: number;
  scoreLabel: string;
  breakdown: HealthScoreBreakdown;
  brief: DailyBrief;
  alerts: SmartAlert[];
  timeline: TimelineEvent[];
  recommendations: Recommendation[];
}

const SYSTEM = `You are AgriAssist AI's Farm Command Center — a proactive AI operating system for Indian farmers.

Given the farmer's profile (crop, region, soil, water source, land size, sowing date), generate a complete daily farm brief as if you had analyzed weather patterns, disease pressure, mandi prices, irrigation status, crop stage, and relevant government scheme calendars.

Return ONLY valid JSON. Do not use markdown fences or explanatory prose outside the JSON.

Use this exact schema:

{
  "headline": string,
  "score": number,
  "scoreLabel": string,
  "breakdown": {
    "cropHealth": number,
    "irrigation": number,
    "diseaseRisk": number,
    "planner": number,
    "weather": number
  },
  "brief": {
    "farmHealth": string,
    "weather": string,
    "crop": string,
    "diseaseRisk": string,
    "irrigation": string,
    "fertilizer": string,
    "market": string,
    "scheme": string,
    "topPriority": string
  },
  "alerts": [
    {
      "id": string,
      "type": "disease"|"weather"|"market"|"irrigation"|"fertilizer"|"harvest"|"scheme",
      "severity": "critical"|"warning"|"info"|"success",
      "title": string,
      "message": string,
      "action": string,
      "dueDate": "YYYY-MM-DD"
    }
  ],
  "timeline": [
    {
      "date": "YYYY-MM-DD",
      "title": string,
      "category": string,
      "detail": string
    }
  ],
  "recommendations": [
    {
      "title": string,
      "detail": string,
      "impact": "High"|"Medium"|"Low",
      "category": string
    }
  ]
}

Rules:

- Generate 5-7 smart alerts.
- Cover disease risk, weather, market opportunity, irrigation, fertilizer, harvest when applicable, and a relevant government scheme.
- Generate 6-10 timeline events over the next 30 days.
- Timeline dates must be real dates relative to today's date and sorted chronologically.
- Generate EXACTLY 3 recommendations.
- Recommendations must be highly personalized to the crop, region, soil, water source, land size, and season.
- Each brief field should contain 1-2 short sentences.
- Keep all natural-language text simple and farmer-friendly.
- Score must be between 0 and 100.
- Score labels:
  85+ = Excellent
  70-84 = Healthy
  50-69 = At Risk
  below 50 = Critical
- Use realistic Indian farming context, crop stages, disease names, mandi terminology, and relevant schemes such as PM-KISAN, PMFBY, PM-KUSUM, KCC, etc.
- Do not claim that live weather or live mandi data was actually retrieved unless it is explicitly provided.
- If exact live information is unavailable, clearly phrase it as an estimate or advisory.
`;

function getLanguageInstruction(
  language: CommandLanguage,
): string {
  const languageName =
    LANGUAGE_NAMES[language] ?? "English";

  return `

IMPORTANT LANGUAGE INSTRUCTION:

The farmer's selected language is ${languageName}.

You MUST write ALL natural-language content in ${languageName}.

This includes:
- headline
- scoreLabel
- every brief field
- alert titles
- alert messages
- alert actions
- timeline titles
- timeline categories
- timeline details
- recommendation titles
- recommendation details
- recommendation categories

Do NOT switch to English.

Keep numbers, dates, crop names, chemical names, product names, abbreviations,
scheme names, and technical terms accurate and understandable.

The JSON keys MUST remain exactly as specified in the schema.
Only the VALUES containing natural language should be translated.
`;
}

function parseJson<T>(text: string): T | null {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start < 0 || end < 0) {
    return null;
  }

  try {
    return JSON.parse(
      cleaned.slice(start, end + 1),
    ) as T;
  } catch {
    return null;
  }
}

function fallbackReport(
  data: CommandInput,
): Omit<CommandCenterReport, "generatedAt"> {
  const language = data.language ?? "en";

  const fallbacks: Record<
    CommandLanguage,
    {
      headline: string;
      scoreLabel: string;
      farmHealth: string;
      weather: string;
      crop: string;
      diseaseRisk: string;
      irrigation: string;
      fertilizer: string;
      market: string;
      scheme: string;
      topPriority: string;
      alertTitle: string;
      alertMessage: string;
      alertAction: string;
      timelineTitle: string;
      timelineDetail: string;
      recommendationTitle: string;
      recommendationDetail: string;
    }
  > = {
    en: {
      headline: "Your farm needs a focused daily check",
      scoreLabel: "Healthy",
      farmHealth:
        "Your farm profile is ready for a practical daily review.",
      weather:
        "Check local weather before irrigation or spraying.",
      crop:
        `Monitor your ${data.crop} crop closely for changes in growth and leaf health.`,
      diseaseRisk:
        "Inspect leaves and stems regularly for early disease symptoms.",
      irrigation:
        "Check soil moisture before the next irrigation.",
      fertilizer:
        "Follow the crop-stage fertilizer plan and avoid unnecessary application.",
      market:
        "Compare nearby mandi prices before deciding where to sell.",
      scheme:
        "Check eligibility and current deadlines for relevant farmer schemes.",
      topPriority:
        "Inspect the crop and check soil moisture before today's field work.",
      alertTitle: "Daily crop check",
      alertMessage:
        "Inspect the crop for disease symptoms, pests, and moisture stress.",
      alertAction: "Inspect the field",
      timelineTitle: "Field inspection",
      timelineDetail:
        "Review crop health, soil moisture, and visible pest or disease symptoms.",
      recommendationTitle: "Prioritize crop monitoring",
      recommendationDetail:
        "Inspect the field before irrigation, spraying, or fertilizer application.",
    },

    hi: {
      headline: "आपके खेत के लिए आज की प्राथमिक जाँच",
      scoreLabel: "स्वस्थ",
      farmHealth:
        "आपके खेत की जानकारी आज की व्यावहारिक समीक्षा के लिए तैयार है।",
      weather:
        "सिंचाई या छिड़काव से पहले स्थानीय मौसम की जाँच करें।",
      crop:
        `अपनी ${data.crop} फसल की वृद्धि और पत्तियों की स्थिति पर ध्यान दें।`,
      diseaseRisk:
        "बीमारी के शुरुआती लक्षणों के लिए पत्तियों और तनों की नियमित जाँच करें।",
      irrigation:
        "अगली सिंचाई से पहले मिट्टी में नमी की जाँच करें।",
      fertilizer:
        "फसल की अवस्था के अनुसार खाद दें और अनावश्यक मात्रा से बचें।",
      market:
        "बेचने से पहले आसपास की मंडियों के भाव की तुलना करें।",
      scheme:
        "किसान योजनाओं की पात्रता और वर्तमान अंतिम तिथियाँ जाँचें।",
      topPriority:
        "आज खेत में काम शुरू करने से पहले फसल और मिट्टी की नमी जाँचें।",
      alertTitle: "फसल की दैनिक जाँच",
      alertMessage:
        "फसल में बीमारी, कीट और नमी की कमी के लक्षण देखें।",
      alertAction: "खेत की जाँच करें",
      timelineTitle: "खेत की जाँच",
      timelineDetail:
        "फसल की स्थिति, मिट्टी की नमी और कीट या बीमारी के लक्षण देखें।",
      recommendationTitle: "फसल की निगरानी को प्राथमिकता दें",
      recommendationDetail:
        "सिंचाई, छिड़काव या खाद देने से पहले खेत की जाँच करें।",
    },

    kn: {
      headline: "ನಿಮ್ಮ ಹೊಲಕ್ಕಾಗಿ ಇಂದಿನ ಪ್ರಮುಖ ಪರಿಶೀಲನೆ",
      scoreLabel: "ಆರೋಗ್ಯಕರ",
      farmHealth:
        "ನಿಮ್ಮ ಹೊಲದ ವಿವರಗಳು ಇಂದಿನ ಪ್ರಾಯೋಗಿಕ ಪರಿಶೀಲನೆಗೆ ಸಿದ್ಧವಾಗಿವೆ.",
      weather:
        "ನೀರಾವರಿ ಅಥವಾ ಸಿಂಪಡಣೆಗೂ ಮೊದಲು ಸ್ಥಳೀಯ ಹವಾಮಾನವನ್ನು ಪರಿಶೀಲಿಸಿ.",
      crop:
        `ನಿಮ್ಮ ${data.crop} ಬೆಳೆಯ ಬೆಳವಣಿಗೆ ಮತ್ತು ಎಲೆಗಳ ಆರೋಗ್ಯವನ್ನು ಗಮನಿಸಿ.`,
      diseaseRisk:
        "ರೋಗದ ಆರಂಭಿಕ ಲಕ್ಷಣಗಳಿಗಾಗಿ ಎಲೆಗಳು ಮತ್ತು ಕಾಂಡಗಳನ್ನು ನಿಯಮಿತವಾಗಿ ಪರಿಶೀಲಿಸಿ.",
      irrigation:
        "ಮುಂದಿನ ನೀರಾವರಿಗೂ ಮೊದಲು ಮಣ್ಣಿನ ತೇವಾಂಶವನ್ನು ಪರಿಶೀಲಿಸಿ.",
      fertilizer:
        "ಬೆಳೆಯ ಹಂತಕ್ಕೆ ಅನುಗುಣವಾಗಿ ರಸಗೊಬ್ಬರ ಬಳಸಿ ಮತ್ತು ಅನಗತ್ಯ ಪ್ರಮಾಣವನ್ನು ತಪ್ಪಿಸಿ.",
      market:
        "ಮಾರಾಟ ಮಾಡುವ ಮೊದಲು ಹತ್ತಿರದ ಮಾರುಕಟ್ಟೆಗಳ ಬೆಲೆಗಳನ್ನು ಹೋಲಿಸಿ.",
      scheme:
        "ಸಂಬಂಧಿತ ರೈತ ಯೋಜನೆಗಳ ಅರ್ಹತೆ ಮತ್ತು ಪ್ರಸ್ತುತ ಕೊನೆಯ ದಿನಾಂಕಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
      topPriority:
        "ಇಂದಿನ ಹೊಲದ ಕೆಲಸಕ್ಕೂ ಮೊದಲು ಬೆಳೆಯನ್ನು ಮತ್ತು ಮಣ್ಣಿನ ತೇವಾಂಶವನ್ನು ಪರಿಶೀಲಿಸಿ.",
      alertTitle: "ದೈನಂದಿನ ಬೆಳೆ ಪರಿಶೀಲನೆ",
      alertMessage:
        "ಬೆಳೆಯಲ್ಲಿ ರೋಗ, ಕೀಟಗಳು ಮತ್ತು ತೇವಾಂಶದ ಕೊರತೆಯ ಲಕ್ಷಣಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
      alertAction: "ಹೊಲವನ್ನು ಪರಿಶೀಲಿಸಿ",
      timelineTitle: "ಹೊಲ ಪರಿಶೀಲನೆ",
      timelineDetail:
        "ಬೆಳೆಯ ಆರೋಗ್ಯ, ಮಣ್ಣಿನ ತೇವಾಂಶ ಮತ್ತು ಕೀಟ ಅಥವಾ ರೋಗದ ಲಕ್ಷಣಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
      recommendationTitle: "ಬೆಳೆ ಮೇಲ್ವಿಚಾರಣೆಗೆ ಆದ್ಯತೆ ನೀಡಿ",
      recommendationDetail:
        "ನೀರಾವರಿ, ಸಿಂಪಡಣೆ ಅಥವಾ ರಸಗೊಬ್ಬರ ಹಾಕುವ ಮೊದಲು ಹೊಲವನ್ನು ಪರಿಶೀಲಿಸಿ.",
    },

    ta: {
      headline: "உங்கள் பண்ணைக்கான இன்றைய முக்கிய சரிபார்ப்பு",
      scoreLabel: "ஆரோக்கியமானது",
      farmHealth:
        "உங்கள் பண்ணை விவரங்கள் இன்றைய நடைமுறை மதிப்பாய்வுக்கு தயாராக உள்ளன.",
      weather:
        "நீர்ப்பாசனம் அல்லது தெளிப்பதற்கு முன் உள்ளூர் வானிலையை சரிபார்க்கவும்.",
      crop:
        `உங்கள் ${data.crop} பயிரின் வளர்ச்சி மற்றும் இலைகளின் ஆரோக்கியத்தை கவனிக்கவும்.`,
      diseaseRisk:
        "நோயின் ஆரம்ப அறிகுறிகளுக்காக இலைகள் மற்றும் தண்டுகளை தொடர்ந்து சரிபார்க்கவும்.",
      irrigation:
        "அடுத்த நீர்ப்பாசனத்திற்கு முன் மண்ணின் ஈரப்பதத்தை சரிபார்க்கவும்.",
      fertilizer:
        "பயிரின் வளர்ச்சி நிலைக்கு ஏற்ப உரமிடவும்; தேவையற்ற அளவை தவிர்க்கவும்.",
      market:
        "விற்பனை செய்வதற்கு முன் அருகிலுள்ள சந்தைகளின் விலைகளை ஒப்பிடவும்.",
      scheme:
        "தொடர்புடைய விவசாய திட்டங்களின் தகுதி மற்றும் தற்போதைய கடைசி தேதிகளை சரிபார்க்கவும்.",
      topPriority:
        "இன்றைய வயல் பணிக்கு முன் பயிரையும் மண்ணின் ஈரப்பதத்தையும் சரிபார்க்கவும்.",
      alertTitle: "தினசரி பயிர் சரிபார்ப்பு",
      alertMessage:
        "பயிரில் நோய், பூச்சி மற்றும் ஈரப்பதக் குறைபாட்டின் அறிகுறிகளை சரிபார்க்கவும்.",
      alertAction: "வயலை சரிபார்க்கவும்",
      timelineTitle: "வயல் ஆய்வு",
      timelineDetail:
        "பயிர் ஆரோக்கியம், மண்ணின் ஈரப்பதம் மற்றும் பூச்சி அல்லது நோய் அறிகுறிகளை சரிபார்க்கவும்.",
      recommendationTitle: "பயிர் கண்காணிப்புக்கு முன்னுரிமை அளிக்கவும்",
      recommendationDetail:
        "நீர்ப்பாசனம், தெளிப்பு அல்லது உரமிடுவதற்கு முன் வயலை சரிபார்க்கவும்.",
    },
  };

  const f = fallbacks[language];

  return {
    headline: f.headline,
    score: 70,
    scoreLabel: f.scoreLabel,

    breakdown: {
      cropHealth: 70,
      irrigation: 70,
      diseaseRisk: 70,
      planner: 70,
      weather: 70,
    },

    brief: {
      farmHealth: f.farmHealth,
      weather: f.weather,
      crop: f.crop,
      diseaseRisk: f.diseaseRisk,
      irrigation: f.irrigation,
      fertilizer: f.fertilizer,
      market: f.market,
      scheme: f.scheme,
      topPriority: f.topPriority,
    },

    alerts: [
      {
        id: `fallback-alert-${Date.now()}`,
        type: "disease",
        severity: "info",
        title: f.alertTitle,
        message: f.alertMessage,
        action: f.alertAction,
      },
    ],

    timeline: [
      {
        date: new Date().toISOString().slice(0, 10),
        title: f.timelineTitle,
        category: "crop",
        detail: f.timelineDetail,
      },
    ],

    recommendations: [
      {
        title: f.recommendationTitle,
        detail: f.recommendationDetail,
        impact: "High",
        category: "crop",
      },
      {
        title: f.alertAction,
        detail: f.alertMessage,
        impact: "Medium",
        category: "disease",
      },
      {
        title: f.irrigation,
        detail: f.weather,
        impact: "Medium",
        category: "irrigation",
      },
    ],
  };
}

export const generateCommandBrief = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((data: CommandInput) => data)
  .handler(async ({ data }): Promise<CommandCenterReport> => {
    const { callGemini } = await import(
      "@/lib/ai/gemini.server"
    );

    const language = data.language ?? "en";

    const today = new Date()
      .toISOString()
      .slice(0, 10);

    const prompt = `Today's date: ${today}

Farmer profile:
- Name: ${data.farmerName}
- Location: ${data.village}, ${data.district}, ${data.state}
- Land size: ${data.landSizeAcres} acres
- Crop: ${data.crop}
- Soil: ${data.soil}
- Water source: ${data.water}
- Sowing date: ${
      data.sowingDate ??
      "not specified — assume mid-season"
    }

Selected language: ${
      LANGUAGE_NAMES[language]
    }

Generate the complete Farm Command Center JSON now.`;

    try {
      const { text } = await callGemini({
        system:
          SYSTEM +
          getLanguageInstruction(language),
        prompt,
        temperature: 0.5,
        maxOutputTokens: 4000,
        jsonMode: true,
      });

      const parsed =
        parseJson<
          Omit<CommandCenterReport, "generatedAt">
        >(text);

      if (!parsed) {
        throw new Error(
          "Invalid AI response",
        );
      }

      const recs = (
        parsed.recommendations ?? []
      ).slice(0, 3);

      while (recs.length < 3) {
        recs.push({
          title:
            language === "hi"
              ? "फसल की निगरानी करें"
              : language === "kn"
                ? "ಬೆಳೆಯನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ"
                : language === "ta"
                  ? "பயிரை கண்காணிக்கவும்"
                  : "Monitor the crop",
          detail:
            language === "hi"
              ? "खेत की स्थिति की नियमित जाँच करें।"
              : language === "kn"
                ? "ಹೊಲದ ಸ್ಥಿತಿಯನ್ನು ನಿಯಮಿತವಾಗಿ ಪರಿಶೀಲಿಸಿ."
                : language === "ta"
                  ? "வயலின் நிலையை தொடர்ந்து சரிபார்க்கவும்."
                  : "Check the field condition regularly.",
          impact: "Medium",
          category: "crop",
        });
      }

      const alerts = (
        parsed.alerts ?? []
      ).map((alert, index) => ({
        ...alert,
        id:
          alert.id ||
          `alert-${index}-${Date.now()}`,
      }));

      return {
        ...parsed,
        alerts,
        recommendations: recs,
        generatedAt:
          new Date().toISOString(),
      };
    } catch {
      return {
        ...fallbackReport(data),
        generatedAt:
          new Date().toISOString(),
      };
    }
  });