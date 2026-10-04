import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type MarketLanguage = "en" | "hi" | "kn" | "ta";

const LANGUAGE_NAMES: Record<MarketLanguage, string> = {
  en: "English",
  hi: "Hindi",
  kn: "Kannada",
  ta: "Tamil",
};

export interface MarketInput {
  crop: string;
  variety: string;
  state: string;
  district: string;
  quantityQuintal: number;
  language?: MarketLanguage;
}

export interface NearbyMarket {
  name: string;
  distanceKm: number;
  pricePerQuintal: number;
  demand: "High" | "Medium" | "Low";
  arrivalQuintal: number;
}

export interface PriceTrendPoint {
  date: string;
  price: number;
}

export interface AiAdvisory {
  action: "SELL_TODAY" | "WAIT";
  actionReason: string;
  trendAnalysis: string;
  bestMarket: string;
  bestMarketReason: string;
  transportation: string;
  expectedProfit: number;
  profitBreakdown: string;
  riskFactors: string[];
  confidence: number;
}

export interface MarketReport {
  crop: string;
  variety: string;
  state: string;
  district: string;
  quantityQuintal: number;

  currentPrice: number;
  msp?: number;
  priceChangePct: number;
  unit: string;

  nearbyMarkets: NearbyMarket[];
  bestMarket: NearbyMarket;

  trend: PriceTrendPoint[];
  forecast: PriceTrendPoint[];

  expectedMovement: {
    direction: "up" | "down" | "flat";
    percent: number;
    horizonDays: number;
    summary: string;
  };

  advisory: AiAdvisory;
  generatedAt: string;
}

const SYSTEM = `You are AgriAssist AI's Market Intelligence AI for Indian farmers.

Given realistic mandi market data (current prices, nearby markets, 14-day price history and 7-day forecast) plus the farmer's crop, variety, location and quantity, produce a practical market advisory.

Return ONLY valid JSON (no markdown, no prose) matching exactly:

{
  "action": "SELL_TODAY" | "WAIT",
  "actionReason": string,
  "trendAnalysis": string,
  "bestMarket": string,
  "bestMarketReason": string,
  "transportation": string,
  "expectedProfit": number,
  "profitBreakdown": string,
  "riskFactors": string[],
  "confidence": number
}

Rules:
- Base every claim on the provided data.
- Do not invent prices.
- expectedProfit is total INR net for the given quantity after estimated transport and mandi cess.
- transportation should give practical advice such as vehicle type, approximate cost per quintal and timing.
- riskFactors must contain 3-5 concrete risks.
- confidence must be between 0 and 100.
- Keep every string concise, plain and farmer-friendly.
- The action must be exactly SELL_TODAY or WAIT.
- Do not translate JSON keys.
- Do not translate enum values SELL_TODAY or WAIT.
`;

function getLanguageInstruction(language: MarketLanguage) {
  const languageName = LANGUAGE_NAMES[language];

  return `

IMPORTANT LANGUAGE REQUIREMENT:

Write ALL natural-language values in the JSON response in ${languageName}.

The farmer selected ${languageName} as their preferred language.

These fields must be written entirely in ${languageName}:
- actionReason
- trendAnalysis
- bestMarket
- bestMarketReason
- transportation
- profitBreakdown
- every item in riskFactors

Keep these JSON keys exactly as provided.
Keep action values exactly as SELL_TODAY or WAIT.
Keep numbers unchanged and numeric.

Do not switch to English unless a proper noun, market name, crop name, product name, abbreviation or technical term genuinely needs to remain recognizable.

Use simple language suitable for Indian farmers.
`;
}

function parseJson<T>(text: string): T | null {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const s = cleaned.indexOf("{");
  const e = cleaned.lastIndexOf("}");

  if (s < 0 || e < 0) return null;

  try {
    return JSON.parse(
      cleaned.slice(s, e + 1),
    ) as T;
  } catch {
    return null;
  }
}

// Deterministic pseudo-random from string
function seed(str: string) {
  let h = 2166136261;

  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;

    return ((h >>> 0) % 10000) / 10000;
  };
}

// Base price bands (INR/quintal)
const BASE_PRICE: Record<string, [number, number]> = {
  tomato: [1200, 3500],
  onion: [1500, 3800],
  potato: [900, 2200],
  wheat: [2100, 2700],
  paddy: [1900, 2400],
  rice: [2800, 4500],
  cotton: [6500, 8200],
  soybean: [4200, 5200],
  maize: [1900, 2400],
  sugarcane: [310, 400],
  groundnut: [5500, 7000],
  chilli: [12000, 22000],
  turmeric: [11000, 16000],
  gram: [4800, 6200],
  bajra: [2100, 2600],
  jowar: [2600, 3300],
  mustard: [5000, 6200],
  banana: [1400, 2500],
  mango: [3500, 6500],
};

function priceFor(
  crop: string,
  rand: () => number,
) {
  const key = crop.trim().toLowerCase();

  const band =
    BASE_PRICE[key] ?? [2000, 3500];

  return Math.round(
    band[0] +
      rand() * (band[1] - band[0]),
  );
}

function generateMockMarketData(
  input: MarketInput,
): Omit<
  MarketReport,
  "advisory" | "generatedAt"
> {
  const rand = seed(
    `${input.crop}|${input.variety}|${input.state}|${input.district}`,
  );

  const current = priceFor(
    input.crop,
    rand,
  );

  const change =
    (rand() - 0.4) * 12;

  // 14-day trend
  const trend: PriceTrendPoint[] = [];

  const today = new Date();

  let p =
    current / (1 + change / 100);

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);

    d.setDate(
      today.getDate() - i,
    );

    p =
      p *
      (1 + (rand() - 0.5) * 0.03);

    trend.push({
      date: d
        .toISOString()
        .slice(0, 10),
      price: Math.round(p),
    });
  }

  trend[
    trend.length - 1
  ].price = current;

  // 7-day forecast
  const forecast: PriceTrendPoint[] =
    [];

  let fp = current;

  const drift =
    (rand() - 0.35) * 0.02;

  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);

    d.setDate(
      today.getDate() + i,
    );

    fp =
      fp *
      (1 +
        drift +
        (rand() - 0.5) * 0.02);

    forecast.push({
      date: d
        .toISOString()
        .slice(0, 10),
      price: Math.round(fp),
    });
  }

  const forecastEnd =
    forecast[
      forecast.length - 1
    ].price;

  const movePct =
    ((forecastEnd - current) /
      current) *
    100;

  const direction:
    | "up"
    | "down"
    | "flat" =
    movePct > 1
      ? "up"
      : movePct < -1
        ? "down"
        : "flat";

  const marketNames = [
    `${input.district} APMC`,
    `${input.district} Mandi`,
    `${input.state} Central Market`,
    `Regional Wholesale Yard`,
    `${input.district} Sub-Yard`,
  ];

  const nearbyMarkets: NearbyMarket[] =
    marketNames
      .map((name): NearbyMarket => {
        const spread =
          (rand() - 0.5) * 0.15;
        const demand: NearbyMarket["demand"] =
          rand() > 0.66
            ? "High"
            : rand() > 0.33
              ? "Medium"
              : "Low";


        return {
          name,

          distanceKm: Math.round(
            5 + rand() * 90,
          ),

          pricePerQuintal:
            Math.round(
              current *
                (1 + spread),
            ),

          demand,

          arrivalQuintal:
            Math.round(
              50 + rand() * 950,
            ),
        };
      })
      .sort(
        (a, b) =>
          b.pricePerQuintal -
          a.pricePerQuintal,
      );

  const bestMarket =
    nearbyMarkets[0];

  return {
    crop: input.crop,
    variety: input.variety,
    state: input.state,
    district: input.district,

    quantityQuintal:
      input.quantityQuintal,

    currentPrice: current,

    priceChangePct:
      Math.round(change * 10) / 10,

    unit: "quintal",

    nearbyMarkets,
    bestMarket,

    trend,
    forecast,

    expectedMovement: {
      direction,

      percent:
        Math.round(movePct * 10) / 10,

      horizonDays: 7,

      summary:
        direction === "up"
          ? `Prices likely to rise ~${Math.abs(
              Math.round(movePct),
            )}% over next 7 days`
          : direction === "down"
            ? `Prices likely to soften ~${Math.abs(
                Math.round(movePct),
              )}% over next 7 days`
            : `Prices expected to stay flat over next 7 days`,
    },
  };
}

function getFallbackAdvisory(
  market: Omit<
    MarketReport,
    "advisory" | "generatedAt"
  >,
  language: MarketLanguage,
): AiAdvisory {
  const direction =
    market.expectedMovement
      .direction;

  const action =
    direction === "up"
      ? "WAIT"
      : "SELL_TODAY";

  const fallbacks: Record<
    MarketLanguage,
    {
      actionReason: string;
      trendAnalysis: string;
      bestMarketReason: string;
      transportation: string;
      profitBreakdown: string;
      risks: string[];
    }
  > = {
    en: {
      actionReason:
        market.expectedMovement
          .summary,

      trendAnalysis:
        `Prices moved ${market.priceChangePct}% over the last week.`,

      bestMarketReason:
        `Highest price ₹${market.bestMarket.pricePerQuintal}/q at ${market.bestMarket.distanceKm} km.`,

      transportation:
        "Use a mini-truck or shared tempo; budget ₹100-200/quintal for transport.",

      profitBreakdown:
        "Gross revenue less estimated transport (~5%) and mandi cess (~3%).",

      risks: [
        "Sudden weather change",
        "Market glut",
        "Transport delay",
      ],
    },

    hi: {
      actionReason:
        market.expectedMovement
          .direction === "up"
          ? "अगले 7 दिनों में कीमत बढ़ने की संभावना है, इसलिए थोड़ा इंतजार करना बेहतर हो सकता है।"
          : "मौजूदा बाजार संकेतों के आधार पर अभी बिक्री करना बेहतर हो सकता है।",

      trendAnalysis:
        `पिछले सप्ताह कीमत में ${market.priceChangePct}% का बदलाव हुआ है।`,

      bestMarketReason:
        `सबसे अच्छी कीमत ₹${market.bestMarket.pricePerQuintal}/क्विंटल है और बाजार ${market.bestMarket.distanceKm} किमी दूर है।`,

      transportation:
        "मिनी-ट्रक या साझा टेंपो का उपयोग करें। परिवहन के लिए लगभग ₹100-200/क्विंटल का बजट रखें।",

      profitBreakdown:
        "कुल आय में से अनुमानित परिवहन (~5%) और मंडी शुल्क (~3%) घटाया गया है।",

      risks: [
        "अचानक मौसम में बदलाव",
        "बाजार में अधिक आवक",
        "परिवहन में देरी",
      ],
    },

    kn: {
      actionReason:
        market.expectedMovement
          .direction === "up"
          ? "ಮುಂದಿನ 7 ದಿನಗಳಲ್ಲಿ ಬೆಲೆ ಏರಿಕೆಯಾಗುವ ಸಾಧ್ಯತೆ ಇದೆ, ಆದ್ದರಿಂದ ಸ್ವಲ್ಪ ಕಾಯುವುದು ಉತ್ತಮವಾಗಬಹುದು."
          : "ಪ್ರಸ್ತುತ ಮಾರುಕಟ್ಟೆ ಸೂಚನೆಗಳ ಆಧಾರದ ಮೇಲೆ ಈಗ ಮಾರಾಟ ಮಾಡುವುದು ಉತ್ತಮವಾಗಬಹುದು.",

      trendAnalysis:
        `ಕಳೆದ ವಾರದಲ್ಲಿ ಬೆಲೆಯಲ್ಲಿ ${market.priceChangePct}% ಬದಲಾವಣೆ ಕಂಡುಬಂದಿದೆ.`,

      bestMarketReason:
        `ಅತ್ಯುತ್ತಮ ಬೆಲೆ ₹${market.bestMarket.pricePerQuintal}/ಕ್ವಿಂಟಲ್ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ${market.bestMarket.distanceKm} ಕಿಮೀ ದೂರದಲ್ಲಿದೆ.`,

      transportation:
        "ಮಿನಿ ಟ್ರಕ್ ಅಥವಾ ಹಂಚಿಕೆ ಟೆಂಪೋ ಬಳಸಿ. ಸಾರಿಗೆಗಾಗಿ ಸುಮಾರು ₹100-200/ಕ್ವಿಂಟಲ್ ಬಜೆಟ್ ಇಡಿ.",

      profitBreakdown:
        "ಒಟ್ಟು ಆದಾಯದಿಂದ ಅಂದಾಜು ಸಾರಿಗೆ (~5%) ಮತ್ತು ಮಂಡಿ ಶುಲ್ಕ (~3%) ಕಡಿತಗೊಳಿಸಲಾಗಿದೆ.",

      risks: [
        "ಹಠಾತ್ ಹವಾಮಾನ ಬದಲಾವಣೆ",
        "ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಹೆಚ್ಚಿನ ಆಗಮನ",
        "ಸಾರಿಗೆ ವಿಳಂಬ",
      ],
    },

    ta: {
      actionReason:
        market.expectedMovement
          .direction === "up"
          ? "அடுத்த 7 நாட்களில் விலை உயர வாய்ப்புள்ளது, எனவே சிறிது காத்திருப்பது நல்லது."
          : "தற்போதைய சந்தை நிலவரத்தின் அடிப்படையில் இப்போது விற்பனை செய்வது நல்லதாக இருக்கலாம்.",

      trendAnalysis:
        `கடந்த வாரத்தில் விலையில் ${market.priceChangePct}% மாற்றம் ஏற்பட்டுள்ளது.`,

      bestMarketReason:
        `சிறந்த விலை ₹${market.bestMarket.pricePerQuintal}/குவிண்டால் மற்றும் சந்தை ${market.bestMarket.distanceKm} கிமீ தொலைவில் உள்ளது.`,

      transportation:
        "மினி டிரக் அல்லது பகிர்வு டெம்போவைப் பயன்படுத்துங்கள். போக்குவரத்துக்கு சுமார் ₹100-200/குவிண்டால் பட்ஜெட் வைத்துக்கொள்ளுங்கள்.",

      profitBreakdown:
        "மொத்த வருவாயிலிருந்து மதிப்பிடப்பட்ட போக்குவரத்து (~5%) மற்றும் மண்டி கட்டணம் (~3%) கழிக்கப்பட்டுள்ளது.",

      risks: [
        "திடீர் வானிலை மாற்றம்",
        "சந்தையில் அதிக வரத்து",
        "போக்குவரத்து தாமதம்",
      ],
    },
  };

  const f =
    fallbacks[language] ??
    fallbacks.en;

  return {
    action,

    actionReason:
      f.actionReason,

    trendAnalysis:
      f.trendAnalysis,

    bestMarket:
      market.bestMarket.name,

    bestMarketReason:
      f.bestMarketReason,

    transportation:
      f.transportation,

    expectedProfit:
      Math.round(
        market.bestMarket
          .pricePerQuintal *
          market.quantityQuintal *
          0.92,
      ),

    profitBreakdown:
      f.profitBreakdown,

    riskFactors:
      f.risks,

    confidence: 60,
  };
}

export const generateMarketReport =
  createServerFn({
    method: "POST",
  })
    .middleware([
      requireSupabaseAuth,
    ])
    .inputValidator(
      (data: MarketInput) => data,
    )
    .handler(
      async ({
        data,
      }): Promise<MarketReport> => {
        const {
          callGemini,
        } = await import(
          "@/lib/ai/gemini.server"
        );

        const language =
          data.language ?? "en";

        const market =
          generateMockMarketData(
            data,
          );

        const prompt = `Farmer input:
- Crop: ${data.crop}
- Variety: ${data.variety}
- Location: ${data.district}, ${data.state}
- Quantity to sell: ${data.quantityQuintal} quintal

Market data:
- Current price: ₹${market.currentPrice}/quintal
- Change vs last week: ${market.priceChangePct}%
- Expected 7-day movement: ${market.expectedMovement.summary}
- Best market: ${market.bestMarket.name} at ₹${market.bestMarket.pricePerQuintal}/quintal (${market.bestMarket.distanceKm} km, demand ${market.bestMarket.demand})

Nearby markets:
${market.nearbyMarkets
  .slice(0, 5)
  .map(
    (m) =>
      `  • ${m.name} — ₹${m.pricePerQuintal}/q, ${m.distanceKm} km, demand ${m.demand}, arrivals ${m.arrivalQuintal} q`,
  )
  .join("\n")}

14-day price trend:
${market.trend
  .map((t) => t.price)
  .join(", ")}

7-day forecast:
${market.forecast
  .map((t) => t.price)
  .join(", ")}

Generate the JSON advisory now.`;

        const {
          text,
        } = await callGemini({
          system:
            SYSTEM +
            getLanguageInstruction(
              language,
            ),

          prompt,

          temperature: 0.3,

          maxOutputTokens: 1400,

          jsonMode: true,
        });

        const advisory =
          parseJson<AiAdvisory>(
            text,
          ) ??
          getFallbackAdvisory(
            market,
            language,
          );

        return {
          ...market,

          advisory,

          generatedAt:
            new Date().toISOString(),
        };
      },
    );