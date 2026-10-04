import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type {
  AgentInput,
  AgentResponse,
  JsonValue,
} from "./types";

type Severity =
  | "Mild"
  | "Moderate"
  | "Severe"
  | "Unknown";

type Emergency =
  | "Low"
  | "Medium"
  | "High"
  | "Critical";

interface VisionDiagnosis {
  diseaseName: string;
  confidence: number;
  severity: Severity;
  symptoms: string[];
  possibleCause: string;
  organicTreatment: string[];
  chemicalTreatment: string[];
  preventionTips: string[];
  nextActions: string[];
  emergencyLevel: Emergency;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  kn: "Kannada",
  ta: "Tamil",
};

function getLanguage(language?: string): string {
  return (
    LANGUAGE_NAMES[language ?? "en"] ??
    "English"
  );
}

function buildSystemPrompt(
  language?: string,
): string {
  const selectedLanguage =
    getLanguage(language);

  return `You are AgriAssist AI's AI Vision plant pathologist for Indian farmers.
You analyze the attached crop image and the farmer's message to diagnose diseases,
pests, or nutrient disorders.

IMPORTANT LANGUAGE RULE:
The farmer's selected language is ${selectedLanguage}.

All natural-language text in your JSON response MUST be written in ${selectedLanguage}.

This includes:
- diseaseName
- symptoms
- possibleCause
- organicTreatment
- chemicalTreatment
- preventionTips
- nextActions

Do NOT write these natural-language fields in English when the selected language is not English.

The following two fields MUST remain exactly in English because the application uses them
as fixed enum values:
- severity: "Mild" | "Moderate" | "Severe" | "Unknown"
- emergencyLevel: "Low" | "Medium" | "High" | "Critical"

Return ONLY a valid JSON object with this exact schema:

{
  "diseaseName": string,
  "confidence": number,
  "severity": "Mild" | "Moderate" | "Severe" | "Unknown",
  "symptoms": string[],
  "possibleCause": string,
  "organicTreatment": string[],
  "chemicalTreatment": string[],
  "preventionTips": string[],
  "nextActions": string[],
  "emergencyLevel": "Low" | "Medium" | "High" | "Critical"
}

Rules:
- If the image is unclear, wrong subject, or you are uncertain, set confidence < 70.
- In that case, set nextActions to instructions for taking better photos.
- Ask for close-up photos of the affected leaf top and bottom, whole plant,
  affected fruit or stem, and daylight photos.
- If confidence is below 70, organicTreatment and chemicalTreatment MUST be empty arrays.
- Be concise and use simple language suitable for smallholder farmers.
- Use Indian agricultural products and brands where appropriate.
- Keep technical agricultural names recognizable.
- Never invent facts.
- If unsure, lower confidence instead of guessing.
- Dosages must use clear units such as g/L or ml/L.
- Treatment advice must include appropriate safety precautions.
- Return ONLY the JSON object.`;
}

function parseJson(
  text: string,
): VisionDiagnosis | null {
  const cleaned = text
    .replace(
      /^```(?:json)?\s*/i,
      "",
    )
    .replace(
      /```\s*$/i,
      "",
    )
    .trim();

  const start =
    cleaned.indexOf("{");

  const end =
    cleaned.lastIndexOf("}");

  if (
    start < 0 ||
    end < 0
  ) {
    return null;
  }

  try {
    return JSON.parse(
      cleaned.slice(
        start,
        end + 1,
      ),
    ) as VisionDiagnosis;
  } catch {
    return null;
  }
}

function normalize(
  raw: Partial<VisionDiagnosis> | null,
): VisionDiagnosis {
  const arr = (
    value: unknown,
  ): string[] =>
    Array.isArray(value)
      ? value
          .map((item) =>
            String(item),
          )
          .filter(Boolean)
      : [];

  const validSeverities: Severity[] = [
    "Mild",
    "Moderate",
    "Severe",
    "Unknown",
  ];

  const severity =
    validSeverities.includes(
      raw?.severity as Severity,
    )
      ? (raw?.severity as Severity)
      : "Unknown";

  const validEmergencyLevels: Emergency[] = [
    "Low",
    "Medium",
    "High",
    "Critical",
  ];

  const emergencyLevel =
    validEmergencyLevels.includes(
      raw?.emergencyLevel as Emergency,
    )
      ? (raw?.emergencyLevel as Emergency)
      : "Low";

  const confidenceRaw =
    Number(
      raw?.confidence ?? 0,
    );

  const confidence = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        Number.isFinite(
          confidenceRaw,
        )
          ? confidenceRaw
          : 0,
      ),
    ),
  );

  return {
    diseaseName: String(
      raw?.diseaseName ??
        "Unclear diagnosis",
    ),

    confidence,

    severity,

    symptoms: arr(
      raw?.symptoms,
    ),

    possibleCause: String(
      raw?.possibleCause ??
        "",
    ),

    organicTreatment: arr(
      raw?.organicTreatment,
    ),

    chemicalTreatment: arr(
      raw?.chemicalTreatment,
    ),

    preventionTips: arr(
      raw?.preventionTips,
    ),

    nextActions: arr(
      raw?.nextActions,
    ),

    emergencyLevel,
  };
}

function getNoImageMessage(
  language: string,
): string {
  const messages: Record<
    string,
    string
  > = {
    English:
      "📸 **Please upload a clear photo of the affected crop first.**\n\nFor an accurate diagnosis, I need to see the plant. Please share:\n\n- A close-up of the affected leaf (top and underside)\n- A photo of the whole plant\n- Any affected fruit, stem, or roots\n\nTake the photos in daylight and try to keep them in focus. Once you attach the image, I'll diagnose the disease and recommend a treatment plan.",

    Hindi:
      "📸 **कृपया पहले प्रभावित फसल की एक स्पष्ट फोटो अपलोड करें।**\n\nसही रोग पहचान के लिए मुझे पौधे को देखना जरूरी है। कृपया साझा करें:\n\n- प्रभावित पत्ती का पास से फोटो (ऊपरी और निचला भाग)\n- पूरे पौधे का फोटो\n- प्रभावित फल, तना या जड़ों का फोटो\n\nफोटो दिन की रोशनी में लें और ध्यान रखें कि फोटो स्पष्ट हो। फोटो अपलोड करने के बाद मैं रोग की पहचान करके उपचार की सलाह दूँगा।",

    Kannada:
      "📸 **ದಯವಿಟ್ಟು ಮೊದಲು ಬಾಧಿತ ಬೆಳೆಯ ಸ್ಪಷ್ಟವಾದ ಫೋಟೋವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.**\n\nನಿಖರವಾದ ರೋಗ ಪತ್ತೆಗಾಗಿ ನಾನು ಸಸ್ಯವನ್ನು ನೋಡಬೇಕು. ದಯವಿಟ್ಟು ಇವುಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ:\n\n- ಬಾಧಿತ ಎಲೆಯ ಹತ್ತಿರದ ಫೋಟೋ (ಮೇಲ್ಭಾಗ ಮತ್ತು ಕೆಳಭಾಗ)\n- ಸಂಪೂರ್ಣ ಸಸ್ಯದ ಫೋಟೋ\n- ಬಾಧಿತ ಹಣ್ಣು, ಕಾಂಡ ಅಥವಾ ಬೇರುಗಳ ಫೋಟೋ\n\nಫೋಟೋಗಳನ್ನು ಹಗಲಿನ ಬೆಳಕಿನಲ್ಲಿ ತೆಗೆದು ಸ್ಪಷ್ಟವಾಗಿರುವಂತೆ ನೋಡಿಕೊಳ್ಳಿ. ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ನಂತರ ನಾನು ರೋಗವನ್ನು ಗುರುತಿಸಿ ಚಿಕಿತ್ಸೆಯ ಸಲಹೆ ನೀಡುತ್ತೇನೆ.",

    Tamil:
      "📸 **முதலில் பாதிக்கப்பட்ட பயிரின் தெளிவான புகைப்படத்தைப் பதிவேற்றுங்கள்.**\n\nதுல்லியமான நோயைக் கண்டறிய நான் தாவரத்தைப் பார்க்க வேண்டும். தயவுசெய்து இவற்றைப் பகிருங்கள்:\n\n- பாதிக்கப்பட்ட இலையின் அருகிலிருந்து எடுத்த புகைப்படம் (மேல் மற்றும் கீழ்ப்பக்கம்)\n- முழு தாவரத்தின் புகைப்படம்\n- பாதிக்கப்பட்ட பழம், தண்டு அல்லது வேர்களின் புகைப்படம்\n\nபுகைப்படங்களை பகல் நேர வெளிச்சத்தில் எடுத்து தெளிவாக வைத்திருக்கவும். படத்தைப் பதிவேற்றியதும் நோயைக் கண்டறிந்து சிகிச்சையைப் பரிந்துரைக்கிறேன்.",
  };

  return (
    messages[language] ??
    messages.English
  );
}

function getLowConfidenceActions(
  language: string,
): string[] {
  const actions: Record<
    string,
    string[]
  > = {
    English: [
      "Take a close-up photo of the affected leaf (top side).",
      "Take a photo of the underside of the same leaf.",
      "Take a wider photo of the whole plant.",
      "Photograph any affected fruit, stem, or roots — in daylight.",
    ],

    Hindi: [
      "प्रभावित पत्ती के ऊपरी भाग की पास से स्पष्ट फोटो लें।",
      "उसी पत्ती के निचले भाग की फोटो लें।",
      "पूरे पौधे की थोड़ी दूर से फोटो लें।",
      "प्रभावित फल, तने या जड़ों की दिन की रोशनी में फोटो लें।",
    ],

    Kannada: [
      "ಬಾಧಿತ ಎಲೆಯ ಮೇಲ್ಭಾಗದ ಹತ್ತಿರದ ಸ್ಪಷ್ಟ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ.",
      "ಅದೇ ಎಲೆಯ ಕೆಳಭಾಗದ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ.",
      "ಸಂಪೂರ್ಣ ಸಸ್ಯದ ಸ್ವಲ್ಪ ದೂರದ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ.",
      "ಬಾಧಿತ ಹಣ್ಣು, ಕಾಂಡ ಅಥವಾ ಬೇರುಗಳ ಹಗಲಿನ ಬೆಳಕಿನಲ್ಲಿನ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ.",
    ],

    Tamil: [
      "பாதிக்கப்பட்ட இலையின் மேற்பகுதியை அருகிலிருந்து தெளிவாகப் புகைப்படம் எடுக்கவும்.",
      "அதே இலையின் கீழ்ப்பகுதியின் புகைப்படத்தை எடுக்கவும்.",
      "முழு தாவரத்தையும் சிறிது தொலைவில் இருந்து புகைப்படம் எடுக்கவும்.",
      "பாதிக்கப்பட்ட பழம், தண்டு அல்லது வேர்களை பகல் நேர வெளிச்சத்தில் புகைப்படம் எடுக்கவும்.",
    ],
  };

  return (
    actions[language] ??
    actions.English
  );
}

function getLowConfidenceNotice(
  language: string,
): string {
  const notices: Record<
    string,
    string
  > = {
    English:
      "I'm not confident enough in this diagnosis. Please share 2–3 more clear photos before I recommend a treatment.",

    Hindi:
      "मैं इस रोग की पहचान को लेकर पर्याप्त आश्वस्त नहीं हूँ। उपचार की सलाह देने से पहले कृपया 2–3 और स्पष्ट फोटो साझा करें।",

    Kannada:
      "ಈ ರೋಗದ ಪತ್ತೆಯ ಬಗ್ಗೆ ನನಗೆ ಸಾಕಷ್ಟು ಖಚಿತತೆ ಇಲ್ಲ. ಚಿಕಿತ್ಸೆಯನ್ನು ಸೂಚಿಸುವ ಮೊದಲು ದಯವಿಟ್ಟು 2–3 ಸ್ಪಷ್ಟವಾದ ಫೋಟೋಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.",

    Tamil:
      "இந்த நோயைக் கண்டறிவதில் எனக்கு போதுமான நம்பிக்கை இல்லை. சிகிச்சையைப் பரிந்துரைக்கும் முன் தயவுசெய்து மேலும் 2–3 தெளிவான புகைப்படங்களைப் பகிருங்கள்.",
  };

  return (
    notices[language] ??
    notices.English
  );
}

function getIntro(
  language: string,
  lowConfidence: boolean,
): string {
  const intros: Record<
    string,
    {
      normal: string;
      lowConfidence: string;
    }
  > = {
    English: {
      normal:
        "Here's the AI Vision diagnosis for the image you shared.",
      lowConfidence:
        "I couldn't diagnose this confidently. I need a few more photos before recommending treatment.",
    },

    Hindi: {
      normal:
        "आपके द्वारा साझा की गई फोटो के लिए AI Vision रोग पहचान यहाँ है।",
      lowConfidence:
        "मैं इस रोग की निश्चित पहचान नहीं कर पाया। उपचार की सलाह देने से पहले मुझे कुछ और स्पष्ट फोटो चाहिए।",
    },

    Kannada: {
      normal:
        "ನೀವು ಹಂಚಿಕೊಂಡ ಚಿತ್ರಕ್ಕಾಗಿ AI Vision ರೋಗ ಪತ್ತೆ ಇಲ್ಲಿದೆ.",
      lowConfidence:
        "ಈ ರೋಗವನ್ನು ಖಚಿತವಾಗಿ ಪತ್ತೆಹಚ್ಚಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಚಿಕಿತ್ಸೆಯನ್ನು ಸೂಚಿಸುವ ಮೊದಲು ಇನ್ನೂ ಕೆಲವು ಸ್ಪಷ್ಟವಾದ ಫೋಟೋಗಳು ಬೇಕಾಗಿವೆ.",
    },

    Tamil: {
      normal:
        "நீங்கள் பகிர்ந்த படத்திற்கான AI Vision நோய் கண்டறிதல் இதோ.",
      lowConfidence:
        "இந்த நோயை உறுதியாகக் கண்டறிய முடியவில்லை. சிகிச்சையைப் பரிந்துரைக்கும் முன் இன்னும் சில தெளிவான புகைப்படங்கள் தேவை.",
    },
  };

  const selected =
    intros[language] ??
    intros.English;

  return lowConfidence
    ? selected.lowConfidence
    : selected.normal;
}

export const runDiseaseAgent =
  createServerFn({
    method: "POST",
  })
    .middleware([
      requireSupabaseAuth,
    ])
    .inputValidator(
      (data: AgentInput) =>
        data,
    )
    .handler(
      async ({
        data,
      }): Promise<AgentResponse> => {
        const selectedLanguage =
          getLanguage(
            data.language,
          );

        // No image → ask for one.
        if (!data.imageUrl) {
          return {
            agent:
              "disease-agent",
            content:
              getNoImageMessage(
                selectedLanguage,
              ),
          };
        }

        const imageBase64 =
          data.imageUrl.startsWith(
            "data:",
          )
            ? data.imageUrl.split(
                ",",
              )[1]
            : undefined;

        const imageMimeType =
          data.imageUrl.startsWith(
            "data:",
          )
            ? data.imageUrl.slice(
                5,
                data.imageUrl.indexOf(
                  ";",
                ),
              )
            : "image/jpeg";

        const contextLines: string[] =
          [];

        if (data.location) {
          contextLines.push(
            `Farmer location: ${data.location.lat}, ${data.location.lng}`,
          );
        }

        contextLines.push(
          `Preferred language: ${selectedLanguage}`,
        );

        const contextBlock =
          `\n\nContext:\n${contextLines.join(
            "\n",
          )}`;

        const {
          callGemini,
        } = await import(
          "@/lib/ai/gemini.server"
        );

        const {
          text,
        } = await callGemini({
          system:
            buildSystemPrompt(
              data.language,
            ),

          prompt: `Farmer's message: ${
            data.message ||
            "(no text provided — please analyze the image)"
          }

The farmer selected ${selectedLanguage} as their preferred language.

Return the complete diagnosis JSON now.
All natural-language fields must be written in ${selectedLanguage}.` +
            contextBlock,

          imageBase64,
          imageMimeType,

          temperature: 0.2,

          maxOutputTokens: 1400,

          jsonMode: true,
        });

        const parsed =
          normalize(
            parseJson(text),
          );

        const lowConfidence =
          parsed.confidence < 70;

        const visionBlock: JsonValue =
          {
            kind: "diseaseVision",

            diseaseName:
              parsed.diseaseName,

            confidence:
              parsed.confidence,

            severity:
              parsed.severity,

            symptoms:
              parsed.symptoms,

            possibleCause:
              parsed.possibleCause,

            organicTreatment:
              parsed.organicTreatment,

            chemicalTreatment:
              parsed.chemicalTreatment,

            preventionTips:
              parsed.preventionTips,

            nextActions:
              parsed.nextActions
                .length
                ? parsed.nextActions
                : lowConfidence
                  ? getLowConfidenceActions(
                      selectedLanguage,
                    )
                  : [],

            emergencyLevel:
              parsed.emergencyLevel,

            ...(lowConfidence
              ? {
                  lowConfidenceNotice:
                    getLowConfidenceNotice(
                      selectedLanguage,
                    ),
                }
              : {}),
          };

        const intro =
          getIntro(
            selectedLanguage,
            lowConfidence,
          );

        return {
          agent:
            "disease-agent",

          content:
            intro,

          blocks: [
            visionBlock,
          ],
        };
      },
    );