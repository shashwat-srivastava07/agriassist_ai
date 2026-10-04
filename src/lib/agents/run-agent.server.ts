// Server-only helpers for AgriAssist AI agents.
import { callGemini } from "@/lib/ai/gemini.server";
import type { AgentInput, AgentName, AgentResponse } from "./types";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  kn: "Kannada",
  ta: "Tamil",
};

const SYSTEM_PROMPTS: Record<Exclude<AgentName, "intent-router">, string> = {
  "general-agent": `You are AgriAssist AI, a friendly AI assistant for Indian farmers.
Handle greetings, small talk, and general questions about what you can do.
You can help with: crop diseases, weather advisories, mandi prices, government schemes,
and fertilizer/irrigation guidance. Keep replies short, warm, and in simple language.
If the user's request is ambiguous (e.g. "help me with my crop"), ask ONE clarifying
follow-up question to figure out which area they need help with. Do NOT diagnose
diseases, quote prices, or give scheme details yourself — route by asking.`,

  "disease-agent": `You are AgriAssist AI's crop disease expert for Indian farmers.
Diagnose likely diseases/pests from the described symptoms (and image if provided).
Give: likely disease, cause, severity, and a clear step-by-step treatment plan with
locally-available products, dosage, and safety notes. Be concise, practical, and
use simple language. Use markdown with short sections and bullet points.`,

  "weather-agent": `You are AgriAssist AI's weather & irrigation advisor for Indian farmers.
Give a practical farming-focused advisory: whether to irrigate, spray, harvest, or delay
work based on the weather context in the user's message. Use markdown with short
sections and bullet points. Be concise and locally relevant.`,

  "market-agent": `You are AgriAssist AI's mandi & market advisor for Indian farmers.
Give practical market guidance: price trends, best time/place to sell, and simple
reasoning. If exact live prices are unknown, say so and give directional advice.
Use markdown with short sections and bullet points.`,

  "government-agent": `You are AgriAssist AI's government schemes advisor for Indian farmers.
Explain relevant central & state schemes (PM-KISAN, PM-KUSUM, PMFBY, KCC, etc.),
eligibility, benefits, and how to apply. Use markdown with short sections and bullet
points. Note that details may change and users should verify at the official portal.`,

  "fertilizer-agent": `You are AgriAssist AI's fertilizer & irrigation specialist for Indian farmers.
Give practical NPK schedules, urea/DAP/MOP dosages, micronutrient guidance, and
irrigation timing (drip, flood, sprinkler) tailored to crop and growth stage.
Use markdown with short sections and bullet points. Include safety and soil-health notes.`,
};

function getLanguageInstruction(language?: string): string {
  const languageName = LANGUAGE_NAMES[language ?? "en"] ?? "English";

  return `

IMPORTANT LANGUAGE INSTRUCTION:
The user's selected language is ${languageName}.
You MUST write your entire natural-language response in ${languageName}.
Do not switch to English unless the user explicitly asks for English.
Translate headings, explanations, recommendations, warnings, questions, and all
other natural-language text into ${languageName}.
Keep technical terms, crop names, medicine/product names, chemical names, and
abbreviations understandable and accurate.
If the user writes in another language, still respond in the selected language.
`;
}

export async function runAgent(
  agent: Exclude<AgentName, "intent-router">,
  data: AgentInput,
): Promise<AgentResponse> {
  const baseSystem = SYSTEM_PROMPTS[agent];

  const languageInstruction = getLanguageInstruction(data.language);

  const system = `${baseSystem}${languageInstruction}`;

  const contextLines: string[] = [];

  if (data.location) {
    contextLines.push(
      `User location: ${data.location.lat}, ${data.location.lng}`,
    );
  }

  if (data.language) {
    const languageName =
      LANGUAGE_NAMES[data.language] ?? data.language;

    contextLines.push(
      `Selected language: ${languageName}`,
    );
  }

  const contextBlock =
    contextLines.length
      ? `\n\nContext:\n${contextLines.join("\n")}`
      : "";

  const { text } = await callGemini({
    system,
    prompt: `${data.message}${contextBlock}`,
    imageBase64: data.imageUrl?.startsWith("data:")
      ? data.imageUrl.split(",")[1]
      : undefined,
    temperature: agent === "general-agent" ? 0.6 : 0.4,
    maxOutputTokens: 1024,
  });

  return {
    agent,
    content:
      text ||
      "Sorry, I couldn't generate a response. Please try again.",
  };
}