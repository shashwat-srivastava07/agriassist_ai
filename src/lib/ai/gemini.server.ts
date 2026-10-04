// Server-only Gemini helper.
// Uses Google Gemini through Cloudflare AI Gateway with a stored provider key.
// No Gemini API key is exposed to the Worker request.

export interface GeminiCallOptions {
  model?: string;
  system?: string;
  prompt: string;
  imageBase64?: string;
  imageMimeType?: string;
  temperature?: number;
  maxOutputTokens?: number;
  jsonMode?: boolean;
}

export interface GeminiResult {
  text: string;
  raw?: unknown;
}

const CLOUDFLARE_ACCOUNT_ID = "47f90236cbd302bd26d378105664fc24";
const CLOUDFLARE_GATEWAY_ID = "default";

const GEMINI_GATEWAY_URL =
  `https://gateway.ai.cloudflare.com/v1/${CLOUDFLARE_ACCOUNT_ID}/${CLOUDFLARE_GATEWAY_ID}/google-ai-studio/v1beta`;

const DEFAULT_MODEL = "gemini-3.5-flash-lite";

function getGatewayToken(): string {
  const token = process.env.CF_AIG_TOKEN;

  if (!token) {
    throw new Error(
      "CF_AIG_TOKEN is not set. Add your Cloudflare AI Gateway token to the Worker.",
    );
  }

  return token;
}

/**
 * Convert old model names to currently supported Google model names.
 */
function normalizeModelName(model: string): string {
  if (model.startsWith("google/")) {
    return model.slice("google/".length);
  }

  if (
    model === "gemini-3.7-flash" ||
    model === "gemini-3.6-flash" ||
    model === "gemini-3-flash-preview"
  ) {
    return DEFAULT_MODEL;
  }

  return model;
}

type GeminiPart =
  | {
      text: string;
    }
  | {
      inlineData: {
        mimeType: string;
        data: string;
      };
    };

interface GeminiMessage {
  role: "user" | "model";
  parts: GeminiPart[];
}

async function requestGemini(
  model: string,
  opts: GeminiCallOptions,
  cloudflareGatewayToken: string,
): Promise<GeminiResult> {
  const userParts: GeminiPart[] = [
    {
      text: opts.prompt,
    },
  ];

  // Support image input for the Disease Scanner.
  if (opts.imageBase64) {
    userParts.push({
      inlineData: {
        mimeType: opts.imageMimeType ?? "image/jpeg",
        data: opts.imageBase64,
      },
    });
  }

  const body: Record<string, unknown> = {
    contents: [
      {
        role: "user",
        parts: userParts,
      } satisfies GeminiMessage,
    ],
  };

  // System instruction.
  if (opts.system) {
    body.systemInstruction = {
      parts: [
        {
          text: opts.system,
        },
      ],
    };
  }

  const generationConfig: Record<string, unknown> = {};

  if (opts.temperature !== undefined) {
    generationConfig.temperature = opts.temperature;
  }

  if (opts.maxOutputTokens !== undefined) {
    generationConfig.maxOutputTokens = opts.maxOutputTokens;
  }

  if (opts.jsonMode) {
    generationConfig.responseMimeType = "application/json";
  }

  if (Object.keys(generationConfig).length > 0) {
    body.generationConfig = generationConfig;
  }

  const response = await fetch(
    `${GEMINI_GATEWAY_URL}/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "cf-aig-authorization": `Bearer ${cloudflareGatewayToken}`,
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();

    if (response.status === 401) {
      throw new Error(
        `Cloudflare AI Gateway authentication failed [401]: ${errorBody}`,
      );
    }

    if (response.status === 429) {
      throw new Error(
        "Gemini quota exceeded. Please wait for the free-tier quota to reset or use a different Gemini project.",
      );
    }

    if (response.status === 503) {
      throw new Error(
        "Gemini is temporarily unavailable. Please try again in a moment.",
      );
    }

    throw new Error(
      `Gemini API request failed [${response.status}]: ${errorBody}`,
    );
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
      finishReason?: string;
    }>;
  };

  const text =
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("") ?? "";

  if (!text) {
    const finishReason = data.candidates?.[0]?.finishReason;

    throw new Error(
      finishReason
        ? `Gemini returned no text. Finish reason: ${finishReason}`
        : "Gemini returned an empty response.",
    );
  }

  return {
    text,
    raw: data,
  };
}

/**
 * Call Google's Gemini API through Cloudflare AI Gateway.
 *
 * The Google API key is stored securely in Cloudflare AI Gateway
 * under the "default" provider-key alias.
 */
export async function callGemini(
  opts: GeminiCallOptions,
): Promise<GeminiResult> {
  const cloudflareGatewayToken = getGatewayToken();

  const requestedModel = normalizeModelName(
    opts.model ?? DEFAULT_MODEL,
  );

  return requestGemini(
    requestedModel,
    opts,
    cloudflareGatewayToken,
  );
}