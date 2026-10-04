import { motion } from "framer-motion";
import {
  ArrowRight,
  CloudRain,
  FileBarChart2,
  Sprout,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/agriassist/Logo";
import { useFarmer } from "@/hooks/useFarmer";
import { QUICK_PROMPTS } from "@/lib/chat-mocks";
import { RECENT_REPORTS } from "@/lib/farm-mocks";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

const toneClass: Record<string, string> = {
  emerald:
    "text-emerald-300 bg-emerald-500/10 group-hover:bg-emerald-500/15",
  sky:
    "text-sky-300 bg-sky-500/10 group-hover:bg-sky-500/15",
  amber:
    "text-amber-300 bg-amber-500/10 group-hover:bg-amber-500/15",
  violet:
    "text-violet-300 bg-violet-500/10 group-hover:bg-violet-500/15",
  lime:
    "text-lime-300 bg-lime-500/10 group-hover:bg-lime-500/15",
};

const EMPTY_STATE_TRANSLATIONS = {
  en: {
    greeting: "Good Morning",
    description:
      "Your AI farming co-pilot. Ask about crops, diseases, weather, market prices or schemes — or upload a crop image for instant diagnosis.",

    prompts: {
      "Diagnose my crop": {
        label: "Diagnose my crop",
        hint: "Upload a leaf photo",
      },
      "Should I irrigate today?": {
        label: "Should I irrigate today?",
        hint: "Based on soil + weather",
      },
      "Best fertilizer for cotton": {
        label: "Best fertilizer for cotton",
        hint: "For flowering stage",
      },
      "Weather forecast": {
        label: "Weather forecast",
        hint: "3-day farming outlook",
      },
      "Market price today": {
        label: "Market price today",
        hint: "Nearby mandis",
      },
      "Government schemes": {
        label: "Government schemes",
        hint: "Subsidies for you",
      },
    },

    weather: "Weather",
    cloudy: "Cloudy",
    rainLikely: "Rain likely tomorrow",

    farm: "Farm",
    flowering: "Flowering · Day 42",

    recentReport: "Recent report",
    leafSpot: "Leaf spot diagnosis",
    resolved: "Resolved",
  },

  hi: {
    greeting: "सुप्रभात",
    description:
      "आपका AI कृषि सहायक। फसल, रोग, मौसम, मंडी भाव या सरकारी योजनाओं के बारे में पूछें — या तुरंत रोग पहचानने के लिए फसल की फोटो अपलोड करें।",

    prompts: {
      "Diagnose my crop": {
        label: "मेरी फसल का रोग पहचानें",
        hint: "पत्ते की फोटो अपलोड करें",
      },
      "Should I irrigate today?": {
        label: "क्या आज सिंचाई करनी चाहिए?",
        hint: "मिट्टी और मौसम के आधार पर",
      },
      "Best fertilizer for cotton": {
        label: "कपास के लिए सबसे अच्छा उर्वरक",
        hint: "फूल आने की अवस्था के लिए",
      },
      "Weather forecast": {
        label: "मौसम का पूर्वानुमान",
        hint: "3 दिन का कृषि मौसम पूर्वानुमान",
      },
      "Market price today": {
        label: "आज का मंडी भाव",
        hint: "नज़दीकी मंडियों के भाव",
      },
      "Government schemes": {
        label: "सरकारी योजनाएँ",
        hint: "आपके लिए सब्सिडी",
      },
    },

    weather: "मौसम",
    cloudy: "बादल छाए हुए",
    rainLikely: "कल बारिश की संभावना",

    farm: "खेत",
    flowering: "फूल आने की अवस्था · दिन 42",

    recentReport: "हाल की रिपोर्ट",
    leafSpot: "पत्ती के धब्बे का निदान",
    resolved: "समाधान किया गया",
  },

  kn: {
    greeting: "ಶುಭೋದಯ",
    description:
      "ನಿಮ್ಮ AI ಕೃಷಿ ಸಹಾಯಕ. ಬೆಳೆಗಳು, ರೋಗಗಳು, ಹವಾಮಾನ, ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು ಅಥವಾ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ — ಅಥವಾ ತಕ್ಷಣ ರೋಗ ಪತ್ತೆ ಮಾಡಲು ಬೆಳೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",

    prompts: {
      "Diagnose my crop": {
        label: "ನನ್ನ ಬೆಳೆಯ ರೋಗ ಪತ್ತೆಹಚ್ಚಿ",
        hint: "ಎಲೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
      },
      "Should I irrigate today?": {
        label: "ಇಂದು ನೀರಾವರಿ ಮಾಡಬೇಕೇ?",
        hint: "ಮಣ್ಣು ಮತ್ತು ಹವಾಮಾನದ ಆಧಾರದ ಮೇಲೆ",
      },
      "Best fertilizer for cotton": {
        label: "ಹತ್ತಿಗೆ ಉತ್ತಮ ಗೊಬ್ಬರ",
        hint: "ಹೂ ಬಿಡುವ ಹಂತಕ್ಕೆ",
      },
      "Weather forecast": {
        label: "ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ",
        hint: "3 ದಿನಗಳ ಕೃಷಿ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ",
      },
      "Market price today": {
        label: "ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ",
        hint: "ಹತ್ತಿರದ ಮಾರುಕಟ್ಟೆಗಳ ಬೆಲೆ",
      },
      "Government schemes": {
        label: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
        hint: "ನಿಮಗಾಗಿ ಸಬ್ಸಿಡಿಗಳು",
      },
    },

    weather: "ಹವಾಮಾನ",
    cloudy: "ಮೋಡ ಕವಿದಿದೆ",
    rainLikely: "ನಾಳೆ ಮಳೆಯ ಸಾಧ್ಯತೆ",

    farm: "ಕೃಷಿ ಜಮೀನು",
    flowering: "ಹೂ ಬಿಡುವ ಹಂತ · ದಿನ 42",

    recentReport: "ಇತ್ತೀಚಿನ ವರದಿ",
    leafSpot: "ಎಲೆ ಕಲೆ ರೋಗದ ಪತ್ತೆ",
    resolved: "ಪರಿಹರಿಸಲಾಗಿದೆ",
  },

  ta: {
    greeting: "காலை வணக்கம்",
    description:
      "உங்கள் AI விவசாய உதவியாளர். பயிர்கள், நோய்கள், வானிலை, சந்தை விலைகள் அல்லது அரசு திட்டங்கள் பற்றி கேளுங்கள் — அல்லது உடனடி நோய் கண்டறிதலுக்காக பயிரின் புகைப்படத்தைப் பதிவேற்றுங்கள்.",

    prompts: {
      "Diagnose my crop": {
        label: "என் பயிரின் நோயைக் கண்டறியவும்",
        hint: "இலை புகைப்படத்தைப் பதிவேற்றவும்",
      },
      "Should I irrigate today?": {
        label: "இன்று நீர்ப்பாசனம் செய்ய வேண்டுமா?",
        hint: "மண் மற்றும் வானிலையின் அடிப்படையில்",
      },
      "Best fertilizer for cotton": {
        label: "பருத்திக்கு சிறந்த உரம்",
        hint: "பூக்கும் நிலைக்கு",
      },
      "Weather forecast": {
        label: "வானிலை முன்னறிவிப்பு",
        hint: "3 நாள் விவசாய வானிலை நிலவரம்",
      },
      "Market price today": {
        label: "இன்றைய சந்தை விலை",
        hint: "அருகிலுள்ள சந்தை விலைகள்",
      },
      "Government schemes": {
        label: "அரசு திட்டங்கள்",
        hint: "உங்களுக்கான மானியங்கள்",
      },
    },

    weather: "வானிலை",
    cloudy: "மேகமூட்டம்",
    rainLikely: "நாளை மழைக்கு வாய்ப்பு",

    farm: "பண்ணை",
    flowering: "பூக்கும் நிலை · நாள் 42",

    recentReport: "சமீபத்திய அறிக்கை",
    leafSpot: "இலைப் புள்ளி நோய் கண்டறிதல்",
    resolved: "தீர்க்கப்பட்டது",
  },
} as const;

export function ChatEmptyState({
  onPick,
}: {
  onPick: (q: string) => void;
}) {
  const { name } = useFarmer();
  const { language } = useLanguage();

  const t =
    EMPTY_STATE_TRANSLATIONS[language] ??
    EMPTY_STATE_TRANSLATIONS.en;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
          <Logo showText={false} />
        </div>

        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {t.greeting},{" "}
          <span className="text-gradient">{name}</span>
        </h1>

        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground md:text-base">
          {t.description}
        </p>
      </motion.div>

      {/* Quick prompt cards */}
      <div className="mt-8 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_PROMPTS.slice(0, 6).map((q, i) => {
          const Icon = q.icon;

          const translatedPrompt =
            t.prompts[
              q.label as keyof typeof t.prompts
            ];

          return (
            <motion.button
              key={q.label}
              onClick={() => onPick(q.prompt)}
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                delay: 0.04 * i,
              }}
              className="glass group flex items-start gap-3 rounded-2xl p-3.5 text-left transition-colors hover:border-accent/40"
            >
              <div
                className={cn(
                  "rounded-lg p-2 transition-colors",
                  toneClass[q.tone],
                )}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {translatedPrompt?.label ?? q.label}
                </div>

                <div className="truncate text-[11px] text-muted-foreground">
                  {translatedPrompt?.hint ?? q.hint}
                </div>
              </div>

              <ArrowRight className="h-3.5 w-3.5 shrink-0 self-center text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.button>
          );
        })}
      </div>

      {/* Farm widgets */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">

        {/* Weather */}
        <Card className="glass border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                {t.weather}
              </div>

              <CloudRain className="h-4 w-4 text-sky-300" />
            </div>

            <div className="mt-1 font-display text-xl font-semibold">
              29° · {t.cloudy}
            </div>

            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {t.rainLikely}
            </div>
          </CardContent>
        </Card>

        {/* Farm */}
        <Card className="glass border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                {t.farm}
              </div>

              <Sprout className="h-4 w-4 text-emerald-300" />
            </div>

            <div className="mt-1 font-display text-xl font-semibold">
              Tomato · 4.5 ac
            </div>

            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {t.flowering}
            </div>
          </CardContent>
        </Card>

        {/* Recent report */}
        <Card className="glass border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                {t.recentReport}
              </div>

              <FileBarChart2 className="h-4 w-4 text-accent" />
            </div>

            <div className="mt-1 truncate font-display text-sm font-semibold">
              {language === "en"
                ? RECENT_REPORTS[0].title
                : t.leafSpot}
            </div>

            <Badge
              variant="secondary"
              className="mt-1.5 rounded-full bg-white/5 text-[10px]"
            >
              {language === "en"
                ? RECENT_REPORTS[0].status
                : t.resolved}
            </Badge>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}