import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Cloud,
  CloudRain,
  CloudSun,
  CloudSnow,
  CloudFog,
  CloudLightning,
  Droplets,
  Sun,
  Wind,
  Gauge,
  Eye,
  MapPin,
  Loader2,
  RefreshCw,
  Search,
  Sprout,
  Bug,
  ShieldAlert,
  Snowflake,
  Flame,
  SprayCan,
  Calendar,
  AlertCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  getWeatherIntelligence,
  type WeatherIntelResult,
  type WeatherAdvisory,
  type WeatherDay,
  type WeatherHour,
} from "@/lib/weather/weather.functions";

import { useLanguage } from "@/context/LanguageContext";

export const Route = createFileRoute("/_workspace/weather")({
  component: WeatherPage,
});

/* -------------------------------------------------------------------------- */
/* Weather icons                                                               */
/* -------------------------------------------------------------------------- */

function codeToIcon(code: number) {
  if (code === 0) return Sun;
  if ([1, 2].includes(code)) return CloudSun;
  if (code === 3) return Cloud;
  if ([45, 48].includes(code)) return CloudFog;

  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)
  ) {
    return CloudRain;
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return CloudSnow;
  }

  if ([95, 96, 99].includes(code)) {
    return CloudLightning;
  }

  return Cloud;
}

/* -------------------------------------------------------------------------- */
/* Weather condition translations                                              */
/* -------------------------------------------------------------------------- */

const WEATHER_LABELS = {
  en: {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Rain showers",
    82: "Violent showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Severe thunderstorm",
  },

  hi: {
    0: "साफ़ आसमान",
    1: "मुख्यतः साफ़",
    2: "आंशिक बादल",
    3: "बादल छाए हुए",
    45: "कोहरा",
    48: "पाला युक्त कोहरा",
    51: "हल्की बूंदाबांदी",
    53: "बूंदाबांदी",
    55: "तेज़ बूंदाबांदी",
    61: "हल्की बारिश",
    63: "बारिश",
    65: "भारी बारिश",
    71: "हल्की बर्फबारी",
    73: "बर्फबारी",
    75: "भारी बर्फबारी",
    80: "बारिश की बौछारें",
    81: "बारिश की बौछारें",
    82: "तेज़ बारिश की बौछारें",
    95: "आंधी-तूफ़ान",
    96: "ओलों के साथ आंधी-तूफ़ान",
    99: "तेज़ आंधी-तूफ़ान",
  },

  kn: {
    0: "ಸ್ವಚ್ಛ ಆಕಾಶ",
    1: "ಮುಖ್ಯವಾಗಿ ಸ್ವಚ್ಛ",
    2: "ಭಾಗಶಃ ಮೋಡ ಕವಿದಿದೆ",
    3: "ಮೋಡ ಕವಿದಿದೆ",
    45: "ಮಂಜು",
    48: "ಹಿಮಮಂಜು",
    51: "ಸಣ್ಣ ತುಂತುರು ಮಳೆ",
    53: "ತುಂತುರು ಮಳೆ",
    55: "ಭಾರಿ ತುಂತುರು ಮಳೆ",
    61: "ಸಣ್ಣ ಮಳೆ",
    63: "ಮಳೆ",
    65: "ಭಾರಿ ಮಳೆ",
    71: "ಸಣ್ಣ ಹಿಮಪಾತ",
    73: "ಹಿಮಪಾತ",
    75: "ಭಾರಿ ಹಿಮಪಾತ",
    80: "ಮಳೆಯ ಬಿರುಗಾಳಿಯ ತುಂತುರು",
    81: "ಮಳೆಯ ಬಿರುಗಾಳಿಯ ತುಂತುರು",
    82: "ಭಾರಿ ಮಳೆಯ ಬಿರುಗಾಳಿಯ ತುಂತುರು",
    95: "ಗುಡುಗು ಸಹಿತ ಮಳೆ",
    96: "ಆಲಿಕಲ್ಲಿನೊಂದಿಗೆ ಗುಡುಗು ಮಳೆ",
    99: "ತೀವ್ರ ಗುಡುಗು ಮಳೆ",
  },

  ta: {
    0: "தெளிவான வானம்",
    1: "பெரும்பாலும் தெளிவு",
    2: "பகுதி மேகமூட்டம்",
    3: "மேகமூட்டம்",
    45: "மூடுபனி",
    48: "பனிமூட்டம்",
    51: "லேசான தூறல்",
    53: "தூறல்",
    55: "கனமான தூறல்",
    61: "லேசான மழை",
    63: "மழை",
    65: "கனமழை",
    71: "லேசான பனிப்பொழிவு",
    73: "பனிப்பொழிவு",
    75: "கனமான பனிப்பொழிவு",
    80: "மழைத்தூறல்",
    81: "மழைத்தூறல்",
    82: "கனமான மழைத்தூறல்",
    95: "இடியுடன் கூடிய மழை",
    96: "ஆலங்கட்டி மழையுடன் கூடிய இடி",
    99: "கடுமையான இடியுடன் கூடிய மழை",
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Page translations                                                           */
/* -------------------------------------------------------------------------- */

const WEATHER_TRANSLATIONS = {
  en: {
    saved: "saved",
    autoDetected: "auto-detected",
    detecting: "Detecting your location…",
    searchPlaceholder: "Village, city or 6-digit PIN…",
    save: "Save",
    useLive: "Use live location",
    refresh: "Refresh",

    locationNotice:
      "On desktops, browser location often uses Wi-Fi / IP and can land on a nearby town instead of your village. Type your village name or 6-digit PIN above and click Save — it will stick on every refresh.",

    weatherLoading: "Fetching live weather & AI advisory…",

    feelsLike: "Feels like",
    humidity: "Humidity",
    wind: "Wind",
    rain: "Rain",
    uvIndex: "UV Index",
    precip: "Precip",
    updated: "Updated",

    aiAdvisory: "AI Farm Advisory",
    liveAi: "Live weather · AI reasoning",

    irrigation: "Irrigation",
    spraying: "Spraying",
    diseaseRisk: "Disease risk",
    pestRisk: "Pest risk",
    heatStress: "Heat stress",
    frost: "Frost",

    safe: "Safe",
    notSafe: "Not safe",
    warning: "Warning",
    ok: "OK",

    noHeat: "No heat stress expected.",
    noFrost: "No frost risk expected.",

    bestToday: "Best activity today",
    bestTomorrow: "Best activity tomorrow",
    noRecommendations: "No specific recommendations.",

    hourly: "Hourly forecast · next 24h",
    now: "Now",
    daily: "3-day forecast",
    rainLabel: "Rain",

    source:
      "Weather data from WeatherAPI.com · AI advisory generated from current weather conditions.",
  },

  hi: {
    saved: "सहेजा गया",
    autoDetected: "स्वतः पता लगाया गया",
    detecting: "आपका स्थान पता लगाया जा रहा है…",
    searchPlaceholder: "गाँव, शहर या 6 अंकों का PIN…",
    save: "सहेजें",
    useLive: "लाइव स्थान का उपयोग करें",
    refresh: "रिफ्रेश करें",

    locationNotice:
      "डेस्कटॉप पर ब्राउज़र का स्थान अक्सर Wi-Fi / IP का उपयोग करता है और आपके गाँव के बजाय किसी नज़दीकी शहर का स्थान दिखा सकता है। ऊपर अपना गाँव या 6 अंकों का PIN दर्ज करें और सहेजें दबाएँ — यह हर रिफ्रेश पर बना रहेगा।",

    weatherLoading: "लाइव मौसम और AI सलाह प्राप्त की जा रही है…",

    feelsLike: "महसूस हो रहा है",
    humidity: "नमी",
    wind: "हवा",
    rain: "बारिश",
    uvIndex: "UV इंडेक्स",
    precip: "वर्षा",
    updated: "अपडेट किया गया",

    aiAdvisory: "AI कृषि सलाह",
    liveAi: "लाइव मौसम · AI विश्लेषण",

    irrigation: "सिंचाई",
    spraying: "छिड़काव",
    diseaseRisk: "रोग का जोखिम",
    pestRisk: "कीट का जोखिम",
    heatStress: "गर्मी का तनाव",
    frost: "पाला",

    safe: "सुरक्षित",
    notSafe: "सुरक्षित नहीं",
    warning: "चेतावनी",
    ok: "ठीक है",

    noHeat: "गर्मी के तनाव की संभावना नहीं है।",
    noFrost: "पाले की संभावना नहीं है।",

    bestToday: "आज की सबसे अच्छी गतिविधि",
    bestTomorrow: "कल की सबसे अच्छी गतिविधि",
    noRecommendations: "कोई विशेष सलाह उपलब्ध नहीं है।",

    hourly: "प्रति घंटे का पूर्वानुमान · अगले 24 घंटे",
    now: "अभी",
    daily: "3 दिन का पूर्वानुमान",
    rainLabel: "बारिश",

    source:
      "मौसम डेटा WeatherAPI.com से · AI सलाह वर्तमान मौसम की स्थिति के आधार पर तैयार की गई है।",
  },

  kn: {
    saved: "ಉಳಿಸಲಾಗಿದೆ",
    autoDetected: "ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪತ್ತೆಹಚ್ಚಲಾಗಿದೆ",
    detecting: "ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತಿದೆ…",
    searchPlaceholder: "ಗ್ರಾಮ, ನಗರ ಅಥವಾ 6 ಅಂಕಿಯ PIN…",
    save: "ಉಳಿಸಿ",
    useLive: "ನೇರ ಸ್ಥಳವನ್ನು ಬಳಸಿ",
    refresh: "ರಿಫ್ರೆಶ್ ಮಾಡಿ",

    locationNotice:
      "ಡೆಸ್ಕ್‌ಟಾಪ್‌ನಲ್ಲಿ ಬ್ರೌಸರ್ ಸ್ಥಳವು ಸಾಮಾನ್ಯವಾಗಿ Wi-Fi / IP ಅನ್ನು ಬಳಸುತ್ತದೆ ಮತ್ತು ನಿಮ್ಮ ಗ್ರಾಮದ ಬದಲಿಗೆ ಹತ್ತಿರದ ಪಟ್ಟಣವನ್ನು ತೋರಿಸಬಹುದು. ಮೇಲಿನ ಸ್ಥಳದಲ್ಲಿ ನಿಮ್ಮ ಗ್ರಾಮ ಅಥವಾ 6 ಅಂಕಿಯ PIN ನಮೂದಿಸಿ ಮತ್ತು ಉಳಿಸಿ ಒತ್ತಿರಿ — ಇದು ಪ್ರತಿ ರಿಫ್ರೆಶ್‌ನಲ್ಲೂ ಉಳಿಯುತ್ತದೆ.",

    weatherLoading: "ನೇರ ಹವಾಮಾನ ಮತ್ತು AI ಸಲಹೆಯನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ…",

    feelsLike: "ಅನುಭವವಾಗುವ ತಾಪಮಾನ",
    humidity: "ತೇವಾಂಶ",
    wind: "ಗಾಳಿ",
    rain: "ಮಳೆ",
    uvIndex: "UV ಸೂಚ್ಯಂಕ",
    precip: "ಮಳೆ ಪ್ರಮಾಣ",
    updated: "ನವೀಕರಿಸಲಾಗಿದೆ",

    aiAdvisory: "AI ಕೃಷಿ ಸಲಹೆ",
    liveAi: "ನೇರ ಹವಾಮಾನ · AI ವಿಶ್ಲೇಷಣೆ",

    irrigation: "ನೀರಾವರಿ",
    spraying: "ಸಿಂಪಡಣೆ",
    diseaseRisk: "ರೋಗದ ಅಪಾಯ",
    pestRisk: "ಕೀಟದ ಅಪಾಯ",
    heatStress: "ಬಿಸಿಲಿನ ಒತ್ತಡ",
    frost: "ಹಿಮಪಾತ",

    safe: "ಸುರಕ್ಷಿತ",
    notSafe: "ಸುರಕ್ಷಿತವಲ್ಲ",
    warning: "ಎಚ್ಚರಿಕೆ",
    ok: "ಸರಿ",

    noHeat: "ಬಿಸಿಲಿನ ಒತ್ತಡದ ನಿರೀಕ್ಷೆಯಿಲ್ಲ.",
    noFrost: "ಹಿಮಪಾತದ ನಿರೀಕ್ಷೆಯಿಲ್ಲ.",

    bestToday: "ಇಂದಿನ ಉತ್ತಮ ಚಟುವಟಿಕೆ",
    bestTomorrow: "ನಾಳೆಯ ಉತ್ತಮ ಚಟುವಟಿಕೆ",
    noRecommendations: "ಯಾವುದೇ ವಿಶೇಷ ಶಿಫಾರಸುಗಳಿಲ್ಲ.",

    hourly: "ಗಂಟೆಯ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ · ಮುಂದಿನ 24 ಗಂಟೆಗಳು",
    now: "ಈಗ",
    daily: "3 ದಿನಗಳ ಮುನ್ಸೂಚನೆ",
    rainLabel: "ಮಳೆ",

    source:
      "ಹವಾಮಾನ ಮಾಹಿತಿ WeatherAPI.com ನಿಂದ · AI ಸಲಹೆಯನ್ನು ಪ್ರಸ್ತುತ ಹವಾಮಾನ ಪರಿಸ್ಥಿತಿಗಳ ಆಧಾರದ ಮೇಲೆ ರಚಿಸಲಾಗಿದೆ.",
  },

  ta: {
    saved: "சேமிக்கப்பட்டது",
    autoDetected: "தானாக கண்டறியப்பட்டது",
    detecting: "உங்கள் இருப்பிடம் கண்டறியப்படுகிறது…",
    searchPlaceholder: "கிராமம், நகரம் அல்லது 6 இலக்க PIN…",
    save: "சேமிக்கவும்",
    useLive: "நேரடி இருப்பிடத்தைப் பயன்படுத்தவும்",
    refresh: "புதுப்பிக்கவும்",

    locationNotice:
      "டெஸ்க்டாப்பில் உலாவி இருப்பிடம் பொதுவாக Wi-Fi / IP-ஐப் பயன்படுத்துகிறது. இதனால் உங்கள் கிராமத்திற்குப் பதிலாக அருகிலுள்ள நகரம் காட்டப்படலாம். மேலே உங்கள் கிராமம் அல்லது 6 இலக்க PIN-ஐ உள்ளிட்டு சேமிக்கவும் — ஒவ்வொரு புதுப்பிப்பிலும் இது நிலைத்திருக்கும்.",

    weatherLoading: "நேரடி வானிலை மற்றும் AI ஆலோசனை பெறப்படுகிறது…",

    feelsLike: "உணரப்படும் வெப்பநிலை",
    humidity: "ஈரப்பதம்",
    wind: "காற்று",
    rain: "மழை",
    uvIndex: "UV குறியீடு",
    precip: "மழைப்பொழிவு",
    updated: "புதுப்பிக்கப்பட்டது",

    aiAdvisory: "AI விவசாய ஆலோசனை",
    liveAi: "நேரடி வானிலை · AI பகுப்பாய்வு",

    irrigation: "நீர்ப்பாசனம்",
    spraying: "தெளித்தல்",
    diseaseRisk: "நோய் அபாயம்",
    pestRisk: "பூச்சி அபாயம்",
    heatStress: "வெப்ப அழுத்தம்",
    frost: "பனிப்பொழிவு",

    safe: "பாதுகாப்பானது",
    notSafe: "பாதுகாப்பானது அல்ல",
    warning: "எச்சரிக்கை",
    ok: "சரி",

    noHeat: "வெப்ப அழுத்தம் ஏற்படும் வாய்ப்பு இல்லை.",
    noFrost: "பனிப்பொழிவு ஏற்படும் வாய்ப்பு இல்லை.",

    bestToday: "இன்றைய சிறந்த செயல்பாடு",
    bestTomorrow: "நாளைய சிறந்த செயல்பாடு",
    noRecommendations: "குறிப்பிட்ட பரிந்துரைகள் எதுவும் இல்லை.",

    hourly: "மணிநேர வானிலை முன்னறிவிப்பு · அடுத்த 24 மணி நேரம்",
    now: "இப்போது",
    daily: "3 நாள் முன்னறிவிப்பு",
    rainLabel: "மழை",

    source:
      "வானிலைத் தகவல் WeatherAPI.com இலிருந்து · தற்போதைய வானிலை நிலைமைகளின் அடிப்படையில் AI ஆலோசனை உருவாக்கப்படுகிறது.",
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Formatters                                                                  */
/* -------------------------------------------------------------------------- */

function fmtHour(iso: string, language: string) {
  const d = new Date(iso);

  const locale =
    language === "hi"
      ? "hi-IN"
      : language === "kn"
        ? "kn-IN"
        : language === "ta"
          ? "ta-IN"
          : "en-IN";

  return d.toLocaleTimeString(locale, {
    hour: "numeric",
  });
}

function fmtDay(
  iso: string,
  idx: number,
  language: string,
) {
  if (idx === 0) {
    return language === "hi"
      ? "आज"
      : language === "kn"
        ? "ಇಂದು"
        : language === "ta"
          ? "இன்று"
          : "Today";
  }

  const locale =
    language === "hi"
      ? "hi-IN"
      : language === "kn"
        ? "kn-IN"
        : language === "ta"
          ? "ta-IN"
          : "en-IN";

  return new Date(iso).toLocaleDateString(locale, {
    weekday: "short",
  });
}

/* -------------------------------------------------------------------------- */
/* Metric                                                                      */
/* -------------------------------------------------------------------------- */

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-white/[0.03] p-3">
      <div className="rounded-lg bg-primary/15 p-2 text-primary">
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <div className="text-xs text-muted-foreground">
          {label}
        </div>

        <div className="text-sm font-medium">
          {value}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Level colors                                                                */
/* -------------------------------------------------------------------------- */

function levelColor(level: string) {
  const l = level.toLowerCase();

  if (l === "high" || l === "increase") {
    return "bg-destructive/15 text-destructive border-destructive/30";
  }

  if (l === "medium" || l === "reduce") {
    return "bg-amber-500/15 text-amber-500 border-amber-500/30";
  }

  if (l === "skip") {
    return "bg-slate-500/15 text-slate-300 border-slate-500/30";
  }

  return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
}

/* -------------------------------------------------------------------------- */
/* Advisory card                                                               */
/* -------------------------------------------------------------------------- */

function AdvisoryCard({
  icon: Icon,
  title,
  badge,
  badgeTone = "normal",
  body,
  reason,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  badge?: string;
  badgeTone?: "normal" | "level";
  body: string;
  reason?: string;
}) {
  return (
    <Card className="glass border-0">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/15 p-2 text-primary">
              <Icon className="h-4 w-4" />
            </div>

            <h3 className="text-sm font-semibold">
              {title}
            </h3>
          </div>

          {badge && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-medium uppercase tracking-wide",
                badgeTone === "level"
                  ? levelColor(badge)
                  : "border-accent/40 bg-accent/10 text-accent",
              )}
            >
              {badge}
            </Badge>
          )}
        </div>

        <p className="mt-3 text-sm leading-relaxed">
          {body}
        </p>

        {reason && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {reason}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Activity list                                                               */
/* -------------------------------------------------------------------------- */

function ActivityList({
  icon: Icon,
  title,
  items,
  emptyText,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <Card className="glass border-0">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/15 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>

          <h3 className="text-sm font-semibold">
            {title}
          </h3>
        </div>

        {items.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {emptyText}
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {items.map((it, i) => (
              <li
                key={i}
                className="flex gap-2"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

const SAVED_PLACE_KEY = "agriassist.weather.savedPlace";

function WeatherPage() {
  const weatherFn = useServerFn(getWeatherIntelligence);

  const { language } = useLanguage();

  const t =
    WEATHER_TRANSLATIONS[language] ??
    WEATHER_TRANSLATIONS.en;

  const weatherLabels =
    WEATHER_LABELS[language] ??
    WEATHER_LABELS.en;

  const [data, setData] =
    useState<WeatherIntelResult | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  const [placeInput, setPlaceInput] =
    useState("");

  const [usingGeo, setUsingGeo] =
    useState(false);

  const [savedPlace, setSavedPlace] =
    useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Load weather                                                              */
  /* ------------------------------------------------------------------------ */

  const load = useCallback(
    async (args: {
      lat?: number;
      lng?: number;
      place?: string;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const res = await weatherFn({
          data: {
            ...args,
            language,
          } as typeof args & {
            language: typeof language;
          },
        });

        setData(res);
      } catch (e) {
        console.error(e);

        setError(
          e instanceof Error
            ? e.message
            : "Failed to load weather.",
        );
      } finally {
        setLoading(false);
      }
    },
    [weatherFn, language],
  );

  /* ------------------------------------------------------------------------ */
  /* Initial location                                                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem(SAVED_PLACE_KEY)
        : null;

    if (saved) {
      setSavedPlace(saved);

      void load({
        place: saved,
      });

      return;
    }

    if (!navigator.geolocation) {
      setError(
        "Your browser doesn't support location access. Search a place to continue.",
      );

      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUsingGeo(true);

        void load({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        setLoading(false);

        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location access blocked. Enable location or search your place / PIN code below."
            : "Couldn't detect your location. Search your place or PIN code below.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );

    // Only run automatically on first visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Search                                                                    */
  /* ------------------------------------------------------------------------ */

  const handleSearch = (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    const p = placeInput.trim();

    if (!p) return;

    setUsingGeo(false);

    localStorage.setItem(
      SAVED_PLACE_KEY,
      p,
    );

    setSavedPlace(p);
    setPlaceInput("");

    void load({
      place: p,
    });
  };

  /* ------------------------------------------------------------------------ */
  /* Clear saved location                                                      */
  /* ------------------------------------------------------------------------ */

  const handleClearSaved = () => {
    localStorage.removeItem(
      SAVED_PLACE_KEY,
    );

    setSavedPlace(null);
    setUsingGeo(false);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUsingGeo(true);

          void load({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => void load({}),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        },
      );
    }
  };

  const advisory: WeatherAdvisory | null =
    data?.advisory ?? null;

  const CurrentIcon = useMemo(
    () =>
      data
        ? codeToIcon(data.current.code)
        : CloudSun,
    [data],
  );

  /* ------------------------------------------------------------------------ */
  /* Render                                                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">

      {/* Location bar */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

        <div className="flex items-center gap-2 text-sm text-foreground/70">
          <MapPin className="h-4 w-4" />

          {data ? (
            <span>
              {data.location.name}

              {data.location.region
                ? `, ${data.location.region}`
                : ""}

              {data.location.country
                ? `, ${data.location.country}`
                : ""}

              {savedPlace && (
                <span className="ml-2 text-xs text-primary">
                  • {t.saved}
                </span>
              )}

              {!savedPlace && usingGeo && (
                <span className="ml-2 text-xs text-primary">
                  • {t.autoDetected}
                </span>
              )}
            </span>
          ) : (
            <span>{t.detecting}</span>
          )}
        </div>

        <form
          onSubmit={handleSearch}
          className="flex flex-wrap items-center gap-2"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={placeInput}
              onChange={(e) =>
                setPlaceInput(e.target.value)
              }
              placeholder={t.searchPlaceholder}
              className="w-64 pl-8"
            />
          </div>

          <Button
            type="submit"
            variant="secondary"
            size="sm"
            disabled={loading}
          >
            {t.save}
          </Button>

          {savedPlace && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearSaved}
              disabled={loading}
            >
              {t.useLive}
            </Button>
          )}

          {data && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                void load(
                  savedPlace
                    ? {
                        place: savedPlace,
                      }
                    : {
                        lat: data.location.lat,
                        lng: data.location.lng,
                      },
                )
              }
              disabled={loading}
              aria-label={t.refresh}
              title={t.refresh}
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4",
                  loading && "animate-spin",
                )}
              />
            </Button>
          )}
        </form>
      </div>

      {/* Location notice */}
      {!savedPlace && data && usingGeo && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-accent/30 bg-accent/5 p-3 text-xs text-muted-foreground">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />

          <span>
            {t.locationNotice}
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && !data ? (
        <Card className="glass border-0">
          <CardContent className="flex items-center justify-center gap-2 p-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.weatherLoading}
          </CardContent>
        </Card>
      ) : data ? (
        <>
          {/* Current weather */}
          <Card className="glass overflow-hidden border-0">
            <div className="bg-gradient-hero p-6 md:p-8">

              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <div className="text-sm text-muted-foreground">
                    {data.location.name}

                    {data.location.region
                      ? `, ${data.location.region}`
                      : ""}
                  </div>

                  <div className="mt-1 font-display text-6xl font-semibold tracking-tight md:text-7xl">
                    {Math.round(data.current.tempC)}°
                  </div>

                  <div className="mt-1 text-sm text-muted-foreground">
                    {weatherLabels[
                      data.current.code as keyof typeof weatherLabels
                    ] ?? "—"}

                    {" • "}

                    {t.feelsLike}{" "}
                    {Math.round(
                      data.current.feelsLikeC,
                    )}°
                  </div>
                </div>

                <CurrentIcon className="h-24 w-24 text-primary drop-shadow-[0_10px_30px_rgba(139,154,110,0.35)]" />
              </div>

              {/* Metrics */}
              <div className="mt-6 grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-6">

                <Metric
                  icon={Droplets}
                  label={t.humidity}
                  value={`${Math.round(data.current.humidity)}%`}
                />

                <Metric
                  icon={Wind}
                  label={t.wind}
                  value={`${Math.round(data.current.windKph)} km/h`}
                />

                <Metric
                  icon={CloudRain}
                  label={t.rain}
                  value={`${Math.round(data.current.precipProb)}%`}
                />

                <Metric
                  icon={Sun}
                  label={t.uvIndex}
                  value={`${Math.round(data.current.uvIndex)}`}
                />

                <Metric
                  icon={Gauge}
                  label={t.precip}
                  value={`${data.current.precipMm.toFixed(1)} mm`}
                />

                <Metric
                  icon={Eye}
                  label={t.updated}
                  value={new Date(
                    data.fetchedAt,
                  ).toLocaleTimeString(
                    language === "hi"
                      ? "hi-IN"
                      : language === "kn"
                        ? "kn-IN"
                        : language === "ta"
                          ? "ta-IN"
                          : "en-IN",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                />
              </div>
            </div>
          </Card>

          {/* AI advisory */}
          {advisory && (
            <div className="mt-6">

              <div className="mb-3 flex items-center gap-2">
                <Sprout className="h-4 w-4 text-primary" />

                <h2 className="font-display text-base font-semibold">
                  {t.aiAdvisory}
                </h2>

                <Badge
                  variant="outline"
                  className="border-primary/40 bg-primary/10 text-[10px] uppercase tracking-wide text-primary"
                >
                  {t.liveAi}
                </Badge>
              </div>

              <p className="mb-4 text-sm text-muted-foreground">
                {advisory.summary}
              </p>

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">

                <AdvisoryCard
                  icon={Droplets}
                  title={t.irrigation}
                  badge={advisory.irrigation.level}
                  badgeTone="level"
                  body={advisory.irrigation.action}
                  reason={advisory.irrigation.reason}
                />

                <AdvisoryCard
                  icon={SprayCan}
                  title={t.spraying}
                  badge={
                    advisory.spray.safe
                      ? t.safe
                      : t.notSafe
                  }
                  badgeTone="level"
                  body={advisory.spray.action}
                  reason={advisory.spray.reason}
                />

                <AdvisoryCard
                  icon={ShieldAlert}
                  title={t.diseaseRisk}
                  badge={advisory.diseaseRisk.level}
                  badgeTone="level"
                  body={advisory.diseaseRisk.note}
                />

                <AdvisoryCard
                  icon={Bug}
                  title={t.pestRisk}
                  badge={advisory.pestRisk.level}
                  badgeTone="level"
                  body={advisory.pestRisk.note}
                />

                <AdvisoryCard
                  icon={Flame}
                  title={t.heatStress}
                  badge={
                    advisory.heatStress.warning
                      ? t.warning
                      : t.ok
                  }
                  badgeTone="level"
                  body={
                    advisory.heatStress.note ||
                    t.noHeat
                  }
                />

                <AdvisoryCard
                  icon={Snowflake}
                  title={t.frost}
                  badge={
                    advisory.frost.warning
                      ? t.warning
                      : t.ok
                  }
                  badgeTone="level"
                  body={
                    advisory.frost.note ||
                    t.noFrost
                  }
                />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">

                <ActivityList
                  icon={Calendar}
                  title={t.bestToday}
                  items={advisory.todayActivities}
                  emptyText={t.noRecommendations}
                />

                <ActivityList
                  icon={Calendar}
                  title={t.bestTomorrow}
                  items={advisory.tomorrowActivities}
                  emptyText={t.noRecommendations}
                />

              </div>
            </div>
          )}

          {/* Hourly */}
          <Card className="glass mt-6 border-0">
            <CardContent className="p-5">

              <h2 className="font-display text-base font-semibold">
                {t.hourly}
              </h2>

              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {data.hourly.map(
                  (h: WeatherHour, i) => {
                    const Icon = codeToIcon(h.code);

                    return (
                      <div
                        key={h.time}
                        className="flex min-w-[76px] flex-col items-center rounded-lg border border-border/60 bg-white/[0.02] p-3"
                      >
                        <div className="text-xs text-muted-foreground">
                          {i === 0
                            ? t.now
                            : fmtHour(
                                h.time,
                                language,
                              )}
                        </div>

                        <Icon className="my-2 h-6 w-6 text-accent" />

                        <div className="text-sm font-medium">
                          {Math.round(h.tempC)}°
                        </div>

                        <div className="mt-0.5 text-[10px] text-muted-foreground">
                          {h.precipProb}%
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </CardContent>
          </Card>

          {/* Daily */}
          <Card className="glass mt-6 border-0">
            <CardContent className="p-5">

              <h2 className="font-display text-base font-semibold">
                {t.daily}
              </h2>

              <div className="mt-3 divide-y divide-border/60">
                {data.daily.map(
                  (d: WeatherDay, i) => {
                    const Icon = codeToIcon(d.code);

                    return (
                      <div
                        key={d.date}
                        className="flex items-center gap-4 py-3"
                      >
                        <div className="w-16 text-sm">
                          {fmtDay(
                            d.date,
                            i,
                            language,
                          )}
                        </div>

                        <Icon className="h-5 w-5 text-accent" />

                        <div className="flex-1 text-xs text-muted-foreground">
                          {t.rainLabel}{" "}
                          {d.precipProb}% · {t.uv}{" "}
                          {Math.round(d.uvMax)}
                        </div>

                        <div className="text-sm">
                          <span className="font-medium">
                            {Math.round(d.tempMaxC)}°
                          </span>{" "}

                          <span className="text-muted-foreground">
                            {Math.round(d.tempMinC)}°
                          </span>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-4 text-center text-[11px] text-muted-foreground">
            {t.weatherSource}
          </div>
        </>
      ) : null}
    </div>
  );
}
