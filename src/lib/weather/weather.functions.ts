import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface WeatherHour {
  time: string;
  tempC: number;
  precipProb: number;
  code: number;
}

export interface WeatherDay {
  date: string;
  tempMaxC: number;
  tempMinC: number;
  precipProb: number;
  uvMax: number;
  code: number;
}

export interface WeatherCurrent {
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  windKph: number;
  precipMm: number;
  precipProb: number;
  uvIndex: number;
  code: number;
  isDay: boolean;
}

export interface WeatherLocation {
  name: string;
  region?: string;
  country?: string;
  lat: number;
  lng: number;
  timezone: string;
}

export interface WeatherAdvisory {
  summary: string;

  irrigation: {
    action: string;
    reason: string;
    level: "Skip" | "Reduce" | "Normal" | "Increase";
  };

  spray: {
    action: string;
    reason: string;
    safe: boolean;
  };

  diseaseRisk: {
    level: "Low" | "Medium" | "High";
    note: string;
  };

  pestRisk: {
    level: "Low" | "Medium" | "High";
    note: string;
  };

  heatStress: {
    warning: boolean;
    note: string;
  };

  frost: {
    warning: boolean;
    note: string;
  };

  todayActivities: string[];
  tomorrowActivities: string[];
}

export interface WeatherIntelResult {
  location: WeatherLocation;
  current: WeatherCurrent;
  hourly: WeatherHour[];
  daily: WeatherDay[];
  advisory: WeatherAdvisory;
  fetchedAt: string;
}

interface Input {
  lat?: number;
  lng?: number;
  place?: string;
  crops?: string[];
  language?: "en" | "hi" | "kn" | "ta";
}

/* -------------------------------------------------------------------------- */
/* WeatherAPI.com                                                              */
/* -------------------------------------------------------------------------- */

interface WAResponse {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime_epoch: number;
  };

  current: {
    temp_c: number;
    feelslike_c: number;
    humidity: number;
    wind_kph: number;
    precip_mm: number;
    uv: number;
    is_day: number;
    condition: {
      code: number;
    };
  };

  forecast: {
    forecastday: Array<{
      date: string;

      day: {
        maxtemp_c: number;
        mintemp_c: number;
        daily_chance_of_rain: number;
        uv: number;
        condition: {
          code: number;
        };
      };

      hour: Array<{
        time: string;
        time_epoch: number;
        temp_c: number;
        chance_of_rain: number;
        condition: {
          code: number;
        };
      }>;
    }>;
  };
}

/* -------------------------------------------------------------------------- */
/* WeatherAPI condition codes → UI codes                                      */
/* -------------------------------------------------------------------------- */

function mapConditionCode(waCode: number): number {
  const map: Record<number, number> = {
    1000: 0,
    1003: 2,
    1006: 3,
    1009: 3,

    1030: 45,

    1063: 61,
    1066: 71,
    1069: 66,
    1072: 66,
    1087: 95,

    1114: 71,
    1117: 75,

    1135: 45,
    1147: 48,

    1150: 51,
    1153: 53,
    1168: 56,
    1171: 57,

    1180: 61,
    1183: 61,
    1186: 63,
    1189: 63,
    1192: 65,
    1195: 65,

    1198: 66,
    1201: 67,
    1204: 68,
    1207: 69,

    1210: 71,
    1213: 71,
    1216: 73,
    1219: 73,
    1222: 75,
    1225: 75,

    1237: 77,

    1240: 80,
    1243: 81,
    1246: 82,

    1249: 85,
    1252: 86,

    1255: 85,
    1258: 86,

    1261: 77,
    1264: 77,

    1273: 95,
    1276: 96,
    1279: 95,
    1282: 96,
  };

  return map[waCode] ?? 3;
}

/* -------------------------------------------------------------------------- */
/* Indian PIN → district/state                                                 */
/* -------------------------------------------------------------------------- */

interface IndianPinResponse {
  success?: boolean;

  data?: {
    pincode?: string;

    post_offices?: Array<{
      office_name?: string;
      district?: string;
      state?: string;
      pincode?: string;
    }>;
  };
}

interface PinLocation {
  pin: string;
  officeName: string;
  district: string;
  state: string;
}

async function pinToLocation(
  pin: string,
): Promise<PinLocation | null> {
  try {
    const url =
      `https://api.pincodeapi.in/api/v1/pincode/${encodeURIComponent(pin)}`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.error(
        `Indian PIN lookup failed [${res.status}] for ${pin}`,
      );

      return null;
    }

    const json =
      (await res.json()) as IndianPinResponse;

    const offices =
      json.data?.post_offices ?? [];

    if (!json.success || offices.length === 0) {
      return null;
    }

    const office =
      offices.find(
        (item) =>
          item.office_name &&
          item.district &&
          item.state,
      ) ?? offices[0];

    if (
      !office?.office_name ||
      !office.district ||
      !office.state
    ) {
      return null;
    }

    return {
      pin,
      officeName: office.office_name,
      district: office.district,
      state: office.state,
    };
  } catch (error) {
    console.error(
      "Indian PIN lookup failed",
      error,
    );

    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* WeatherAPI request                                                          */
/* -------------------------------------------------------------------------- */

async function fetchWeatherAPI(
  q: string,
  apiKey: string,
): Promise<WAResponse> {
  const url =
    `https://api.weatherapi.com/v1/forecast.json?key=${encodeURIComponent(apiKey)}` +
    `&q=${encodeURIComponent(q)}` +
    `&days=3` +
    `&aqi=no` +
    `&alerts=no`;

  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.text();

    throw new Error(
      `WeatherAPI error [${res.status}]: ${body}`,
    );
  }

  return (await res.json()) as WAResponse;
}

/* -------------------------------------------------------------------------- */
/* AI weather advisory                                                         */
/* -------------------------------------------------------------------------- */

const ADVISORY_SYSTEM = `
You are AgriAssist AI's Weather Intelligence advisor for Indian farmers.

You are given ONLY structured weather JSON from a live weather API
and the farmer's crop profile.

Do NOT invent, adjust, or estimate any weather numbers.

Base every conclusion strictly on the provided JSON.

Return ONLY valid JSON matching this schema:

{
  "summary": string,

  "irrigation": {
    "action": string,
    "reason": string,
    "level": "Skip"|"Reduce"|"Normal"|"Increase"
  },

  "spray": {
    "action": string,
    "reason": string,
    "safe": boolean
  },

  "diseaseRisk": {
    "level": "Low"|"Medium"|"High",
    "note": string
  },

  "pestRisk": {
    "level": "Low"|"Medium"|"High",
    "note": string
  },

  "heatStress": {
    "warning": boolean,
    "note": string
  },

  "frost": {
    "warning": boolean,
    "note": string
  },

  "todayActivities": string[],
  "tomorrowActivities": string[]
}

Rules:

- Use the crop profile to tailor advice.
- If rain probability is high in next 6-12h, recommend skipping irrigation
  and delaying spraying.
- If wind > 15 km/h, spraying is not safe because of drift.
- If daily minimum temperature <= 4°C, frost warning should be true.
- If daily maximum temperature >= 38°C or feels-like >= 40°C,
  heat stress warning should be true.
- High humidity (>80%) with warm temperature (>22°C) means higher
  fungal disease risk.
- Keep language simple and Indian-farmer friendly.
`;

const LANGUAGE_NAMES = {
  en: "English",
  hi: "Hindi",
  kn: "Kannada",
  ta: "Tamil",
} as const;

function getLanguageInstruction(
  language: "en" | "hi" | "kn" | "ta",
) {
  const languageName =
    LANGUAGE_NAMES[language] ?? "English";

  return `
IMPORTANT LANGUAGE REQUIREMENT:

The farmer's selected language is ${languageName}.

Write ALL natural-language text in the JSON response in ${languageName}.

Translate:
- summary
- irrigation.action
- irrigation.reason
- spray.action
- spray.reason
- diseaseRisk.note
- pestRisk.note
- heatStress.note
- frost.note
- todayActivities
- tomorrowActivities

Do NOT translate JSON keys.

Keep these enum values EXACTLY in English:
- irrigation.level: "Skip" | "Reduce" | "Normal" | "Increase"
- diseaseRisk.level: "Low" | "Medium" | "High"
- pestRisk.level: "Low" | "Medium" | "High"

Keep:
- spray.safe as boolean
- heatStress.warning as boolean
- frost.warning as boolean

Do not translate or modify numerical weather values.

Use simple language that an Indian farmer can easily understand.
`;
}

/* -------------------------------------------------------------------------- */
/* JSON parser                                                                 */
/* -------------------------------------------------------------------------- */

function parseJson<T>(
  text: string,
): T | null {
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

/* -------------------------------------------------------------------------- */
/* Multilingual fallback                                                       */
/* -------------------------------------------------------------------------- */

function fallbackAdvisory(
  language: "en" | "hi" | "kn" | "ta" = "en",
): WeatherAdvisory {
  const fallback = {
    en: {
      summary:
        "Live weather retrieved. Detailed AI advisory is unavailable right now — showing the basic forecast.",

      irrigationAction:
        "Check soil moisture manually",

      irrigationReason:
        "AI advisory unavailable",

      sprayAction:
        "Use standard judgement based on wind and rain",

      sprayReason:
        "AI advisory unavailable",

      disease:
        "No AI disease assessment available.",

      pest:
        "No AI pest assessment available.",

      heat:
        "No heat stress warning.",

      frost:
        "No frost warning.",
    },

    hi: {
      summary:
        "लाइव मौसम की जानकारी प्राप्त हो गई है। अभी विस्तृत AI सलाह उपलब्ध नहीं है — सामान्य मौसम पूर्वानुमान दिखाया जा रहा है।",

      irrigationAction:
        "मिट्टी की नमी की स्वयं जाँच करें",

      irrigationReason:
        "AI सलाह उपलब्ध नहीं है",

      sprayAction:
        "हवा और बारिश को देखकर सामान्य निर्णय लें",

      sprayReason:
        "AI सलाह उपलब्ध नहीं है",

      disease:
        "AI द्वारा रोग का आकलन उपलब्ध नहीं है।",

      pest:
        "AI द्वारा कीट का आकलन उपलब्ध नहीं है।",

      heat:
        "गर्मी के तनाव की चेतावनी नहीं है।",

      frost:
        "पाले की चेतावनी नहीं है।",
    },

    kn: {
      summary:
        "ನೇರ ಹವಾಮಾನ ಮಾಹಿತಿ ಲಭ್ಯವಾಗಿದೆ. ಈಗ ವಿವರವಾದ AI ಸಲಹೆ ಲಭ್ಯವಿಲ್ಲ — ಮೂಲ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ.",

      irrigationAction:
        "ಮಣ್ಣಿನ ತೇವಾಂಶವನ್ನು ಸ್ವತಃ ಪರಿಶೀಲಿಸಿ",

      irrigationReason:
        "AI ಸಲಹೆ ಲಭ್ಯವಿಲ್ಲ",

      sprayAction:
        "ಗಾಳಿ ಮತ್ತು ಮಳೆಯನ್ನು ಗಮನಿಸಿ ಸಾಮಾನ್ಯ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳಿ",

      sprayReason:
        "AI ಸಲಹೆ ಲಭ್ಯವಿಲ್ಲ",

      disease:
        "AI ರೋಗದ ಮೌಲ್ಯಮಾಪನ ಲಭ್ಯವಿಲ್ಲ.",

      pest:
        "AI ಕೀಟದ ಮೌಲ್ಯಮಾಪನ ಲಭ್ಯವಿಲ್ಲ.",

      heat:
        "ಬಿಸಿಲಿನ ಒತ್ತಡದ ಎಚ್ಚರಿಕೆ ಇಲ್ಲ.",

      frost:
        "ಹಿಮಪಾತದ ಎಚ್ಚರಿಕೆ ಇಲ್ಲ.",
    },

    ta: {
      summary:
        "நேரடி வானிலை தகவல் பெறப்பட்டது. தற்போது விரிவான AI ஆலோசனை கிடைக்கவில்லை — அடிப்படை வானிலை முன்னறிவிப்பு காட்டப்படுகிறது.",

      irrigationAction:
        "மண்ணின் ஈரப்பதத்தை நேரடியாக சரிபார்க்கவும்",

      irrigationReason:
        "AI ஆலோசனை கிடைக்கவில்லை",

      sprayAction:
        "காற்று மற்றும் மழையைப் பார்த்து வழக்கமான முடிவை எடுக்கவும்",

      sprayReason:
        "AI ஆலோசனை கிடைக்கவில்லை",

      disease:
        "AI நோய் மதிப்பீடு கிடைக்கவில்லை.",

      pest:
        "AI பூச்சி மதிப்பீடு கிடைக்கவில்லை.",

      heat:
        "வெப்ப அழுத்த எச்சரிக்கை இல்லை.",

      frost:
        "பனிப்பொழிவு எச்சரிக்கை இல்லை.",
    },
  } as const;

  const t =
    fallback[language] ??
    fallback.en;

  return {
    summary: t.summary,

    irrigation: {
      action: t.irrigationAction,
      reason: t.irrigationReason,
      level: "Normal",
    },

    spray: {
      action: t.sprayAction,
      reason: t.sprayReason,
      safe: true,
    },

    diseaseRisk: {
      level: "Low",
      note: t.disease,
    },

    pestRisk: {
      level: "Low",
      note: t.pest,
    },

    heatStress: {
      warning: false,
      note: t.heat,
    },

    frost: {
      warning: false,
      note: t.frost,
    },

    todayActivities: [],
    tomorrowActivities: [],
  };
}

/* -------------------------------------------------------------------------- */
/* Generate AI advisory                                                        */
/* -------------------------------------------------------------------------- */

async function generateAdvisory(
  weatherJson: unknown,
  crops: string[] | undefined,
  language: "en" | "hi" | "kn" | "ta" = "en",
): Promise<WeatherAdvisory> {
  const { callGemini } =
    await import("@/lib/ai/gemini.server");

  const cropLine =
    crops && crops.length
      ? crops.join(", ")
      : "General mixed farming (not specified)";

  const system =
    ADVISORY_SYSTEM +
    "\n" +
    getLanguageInstruction(language);

  try {
    const { text } = await callGemini({
      system,

      prompt:
        `Farmer's crop profile: ${cropLine}\n\n` +
        `Selected language: ${LANGUAGE_NAMES[language]}\n\n` +
        `Live weather JSON (source of truth — do not change):\n` +
        `${JSON.stringify(weatherJson)}\n\n` +
        `Return the JSON advisory now.`,

      temperature: 0.2,
      maxOutputTokens: 1200,
      jsonMode: true,
    });

    const parsed =
      parseJson<WeatherAdvisory>(text);

    return (
      parsed ??
      fallbackAdvisory(language)
    );
  } catch (error) {
    console.error(
      "Weather advisory failed",
      error,
    );

    return fallbackAdvisory(language);
  }
}

/* -------------------------------------------------------------------------- */
/* Server function                                                             */
/* -------------------------------------------------------------------------- */

export const getWeatherIntelligence =
  createServerFn({ method: "POST" })
    .middleware([requireSupabaseAuth])
    .inputValidator(
      (data: Input) => data,
    )
    .handler(
      async ({
        data,
      }): Promise<WeatherIntelResult> => {
        const apiKey =
          process.env.WEATHERAPI_KEY;

        if (!apiKey) {
          throw new Error(
            "Weather service is not configured. Missing WEATHERAPI_KEY.",
          );
        }

        /* ------------------------------------------------------------------ */
        /* Resolve WeatherAPI query                                            */
        /* ------------------------------------------------------------------ */

        let q: string;

        let overrideName:
          | string
          | undefined;

        let overrideRegion:
          | string
          | undefined;

        /* ------------------------------------------------------------------ */
        /* User searched for a place/PIN                                       */
        /* ------------------------------------------------------------------ */

        if (data.place) {
          const trimmed =
            data.place.trim();

          if (/^\d{6}$/.test(trimmed)) {
            const pin =
              await pinToLocation(
                trimmed,
              );

            if (!pin) {
              throw new Error(
                `Couldn't find PIN "${trimmed}". ` +
                  `Try a nearby city or village name, or use auto-detect.`,
              );
            }

            q =
              `${pin.district}, ${pin.state}, India`;

            overrideName =
              `${pin.officeName} (${pin.pin})`;

            overrideRegion =
              `${pin.district}, ${pin.state}`;
          } else {
            q = trimmed;
          }
        }

        /* ------------------------------------------------------------------ */
        /* Live browser location                                                */
        /* ------------------------------------------------------------------ */

        else if (
          typeof data.lat === "number" &&
          typeof data.lng === "number"
        ) {
          q =
            `${data.lat},${data.lng}`;
        }

        /* ------------------------------------------------------------------ */
        /* Safe fallback                                                        */
        /* ------------------------------------------------------------------ */

        else {
          q = "Bengaluru";
        }

        /* ------------------------------------------------------------------ */
        /* Fetch actual weather                                                 */
        /* ------------------------------------------------------------------ */

        const wa =
          await fetchWeatherAPI(
            q,
            apiKey,
          );

        /* ------------------------------------------------------------------ */
        /* Location                                                             */
        /* ------------------------------------------------------------------ */

        const location: WeatherLocation = {
          name:
            overrideName ??
            wa.location.name,

          region:
            overrideRegion ??
            wa.location.region,

          country:
            wa.location.country,

          lat:
            wa.location.lat,

          lng:
            wa.location.lon,

          timezone:
            wa.location.tz_id,
        };

        /* ------------------------------------------------------------------ */
        /* Current weather                                                      */
        /* ------------------------------------------------------------------ */

        const current: WeatherCurrent = {
          tempC:
            wa.current.temp_c,

          feelsLikeC:
            wa.current.feelslike_c,

          humidity:
            wa.current.humidity,

          windKph:
            wa.current.wind_kph,

          precipMm:
            wa.current.precip_mm,

          precipProb:
            wa.forecast
              .forecastday[0]
              ?.day
              .daily_chance_of_rain ?? 0,

          uvIndex:
            wa.current.uv,

          code:
            mapConditionCode(
              wa.current.condition.code,
            ),

          isDay:
            wa.current.is_day === 1,
        };

        /* ------------------------------------------------------------------ */
        /* Hourly forecast                                                      */
        /* ------------------------------------------------------------------ */

        const nowSec =
          wa.location.localtime_epoch;

        const allHours =
          wa.forecast.forecastday.flatMap(
            (day) => day.hour,
          );

        const hourly: WeatherHour[] =
          allHours
            .filter(
              (hour) =>
                hour.time_epoch >=
                nowSec - 3600,
            )
            .slice(0, 24)
            .map((hour) => ({
              time:
                hour.time.replace(
                  " ",
                  "T",
                ),

              tempC:
                hour.temp_c,

              precipProb:
                hour.chance_of_rain,

              code:
                mapConditionCode(
                  hour.condition.code,
                ),
            }));

        /* ------------------------------------------------------------------ */
        /* Daily forecast                                                       */
        /* ------------------------------------------------------------------ */

        const daily: WeatherDay[] =
          wa.forecast.forecastday.map(
            (day) => ({
              date:
                day.date,

              tempMaxC:
                day.day.maxtemp_c,

              tempMinC:
                day.day.mintemp_c,

              precipProb:
                day.day
                  .daily_chance_of_rain,

              uvMax:
                day.day.uv,

              code:
                mapConditionCode(
                  day.day.condition.code,
                ),
            }),
          );

        /* ------------------------------------------------------------------ */
        /* AI advisory payload                                                  */
        /* ------------------------------------------------------------------ */

        const aiPayload = {
          location: {
            name:
              location.name,

            region:
              location.region,

            country:
              location.country,

            timezone:
              location.timezone,
          },

          current,

          hourly:
            hourly.slice(0, 12),

          daily,
        };

        /* ------------------------------------------------------------------ */
        /* Generate multilingual advisory                                       */
        /* ------------------------------------------------------------------ */

        const advisory =
          await generateAdvisory(
            aiPayload,
            data.crops,
            data.language ?? "en",
          );

        /* ------------------------------------------------------------------ */
        /* Final result                                                         */
        /* ------------------------------------------------------------------ */

        return {
          location,
          current,
          hourly,
          daily,
          advisory,
          fetchedAt:
            new Date().toISOString(),
        };
      },
    );