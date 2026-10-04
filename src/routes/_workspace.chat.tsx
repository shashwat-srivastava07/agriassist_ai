import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { useCallback, useEffect, useRef, useState } from "react";

import { useServerFn } from "@tanstack/react-start";

import {
  Sparkles,
  Loader2,
  CloudRain,
  Droplets,
  FlaskConical,
  Landmark,
  LineChart,
  Camera,
  ShieldAlert,
  Sprout,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { toast } from "sonner";

import {
  ChatComposer,
  type Attachment,
} from "@/components/agriassist/chat/ChatComposer";

import {
  AssistantMessage,
  TypingIndicator,
  UserMessage,
} from "@/components/agriassist/chat/Message";

import { ChatEmptyState } from "@/components/agriassist/chat/EmptyState";

type QuickPrompt = {
  icon: any;
  label: string;
  hint: string;
  prompt: string;
  tone: "sky" | "emerald" | "amber" | "violet" | "lime";
};

const QUICK_PROMPTS: QuickPrompt[] = [
  {
    icon: Camera,
    label: "Diagnose my crop",
    hint: "Upload a leaf photo",
    prompt:
      "I want to diagnose my crop. Here's a photo of the affected leaves.",
    tone: "emerald",
  },
  {
    icon: Droplets,
    label: "Should I irrigate today?",
    hint: "Based on soil + weather",
    prompt: "Should I irrigate my tomato field today?",
    tone: "sky",
  },
  {
    icon: FlaskConical,
    label: "Best fertilizer for cotton",
    hint: "For flowering stage",
    prompt:
      "What's the best fertilizer schedule for cotton at flowering?",
    tone: "lime",
  },
  {
    icon: CloudRain,
    label: "Weather forecast",
    hint: "3-day farming outlook",
    prompt:
      "Give me a 3-day weather-based farming advisory for Hosakote.",
    tone: "sky",
  },
  {
    icon: LineChart,
    label: "Market price today",
    hint: "Nearby mandis",
    prompt:
      "What are today's mandi prices for tomato in Karnataka?",
    tone: "emerald",
  },
  {
    icon: Landmark,
    label: "Government schemes",
    hint: "Subsidies for you",
    prompt:
      "Which government subsidies am I eligible for as a Karnataka tomato farmer?",
    tone: "violet",
  },
  {
    icon: ShieldAlert,
    label: "Pest risk near me",
    hint: "District-level alerts",
    prompt:
      "What pest risks are rising in my district this week?",
    tone: "amber",
  },
  {
    icon: Sprout,
    label: "Next crop to plant",
    hint: "Based on rotation",
    prompt:
      "Given I just harvested tomato, what crop should I plant next?",
    tone: "emerald",
  },
];

type Block =
  | { kind: "markdown"; text: string }
  | {
      kind: "diagnosis";
      crop: string;
      disease: string;
      confidence: number;
      severity: "Mild" | "Moderate" | "Severe";
      cause: string;
      treatment: { title: string; detail: string }[];
    }
  | {
      kind: "weather";
      location: string;
      current: {
        temp: string;
        cond: string;
        feels: string;
      };
      days: {
        day: string;
        icon: "sun" | "rain" | "cloud";
        hi: string;
        lo: string;
        rain: string;
      }[];
      advisory: string;
    }
  | {
      kind: "recommendation";
      title: string;
      body: string;
      confidence: number;
      tags: string[];
    }
  | {
      kind: "risk";
      title: string;
      level: "Low" | "Moderate" | "High";
      body: string;
      mitigate: string[];
    }
  | {
      kind: "market";
      commodity: string;
      unit: string;
      today: string;
      change: string;
      trend: "up" | "down";
      mandis: {
        name: string;
        price: string;
        distance: string;
      }[];
    }
  | {
      kind: "scheme";
      name: string;
      agency: string;
      benefit: string;
      eligibility: string[];
      deadline: string;
    }
  | {
      kind: "actionPlan";
      items: {
        when: "Today" | "Tomorrow" | "In 3 days" | "Next week";
        title: string;
        detail: string;
        icon:
          | "water"
          | "spray"
          | "scout"
          | "harvest"
          | "fertilize";
      }[];
    }
  | {
      kind: "diseaseVision";
      diseaseName: string;
      confidence: number;
      severity:
        | "Mild"
        | "Moderate"
        | "Severe"
        | "Unknown";
      symptoms: string[];
      possibleCause: string;
      organicTreatment: string[];
      chemicalTreatment: string[];
      preventionTips: string[];
      nextActions: string[];
      emergencyLevel:
        | "Low"
        | "Medium"
        | "High"
        | "Critical";
      lowConfidenceNotice?: string;
    }
  | {
      kind: "followups";
      questions: string[];
    };

type ChatMessage =
  | {
      id: string;
      role: "user";
      text: string;
      attachments?: {
        name: string;
        kind: "image" | "pdf";
      }[];
    }
  | {
      id: string;
      role: "assistant";
      blocks: Block[];
    };

import { routeIntent } from "@/lib/agents/intent-router.functions";

import { runGeneralAgent } from "@/lib/agents/general-agent.functions";

import { runDiseaseAgent } from "@/lib/agents/disease-agent.functions";

import { runWeatherAgent } from "@/lib/agents/weather-agent.functions";

import { runMarketAgent } from "@/lib/agents/market-agent.functions";

import { runGovernmentAgent } from "@/lib/agents/government-agent.functions";

import { runFertilizerAgent } from "@/lib/agents/fertilizer-agent.functions";

import type { AgentName } from "@/lib/agents/types";

import {
  createChat,
  appendMessage,
  getChatMessages,
  renameChat,
} from "@/lib/chat/chat.functions";

import {
  useLanguage,
  type Language,
} from "@/context/LanguageContext";

type ChatSearch = {
  c?: string;
  q?: string;
};

/* -------------------------------------------------------------------------- */
/* Chat translations                                                          */
/* -------------------------------------------------------------------------- */

type ChatTranslation = {
  conversation: string;
  newChat: string;
  askAnything: string;
  loading: string;
  placeholder: string;
  tip: string;
  assistantTag: string;
  chips: Record<string, string>;
};

const CHAT_TRANSLATIONS: Record<
  "en" | "hi" | "kn" | "ta",
  ChatTranslation
> = {
  en: {
    conversation: "Conversation",
    newChat: "New chat",
    askAnything: "Ask AgriAssist AI anything",
    loading: "Loading conversation…",
    placeholder:
      "Ask AgriAssist AI — try a crop, weather, fertilizer, market, or scheme question.",
    tip:
      "Tip: You can send a photo of a leaf, speak your question, or share your location for better advice.",
    assistantTag: "AgriAssist AI · your farming assistant",
    chips: {
      "Diagnose my crop": "Diagnose my crop",
      "Should I irrigate today?": "Should I irrigate today?",
      "Best fertilizer for cotton":
        "Best fertilizer for cotton",
      "Weather forecast": "Weather forecast",
    },
  },

  hi: {
    conversation: "बातचीत",
    newChat: "नई चैट",
    askAnything: "AgriAssist AI से कुछ भी पूछें",
    loading: "बातचीत लोड हो रही है…",
    placeholder:
      "AgriAssist AI से पूछें — फसल, मौसम, उर्वरक, बाजार या सरकारी योजना के बारे में।",
    tip:
      "बेहतर सलाह के लिए आप पत्ते की फोटो भेज सकते हैं, सवाल बोल सकते हैं या अपना स्थान साझा कर सकते हैं।",
    assistantTag: "AgriAssist AI · आपका कृषि सहायक",
    chips: {
      "Diagnose my crop": "मेरी फसल का निदान करें",
      "Should I irrigate today?":
        "क्या आज सिंचाई करनी चाहिए?",
      "Best fertilizer for cotton":
        "कपास के लिए सर्वोत्तम उर्वरक",
      "Weather forecast": "मौसम का पूर्वानुमान",
    },
  },

  kn: {
    conversation: "ಸಂಭಾಷಣೆ",
    newChat: "ಹೊಸ ಚಾಟ್",
    askAnything: "AgriAssist AI ಗೆ ಏನಾದರೂ ಕೇಳಿ",
    loading: "ಸಂಭಾಷಣೆಯನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ…",
    placeholder:
      "AgriAssist AI ಗೆ ಕೇಳಿ — ಬೆಳೆ, ಹವಾಮಾನ, ರಸಗೊಬ್ಬರ, ಮಾರುಕಟ್ಟೆ ಅಥವಾ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ.",
    tip:
      "ಉತ್ತಮ ಸಲಹೆಗಾಗಿ ಎಲೆಯ ಫೋಟೋ ಕಳುಹಿಸಬಹುದು, ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಮಾತನಾಡಬಹುದು ಅಥವಾ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳಬಹುದು.",
    assistantTag: "AgriAssist AI · ನಿಮ್ಮ ಕೃಷಿ ಸಹಾಯಕ",
    chips: {
      "Diagnose my crop": "ನನ್ನ ಬೆಳೆಯನ್ನು ಪರೀಕ್ಷಿಸಿ",
      "Should I irrigate today?":
        "ಇಂದು ನೀರಾವರಿ ಮಾಡಬೇಕೇ?",
      "Best fertilizer for cotton":
        "ಹತ್ತಿಗೆ ಉತ್ತಮ ರಸಗೊಬ್ಬರ",
      "Weather forecast": "ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ",
    },
  },

  ta: {
    conversation: "உரையாடல்",
    newChat: "புதிய உரையாடல்",
    askAnything:
      "AgriAssist AI-யிடம் எதையும் கேளுங்கள்",
    loading: "உரையாடல் ஏற்றப்படுகிறது…",
    placeholder:
      "AgriAssist AI-யிடம் கேளுங்கள் — பயிர், வானிலை, உரம், சந்தை அல்லது அரசு திட்டங்கள் பற்றி.",
    tip:
      "சிறந்த ஆலோசனைக்கு இலை புகைப்படத்தை அனுப்பலாம், கேள்வியைப் பேசலாம் அல்லது உங்கள் இருப்பிடத்தைப் பகிரலாம்.",
    assistantTag:
      "AgriAssist AI · உங்கள் விவசாய உதவியாளர்",
    chips: {
      "Diagnose my crop": "என் பயிரைக் கண்டறியவும்",
      "Should I irrigate today?":
        "இன்று நீர்ப்பாசனம் செய்ய வேண்டுமா?",
      "Best fertilizer for cotton":
        "பருத்திக்கு சிறந்த உரம்",
      "Weather forecast":
        "வானிலை முன்னறிவிப்பு",
    },
  },
};

function getChatTranslations(
  language: "en" | "hi" | "kn" | "ta",
): ChatTranslation {
  return CHAT_TRANSLATIONS[language];
}

/* -------------------------------------------------------------------------- */
/* Route                                                                      */
/* -------------------------------------------------------------------------- */

export const Route = createFileRoute("/_workspace/chat")({
  validateSearch: (
    s: Record<string, unknown>,
  ): ChatSearch => ({
    c: typeof s.c === "string" ? s.c : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  component: ChatPage,
});

/* -------------------------------------------------------------------------- */
/* Image helper                                                               */
/* -------------------------------------------------------------------------- */

async function blobUrlToBase64DataUrl(
  url: string,
): Promise<string | undefined> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();

    return await new Promise<string>(
      (resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () =>
          resolve(reader.result as string);

        reader.onerror = reject;

        reader.readAsDataURL(blob);
      },
    );
  } catch {
    return undefined;
  }
}

/* -------------------------------------------------------------------------- */
/* Chat page                                                                  */
/* -------------------------------------------------------------------------- */

function ChatPage() {
  const {
    c: chatIdFromUrl,
    q: initialQuery,
  } = Route.useSearch();

  const navigate = useNavigate();

  const { language } = useLanguage();

  const t = getChatTranslations(language);

  const [messages, setMessages] = useState<
    ChatMessage[]
  >([]);

  const [prompt, setPrompt] = useState("");

  const [streaming, setStreaming] = useState(false);

  const [loading, setLoading] = useState(false);

  const [chatId, setChatId] = useState<
    string | undefined
  >(chatIdFromUrl);

  const scrollRef = useRef<HTMLDivElement>(null);

  const abortRef = useRef(false);

  const localChatIdsRef = useRef<Set<string>>(
    new Set(),
  );

  const routeIntentFn = useServerFn(routeIntent);

  const generalFn = useServerFn(runGeneralAgent);

  const diseaseFn = useServerFn(runDiseaseAgent);

  const weatherFn = useServerFn(runWeatherAgent);

  const marketFn = useServerFn(runMarketAgent);

  const govFn = useServerFn(runGovernmentAgent);

  const fertilizerFn = useServerFn(runFertilizerAgent);

  const createChatFn = useServerFn(createChat);

  const appendMessageFn = useServerFn(appendMessage);

  const getChatMessagesFn =
    useServerFn(getChatMessages);

  const renameChatFn = useServerFn(renameChat);

  const agentMap: Record<
    Exclude<AgentName, "intent-router">,
    typeof diseaseFn
  > = {
    "general-agent": generalFn,
    "disease-agent": diseaseFn,
    "weather-agent": weatherFn,
    "market-agent": marketFn,
    "government-agent": govFn,
    "fertilizer-agent": fertilizerFn,
  };

  /* ------------------------------------------------------------------------ */
  /* Load existing chat                                                       */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    setChatId(chatIdFromUrl);

    if (!chatIdFromUrl) {
      setMessages([]);
      return;
    }

    if (
      localChatIdsRef.current.has(chatIdFromUrl)
    ) {
      return;
    }

    let cancelled = false;

    setLoading(true);

    getChatMessagesFn({
      data: {
        chatId: chatIdFromUrl,
      },
    })
      .then((r) => {
        if (cancelled) return;

        setMessages(r.messages);
      })
      .catch((e: unknown) => {
        toast.error(
          e instanceof Error
            ? e.message
            : "Could not load conversation",
        );

        void navigate({
          to: "/chat",
          search: {},
        });
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatIdFromUrl]);

  /* ------------------------------------------------------------------------ */
  /* Empty chat rotation                                                      */
  /* ------------------------------------------------------------------------ */

  const [rotationSeed, setRotationSeed] =
    useState(0);

  useEffect(() => {
    if (messages.length > 0) return;

    const timer = setInterval(
      () => setRotationSeed((s) => s + 1),
      12000,
    );

    return () => clearInterval(timer);
  }, [messages.length]);

  /* ------------------------------------------------------------------------ */
  /* Scroll                                                                    */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, streaming]);

  /* ------------------------------------------------------------------------ */
  /* Send message                                                              */
  /* ------------------------------------------------------------------------ */

  const send = useCallback(
    async (
      text: string,
      atts: Attachment[],
    ) => {
      if (!text && atts.length === 0) return;

      const attachmentsMeta = atts.map((a) => ({
        name: a.name,
        kind: a.kind,
      }));

      const userMsg: ChatMessage = {
        id: `u${Date.now()}`,
        role: "user",
        text: text || "(attachment)",
        attachments: attachmentsMeta,
      };

      setMessages((prev) => [...prev, userMsg]);

      setPrompt("");

      setStreaming(true);

      abortRef.current = false;

      let activeChatId = chatId;

      const isFirstMessage = !activeChatId;

      try {
        /* Create chat */
        if (!activeChatId) {
          const title = (
            text || "New conversation"
          ).slice(0, 60);

          const created = await createChatFn({
            data: {
              title,
            },
          });

          activeChatId = created.id;

          localChatIdsRef.current.add(
            activeChatId,
          );

          setChatId(activeChatId);

          void navigate({
            to: "/chat",
            search: {
              c: activeChatId,
            },
            replace: true,
          });
        }

        /* Save user message */
        await appendMessageFn({
          data: {
            chatId: activeChatId,
            role: "user",
            content: userMsg.text,
            metadata:
              attachmentsMeta.length > 0
                ? {
                    attachments:
                      attachmentsMeta,
                  }
                : undefined,
          },
        }).catch(() => {});

        /* Image */
        const firstImage = atts.find(
          (a) => a.kind === "image" && a.url,
        );

        const imageUrl = firstImage?.url
          ? await blobUrlToBase64DataUrl(
              firstImage.url,
            )
          : undefined;

        const message =
          text ||
          "Please analyze the attached image.";

        /* Intent routing */
        const agent = imageUrl
          ? ("disease-agent" as const)
          : (
              await routeIntentFn({
                data: {
                  message,
                  language,
                },
              })
            ).agent;

        if (abortRef.current) return;

        const agentFn =
          agentMap[
            agent as Exclude<
              AgentName,
              "intent-router"
            >
          ] ?? generalFn;

        /* Send selected language to AI */
        const response = await agentFn({
          data: {
            message,
            imageUrl,
            language,
          },
        });

        if (abortRef.current) return;

        const extraBlocks = Array.isArray(
          response.blocks,
        )
          ? (response.blocks as Block[])
          : [];

        const blocks: Block[] = [];

        if (response.content) {
          blocks.push({
            kind: "markdown",
            text: response.content,
          });
        }

        blocks.push(...extraBlocks);

        const finalBlocks = blocks.length
          ? blocks
          : [
              {
                kind: "markdown",
                text: "",
              } as Block,
            ];

        const assistantText =
          finalBlocks
            .map((b) =>
              b.kind === "markdown" ? b.text : "",
            )
            .join("\n\n")
            .trim() ||
          (response.content ?? "");

        setMessages((prev) => [
          ...prev,
          {
            id: `a${Date.now()}`,
            role: "assistant",
            blocks: finalBlocks,
          },
        ]);

        /* Save assistant message */
        await appendMessageFn({
          data: {
            chatId: activeChatId,
            role: "assistant",
            content: assistantText,
            metadata: {
              blocks: finalBlocks,
              agent,
            },
          },
        }).catch(() => {});

        /* Rename first chat */
        if (isFirstMessage) {
          const cleanTitle = (
            text || "Conversation"
          )
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 60);

          if (cleanTitle) {
            void renameChatFn({
              data: {
                chatId: activeChatId,
                title: cleanTitle,
              },
            });
          }
        }
      } catch (err) {
        if (!abortRef.current) {
          const msg =
            err instanceof Error
              ? err.message
              : "Something went wrong.";

          setMessages((prev) => [
            ...prev,
            {
              id: `a${Date.now()}`,
              role: "assistant",
              blocks: [
                {
                  kind: "markdown",
                  text: `⚠️ ${msg}`,
                },
              ],
            },
          ]);
        }
      } finally {
        setStreaming(false);
      }
    },

    // Language is included so the next request always uses
    // the currently selected language.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chatId, language],
  );

  /* ------------------------------------------------------------------------ */
  /* Auto-send query                                                           */
  /* ------------------------------------------------------------------------ */

  const autoSentRef = useRef<string | null>(
    null,
  );

  useEffect(() => {
    if (!initialQuery) return;

    if (autoSentRef.current === initialQuery)
      return;

    autoSentRef.current = initialQuery;

    void navigate({
      to: "/chat",
      search: {
        c: chatId,
      },
      replace: true,
    });

    void send(initialQuery, []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  /* ------------------------------------------------------------------------ */
  /* Regenerate                                                                */
  /* ------------------------------------------------------------------------ */

  const regenerate = () => {
    const lastUser = [...messages]
      .reverse()
      .find(
        (m) => m.role === "user",
      ) as
      | Extract<
          ChatMessage,
          { role: "user" }
        >
      | undefined;

    if (!lastUser) return;

    setMessages((prev) => {
      const idx = prev.findIndex(
        (m) => m.id === lastUser.id,
      );

      return idx >= 0
        ? prev.slice(0, idx)
        : prev;
    });

    void send(lastUser.text, []);
  };

  /* ------------------------------------------------------------------------ */
  /* UI                                                                        */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="flex h-full min-h-0 w-full">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Chat header */}
        <div className="flex items-center gap-2 border-b border-border/40 px-3 py-2">
          <div className="text-xs font-medium text-muted-foreground">
            {chatId
              ? t.conversation
              : messages.length > 0
                ? t.newChat
                : t.askAnything}
          </div>

          <div className="ml-auto flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/30 px-2.5 py-1 text-[10px] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-accent" />
            {t.assistantTag}
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto scroll-smooth"
        >
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.loading}
            </div>
          ) : messages.length === 0 ? (
            <ChatEmptyState
              onPick={(q) => setPrompt(q)}
            />
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 md:px-6 md:py-8">
              {messages.map((m) =>
                m.role === "user" ? (
                  <UserMessage
                    key={m.id}
                    m={m}
                  />
                ) : (
                  <AssistantMessage
                    key={m.id}
                    m={m}
                    onRegenerate={regenerate}
                    onFollowup={(q) =>
                      void send(q, [])
                    }
                  />
                ),
              )}

              {streaming && <TypingIndicator />}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-border/40 bg-background/60 backdrop-blur">
          <div className="mx-auto w-full max-w-3xl px-4 pt-3 pb-4 md:px-6">
            {messages.length > 0 &&
              !streaming && (
                <QuickChips
                  seed={rotationSeed}
                  onPick={(q) => setPrompt(q)}
                  language={language}
                />
              )}

            <ChatComposer
              value={prompt}
              onChange={setPrompt}
              onSend={(t, a) =>
                void send(t, a)
              }
              onStop={() => {
                abortRef.current = true;
                setStreaming(false);
              }}
              isStreaming={streaming}
              autoFocus
              placeholder={t.placeholder}
            />

            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              {t.tip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Quick chips                                                                */
/* -------------------------------------------------------------------------- */

function QuickChips({
  seed,
  onPick,
  language,
}: {
  seed: number;
  onPick: (q: string) => void;
  language: Language;
}) {
  const start =
    seed % QUICK_PROMPTS.length;

  const chips = [
    ...QUICK_PROMPTS.slice(start),
    ...QUICK_PROMPTS.slice(0, start),
  ].slice(0, 4);

  const t = getChatTranslations(language);

  return (
    <div className="mb-2 flex flex-wrap gap-1.5">
      {chips.map((c) => {
        const Icon = c.icon;

        const translatedLabel =
          t.chips[
            c.label as keyof typeof t.chips
          ] ?? c.label;

        return (
          <button
            key={c.label}
            onClick={() => onPick(c.prompt)}
            className={cn(
              "glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground",
            )}
          >
            <Icon className="h-3 w-3 text-accent" />
            {translatedLabel}
          </button>
        );
      })}
    </div>
  );
}