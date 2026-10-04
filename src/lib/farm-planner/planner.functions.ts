import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PlannerLanguage = "en" | "hi" | "kn" | "ta";

const LANGUAGE_NAMES: Record<PlannerLanguage, string> = {
  en: "English",
  hi: "Hindi",
  kn: "Kannada",
  ta: "Tamil",
};

export interface PlannerInput {
  crop: string;
  state: string;
  district: string;
  landSizeAcres: number;
  soilType: string;
  irrigationSource: string;
  sowingDate: string;
  language?: PlannerLanguage;
}

export interface CalendarStage {
  stage: string;
  startDate: string;
  endDate: string;
  activities: string[];
}

export interface IrrigationEvent {
  date: string;
  stage: string;
  method: string;
  quantity: string;
  notes: string;
}

export interface Product {
  name: string;
  price: string;
  quantityForLand: string;
  dosePer20LPump: string;
  notes?: string;
}

export interface ScheduleItem {
  date: string;
  stage: string;
  problem?: string;
  purpose: string;
  options: Product[];
}

export interface HarvestInfo {
  fromDate: string;
  toDate: string;
  indicators: string[];
  postHarvest: string[];
}

export interface CostBreakdownItem {
  category: string;
  amount: number;
  detail: string;
}

export interface ProfitEstimate {
  yieldQuintalPerAcre: number;
  totalYieldQuintal: number;
  marketPricePerQuintal: number;
  grossRevenue: number;
  totalCost: number;
  netProfit: number;
  roiPercent: number;
  assumptions: string[];
}

export interface FarmPlan {
  summary: string;
  crop: string;
  location: string;
  landSizeAcres: number;
  season: string;
  calendar: CalendarStage[];
  irrigation: IrrigationEvent[];
  fertilizer: ScheduleItem[];
  pest: ScheduleItem[];
  disease: ScheduleItem[];
  harvest: HarvestInfo;
  costs: CostBreakdownItem[];
  profit: ProfitEstimate;
  tips: string[];
  generatedAt: string;
}

const SYSTEM = `You are AgriAssist AI's Seasonal Farm Planner for Indian farmers.

Given a crop, state, district, land size (acres), soil type, irrigation source and sowing date,
generate a COMPLETE seasonal plan tailored to that region and crop.

Return ONLY valid JSON (no markdown, no prose) matching this exact schema:

{
  "summary": string,
  "crop": string,
  "location": string,
  "landSizeAcres": number,
  "season": string,
  "calendar": [
    {
      "stage": string,
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "activities": string[]
    }
  ],
  "irrigation": [
    {
      "date": "YYYY-MM-DD",
      "stage": string,
      "method": string,
      "quantity": string,
      "notes": string
    }
  ],
  "fertilizer": [
    {
      "date": "YYYY-MM-DD",
      "stage": string,
      "purpose": string,
      "options": [
        {
          "name": string,
          "price": string,
          "quantityForLand": string,
          "dosePer20LPump": string,
          "notes": string
        }
      ]
    }
  ],
  "pest": [
    {
      "date": "YYYY-MM-DD",
      "stage": string,
      "problem": string,
      "purpose": string,
      "options": [
        {
          "name": string,
          "price": string,
          "quantityForLand": string,
          "dosePer20LPump": string,
          "notes": string
        }
      ]
    }
  ],
  "disease": [
    {
      "date": "YYYY-MM-DD",
      "stage": string,
      "problem": string,
      "purpose": string,
      "options": [
        {
          "name": string,
          "price": string,
          "quantityForLand": string,
          "dosePer20LPump": string,
          "notes": string
        }
      ]
    }
  ],
  "harvest": {
    "fromDate": "YYYY-MM-DD",
    "toDate": "YYYY-MM-DD",
    "indicators": string[],
    "postHarvest": string[]
  },
  "costs": [
    {
      "category": string,
      "amount": number,
      "detail": string
    }
  ],
  "profit": {
    "yieldQuintalPerAcre": number,
    "totalYieldQuintal": number,
    "marketPricePerQuintal": number,
    "grossRevenue": number,
    "totalCost": number,
    "netProfit": number,
    "roiPercent": number,
    "assumptions": string[]
  },
  "tips": string[]
}

Rules:

- All dates must be real dates derived from the sowing date.
- Calendar must cover the full cycle:
  land preparation → sowing → vegetative → flowering → fruiting → maturity → harvest.
- Irrigation must contain 6-12 events across the season based on crop water needs,
  soil type and irrigation source.
- Fertilizer must contain 3-6 scheduled applications.
- Every fertilizer entry MUST contain exactly 2 product options.
- Every product option must include:
  - realistic Indian retail price,
  - quantity needed for the farmer's total land,
  - dose per standard 20-litre knapsack sprayer.
- Pest and disease sections must each contain 2-5 scheduled entries.
- Each pest/disease entry must contain exactly 2 treatment options.
- Include chemical and biological/organic options when practical.
- Costs must cover seeds, land preparation, fertilizer, pesticide, irrigation,
  labour, harvesting and miscellaneous costs.
- Cost amounts are TOTAL INR for the farmer's complete land size, not per acre.
- Profit must use realistic crop yield and market price assumptions.
- netProfit = grossRevenue - totalCost.
- Use simple, concise, farmer-friendly language.
- Do not claim that live weather, mandi or market data was actually retrieved.
- When exact live information is unavailable, clearly describe prices and conditions as estimates.
- Keep chemical/product names and dosage information accurate.
`;

function getLanguageInstruction(
  language: PlannerLanguage,
): string {
  const languageName =
    LANGUAGE_NAMES[language] ?? "English";

  return `

IMPORTANT LANGUAGE INSTRUCTION:

The farmer has selected ${languageName}.

ALL NATURAL-LANGUAGE VALUES IN THE JSON MUST BE WRITTEN IN ${languageName}.

Translate:
- summary
- season
- calendar stage names
- calendar activities
- irrigation stage, method, quantity and notes
- fertilizer stage, purpose and product notes
- pest stage, problem, purpose and product notes
- disease stage, problem, purpose and product notes
- harvest indicators
- post-harvest instructions
- cost categories and details
- profit assumptions
- tips

Also translate any explanatory text inside:
- product names when appropriate
- dose descriptions
- treatment descriptions

However:
- Keep JSON property names EXACTLY as specified.
- Keep numbers unchanged.
- Keep dates in YYYY-MM-DD format.
- Keep ₹ currency notation.
- Keep scientific names, chemical names, abbreviations and technical product names accurate.
- Do not switch back to English.
- Do not add markdown or prose outside the JSON.
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

export const generateFarmPlan = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((data: PlannerInput) => data)
  .handler(async ({ data }): Promise<FarmPlan> => {
    const { callGemini } = await import(
      "@/lib/ai/gemini.server"
    );

    const language =
      data.language ?? "en";

    const prompt = `Farmer input:

- Crop: ${data.crop}
- State: ${data.state}
- District: ${data.district}
- Land size: ${data.landSizeAcres} acres
- Soil type: ${data.soilType}
- Irrigation source: ${data.irrigationSource}
- Sowing date: ${data.sowingDate}

Selected language: ${
      LANGUAGE_NAMES[language]
    }

Generate the complete seasonal farm plan JSON now.
All natural-language values must follow the selected language instruction.`;

    const { text } = await callGemini({
      system:
        SYSTEM +
        getLanguageInstruction(language),
      prompt,
      temperature: 0.4,
      maxOutputTokens: 6000,
      jsonMode: true,
    });

    const parsed =
      parseJson<FarmPlan>(text);

    if (!parsed) {
      throw new Error(
        "Failed to generate farm plan. Please try again.",
      );
    }

    return {
      ...parsed,
      generatedAt:
        new Date().toISOString(),
    };
  });