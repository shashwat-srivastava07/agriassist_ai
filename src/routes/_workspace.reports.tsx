import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useServerFn } from "@tanstack/react-start";
import {
  FileText,
  Download,
  Search,
  Activity,
  FileBarChart2,
  Trash2,
  Loader2,
  Sprout,
  LineChart,
  LayoutDashboard,
  CloudSun,
  Bug,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  listReports,
  listActivity,
  getReportPdf,
  deleteReport,
  type SavedReport,
  type ActivityRow,
  type ReportKind,
} from "@/lib/reports/reports.functions";

export const Route = createFileRoute("/_workspace/reports")({
  component: Reports,
});

const REPORT_TRANSLATIONS = {
  en: {
    title: "Reports",
    subtitle:
      "Generate a Farm Plan, Market report or Command Brief — it will appear here for download.",
    search: "Search reports",
    previous: "Previous reports",
    total: "total",
    loading: "Loading reports…",
    noReports: "No reports yet",
    noMatching: "No matching reports",
    noReportsHint:
      "Generate a Farm Plan, Market report or Command Brief — it will appear here for download.",
    noMatchingHint: "Try a different search term.",
    recentActivity: "Recent activity",
    noActivity:
      "No activity yet. Your activity on AgriAssist AI will appear here.",
    pdf: "PDF",
    deleteReport: "Delete report",
    deleteConfirm: 'Delete "{title}"?',
    reportDeleted: "Report deleted",
    downloadFailed: "Download failed",
    failedDelete: "Failed to delete",
    failedLoad: "Failed to load reports",
    justNow: "Just now",
    yesterday: "Yesterday",
    daysAgo: "days ago",
    minutesAgo: "m ago",
    hoursAgo: "h ago",
    farmPlan: "Farm Plan",
    marketIntelligence: "Market Intelligence",
    commandCenter: "Command Center",
    weather: "Weather",
    diseaseScan: "Disease Scan",
    report: "Report",
    ariaDelete: "Delete report",
  },

  hi: {
    title: "रिपोर्ट",
    subtitle:
      "फार्म प्लानर, मार्केट इंटेलिजेंस, कमांड सेंटर और अन्य से आपकी सहेजी गई रिपोर्ट।",
    search: "रिपोर्ट खोजें",
    previous: "पिछली रिपोर्ट",
    total: "कुल",
    loading: "रिपोर्ट लोड हो रही हैं…",
    noReports: "अभी कोई रिपोर्ट नहीं है",
    noMatching: "कोई मिलती-जुलती रिपोर्ट नहीं मिली",
    noReportsHint:
      "फार्म प्लान, मार्केट रिपोर्ट या कमांड ब्रीफ बनाएं — वह डाउनलोड के लिए यहां दिखाई देगी।",
    noMatchingHint: "कोई दूसरा खोज शब्द आज़माएं।",
    recentActivity: "हाल की गतिविधि",
    noActivity:
      "अभी कोई गतिविधि नहीं है। AgriAssist AI पर आपकी गतिविधियां यहां दिखाई देंगी।",
    pdf: "PDF",
    deleteReport: "रिपोर्ट हटाएं",
    deleteConfirm: '"{title}" हटाएं?',
    reportDeleted: "रिपोर्ट हटा दी गई",
    downloadFailed: "डाउनलोड विफल रहा",
    failedDelete: "रिपोर्ट हटाई नहीं जा सकी",
    failedLoad: "रिपोर्ट लोड नहीं हो सकीं",
    justNow: "अभी",
    yesterday: "कल",
    daysAgo: "दिन पहले",
    minutesAgo: "मिनट पहले",
    hoursAgo: "घंटे पहले",
    farmPlan: "फार्म प्लान",
    marketIntelligence: "मार्केट इंटेलिजेंस",
    commandCenter: "कमांड सेंटर",
    weather: "मौसम",
    diseaseScan: "रोग स्कैन",
    report: "रिपोर्ट",
    ariaDelete: "रिपोर्ट हटाएं",
  },

  kn: {
    title: "ವರದಿಗಳು",
    subtitle:
      "ಫಾರ್ಮ್ ಪ್ಲಾನರ್, ಮಾರ್ಕೆಟ್ ಇಂಟೆಲಿಜೆನ್ಸ್, ಕಮಾಂಡ್ ಸೆಂಟರ್ ಮತ್ತು ಇತರವುಗಳಿಂದ ನಿಮ್ಮ ಉಳಿಸಿದ ವರದಿಗಳು.",
    search: "ವರದಿಗಳನ್ನು ಹುಡುಕಿ",
    previous: "ಹಿಂದಿನ ವರದಿಗಳು",
    total: "ಒಟ್ಟು",
    loading: "ವರದಿಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ…",
    noReports: "ಇನ್ನೂ ಯಾವುದೇ ವರದಿಗಳಿಲ್ಲ",
    noMatching: "ಹೊಂದಾಣಿಕೆಯ ವರದಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ",
    noReportsHint:
      "ಫಾರ್ಮ್ ಪ್ಲಾನ್, ಮಾರುಕಟ್ಟೆ ವರದಿ ಅಥವಾ ಕಮಾಂಡ್ ಬ್ರೀಫ್ ರಚಿಸಿ — ಅದು ಡೌನ್‌ಲೋಡ್‌ಗಾಗಿ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.",
    noMatchingHint: "ಬೇರೆ ಹುಡುಕಾಟ ಪದವನ್ನು ಪ್ರಯತ್ನಿಸಿ.",
    recentActivity: "ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ",
    noActivity:
      "ಇನ್ನೂ ಯಾವುದೇ ಚಟುವಟಿಕೆ ಇಲ್ಲ. AgriAssist AI ನಲ್ಲಿ ನಿಮ್ಮ ಚಟುವಟಿಕೆಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.",
    pdf: "PDF",
    deleteReport: "ವರದಿಯನ್ನು ಅಳಿಸಿ",
    deleteConfirm: '"{title}" ಅಳಿಸಬೇಕೇ?',
    reportDeleted: "ವರದಿ ಅಳಿಸಲಾಗಿದೆ",
    downloadFailed: "ಡೌನ್‌ಲೋಡ್ ವಿಫಲವಾಗಿದೆ",
    failedDelete: "ವರದಿಯನ್ನು ಅಳಿಸಲು ವಿಫಲವಾಗಿದೆ",
    failedLoad: "ವರದಿಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ",
    justNow: "ಈಗಷ್ಟೇ",
    yesterday: "ನಿನ್ನೆ",
    daysAgo: "ದಿನಗಳ ಹಿಂದೆ",
    minutesAgo: "ನಿಮಿಷಗಳ ಹಿಂದೆ",
    hoursAgo: "ಗಂಟೆಗಳ ಹಿಂದೆ",
    farmPlan: "ಫಾರ್ಮ್ ಪ್ಲಾನ್",
    marketIntelligence: "ಮಾರ್ಕೆಟ್ ಇಂಟೆಲಿಜೆನ್ಸ್",
    commandCenter: "ಕಮಾಂಡ್ ಸೆಂಟರ್",
    weather: "ಹವಾಮಾನ",
    diseaseScan: "ರೋಗ ಸ್ಕ್ಯಾನ್",
    report: "ವರದಿ",
    ariaDelete: "ವರದಿಯನ್ನು ಅಳಿಸಿ",
  },

  ta: {
    title: "அறிக்கைகள்",
    subtitle:
      "பண்ணை திட்டமிடுபவர், சந்தை நுண்ணறிவு, கட்டளை மையம் மற்றும் பிறவற்றிலிருந்து உங்கள் சேமிக்கப்பட்ட அறிக்கைகள்.",
    search: "அறிக்கைகளைத் தேடுங்கள்",
    previous: "முந்தைய அறிக்கைகள்",
    total: "மொத்தம்",
    loading: "அறிக்கைகள் ஏற்றப்படுகின்றன…",
    noReports: "இன்னும் அறிக்கைகள் இல்லை",
    noMatching: "பொருந்தும் அறிக்கைகள் இல்லை",
    noReportsHint:
      "பண்ணை திட்டம், சந்தை அறிக்கை அல்லது கட்டளை சுருக்கத்தை உருவாக்கவும் — அது பதிவிறக்க இங்கே தோன்றும்.",
    noMatchingHint: "வேறு தேடல் சொல்லை முயற்சிக்கவும்.",
    recentActivity: "சமீபத்திய செயல்பாடு",
    noActivity:
      "இன்னும் செயல்பாடு இல்லை. AgriAssist AI இல் உங்கள் செயல்பாடுகள் இங்கே தோன்றும்.",
    pdf: "PDF",
    deleteReport: "அறிக்கையை நீக்கவும்",
    deleteConfirm: '"{title}" நீக்கவா?',
    reportDeleted: "அறிக்கை நீக்கப்பட்டது",
    downloadFailed: "பதிவிறக்கம் தோல்வியடைந்தது",
    failedDelete: "அறிக்கையை நீக்க முடியவில்லை",
    failedLoad: "அறிக்கைகளை ஏற்ற முடியவில்லை",
    justNow: "இப்போது",
    yesterday: "நேற்று",
    daysAgo: "நாட்களுக்கு முன்",
    minutesAgo: "நிமிடங்களுக்கு முன்",
    hoursAgo: "மணி நேரங்களுக்கு முன்",
    farmPlan: "பண்ணை திட்டம்",
    marketIntelligence: "சந்தை நுண்ணறிவு",
    commandCenter: "கட்டளை மையம்",
    weather: "வானிலை",
    diseaseScan: "நோய் ஸ்கேன்",
    report: "அறிக்கை",
    ariaDelete: "அறிக்கையை நீக்கவும்",
  },
} as const;

function getReportTranslations(language: string) {
  return (
    REPORT_TRANSLATIONS[
      language as keyof typeof REPORT_TRANSLATIONS
    ] ?? REPORT_TRANSLATIONS.en
  );
}

const KIND_META: Record<
  ReportKind,
  {
    label: keyof typeof REPORT_TRANSLATIONS.en;
    icon: typeof FileText;
    color: string;
  }
> = {
  "farm-plan": {
    label: "farmPlan",
    icon: Sprout,
    color: "text-emerald-500",
  },
  "market-intelligence": {
    label: "marketIntelligence",
    icon: LineChart,
    color: "text-sky-500",
  },
  "command-center": {
    label: "commandCenter",
    icon: LayoutDashboard,
    color: "text-violet-500",
  },
  weather: {
    label: "weather",
    icon: CloudSun,
    color: "text-cyan-500",
  },
  "disease-scan": {
    label: "diseaseScan",
    icon: Bug,
    color: "text-rose-500",
  },
  general: {
    label: "report",
    icon: FileText,
    color: "text-accent",
  },
};

function fmtSize(b: number | null) {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function languageLocale(language: string) {
  if (language === "hi") return "hi-IN";
  if (language === "kn") return "kn-IN";
  if (language === "ta") return "ta-IN";
  return "en-IN";
}

function fmtDate(iso: string, language = "en") {
  const d = new Date(iso);

  return d.toLocaleDateString(languageLocale(language), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(
  iso: string,
  t: ReturnType<typeof getReportTranslations>,
) {
  const s = Math.floor(
    (Date.now() - new Date(iso).getTime()) / 1000,
  );

  if (s < 60) return t.justNow;
  if (s < 3600) return `${Math.floor(s / 60)} ${t.minutesAgo}`;
  if (s < 86400) return `${Math.floor(s / 3600)} ${t.hoursAgo}`;

  const d = Math.floor(s / 86400);

  if (d === 1) return t.yesterday;
  if (d < 30) return `${d} ${t.daysAgo}`;

  return fmtDate(iso);
}

function base64ToBlob(
  b64: string,
  type = "application/pdf",
) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);

  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }

  return new Blob([bytes], { type });
}

function Reports() {
  const { language } = useLanguage();
  const t = getReportTranslations(language);

  const runList = useServerFn(listReports);
  const runActivity = useServerFn(listActivity);
  const runGetPdf = useServerFn(getReportPdf);
  const runDelete = useServerFn(deleteReport);

  const [reports, setReports] = useState<SavedReport[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);

    try {
      const [r, a] = await Promise.all([
        runList(),
        runActivity(),
      ]);

      setReports(r);
      setActivity(a);
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : t.failedLoad,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return reports;

    return reports.filter((r) => {
      const meta =
        KIND_META[r.kind] ?? KIND_META.general;

      return (
        r.title.toLowerCase().includes(q) ||
        (r.summary ?? "").toLowerCase().includes(q) ||
        t[meta.label].toLowerCase().includes(q)
      );
    });
  }, [reports, query, t]);

  const onDownload = async (r: SavedReport) => {
    setBusyId(r.id);

    try {
      const { title, pdfBase64 } =
        await runGetPdf({
          data: { id: r.id },
        });

      const blob = base64ToBlob(pdfBase64);
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;
      a.download = `${title.replace(
        /[^a-zA-Z0-9_-]+/g,
        "_",
      )}.pdf`;

      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(
        () => URL.revokeObjectURL(url),
        1000,
      );
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : t.downloadFailed,
      );
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (r: SavedReport) => {
    if (!confirm(t.deleteConfirm.replace("{title}", r.title))) {
      return;
    }

    setBusyId(r.id);

    try {
      await runDelete({
        data: { id: r.id },
      });

      setReports((prev) =>
        prev.filter((x) => x.id !== r.id),
      );

      toast.success(t.reportDeleted);
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : t.failedDelete,
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {t.title}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder={t.search}
            className="pl-8"
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="glass border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold">
                {t.previous}
              </h2>

              <span className="text-xs text-muted-foreground">
                {reports.length} {t.total}
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.loading}
              </div>
            ) : filtered.length === 0 ? (
              <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-10 text-center">
                <FileBarChart2 className="h-10 w-10 text-muted-foreground" />

                <div className="mt-3 text-sm font-medium">
                  {reports.length === 0
                    ? t.noReports
                    : t.noMatching}
                </div>

                <div className="mt-1 max-w-sm text-xs text-muted-foreground">
                  {reports.length === 0
                    ? t.noReportsHint
                    : t.noMatchingHint}
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {filtered.map((r) => {
                  const meta =
                    KIND_META[r.kind] ??
                    KIND_META.general;

                  const Icon = meta.icon;

                  return (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 rounded-lg border border-border/60 bg-white/[0.02] p-3"
                    >
                      <div
                        className={`rounded-md bg-accent/15 p-2 ${meta.color}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {r.title}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {t[meta.label]} •{" "}
                          {fmtDate(r.created_at, language)} •{" "}
                          {fmtSize(r.size_bytes)}
                        </div>

                        {r.summary && (
                          <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground/80">
                            {r.summary}
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === r.id}
                        onClick={() =>
                          onDownload(r)
                        }
                      >
                        {busyId === r.id ? (
                          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="mr-1.5 h-4 w-4" />
                        )}
                        {t.pdf}
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive"
                        disabled={busyId === r.id}
                        onClick={() =>
                          onDelete(r)
                        }
                        aria-label={t.ariaDelete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardContent className="p-5">
            <h2 className="font-display text-base font-semibold">
              {t.recentActivity}
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : activity.length === 0 ? (
              <div className="mt-4 rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                {t.noActivity}
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {activity.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-0.5 rounded-md bg-accent/15 p-1.5 text-accent">
                      <Activity className="h-3.5 w-3.5" />
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-sm">
                        {a.title}
                      </div>

                      {a.detail && (
                        <div className="line-clamp-1 text-xs text-muted-foreground/80">
                          {a.detail}
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        {timeAgo(a.created_at, t)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}