import type React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";

import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CloudRain,
  Droplets,
  FlaskConical,
  Landmark,
  Leaf,
  LineChart,
  Sparkles,
  Sprout,
  Sun,
  Cloud,
  TrendingDown,
  TrendingUp,
  Scissors,
  Wheat,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Block } from "@/lib/chat-mocks";
import { useLanguage } from "@/context/LanguageContext";

/* ─── Translations for cards ─── */

const cardTranslations = {
  en: {
    diagnosis: "Diagnosis",
    confidence: "Confidence",
    severity: "Severity",
    stage: "Stage",
    actionable: "Actionable",
    cause: "Cause",
    treatmentPlan: "Treatment plan",

    weather: "Weather",
    feels: "feels",
    advisory: "Advisory",

    recommendation: "Recommendation",

    risk: "Risk",

    market: "Market",

    scheme: "Scheme",
    benefit: "Benefit",
    eligibility: "Eligibility",
    deadline: "Deadline",

    actionPlan: "Action plan",
    nextMoves: "Your farm's next moves",

    aiVisionDiagnosis: "AI Vision Diagnosis",
    emergency: "Emergency",
    symptomsObserved: "Symptoms observed",
    possibleCause: "Possible cause",
    organicTreatment: "Organic treatment",
    chemicalTreatment: "Chemical treatment",
    preventionTips: "Prevention tips",
    whatToDoNext: "What to do next",
    immediateNextActions: "Immediate next actions",
    lowConfidence: "Low confidence",

    followup: "Ask a follow-up",

    mild: "Mild",
    moderate: "Moderate",
    severe: "Severe",
    unknown: "Unknown",

    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
  },

  hi: {
    diagnosis: "रोग पहचान",
    confidence: "विश्वास",
    severity: "गंभीरता",
    stage: "स्थिति",
    actionable: "कार्रवाई योग्य",
    cause: "कारण",
    treatmentPlan: "उपचार योजना",

    weather: "मौसम",
    feels: "महसूस होता है",
    advisory: "सलाह",

    recommendation: "सिफारिश",

    risk: "जोखिम",

    market: "बाज़ार",

    scheme: "योजना",
    benefit: "लाभ",
    eligibility: "पात्रता",
    deadline: "अंतिम तिथि",

    actionPlan: "कार्य योजना",
    nextMoves: "आपके खेत के अगले कदम",

    aiVisionDiagnosis: "AI विज़न रोग पहचान",
    emergency: "आपात स्थिति",
    symptomsObserved: "देखे गए लक्षण",
    possibleCause: "संभावित कारण",
    organicTreatment: "जैविक उपचार",
    chemicalTreatment: "रासायनिक उपचार",
    preventionTips: "बचाव के उपाय",
    whatToDoNext: "अब क्या करें",
    immediateNextActions: "तुरंत उठाए जाने वाले कदम",
    lowConfidence: "कम विश्वास",

    followup: "आगे कुछ पूछें",

    mild: "हल्का",
    moderate: "मध्यम",
    severe: "गंभीर",
    unknown: "अज्ञात",

    low: "कम",
    medium: "मध्यम",
    high: "उच्च",
    critical: "गंभीर",
  },

  kn: {
    diagnosis: "ರೋಗ ಪತ್ತೆ",
    confidence: "ವಿಶ್ವಾಸ",
    severity: "ತೀವ್ರತೆ",
    stage: "ಸ್ಥಿತಿ",
    actionable: "ಕ್ರಮ ಕೈಗೊಳ್ಳಬಹುದು",
    cause: "ಕಾರಣ",
    treatmentPlan: "ಚಿಕಿತ್ಸಾ ಯೋಜನೆ",

    weather: "ಹವಾಮಾನ",
    feels: "ಅನುಭವವಾಗುತ್ತದೆ",
    advisory: "ಸಲಹೆ",

    recommendation: "ಶಿಫಾರಸು",

    risk: "ಅಪಾಯ",

    market: "ಮಾರುಕಟ್ಟೆ",

    scheme: "ಯೋಜನೆ",
    benefit: "ಲಾಭ",
    eligibility: "ಅರ್ಹತೆ",
    deadline: "ಕೊನೆಯ ದಿನಾಂಕ",

    actionPlan: "ಕಾರ್ಯ ಯೋಜನೆ",
    nextMoves: "ನಿಮ್ಮ ಕೃಷಿಯ ಮುಂದಿನ ಕ್ರಮಗಳು",

    aiVisionDiagnosis: "AI ವಿಷನ್ ರೋಗ ಪತ್ತೆ",
    emergency: "ತುರ್ತು ಪರಿಸ್ಥಿತಿ",
    symptomsObserved: "ಕಂಡುಬಂದ ಲಕ್ಷಣಗಳು",
    possibleCause: "ಸಂಭಾವ್ಯ ಕಾರಣ",
    organicTreatment: "ಸಾವಯವ ಚಿಕಿತ್ಸೆ",
    chemicalTreatment: "ರಾಸಾಯನಿಕ ಚಿಕಿತ್ಸೆ",
    preventionTips: "ತಡೆಗಟ್ಟುವ ಸಲಹೆಗಳು",
    whatToDoNext: "ಮುಂದೆ ಏನು ಮಾಡಬೇಕು",
    immediateNextActions: "ತಕ್ಷಣ ಕೈಗೊಳ್ಳಬೇಕಾದ ಕ್ರಮಗಳು",
    lowConfidence: "ಕಡಿಮೆ ವಿಶ್ವಾಸ",

    followup: "ಮುಂದೆ ಪ್ರಶ್ನಿಸಿ",

    mild: "ಸೌಮ್ಯ",
    moderate: "ಮಧ್ಯಮ",
    severe: "ತೀವ್ರ",
    unknown: "ಅಜ್ಞಾತ",

    low: "ಕಡಿಮೆ",
    medium: "ಮಧ್ಯಮ",
    high: "ಹೆಚ್ಚು",
    critical: "ಅತ್ಯಂತ ತೀವ್ರ",
  },

  ta: {
    diagnosis: "நோய் கண்டறிதல்",
    confidence: "நம்பிக்கை",
    severity: "தீவிரம்",
    stage: "நிலை",
    actionable: "நடவடிக்கை எடுக்கலாம்",
    cause: "காரணம்",
    treatmentPlan: "சிகிச்சைத் திட்டம்",

    weather: "வானிலை",
    feels: "உணரப்படுகிறது",
    advisory: "ஆலோசனை",

    recommendation: "பரிந்துரை",

    risk: "ஆபத்து",

    market: "சந்தை",

    scheme: "திட்டம்",
    benefit: "நன்மை",
    eligibility: "தகுதி",
    deadline: "கடைசி தேதி",

    actionPlan: "செயல் திட்டம்",
    nextMoves: "உங்கள் பண்ணையின் அடுத்த நடவடிக்கைகள்",

    aiVisionDiagnosis: "AI விஷன் நோய் கண்டறிதல்",
    emergency: "அவசர நிலை",
    symptomsObserved: "காணப்பட்ட அறிகுறிகள்",
    possibleCause: "சாத்தியமான காரணம்",
    organicTreatment: "இயற்கை சிகிச்சை",
    chemicalTreatment: "ரசாயன சிகிச்சை",
    preventionTips: "தடுப்பு குறிப்புகள்",
    whatToDoNext: "அடுத்து என்ன செய்ய வேண்டும்",
    immediateNextActions: "உடனடியாக செய்ய வேண்டிய நடவடிக்கைகள்",
    lowConfidence: "குறைந்த நம்பிக்கை",

    followup: "தொடர்ந்து கேளுங்கள்",

    mild: "லேசான",
    moderate: "மிதமான",
    severe: "கடுமையான",
    unknown: "தெரியவில்லை",

    low: "குறைவு",
    medium: "மிதமான",
    high: "அதிகம்",
    critical: "மிகவும் தீவிரம்",
  },
} as const;

/* ─── Helper ─── */

function useCardTranslations() {
  const { language } = useLanguage();

  const t =
    cardTranslations[language] ??
    cardTranslations.en;

  return t;
}

/* ─── Shared ─── */

function CardHeader({
  icon: Icon,
  eyebrow,
  title,
  tone = "emerald",
}: {
  icon: any;
  eyebrow: string;
  title: string;
  tone?:
    | "emerald"
    | "sky"
    | "amber"
    | "violet"
    | "lime"
    | "rose";
}) {
  const tones: Record<
    string,
    string
  > = {
    emerald:
      "text-emerald-300 bg-emerald-500/10",
    sky:
      "text-sky-300 bg-sky-500/10",
    amber:
      "text-amber-300 bg-amber-500/10",
    violet:
      "text-violet-300 bg-violet-500/10",
    lime:
      "text-lime-300 bg-lime-500/10",
    rose:
      "text-rose-300 bg-rose-500/10",
  };

  return (
    <div className="mb-3 flex items-start gap-3">
      <div
        className={cn(
          "rounded-lg p-2",
          tones[tone],
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
          {eyebrow}
        </div>

        <div className="font-display text-base font-semibold leading-tight">
          {title}
        </div>
      </div>
    </div>
  );
}

/* ─── Markdown ─── */

export function MarkdownBlock({
  text,
}: {
  text: string;
}) {
  return (
    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-display prose-headings:tracking-tight prose-strong:text-foreground prose-code:rounded prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.85em] prose-code:before:content-none prose-code:after:content-none prose-pre:rounded-xl prose-pre:border prose-pre:border-white/5 prose-pre:bg-black/40 prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-table:overflow-hidden prose-table:rounded-lg prose-table:border prose-table:border-white/5 prose-th:bg-white/5 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-td:border-t prose-td:border-white/5 prose-td:px-3 prose-td:py-2">
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
        ]}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

/* ─── Diagnosis ─── */

export function DiagnosisCard({
  b,
}: {
  b: Extract<
    Block,
    { kind: "diagnosis" }
  >;
}) {
  const t = useCardTranslations();

  const severityTone =
    b.severity === "Severe"
      ? "text-rose-300"
      : b.severity === "Moderate"
        ? "text-amber-300"
        : "text-emerald-300";

  return (
    <Card className="glass border-0 overflow-hidden">
      <CardContent className="p-5">
        <CardHeader
          icon={Leaf}
          eyebrow={t.diagnosis}
          title={`${b.crop} · ${b.disease}`}
          tone="emerald"
        />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Stat
            label={t.confidence}
            value={`${b.confidence}%`}
          />

          <Stat
            label={t.severity}
            value={
              b.severity === "Severe"
                ? t.severe
                : b.severity === "Moderate"
                  ? t.moderate
                  : b.severity === "Mild"
                    ? t.mild
                    : t.unknown
            }
            valueClassName={
              severityTone
            }
          />

          <Stat
            label={t.stage}
            value={t.actionable}
          />
        </div>

        <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3.5 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {t.cause} ·{" "}
          </span>

          {b.cause}
        </div>

        <div className="mt-4">
          <div className="mb-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            {t.treatmentPlan}
          </div>

          <ol className="space-y-2">
            {b.treatment.map(
              (item, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                    {i + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-medium">
                      {item.title}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {item.detail}
                    </div>
                  </div>
                </li>
              ),
            )}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Stat ─── */

function Stat({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
      <div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </div>

      <div
        className={cn(
          "mt-0.5 font-display text-lg font-semibold",
          valueClassName,
        )}
      >
        {value}
      </div>
    </div>
  );
}

/* ─── Weather ─── */

const weatherIcon = {
  sun: Sun,
  rain: CloudRain,
  cloud: Cloud,
} as const;

export function WeatherCard({
  b,
}: {
  b: Extract<
    Block,
    { kind: "weather" }
  >;
}) {
  const t = useCardTranslations();

  return (
    <Card className="glass border-0 overflow-hidden">
      <CardContent className="p-5">
        <CardHeader
          icon={CloudRain}
          eyebrow={t.weather}
          title={b.location}
          tone="sky"
        />

        <div className="flex items-baseline gap-3">
          <div className="font-display text-4xl font-semibold">
            {b.current.temp}
          </div>

          <div className="text-sm text-muted-foreground">
            {b.current.cond} ·{" "}
            {t.feels}{" "}
            {b.current.feels}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {b.days.map((d) => {
            const Icon =
              weatherIcon[d.icon];

            return (
              <div
                key={d.day}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center"
              >
                <div className="text-[11px] font-medium text-muted-foreground">
                  {d.day}
                </div>

                <Icon className="mx-auto my-1.5 h-5 w-5 text-sky-300" />

                <div className="text-sm font-semibold">
                  {d.hi}
                </div>

                <div className="text-[11px] text-muted-foreground">
                  {d.lo}
                </div>

                <div className="mt-1 text-[10px] text-sky-300/80">
                  💧 {d.rain}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-sky-500/20 bg-sky-500/[0.06] p-3 text-sm">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />

          <div className="text-muted-foreground">
            <span className="font-medium text-foreground">
              {t.advisory} ·{" "}
            </span>

            {b.advisory}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Recommendation ─── */

export function RecommendationCard({
  b,
}: {
  b: Extract<
    Block,
    { kind: "recommendation" }
  >;
}) {
  const t = useCardTranslations();

  return (
    <Card className="glass border-0 overflow-hidden">
      <CardContent className="p-5">
        <CardHeader
          icon={Sparkles}
          eyebrow={t.recommendation}
          title={b.title}
          tone="emerald"
        />

        <p className="text-sm text-muted-foreground leading-relaxed">
          {b.body}
        </p>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {t.confidence}
            </span>

            <span className="font-medium text-foreground">
              {b.confidence}%
            </span>
          </div>

          <Progress
            value={b.confidence}
            className="h-1.5 bg-white/5"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {b.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="rounded-full bg-white/5"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Risk ─── */

export function RiskCard({
  b,
}: {
  b: Extract<
    Block,
    { kind: "risk" }
  >;
}) {
  const t = useCardTranslations();

  const tone =
    b.level === "High"
      ? "rose"
      : b.level === "Moderate"
        ? "amber"
        : "emerald";

  const level =
    b.level === "High"
      ? t.high
      : b.level === "Moderate"
        ? t.moderate
        : t.low;

  return (
    <Card className="glass border-0 overflow-hidden">
      <CardContent className="p-5">
        <CardHeader
          icon={AlertTriangle}
          eyebrow={`${t.risk} · ${level}`}
          title={b.title}
          tone={tone as any}
        />

        <p className="text-sm text-muted-foreground">
          {b.body}
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {b.mitigate.map(
            (m, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs"
              >
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />

                <span>{m}</span>
              </div>
            ),
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Market ─── */

export function MarketCard({
  b,
}: {
  b: Extract<
    Block,
    { kind: "market" }
  >;
}) {
  const t = useCardTranslations();

  const Trend =
    b.trend === "up"
      ? TrendingUp
      : TrendingDown;

  const trendClass =
    b.trend === "up"
      ? "text-emerald-300"
      : "text-rose-300";

  return (
    <Card className="glass border-0 overflow-hidden">
      <CardContent className="p-5">
        <CardHeader
          icon={LineChart}
          eyebrow={t.market}
          title={`${b.commodity} · ${b.unit}`}
          tone="lime"
        />

        <div className="flex items-baseline gap-3">
          <div className="font-display text-3xl font-semibold">
            {b.today}
          </div>

          <div
            className={cn(
              "flex items-center gap-1 text-sm font-medium",
              trendClass,
            )}
          >
            <Trend className="h-4 w-4" />
            {b.change}
          </div>
        </div>

        <div className="mt-4 divide-y divide-white/5 rounded-xl border border-white/5">
          {b.mandis.map((m) => (
            <div
              key={m.name}
              className="flex items-center justify-between px-3 py-2.5 text-sm"
            >
              <div className="min-w-0">
                <div className="truncate font-medium">
                  {m.name}
                </div>

                <div className="text-[11px] text-muted-foreground">
                  {m.distance}
                </div>
              </div>

              <div className="font-semibold">
                {m.price}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Scheme ─── */

export function SchemeCard({
  b,
}: {
  b: Extract<
    Block,
    { kind: "scheme" }
  >;
}) {
  const t = useCardTranslations();

  return (
    <Card className="glass border-0 overflow-hidden">
      <CardContent className="p-5">
        <CardHeader
          icon={Landmark}
          eyebrow={`${t.scheme} · ${b.agency}`}
          title={b.name}
          tone="violet"
        />

        <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-3 text-sm">
          <span className="font-medium">
            {t.benefit} ·{" "}
          </span>

          <span className="text-muted-foreground">
            {b.benefit}
          </span>
        </div>

        <div className="mt-3">
          <div className="mb-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            {t.eligibility}
          </div>

          <ul className="space-y-1.5">
            {b.eligibility.map(
              (e, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm"
                >
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-300" />

                  <span className="text-muted-foreground">
                    {e}
                  </span>
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-amber-300">
          <CalendarDays className="h-3.5 w-3.5" />

          {t.deadline} ·{" "}
          {b.deadline}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Action Plan Timeline ─── */

const actionIcons = {
  water: Droplets,
  spray: FlaskConical,
  scout: Activity,
  harvest: Wheat,
  fertilize: Sprout,
} as const;

export function ActionPlan({
  b,
}: {
  b: Extract<
    Block,
    { kind: "actionPlan" }
  >;
}) {
  const t = useCardTranslations();

  return (
    <Card className="glass border-0 overflow-hidden">
      <CardContent className="p-5">
        <CardHeader
          icon={CalendarDays}
          eyebrow={t.actionPlan}
          title={t.nextMoves}
          tone="emerald"
        />

        <ol className="relative ml-2 space-y-3 border-l border-white/10 pl-5">
          {b.items.map(
            (it, i) => {
              const Icon =
                actionIcons[it.icon];

              return (
                <motion.li
                  key={i}
                  initial={{
                    opacity: 0,
                    x: -6,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay:
                      0.05 * i,
                    duration: 0.3,
                  }}
                  className="relative"
                >
                  <span className="absolute -left-[27px] top-1 grid h-5 w-5 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow">
                    <Icon className="h-3 w-3" />
                  </span>

                  <div className="flex flex-wrap items-baseline gap-2">
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-white/5 text-[10px]"
                    >
                      {it.when}
                    </Badge>

                    <div className="text-sm font-medium">
                      {it.title}
                    </div>
                  </div>

                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {it.detail}
                  </div>
                </motion.li>
              );
            },
          )}
        </ol>
      </CardContent>
    </Card>
  );
}

/* ─── Disease Vision ─── */

export function DiseaseVisionCard({
  b,
}: {
  b: Extract<
    Block,
    { kind: "diseaseVision" }
  >;
}) {
  const t = useCardTranslations();

  const severityTone =
    b.severity === "Severe"
      ? "text-rose-300"
      : b.severity === "Moderate"
        ? "text-amber-300"
        : b.severity === "Mild"
          ? "text-emerald-300"
          : "text-muted-foreground";

  const emergencyTone =
    b.emergencyLevel ===
    "Critical"
      ? "rose"
      : b.emergencyLevel ===
          "High"
        ? "rose"
        : b.emergencyLevel ===
            "Medium"
          ? "amber"
          : "emerald";

  const severity =
    b.severity === "Severe"
      ? t.severe
      : b.severity === "Moderate"
        ? t.moderate
        : b.severity === "Mild"
          ? t.mild
          : t.unknown;

  const emergency =
    b.emergencyLevel ===
    "Critical"
      ? t.critical
      : b.emergencyLevel ===
          "High"
        ? t.high
        : b.emergencyLevel ===
            "Medium"
          ? t.medium
          : t.low;

  const lowConfidence =
    b.confidence < 70;

  return (
    <Card className="glass border-0 overflow-hidden">
      <CardContent className="p-5">

        <CardHeader
          icon={Leaf}
          eyebrow={
            t.aiVisionDiagnosis
          }
          title={
            b.diseaseName ||
            "Unclear diagnosis"
          }
          tone="emerald"
        />

        {lowConfidence && (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.08] p-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />

            <div className="text-muted-foreground">
              <span className="font-medium text-foreground">
                {t.lowConfidence} (
                {
                  b.confidence
                }%).{" "}
              </span>

              {b.lowConfidenceNotice ??
                "Please upload 2–3 additional clear, close-up photos before I recommend treatment."}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <Stat
            label={t.confidence}
            value={`${b.confidence}%`}
          />

          <Stat
            label={t.severity}
            value={severity}
            valueClassName={
              severityTone
            }
          />

          <Stat
            label={t.emergency}
            value={emergency}
          />
        </div>

        <div className="mt-3">
          <div className="mb-1.5 text-[11px] text-muted-foreground">
            {t.confidence}
          </div>

          <Progress
            value={b.confidence}
            className="h-1.5 bg-white/5"
          />
        </div>

        {b.symptoms.length >
          0 && (
          <Section
            title={
              t.symptomsObserved
            }
            icon={Activity}
            tone="sky"
          >
            <BulletList
              items={b.symptoms}
            />
          </Section>
        )}

        {b.possibleCause && (
          <Section
            title={
              t.possibleCause
            }
            icon={Sprout}
            tone="violet"
          >
            <p className="text-sm text-muted-foreground leading-relaxed">
              {b.possibleCause}
            </p>
          </Section>
        )}

        {!lowConfidence &&
          b.organicTreatment
            .length > 0 && (
            <Section
              title={
                t.organicTreatment
              }
              icon={Leaf}
              tone="emerald"
            >
              <BulletList
                items={
                  b.organicTreatment
                }
              />
            </Section>
          )}

        {!lowConfidence &&
          b.chemicalTreatment
            .length > 0 && (
            <Section
              title={
                t.chemicalTreatment
              }
              icon={
                FlaskConical
              }
              tone="amber"
            >
              <BulletList
                items={
                  b.chemicalTreatment
                }
              />
            </Section>
          )}

        {b.preventionTips
          .length > 0 && (
          <Section
            title={
              t.preventionTips
            }
            icon={
              CheckCircle2
            }
            tone="emerald"
          >
            <BulletList
              items={
                b.preventionTips
              }
            />
          </Section>
        )}

        {b.nextActions.length >
          0 && (
          <Section
            title={
              lowConfidence
                ? t.whatToDoNext
                : t.immediateNextActions
            }
            icon={Scissors}
            tone={
              emergencyTone as
                | "emerald"
                | "amber"
                | "rose"
            }
          >
            <ol className="space-y-2">
              {b.nextActions.map(
                (action, i) => (
                  <li
                    key={i}
                    className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                  >
                    <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                      {i + 1}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {action}
                    </div>
                  </li>
                ),
              )}
            </ol>
          </Section>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Section ─── */

function Section({
  title,
  icon: Icon,
  tone,
  children,
}: {
  title: string;
  icon: any;
  tone:
    | "emerald"
    | "sky"
    | "amber"
    | "violet"
    | "rose";
  children: React.ReactNode;
}) {
  const tones: Record<
    string,
    string
  > = {
    emerald:
      "text-emerald-300",
    sky:
      "text-sky-300",
    amber:
      "text-amber-300",
    violet:
      "text-violet-300",
    rose:
      "text-rose-300",
  };

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
        <Icon
          className={cn(
            "h-3.5 w-3.5",
            tones[tone],
          )}
        />

        {title}
      </div>

      {children}
    </div>
  );
}

/* ─── Bullet List ─── */

function BulletList({
  items,
}: {
  items: string[];
}) {
  return (
    <ul className="space-y-1.5">
      {items.map(
        (item, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-muted-foreground"
          >
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />

            <span>
              {item}
            </span>
          </li>
        ),
      )}
    </ul>
  );
}

/* ─── Followups ─── */

export function FollowUps({
  questions,
  onPick,
}: {
  questions: string[];
  onPick: (q: string) => void;
}) {
  const t = useCardTranslations();

  return (
    <div>
      <div className="mb-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
        {t.followup}
      </div>

      <div className="flex flex-wrap gap-2">
        {questions.map(
          (question) => (
            <button
              key={question}
              onClick={() =>
                onPick(question)
              }
              className="glass rounded-full px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
            >
              {question}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

/* ─── Renderer ─── */

export function BlockRenderer({
  block,
  onFollowup,
}: {
  block: Block;
  onFollowup: (q: string) => void;
}) {
  switch (block.kind) {
    case "markdown":
      return (
        <MarkdownBlock
          text={block.text}
        />
      );

    case "diagnosis":
      return (
        <DiagnosisCard
          b={block}
        />
      );

    case "diseaseVision":
      return (
        <DiseaseVisionCard
          b={block}
        />
      );

    case "weather":
      return (
        <WeatherCard
          b={block}
        />
      );

    case "recommendation":
      return (
        <RecommendationCard
          b={block}
        />
      );

    case "risk":
      return (
        <RiskCard b={block} />
      );

    case "market":
      return (
        <MarketCard
          b={block}
        />
      );

    case "scheme":
      return (
        <SchemeCard
          b={block}
        />
      );

    case "actionPlan":
      return (
        <ActionPlan
          b={block}
        />
      );

    case "followups":
      return (
        <FollowUps
          questions={
            block.questions
          }
          onPick={onFollowup}
        />
      );
  }
}