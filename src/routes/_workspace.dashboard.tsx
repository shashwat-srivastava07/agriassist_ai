import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { PromptBox } from "@/components/agriassist/PromptBox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CloudRain, Sparkles, MapPin, Loader2 } from "lucide-react";
import { QUICK_ACTIONS } from "@/lib/farm-mocks";
import { useFarmer } from "@/hooks/useFarmer";
import { useLanguage } from "@/context/LanguageContext";
import { getWeatherIntelligence } from "@/lib/weather/weather.functions";

export const Route = createFileRoute("/_workspace/dashboard")({
  component: Dashboard,
});

type Weather = {
  tempC: number;
  code: number;
  description: string;
  place: string;
};

type Language = "en" | "hi" | "kn" | "ta";

const WEATHER_TRANSLATIONS: Record<
  Language,
  Record<string, string>
> = {
  en: {
    "Clear sky": "Clear sky",
    "Mainly clear": "Mainly clear",
    "Partly cloudy": "Partly cloudy",
    Cloudy: "Cloudy",
    Fog: "Fog",
    "Light drizzle": "Light drizzle",
    Drizzle: "Drizzle",
    "Heavy drizzle": "Heavy drizzle",
    "Light rain": "Light rain",
    Rain: "Rain",
    "Heavy rain": "Heavy rain",
    "Light snow": "Light snow",
    Snow: "Snow",
    "Heavy snow": "Heavy snow",
    "Rain showers": "Rain showers",
    "Heavy showers": "Heavy showers",
    Thunderstorm: "Thunderstorm",
  },

  hi: {
    "Clear sky": "साफ़ आसमान",
    "Mainly clear": "मुख्यतः साफ़",
    "Partly cloudy": "आंशिक रूप से बादल",
    Cloudy: "बादल छाए हैं",
    Fog: "कोहरा",
    "Light drizzle": "हल्की बूंदाबांदी",
    Drizzle: "बूंदाबांदी",
    "Heavy drizzle": "तेज़ बूंदाबांदी",
    "Light rain": "हल्की बारिश",
    Rain: "बारिश",
    "Heavy rain": "भारी बारिश",
    "Light snow": "हल्की बर्फ़बारी",
    Snow: "बर्फ़बारी",
    "Heavy snow": "भारी बर्फ़बारी",
    "Rain showers": "बारिश की बौछारें",
    "Heavy showers": "तेज़ बौछारें",
    Thunderstorm: "आंधी-तूफ़ान",
  },

  kn: {
    "Clear sky": "ಸ್ಪಷ್ಟ ಆಕಾಶ",
    "Mainly clear": "ಮುಖ್ಯವಾಗಿ ಸ್ಪಷ್ಟ",
    "Partly cloudy": "ಭಾಗಶಃ ಮೋಡ ಕವಿದಿದೆ",
    Cloudy: "ಮೋಡ ಕವಿದಿದೆ",
    Fog: "ಮಂಜು",
    "Light drizzle": "ಹಗುರವಾದ ತುಂತುರು ಮಳೆ",
    Drizzle: "ತುಂತುರು ಮಳೆ",
    "Heavy drizzle": "ಭಾರೀ ತುಂತುರು ಮಳೆ",
    "Light rain": "ಹಗುರವಾದ ಮಳೆ",
    Rain: "ಮಳೆ",
    "Heavy rain": "ಭಾರೀ ಮಳೆ",
    "Light snow": "ಹಗುರವಾದ ಹಿಮಪಾತ",
    Snow: "ಹಿಮಪಾತ",
    "Heavy snow": "ಭಾರೀ ಹಿಮಪಾತ",
    "Rain showers": "ಮಳೆಯ ತುಂತುರು",
    "Heavy showers": "ಭಾರೀ ಮಳೆಯ ತುಂತುರು",
    Thunderstorm: "ಗುಡುಗು ಸಹಿತ ಮಳೆ",
  },

  ta: {
    "Clear sky": "தெளிவான வானம்",
    "Mainly clear": "பெரும்பாலும் தெளிவான வானம்",
    "Partly cloudy": "பகுதியளவு மேகமூட்டம்",
    Cloudy: "மேகமூட்டம்",
    Fog: "மூடுபனி",
    "Light drizzle": "லேசான தூறல்",
    Drizzle: "தூறல்",
    "Heavy drizzle": "கனமான தூறல்",
    "Light rain": "லேசான மழை",
    Rain: "மழை",
    "Heavy rain": "கனமழை",
    "Light snow": "லேசான பனிப்பொழிவு",
    Snow: "பனிப்பொழிவு",
    "Heavy snow": "கனமான பனிப்பொழிவு",
    "Rain showers": "மழைத்தூறல்கள்",
    "Heavy showers": "கனமான மழைத்தூறல்கள்",
    Thunderstorm: "இடியுடன் கூடிய மழை",
  },
};

const DASHBOARD_TRANSLATIONS: Record<
  Language,
  {
    greeting: string;
    description: string;
    liveWeather: string;
    fetchingWeather: string;
    locationBlocked: string;
    weatherError: string;
    source: string;
    personalizedAdvice: string;
    quickActions: string;
    prefill: string;
    mistake: string;
  }
> = {
  en: {
    greeting: "Good Morning",
    description:
      "Ask AgriAssist AI anything about your crops, weather, market prices, or government schemes.",
    liveWeather: "Live weather at your location",
    fetchingWeather: "Fetching your local weather…",
    locationBlocked:
      "Location access is blocked. Enable location to see real-time weather for your farm, or ask AgriAssist AI about weather for any city.",
    weatherError:
      "Couldn't load weather right now. You can still ask AgriAssist AI about the forecast for your village.",
    source: "Source: WeatherAPI",
    personalizedAdvice:
      "Want personalised farm advice based on this weather? Tap a quick action below or ask AgriAssist AI directly.",
    quickActions: "Quick actions",
    prefill: "Tap to prefill your prompt",
    mistake:
      "AgriAssist AI can make mistakes. Verify important agricultural decisions with an expert.",
  },

  hi: {
    greeting: "सुप्रभात",
    description:
      "अपनी फसल, मौसम, मंडी भाव या सरकारी योजनाओं के बारे में AgriAssist AI से कुछ भी पूछें।",
    liveWeather: "आपके स्थान का लाइव मौसम",
    fetchingWeather: "आपके स्थानीय मौसम की जानकारी प्राप्त की जा रही है…",
    locationBlocked:
      "स्थान की अनुमति बंद है। अपने खेत का रियल-टाइम मौसम देखने के लिए स्थान की अनुमति दें, या किसी भी शहर के मौसम के बारे में AgriAssist AI से पूछें।",
    weatherError:
      "अभी मौसम की जानकारी लोड नहीं हो सकी। आप अपने गाँव के मौसम के पूर्वानुमान के बारे में AgriAssist AI से पूछ सकते हैं।",
    source: "स्रोत: WeatherAPI",
    personalizedAdvice:
      "इस मौसम के आधार पर अपने खेत के लिए व्यक्तिगत सलाह चाहते हैं? नीचे कोई त्वरित विकल्प चुनें या सीधे AgriAssist AI से पूछें।",
    quickActions: "त्वरित विकल्प",
    prefill: "अपना सवाल भरने के लिए टैप करें",
    mistake:
      "AgriAssist AI कभी-कभी गलतियाँ कर सकता है। महत्वपूर्ण कृषि निर्णयों को किसी विशेषज्ञ से सत्यापित करें।",
  },

  kn: {
    greeting: "ಶುಭೋದಯ",
    description:
      "ನಿಮ್ಮ ಬೆಳೆ, ಹವಾಮಾನ, ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು ಅಥವಾ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ AgriAssist AI ಅನ್ನು ಏನಾದರೂ ಕೇಳಿ.",
    liveWeather: "ನಿಮ್ಮ ಸ್ಥಳದ ಲೈವ್ ಹವಾಮಾನ",
    fetchingWeather: "ನಿಮ್ಮ ಸ್ಥಳೀಯ ಹವಾಮಾನದ ಮಾಹಿತಿಯನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ…",
    locationBlocked:
      "ಸ್ಥಳದ ಅನುಮತಿ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಹೊಲದ ನೈಜ ಸಮಯದ ಹವಾಮಾನವನ್ನು ನೋಡಲು ಸ್ಥಳದ ಅನುಮತಿ ನೀಡಿ, ಅಥವಾ ಯಾವುದೇ ನಗರದ ಹವಾಮಾನದ ಬಗ್ಗೆ AgriAssist AI ಅನ್ನು ಕೇಳಿ.",
    weatherError:
      "ಈಗ ಹವಾಮಾನದ ಮಾಹಿತಿಯನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ನಿಮ್ಮ ಗ್ರಾಮದ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯ ಬಗ್ಗೆ AgriAssist AI ಅನ್ನು ಕೇಳಬಹುದು.",
    source: "ಮೂಲ: WeatherAPI",
    personalizedAdvice:
      "ಈ ಹವಾಮಾನದ ಆಧಾರದ ಮೇಲೆ ನಿಮ್ಮ ಹೊಲಕ್ಕೆ ವೈಯಕ್ತಿಕ ಸಲಹೆ ಬೇಕೇ? ಕೆಳಗಿನ ತ್ವರಿತ ಆಯ್ಕೆಯನ್ನು ಆರಿಸಿ ಅಥವಾ ನೇರವಾಗಿ AgriAssist AI ಅನ್ನು ಕೇಳಿ.",
    quickActions: "ತ್ವರಿತ ಆಯ್ಕೆಗಳು",
    prefill: "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ತುಂಬಲು ಟ್ಯಾಪ್ ಮಾಡಿ",
    mistake:
      "AgriAssist AI ಕೆಲವೊಮ್ಮೆ ತಪ್ಪುಗಳನ್ನು ಮಾಡಬಹುದು. ಪ್ರಮುಖ ಕೃಷಿ ನಿರ್ಧಾರಗಳನ್ನು ತಜ್ಞರೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ.",
  },

  ta: {
    greeting: "காலை வணக்கம்",
    description:
      "உங்கள் பயிர்கள், வானிலை, சந்தை விலைகள் அல்லது அரசு திட்டங்கள் பற்றி AgriAssist AI-யிடம் எதையும் கேளுங்கள்.",
    liveWeather: "உங்கள் இருப்பிடத்தின் நேரடி வானிலை",
    fetchingWeather: "உங்கள் உள்ளூர் வானிலை தகவல் பெறப்படுகிறது…",
    locationBlocked:
      "இருப்பிட அனுமதி முடக்கப்பட்டுள்ளது. உங்கள் பண்ணையின் நிகழ்நேர வானிலையைப் பார்க்க இருப்பிட அனுமதியை வழங்கவும் அல்லது எந்த நகரத்தின் வானிலை பற்றியும் AgriAssist AI-யிடம் கேளுங்கள்.",
    weatherError:
      "தற்போது வானிலை தகவலை ஏற்ற முடியவில்லை. உங்கள் கிராமத்தின் வானிலை முன்னறிவிப்பைப் பற்றி AgriAssist AI-யிடம் கேட்கலாம்.",
    source: "ஆதாரம்: WeatherAPI",
    personalizedAdvice:
      "இந்த வானிலையின் அடிப்படையில் உங்கள் பண்ணைக்கு தனிப்பட்ட ஆலோசனை வேண்டுமா? கீழே உள்ள விரைவு விருப்பத்தைத் தேர்ந்தெடுக்கவும் அல்லது நேரடியாக AgriAssist AI-யிடம் கேளுங்கள்.",
    quickActions: "விரைவு விருப்பங்கள்",
    prefill: "உங்கள் கேள்வியை நிரப்ப தட்டவும்",
    mistake:
      "AgriAssist AI சில நேரங்களில் தவறுகளைச் செய்யலாம். முக்கியமான விவசாய முடிவுகளை நிபுணரிடம் சரிபார்க்கவும்.",
  },
};

const QUICK_ACTION_TRANSLATIONS: Record<
  Language,
  Record<string, string>
> = {
  en: {
    "Diagnose my crop": "Diagnose my crop",
    "Should I irrigate today?": "Should I irrigate today?",
    "Best fertilizer for cotton": "Best fertilizer for cotton",
    "Weather forecast": "Weather forecast",
    "Market price today": "Market price today",
    "Government schemes": "Government schemes",
  },

  hi: {
    "Diagnose my crop": "मेरी फसल का रोग पहचानें",
    "Should I irrigate today?": "क्या आज सिंचाई करनी चाहिए?",
    "Best fertilizer for cotton": "कपास के लिए सबसे अच्छा उर्वरक",
    "Weather forecast": "मौसम का पूर्वानुमान",
    "Market price today": "आज का मंडी भाव",
    "Government schemes": "सरकारी योजनाएँ",
  },

  kn: {
    "Diagnose my crop": "ನನ್ನ ಬೆಳೆಯ ರೋಗವನ್ನು ಗುರುತಿಸಿ",
    "Should I irrigate today?": "ಇಂದು ನೀರಾವರಿ ಮಾಡಬೇಕೇ?",
    "Best fertilizer for cotton": "ಹತ್ತಿಗೆ ಉತ್ತಮ ಗೊಬ್ಬರ",
    "Weather forecast": "ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ",
    "Market price today": "ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ",
    "Government schemes": "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
  },

  ta: {
    "Diagnose my crop": "என் பயிரின் நோயை கண்டறியவும்",
    "Should I irrigate today?": "இன்று நீர்ப்பாசனம் செய்ய வேண்டுமா?",
    "Best fertilizer for cotton": "பருத்திக்கு சிறந்த உரம்",
    "Weather forecast": "வானிலை முன்னறிவிப்பு",
    "Market price today": "இன்றைய சந்தை விலை",
    "Government schemes": "அரசு திட்டங்கள்",
  },
};

const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Cloudy",
  45: "Fog",
  48: "Fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Light drizzle",
  57: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Light rain",
  67: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow",
  80: "Rain showers",
  81: "Rain showers",
  82: "Heavy showers",
  85: "Light snow",
  86: "Heavy snow",
  95: "Thunderstorm",
  96: "Thunderstorm",
  99: "Thunderstorm",
};

function Dashboard() {
  const [prompt, setPrompt] = useState("");
  const { name } = useFarmer();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [weather, setWeather] = useState<Weather | null>(null);
  const [weatherStatus, setWeatherStatus] = useState<
    "idle" | "loading" | "denied" | "error" | "ok"
  >("idle");

  const lang = language as Language;
  const t =
    DASHBOARD_TRANSLATIONS[lang] ?? DASHBOARD_TRANSLATIONS.en;

  const sendToChat = (text: string) => {
    const q = text.trim();
    if (!q) return;

    void navigate({
      to: "/chat",
      search: { q },
    });
  };

  useEffect(() => {
    let cancelled = false;

    if (!("geolocation" in navigator)) {
      setWeatherStatus("error");
      return;
    }

    setWeatherStatus("loading");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const result = await getWeatherIntelligence({
            data: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              language: lang,
            },
          });

          if (cancelled) return;

          const code = result.current.code;
          const englishDescription =
            WEATHER_CODES[code] ?? "Clear sky";

          setWeather({
            tempC: Math.round(result.current.tempC),
            code,
            description:
              WEATHER_TRANSLATIONS[lang]?.[englishDescription] ??
              englishDescription,
            place: [
              result.location.name,
              result.location.region,
            ]
              .filter(Boolean)
              .join(", "),
          });

          setWeatherStatus("ok");
        } catch (error) {
          console.error("Dashboard weather error:", error);

          if (!cancelled) {
            setWeatherStatus("error");
          }
        }
      },
      () => {
        if (!cancelled) {
          setWeatherStatus("denied");
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      },
    );

    return () => {
      cancelled = true;
    };
  }, [lang]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-12">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          {t.greeting},{" "}
          <span className="text-gradient">{name}</span>{" "}
          <span className="inline-block">👋</span>
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {t.description}
        </p>
      </motion.header>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card className="glass relative overflow-hidden border-0">
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />

          <CardContent className="relative p-6 md:p-8">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-foreground/80 uppercase">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {t.liveWeather}
            </div>

            {weatherStatus === "loading" && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.fetchingWeather}
              </div>
            )}

            {weatherStatus === "denied" && (
              <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
                {t.locationBlocked}
              </p>
            )}

            {weatherStatus === "error" && (
              <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
                {t.weatherError}
              </p>
            )}

            {weatherStatus === "ok" && weather && (
              <>
                <h2 className="mt-3 flex items-baseline gap-3 font-display text-3xl leading-tight font-semibold md:text-4xl">
                  {weather.tempC}°C

                  <span className="text-base font-normal text-muted-foreground">
                    {weather.description}
                  </span>
                </h2>

                <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {weather.place}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-white/5"
                  >
                    <CloudRain className="mr-1 h-3 w-3" />
                    {t.source}
                  </Badge>
                </div>

                <p className="mt-5 max-w-2xl text-sm text-muted-foreground">
                  {t.personalizedAdvice}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </motion.section>

      <section className="mb-4">
        <div className="mb-2.5 flex items-center justify-between px-1">
          <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t.quickActions}
          </div>

          <div className="hidden text-[11px] text-muted-foreground sm:block">
            {t.prefill}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_ACTIONS.map((a, i) => {
            const Icon = a.icon;

            const label =
              QUICK_ACTION_TRANSLATIONS[lang]?.[a.label] ??
              a.label;

            return (
              <motion.button
                key={a.label}
                type="button"
                onClick={() => sendToChat(a.label)}
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  delay: 0.03 * i,
                }}
                className="glass group flex items-center gap-2.5 rounded-xl p-3 text-left transition-colors hover:border-accent/40"
              >
                <div className="rounded-lg bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary/15">
                  <Icon className="h-4 w-4" />
                </div>

                <div className="truncate text-sm font-medium">
                  {label}
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      <section>
        <PromptBox
          value={prompt}
          onChange={setPrompt}
          onSend={sendToChat}
        />

        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          {t.mistake}
        </p>
      </section>
    </div>
  );
}