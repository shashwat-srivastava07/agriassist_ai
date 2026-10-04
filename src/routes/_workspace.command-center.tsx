import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import {
  generateCommandBrief,
  type CommandCenterReport,
  type CommandInput,
  type SmartAlert,
} from "@/lib/command-center/command.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CloudRain,
  TrendingUp,
  Droplets,
  FlaskConical,
  Wheat,
  Landmark,
  Bell,
  BellOff,
  CheckCircle2,
  Loader2,
  Activity,
  Calendar,
  Target,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFarmer } from "@/hooks/useFarmer";
import { useLanguage, type Language } from "@/context/LanguageContext";


const COMMAND_TRANSLATIONS = {
  en: {
    aiCenter: "AI Farm Command Center",
    goodDay: "Good day,",
    proactive: "Proactive intelligence for",
    unread: "unread",
    refreshBrief: "Refresh brief",
    generateBrief: "Generate brief",
    profileInputs: "Farm profile inputs",
    crop: "Crop",
    village: "Village",
    district: "District",
    state: "State",
    landAcres: "Land (acres)",
    sowingDate: "Sowing date",
    awaits: "Your AI operating system awaits",
    awaitsDesc: "Fill in your farm profile above and generate a personalized brief covering health, weather, disease risk, irrigation, fertilizer, market, and scheme reminders.",
    analyzing: "Analyzing your farm…",
    topPriority: "Today's top priority",
    health: "Health",
    alerts: "alerts",
    upcoming: "upcoming",
    dailyBrief: "AI Daily Brief",
    farmHealth: "Farm Health",
    weather: "Weather",
    cropLabel: "Crop",
    diseaseRisk: "Disease Risk",
    irrigation: "Irrigation",
    fertilizer: "Fertilizer",
    market: "Market",
    govtScheme: "Govt Scheme",
    smartAlerts: "Smart Alerts",
    markAllRead: "Mark all read",
    due: "Due",
    markRead: "Mark read",
    timeline: "Farm Timeline",
    recommendations: "AI Recommendations",
    impact: "impact",
    applyInsight: "Apply insight",
    generated: "Generated",
    commandCenter: "AgriAssist AI Command Center",
    healthScore: "Farm Health Score",
    cropHealth: "Crop Health",
    planner: "Planner",
    scoreExplanation: "Score blends crop health, irrigation status, disease risk, planner completion, and weather signals.",
    somethingWrong: "Something went wrong",
  },
  hi: {
    aiCenter: "AI कृषि कमांड सेंटर",
    goodDay: "नमस्कार,",
    proactive: "के लिए सक्रिय कृषि जानकारी:",
    unread: "अपठित",
    refreshBrief: "ब्रीफ रीफ्रेश करें",
    generateBrief: "ब्रीफ तैयार करें",
    profileInputs: "खेत की प्रोफ़ाइल जानकारी",
    crop: "फसल",
    village: "गाँव",
    district: "ज़िला",
    state: "राज्य",
    landAcres: "भूमि (एकड़)",
    sowingDate: "बुवाई की तारीख",
    awaits: "आपका AI कृषि सिस्टम तैयार है",
    awaitsDesc: "ऊपर अपनी खेत की प्रोफ़ाइल भरें और स्वास्थ्य, मौसम, रोग जोखिम, सिंचाई, उर्वरक, बाज़ार और सरकारी योजनाओं की व्यक्तिगत जानकारी वाली ब्रीफ तैयार करें।",
    analyzing: "आपके खेत का विश्लेषण हो रहा है…",
    topPriority: "आज की मुख्य प्राथमिकता",
    health: "स्वास्थ्य",
    alerts: "अलर्ट",
    upcoming: "आगामी",
    dailyBrief: "AI दैनिक ब्रीफ",
    farmHealth: "खेत का स्वास्थ्य",
    weather: "मौसम",
    cropLabel: "फसल",
    diseaseRisk: "रोग जोखिम",
    irrigation: "सिंचाई",
    fertilizer: "उर्वरक",
    market: "बाज़ार",
    govtScheme: "सरकारी योजना",
    smartAlerts: "स्मार्ट अलर्ट",
    markAllRead: "सभी को पढ़ा हुआ करें",
    due: "देय",
    markRead: "पढ़ा हुआ करें",
    timeline: "खेत की समयरेखा",
    recommendations: "AI सुझाव",
    impact: "प्रभाव",
    applyInsight: "सुझाव लागू करें",
    generated: "तैयार किया गया",
    commandCenter: "AgriAssist AI कमांड सेंटर",
    healthScore: "खेत स्वास्थ्य स्कोर",
    cropHealth: "फसल स्वास्थ्य",
    planner: "प्लानर",
    scoreExplanation: "स्कोर में फसल स्वास्थ्य, सिंचाई स्थिति, रोग जोखिम, प्लानर की प्रगति और मौसम संकेत शामिल हैं।",
    somethingWrong: "कुछ गलत हो गया",
  },
  kn: {
    aiCenter: "AI ಕೃಷಿ ಕಮಾಂಡ್ ಸೆಂಟರ್",
    goodDay: "ನಮಸ್ಕಾರ,",
    proactive: "ಗಾಗಿ ಸಕ್ರಿಯ ಕೃಷಿ ಮಾಹಿತಿ:",
    unread: "ಓದದವು",
    refreshBrief: "ಬ್ರೀಫ್ ರಿಫ್ರೆಶ್ ಮಾಡಿ",
    generateBrief: "ಬ್ರೀಫ್ ತಯಾರಿಸಿ",
    profileInputs: "ಕೃಷಿ ಪ್ರೊಫೈಲ್ ಮಾಹಿತಿ",
    crop: "ಬೆಳೆ",
    village: "ಗ್ರಾಮ",
    district: "ಜಿಲ್ಲೆ",
    state: "ರಾಜ್ಯ",
    landAcres: "ಭೂಮಿ (ಎಕರೆ)",
    sowingDate: "ಬಿತ್ತನೆ ದಿನಾಂಕ",
    awaits: "ನಿಮ್ಮ AI ಕೃಷಿ ವ್ಯವಸ್ಥೆ ಸಿದ್ಧವಾಗಿದೆ",
    awaitsDesc: "ಮೇಲಿನ ಕೃಷಿ ಪ್ರೊಫೈಲ್ ಭರ್ತಿ ಮಾಡಿ ಮತ್ತು ಆರೋಗ್ಯ, ಹವಾಮಾನ, ರೋಗ ಅಪಾಯ, ನೀರಾವರಿ, ಗೊಬ್ಬರ, ಮಾರುಕಟ್ಟೆ ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ವೈಯಕ್ತಿಕ ಬ್ರೀಫ್ ತಯಾರಿಸಿ.",
    analyzing: "ನಿಮ್ಮ ಕೃಷಿಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ…",
    topPriority: "ಇಂದಿನ ಪ್ರಮುಖ ಆದ್ಯತೆ",
    health: "ಆರೋಗ್ಯ",
    alerts: "ಎಚ್ಚರಿಕೆಗಳು",
    upcoming: "ಮುಂಬರುವ",
    dailyBrief: "AI ದೈನಂದಿನ ಬ್ರೀಫ್",
    farmHealth: "ಕೃಷಿ ಆರೋಗ್ಯ",
    weather: "ಹವಾಮಾನ",
    cropLabel: "ಬೆಳೆ",
    diseaseRisk: "ರೋಗ ಅಪಾಯ",
    irrigation: "ನೀರಾವರಿ",
    fertilizer: "ಗೊಬ್ಬರ",
    market: "ಮಾರುಕಟ್ಟೆ",
    govtScheme: "ಸರ್ಕಾರಿ ಯೋಜನೆ",
    smartAlerts: "ಸ್ಮಾರ್ಟ್ ಎಚ್ಚರಿಕೆಗಳು",
    markAllRead: "ಎಲ್ಲವನ್ನೂ ಓದಿದಂತೆ ಗುರುತಿಸಿ",
    due: "ನಿಗದಿತ",
    markRead: "ಓದಿದಂತೆ ಗುರುತಿಸಿ",
    timeline: "ಕೃಷಿ ಸಮಯರೇಖೆ",
    recommendations: "AI ಶಿಫಾರಸುಗಳು",
    impact: "ಪರಿಣಾಮ",
    applyInsight: "ಸಲಹೆ ಅನ್ವಯಿಸಿ",
    generated: "ತಯಾರಿಸಲಾಗಿದೆ",
    commandCenter: "AgriAssist AI ಕಮಾಂಡ್ ಸೆಂಟರ್",
    healthScore: "ಕೃಷಿ ಆರೋಗ್ಯ ಸ್ಕೋರ್",
    cropHealth: "ಬೆಳೆ ಆರೋಗ್ಯ",
    planner: "ಪ್ಲಾನರ್",
    scoreExplanation: "ಸ್ಕೋರ್‌ನಲ್ಲಿ ಬೆಳೆ ಆರೋಗ್ಯ, ನೀರಾವರಿ ಸ್ಥಿತಿ, ರೋಗ ಅಪಾಯ, ಪ್ಲಾನರ್ ಪ್ರಗತಿ ಮತ್ತು ಹವಾಮಾನ ಸೂಚನೆಗಳು ಸೇರಿವೆ.",
    somethingWrong: "ಏನೋ ತಪ್ಪಾಗಿದೆ",
  },
  ta: {
    aiCenter: "AI விவசாய கட்டுப்பாட்டு மையம்",
    goodDay: "வணக்கம்,",
    proactive: "க்கான செயலில் உள்ள விவசாய தகவல்:",
    unread: "படிக்காதவை",
    refreshBrief: "சுருக்கத்தை புதுப்பிக்கவும்",
    generateBrief: "சுருக்கத்தை உருவாக்கவும்",
    profileInputs: "பண்ணை சுயவிவர தகவல்",
    crop: "பயிர்",
    village: "கிராமம்",
    district: "மாவட்டம்",
    state: "மாநிலம்",
    landAcres: "நிலம் (ஏக்கர்)",
    sowingDate: "விதைப்பு தேதி",
    awaits: "உங்கள் AI விவசாய அமைப்பு தயாராக உள்ளது",
    awaitsDesc: "மேலே உங்கள் பண்ணை சுயவிவரத்தை நிரப்பி, பயிர் ஆரோக்கியம், வானிலை, நோய் அபாயம், நீர்ப்பாசனம், உரம், சந்தை மற்றும் அரசு திட்டங்கள் பற்றிய தனிப்பயன் சுருக்கத்தை உருவாக்கவும்.",
    analyzing: "உங்கள் பண்ணை பகுப்பாய்வு செய்யப்படுகிறது…",
    topPriority: "இன்றைய முக்கிய முன்னுரிமை",
    health: "ஆரோக்கியம்",
    alerts: "எச்சரிக்கைகள்",
    upcoming: "வரவிருக்கும்",
    dailyBrief: "AI தினசரி சுருக்கம்",
    farmHealth: "பண்ணை ஆரோக்கியம்",
    weather: "வானிலை",
    cropLabel: "பயிர்",
    diseaseRisk: "நோய் அபாயம்",
    irrigation: "நீர்ப்பாசனம்",
    fertilizer: "உரம்",
    market: "சந்தை",
    govtScheme: "அரசுத் திட்டம்",
    smartAlerts: "ஸ்மார்ட் எச்சரிக்கைகள்",
    markAllRead: "அனைத்தையும் படித்ததாக குறிக்கவும்",
    due: "நிலுவை",
    markRead: "படித்ததாக குறிக்கவும்",
    timeline: "பண்ணை காலவரிசை",
    recommendations: "AI பரிந்துரைகள்",
    impact: "தாக்கம்",
    applyInsight: "பரிந்துரையைப் பயன்படுத்தவும்",
    generated: "உருவாக்கப்பட்டது",
    commandCenter: "AgriAssist AI கட்டுப்பாட்டு மையம்",
    healthScore: "பண்ணை ஆரோக்கிய மதிப்பெண்",
    cropHealth: "பயிர் ஆரோக்கியம்",
    planner: "திட்டமிடல்",
    scoreExplanation: "மதிப்பெண் பயிர் ஆரோக்கியம், நீர்ப்பாசன நிலை, நோய் அபாயம், திட்டமிடல் முன்னேற்றம் மற்றும் வானிலை அறிகுறிகளை இணைக்கிறது.",
    somethingWrong: "ஏதோ தவறு ஏற்பட்டது",
  },
} as const;

function getCommandTranslations(language: keyof typeof COMMAND_TRANSLATIONS) {
  return COMMAND_TRANSLATIONS[language] ?? COMMAND_TRANSLATIONS.en;
}

export const Route = createFileRoute("/_workspace/command-center")({
  component: CommandCenter,
});

const DEFAULT_INPUT: CommandInput = {
  farmerName: "Farmer",
  village: "Hosakote",
  district: "Bengaluru Rural",
  state: "Karnataka",
  landSizeAcres: 4.5,
  crop: "Tomato",
  soil: "loamy",
  water: "borewell",
  sowingDate: "",
};

const STORAGE_KEY = "agriassist.commandCenter.v1";
const READ_KEY = "agriassist.commandCenter.read.v1";

const ALERT_ICONS: Record<
  SmartAlert["type"],
  React.ComponentType<{ className?: string }>
> = {
  disease: AlertTriangle,
  weather: CloudRain,
  market: TrendingUp,
  irrigation: Droplets,
  fertilizer: FlaskConical,
  harvest: Wheat,
  scheme: Landmark,
};

const SEV_STYLE: Record<SmartAlert["severity"], string> = {
  critical: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  warning: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  info: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
};

function CommandCenter() {
  const { name } = useFarmer();
  const { language } = useLanguage();
  const t = getCommandTranslations(language);
  const [input, setInput] = useState<CommandInput>(DEFAULT_INPUT);
  const [report, setReport] = useState<CommandCenterReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const [briefLanguage, setBriefLanguage] = useState<Language | null>(null);
  const run = useServerFn(generateCommandBrief);

  // hydrate
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);

      if (cached) {
        const parsed = JSON.parse(cached) as {
          input: CommandInput & { language?: Language };
          report: CommandCenterReport;
        };

        setInput(parsed.input);
        setReport(parsed.report);
        setBriefLanguage(parsed.input.language ?? null);
      }

      const r = localStorage.getItem(READ_KEY);

      if (r) {
        setReadIds(new Set(JSON.parse(r) as string[]));
      }
    } catch {
      /* noop */
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (name && name !== "Farmer") {
      setInput((s) => ({
        ...s,
        farmerName: s.farmerName === "Farmer" ? name : s.farmerName,
      }));
    }
  }, [name]);

  const fetchBrief = async (payload: CommandInput) => {
    setLoading(true);
    setError(null);

    try {
      const localizedPayload = { ...payload, language } as CommandInput;
      const r = await run({ data: localizedPayload });

      setReport(r);
      setBriefLanguage(language);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          input: localizedPayload,
          report: r,
        }),
      );

      setReadIds(new Set());
      localStorage.setItem(READ_KEY, JSON.stringify([]));

      try {
        const { logActivity } = await import(
          "@/lib/reports/reports.functions"
        );

        await logActivity({
          data: {
            kind: "command-center",
            title: `Command Brief — ${payload.crop}`,
            detail: `Farm health score ${r.score}/100 • ${r.scoreLabel}`,
          },
        });
      } catch {
        /* noop */
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  // Keep an existing cached AI brief in sync with the selected language.
  // The cached brief may load after the first render, so we wait for hydration.
  useEffect(() => {
    if (!hydrated || !report) return;
    if (briefLanguage === language) return;

    void fetchBrief(input);
  }, [language, hydrated, report, briefLanguage]);

  const markRead = (id: string) => {
    const next = new Set(readIds);
    next.add(id);

    setReadIds(next);
    localStorage.setItem(READ_KEY, JSON.stringify([...next]));
  };

  const markAllRead = () => {
    if (!report) return;

    const next = new Set(report.alerts.map((a) => a.id));

    setReadIds(next);
    localStorage.setItem(READ_KEY, JSON.stringify([...next]));
  };

  const unreadCount = useMemo(
    () =>
      report
        ? report.alerts.filter((a) => !readIds.has(a.id)).length
        : 0,
    [report, readIds],
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-foreground uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            {t.aiCenter}
          </div>

          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {t.goodDay}{" "}
            <span className="text-gradient">
              {input.farmerName || name}
            </span>
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {t.proactive} {input.crop} · {input.village},{" "}
            {input.state}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {report && (
            <Badge
              variant="secondary"
              className="rounded-full bg-white/5"
            >
              <Bell className="mr-1 h-3 w-3" />
              {unreadCount} {t.unread}
            </Badge>
          )}

          <Button
            onClick={() => fetchBrief(input)}
            disabled={loading}
            className="bg-gradient-primary text-primary-foreground shadow-glow"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}

            {report ? t.refreshBrief : t.generateBrief}
          </Button>
        </div>
      </motion.header>

      {/* Profile inputs */}
      <Card className="glass mb-6 border-0">
        <CardContent className="p-5">
          <div className="mb-3 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {t.profileInputs}
          </div>

          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            <ProfileField label={t.cropLabel}>
              <Input
                value={input.crop}
                onChange={(e) =>
                  setInput({
                    ...input,
                    crop: e.target.value,
                  })
                }
              />
            </ProfileField>

            <ProfileField label={t.village}>
              <Input
                value={input.village}
                onChange={(e) =>
                  setInput({
                    ...input,
                    village: e.target.value,
                  })
                }
              />
            </ProfileField>

            <ProfileField label={t.district}>
              <Input
                value={input.district}
                onChange={(e) =>
                  setInput({
                    ...input,
                    district: e.target.value,
                  })
                }
              />
            </ProfileField>

            <ProfileField label={t.state}>
              <Input
                value={input.state}
                onChange={(e) =>
                  setInput({
                    ...input,
                    state: e.target.value,
                  })
                }
              />
            </ProfileField>

            <ProfileField label={t.landAcres}>
              <Input
                type="number"
                value={input.landSizeAcres}
                onChange={(e) =>
                  setInput({
                    ...input,
                    landSizeAcres: Number(e.target.value) || 0,
                  })
                }
              />
            </ProfileField>

            <ProfileField label={t.sowingDate}>
              <Input
                type="date"
                value={input.sowingDate}
                onChange={(e) =>
                  setInput({
                    ...input,
                    sowingDate: e.target.value,
                  })
                }
              />
            </ProfileField>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="glass mb-6 border-0">
          <CardContent className="p-4 text-sm text-rose-300">
            {error}
          </CardContent>
        </Card>
      )}

      {!report && !loading && (
        <Card className="glass border-0">
          <CardContent className="flex flex-col items-center justify-center gap-3 p-10 text-center">
            <div className="rounded-full bg-primary/15 p-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>

            <div className="font-display text-lg font-semibold">
              {t.awaits}
            </div>

            <p className="max-w-md text-sm text-muted-foreground">
              {t.awaitsDesc}
            </p>
          </CardContent>
        </Card>
      )}

      {loading && !report && (
        <Card className="glass border-0">
          <CardContent className="flex items-center justify-center gap-3 p-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            {t.analyzing}
          </CardContent>
        </Card>
      )}

      {report && (
        <>
          {/* Score + Priority row */}
          <section className="mb-6 grid gap-4 lg:grid-cols-3">
            <ScoreCard report={report} language={language} />

            <Card className="glass relative overflow-hidden border-0 lg:col-span-2">
              <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />

              <CardContent className="relative p-6">
                <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-accent uppercase">
                  <Target className="h-3.5 w-3.5" />
                  {t.topPriority}
                </div>

                <h2 className="mt-2 font-display text-xl font-semibold leading-snug md:text-2xl">
                  {report.brief.topPriority}
                </h2>

                <p className="mt-3 text-sm text-muted-foreground">
                  {report.headline}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-white/5"
                  >
                    {t.health} {report.score}/100
                  </Badge>

                  <Badge
                    variant="secondary"
                    className="rounded-full bg-white/5"
                  >
                    {report.alerts.length} {t.alerts}
                  </Badge>

                  <Badge
                    variant="secondary"
                    className="rounded-full bg-white/5"
                  >
                    {report.timeline.length} {t.upcoming}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Daily Brief grid */}
          <section className="mb-6">
            <SectionHeader icon={Activity} title={t.dailyBrief} />

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <BriefCard
                tone="emerald"
                icon={Activity}
                label={t.farmHealth}
                text={report.brief.farmHealth}
              />

              <BriefCard
                tone="sky"
                icon={CloudRain}
                label={t.weather}
                text={report.brief.weather}
              />

              <BriefCard
                tone="lime"
                icon={Wheat}
                label={t.cropLabel}
                text={report.brief.crop}
              />

              <BriefCard
                tone="rose"
                icon={AlertTriangle}
                label={t.diseaseRisk}
                text={report.brief.diseaseRisk}
              />

              <BriefCard
                tone="cyan"
                icon={Droplets}
                label={t.irrigation}
                text={report.brief.irrigation}
              />

              <BriefCard
                tone="amber"
                icon={FlaskConical}
                label={t.fertilizer}
                text={report.brief.fertilizer}
              />

              <BriefCard
                tone="violet"
                icon={TrendingUp}
                label={t.market}
                text={report.brief.market}
              />

              <BriefCard
                tone="indigo"
                icon={Landmark}
                label={t.govtScheme}
                text={report.brief.scheme}
              />

              <BriefCard
                tone="primary"
                icon={Target}
                label={t.topPriority}
                text={report.brief.topPriority}
                highlight
              />
            </div>
          </section>

          {/* Alerts + Timeline */}
          <section className="mb-6 grid gap-4 lg:grid-cols-5">
            <Card className="glass border-0 lg:col-span-3">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <SectionHeader
                    icon={Bell}
                    title={t.smartAlerts}
                    inline
                  />

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={markAllRead}
                    className="text-xs text-muted-foreground"
                  >
                    <BellOff className="mr-1.5 h-3.5 w-3.5" />
                    {t.markAllRead}
                  </Button>
                </div>

                <ScrollArea className="h-[440px] pr-3">
                  <ul className="space-y-2.5">
                    {report.alerts.map((a) => {
                      const Icon = ALERT_ICONS[a.type] ?? Bell;
                      const isRead = readIds.has(a.id);

                      return (
                        <motion.li
                          key={a.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "rounded-xl border p-3.5 transition-opacity",
                            SEV_STYLE[a.severity],
                            isRead && "opacity-50",
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-white/10 p-2">
                              <Icon className="h-4 w-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="font-medium text-foreground">
                                  {a.title}
                                </div>

                                <Badge
                                  variant="secondary"
                                  className="rounded-full bg-white/10 text-[10px] uppercase"
                                >
                                  {a.type}
                                </Badge>

                                {a.dueDate && (
                                  <span className="text-[11px] text-muted-foreground">
                                    {t.due} {a.dueDate}
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 text-sm text-muted-foreground">
                                {a.message}
                              </p>

                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs font-medium text-foreground">
                                  → {a.action}
                                </span>

                                {!isRead && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => markRead(a.id)}
                                    className="ml-auto h-7 text-[11px]"
                                  >
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    {t.markRead}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="glass border-0 lg:col-span-2">
              <CardContent className="p-5">
                <SectionHeader
                  icon={Calendar}
                  title={t.timeline}
                  inline
                />

                <ScrollArea className="mt-3 h-[440px] pr-3">
                  <ol className="relative space-y-4 border-l border-white/10 pl-5">
                    {report.timeline.map((t, i) => (
                      <li key={i} className="relative">
                        <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full bg-gradient-primary ring-4 ring-background" />

                        <div className="text-[11px] font-medium uppercase tracking-wide text-accent">
                          {t.date} · {t.category}
                        </div>

                        <div className="mt-0.5 text-sm font-medium">
                          {t.title}
                        </div>

                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {t.detail}
                        </div>
                      </li>
                    ))}
                  </ol>
                </ScrollArea>
              </CardContent>
            </Card>
          </section>

          {/* Recommendations */}
          <section className="mb-6">
            <SectionHeader
              icon={Sparkles}
              title={t.recommendations}
            />

            <div className="grid gap-3 md:grid-cols-3">
              {report.recommendations.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="glass relative h-full overflow-hidden border-0">
                    <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-accent/15 blur-3xl" />

                    <CardContent className="relative p-5">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className="rounded-full bg-white/5 text-[10px] uppercase"
                        >
                          {r.category}
                        </Badge>

                        <Badge
                          className={cn(
                            "rounded-full text-[10px]",
                            r.impact === "High"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : r.impact === "Medium"
                                ? "bg-amber-500/15 text-amber-300"
                                : "bg-sky-500/15 text-sky-300",
                          )}
                        >
                          {r.impact} {t.impact}
                        </Badge>
                      </div>

                      <h3 className="mt-3 font-display text-base font-semibold leading-snug">
                        {r.title}
                      </h3>

                      <p className="mt-2 text-sm text-muted-foreground">
                        {r.detail}
                      </p>

                      <div className="mt-4 inline-flex items-center gap-1 text-xs text-accent">
                        {t.applyInsight}
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          <p className="text-center text-[11px] text-muted-foreground">
            Generated{" "}
            {new Date(report.generatedAt).toLocaleString()} · AgriAssist AI
            Command Center
          </p>
        </>
      )}
    </div>
  );
}

function ProfileField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  inline,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  inline?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        !inline && "mb-3",
      )}
    >
      <Icon className="h-4 w-4 text-accent" />

      <div className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
    </div>
  );
}

const TONE: Record<string, string> = {
  emerald: "bg-emerald-500/15 text-emerald-300",
  sky: "bg-sky-500/15 text-sky-300",
  lime: "bg-lime-500/15 text-lime-300",
  rose: "bg-rose-500/15 text-rose-300",
  cyan: "bg-cyan-500/15 text-cyan-300",
  amber: "bg-amber-500/15 text-amber-300",
  violet: "bg-violet-500/15 text-violet-300",
  indigo: "bg-indigo-500/15 text-indigo-300",
  primary: "bg-primary/20 text-primary",
};

function BriefCard({
  icon: Icon,
  label,
  text,
  tone,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  text: string;
  tone: string;
  highlight?: boolean;
}) {
  return (
    <Card
      className={cn(
        "glass border-0",
        highlight && "ring-1 ring-primary/40",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <div className={cn("rounded-lg p-1.5", TONE[tone])}>
            <Icon className="h-3.5 w-3.5" />
          </div>

          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-foreground/90">
          {text}
        </p>
      </CardContent>
    </Card>
  );
}

function ScoreCard({
  report,
  language,
}: {
  report: CommandCenterReport;
  language: "en" | "hi" | "kn" | "ta";
}) {
  const t = getCommandTranslations(language);
  const score = Math.max(0, Math.min(100, report.score));
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;

  const color =
    score >= 85
      ? "#10b981"
      : score >= 70
        ? "#84cc16"
        : score >= 50
          ? "#f59e0b"
          : "#f43f5e";

  const rows = [
    {
      label: t.cropHealth,
      v: report.breakdown.cropHealth,
    },
    {
      label: t.irrigation,
      v: report.breakdown.irrigation,
    },
    {
      label: t.diseaseRisk,
      v: report.breakdown.diseaseRisk,
    },
    {
      label: t.planner,
      v: report.breakdown.planner,
    },
    {
      label: t.weather,
      v: report.breakdown.weather,
    },
  ];

  return (
    <Card className="glass border-0">
      <CardContent className="p-5">
        <SectionHeader
          icon={Activity}
          title={t.healthScore}
          inline
        />

        <div className="mt-4 flex items-center gap-5">
          <div className="relative h-32 w-32 shrink-0">
            <svg
              viewBox="0 0 120 120"
              className="h-full w-full -rotate-90"
            >
              <circle
                cx="60"
                cy="60"
                r={r}
                strokeWidth="10"
                stroke="rgba(255,255,255,0.08)"
                fill="none"
              />

              <motion.circle
                cx="60"
                cy="60"
                r={r}
                strokeWidth="10"
                stroke={color}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${c}`}
                initial={{
                  strokeDasharray: `0 ${c}`,
                }}
                animate={{
                  strokeDasharray: `${dash} ${c}`,
                }}
                transition={{ duration: 1 }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-display text-3xl font-semibold">
                {score}
              </div>

              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {report.scoreLabel}
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            {rows.map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{row.label}</span>
                  <span>{row.v}</span>
                </div>

                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, row.v),
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-4 bg-white/5" />

        <div className="text-xs text-muted-foreground">
          {t.scoreExplanation}
        </div>
      </CardContent>
    </Card>
  );
}