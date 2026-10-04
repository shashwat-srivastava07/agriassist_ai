import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useServerFn } from "@tanstack/react-start";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  IndianRupee,
  MapPin,
  Truck,
  ShieldAlert,
  Sparkles,
  Download,
  Loader2,
  Store,
  BarChart3,
  Timer,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  generateMarketReport,
  type MarketInput,
  type MarketReport,
} from "@/lib/market/market.functions";

export const Route = createFileRoute("/_workspace/market-intelligence")({
  component: MarketIntelligencePage,
});

function inr(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return iso;
  }
}


const MARKET_TRANSLATIONS = {
  en: {
    title: "Market Intelligence",
    subtitle: "Live mandi prices, nearby markets, price forecasts and AI-powered selling advice.",
    crop: "Crop",
    variety: "Variety",
    state: "State",
    district: "District",
    quantity: "Quantity (quintal)",
    cropPlaceholder: "Tomato",
    varietyPlaceholder: "Hybrid",
    statePlaceholder: "Maharashtra",
    districtPlaceholder: "Pune",
    fetching: "Fetching market data…",
    getIntelligence: "Get Market Intelligence",
    downloadPdf: "Download PDF",
    analysing: "Analysing market prices and generating advisory…",
    fillFields: "Fill crop, state, district and quantity.",
    reportReady: "Market report ready!",
    fetchFailed: "Failed to fetch market data",
    currentPrice: "Current Price",
    expectedMovement: "Expected Movement (7d)",
    bestMarket: "Best Market",
    estimatedRevenue: "Est. Revenue",
    currentPriceSub: "@ current price",
    recommendation: "AI Recommendation",
    liveSignals: "Based on live market signals",
    sellToday: "Sell Today",
    wait: "Wait",
    confidence: "Confidence",
    trendForecast: "Price Trend & Forecast",
    chartSubtitle: "Last 14 days + next 7 days (₹/quintal)",
    today: "Today",
    history: "History",
    forecast: "Forecast",
    nearbyMarkets: "Nearby Markets",
    sortedBestPrice: "Sorted by best price",
    market: "Market",
    pricePerQ: "Price/q",
    distance: "Distance",
    demand: "Demand",
    arrivals: "Arrivals",
    best: "Best",
    trendAnalysis: "Price Trend Analysis",
    bestMarketRecommendation: "Best Market Recommendation",
    transportation: "Transportation Advice",
    profitCalculator: "Profit Calculator",
    bestPrice: "Best price",
    transportCess: "Transport + mandi cess (est.)",
    expectedProfit: "Expected Profit",
    riskFactors: "Risk Factors",
    riskSubtitle: "Things that could change the outcome",
    pageOverview: "Overview",
    actionRationale: "Action Rationale",
    estimatedRevenueCurrent: "Estimated revenue @ current",
    sevenDayMovement: "Expected movement (7d)",
    aiRecommendation: "AI Recommendation",
  },
  hi: {
    title: "बाज़ार जानकारी",
    subtitle: "मंडी की कीमतें, आसपास के बाजार, मूल्य पूर्वानुमान और AI आधारित बिक्री सलाह।",
    crop: "फसल",
    variety: "किस्म",
    state: "राज्य",
    district: "जिला",
    quantity: "मात्रा (क्विंटल)",
    cropPlaceholder: "टमाटर",
    varietyPlaceholder: "हाइब्रिड",
    statePlaceholder: "महाराष्ट्र",
    districtPlaceholder: "पुणे",
    fetching: "बाज़ार डेटा प्राप्त किया जा रहा है…",
    getIntelligence: "बाज़ार जानकारी प्राप्त करें",
    downloadPdf: "PDF डाउनलोड करें",
    analysing: "बाज़ार कीमतों का विश्लेषण और सलाह तैयार की जा रही है…",
    fillFields: "फसल, राज्य, जिला और मात्रा भरें।",
    reportReady: "बाज़ार रिपोर्ट तैयार है!",
    fetchFailed: "बाज़ार डेटा प्राप्त नहीं हो सका",
    currentPrice: "वर्तमान कीमत",
    expectedMovement: "अपेक्षित बदलाव (7 दिन)",
    bestMarket: "सबसे अच्छा बाजार",
    estimatedRevenue: "अनुमानित आय",
    currentPriceSub: "@ वर्तमान कीमत",
    recommendation: "AI सलाह",
    liveSignals: "बाज़ार संकेतों के आधार पर",
    sellToday: "आज बेचें",
    wait: "इंतजार करें",
    confidence: "विश्वास",
    trendForecast: "कीमत रुझान और पूर्वानुमान",
    chartSubtitle: "पिछले 14 दिन + अगले 7 दिन (₹/क्विंटल)",
    today: "आज",
    history: "इतिहास",
    forecast: "पूर्वानुमान",
    nearbyMarkets: "आसपास के बाजार",
    sortedBestPrice: "सबसे अच्छी कीमत के अनुसार",
    market: "बाजार",
    pricePerQ: "कीमत/क्विंटल",
    distance: "दूरी",
    demand: "मांग",
    arrivals: "आवक",
    best: "सर्वश्रेष्ठ",
    trendAnalysis: "कीमत रुझान विश्लेषण",
    bestMarketRecommendation: "सबसे अच्छे बाजार की सलाह",
    transportation: "परिवहन सलाह",
    profitCalculator: "लाभ कैलकुलेटर",
    bestPrice: "सबसे अच्छी कीमत",
    transportCess: "परिवहन + मंडी शुल्क (अनुमानित)",
    expectedProfit: "अपेक्षित लाभ",
    riskFactors: "जोखिम कारक",
    riskSubtitle: "वे बातें जो परिणाम बदल सकती हैं",
    pageOverview: "सारांश",
    actionRationale: "सलाह का कारण",
    estimatedRevenueCurrent: "वर्तमान कीमत पर अनुमानित आय",
    sevenDayMovement: "अपेक्षित बदलाव (7 दिन)",
    aiRecommendation: "AI सलाह",
  },
  kn: {
    title: "ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ",
    subtitle: "ಮಂಡಿ ಬೆಲೆಗಳು, ಹತ್ತಿರದ ಮಾರುಕಟ್ಟೆಗಳು, ಬೆಲೆ ಮುನ್ಸೂಚನೆಗಳು ಮತ್ತು AI ಮಾರಾಟ ಸಲಹೆ.",
    crop: "ಬೆಳೆ",
    variety: "ತಳಿ",
    state: "ರಾಜ್ಯ",
    district: "ಜಿಲ್ಲೆ",
    quantity: "ಪ್ರಮಾಣ (ಕ್ವಿಂಟಲ್)",
    cropPlaceholder: "ಟೊಮೇಟೊ",
    varietyPlaceholder: "ಹೈಬ್ರಿಡ್",
    statePlaceholder: "ಮಹಾರಾಷ್ಟ್ರ",
    districtPlaceholder: "ಪುಣೆ",
    fetching: "ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿಯನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ…",
    getIntelligence: "ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ ಪಡೆಯಿರಿ",
    downloadPdf: "PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    analysing: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಸಲಹೆ ತಯಾರಿಸಲಾಗುತ್ತಿದೆ…",
    fillFields: "ಬೆಳೆ, ರಾಜ್ಯ, ಜಿಲ್ಲೆ ಮತ್ತು ಪ್ರಮಾಣವನ್ನು ನಮೂದಿಸಿ.",
    reportReady: "ಮಾರುಕಟ್ಟೆ ವರದಿ ಸಿದ್ಧವಾಗಿದೆ!",
    fetchFailed: "ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ ಪಡೆಯಲು ವಿಫಲವಾಗಿದೆ",
    currentPrice: "ಪ್ರಸ್ತುತ ಬೆಲೆ",
    expectedMovement: "ನಿರೀಕ್ಷಿತ ಬದಲಾವಣೆ (7 ದಿನ)",
    bestMarket: "ಅತ್ಯುತ್ತಮ ಮಾರುಕಟ್ಟೆ",
    estimatedRevenue: "ಅಂದಾಜು ಆದಾಯ",
    currentPriceSub: "@ ಪ್ರಸ್ತುತ ಬೆಲೆ",
    recommendation: "AI ಸಲಹೆ",
    liveSignals: "ಪ್ರಸ್ತುತ ಮಾರುಕಟ್ಟೆ ಸೂಚನೆಗಳ ಆಧಾರದಲ್ಲಿ",
    sellToday: "ಇಂದು ಮಾರಾಟ ಮಾಡಿ",
    wait: "ಕಾಯಿರಿ",
    confidence: "ವಿಶ್ವಾಸ",
    trendForecast: "ಬೆಲೆ ಪ್ರವೃತ್ತಿ ಮತ್ತು ಮುನ್ಸೂಚನೆ",
    chartSubtitle: "ಕಳೆದ 14 ದಿನ + ಮುಂದಿನ 7 ದಿನ (₹/ಕ್ವಿಂಟಲ್)",
    today: "ಇಂದು",
    history: "ಇತಿಹಾಸ",
    forecast: "ಮುನ್ಸೂಚನೆ",
    nearbyMarkets: "ಹತ್ತಿರದ ಮಾರುಕಟ್ಟೆಗಳು",
    sortedBestPrice: "ಅತ್ಯುತ್ತಮ ಬೆಲೆಯಂತೆ ವಿಂಗಡಿಸಲಾಗಿದೆ",
    market: "ಮಾರುಕಟ್ಟೆ",
    pricePerQ: "ಬೆಲೆ/ಕ್ವಿಂಟಲ್",
    distance: "ದೂರ",
    demand: "ಬೇಡಿಕೆ",
    arrivals: "ಆಗಮನ",
    best: "ಅತ್ಯುತ್ತಮ",
    trendAnalysis: "ಬೆಲೆ ಪ್ರವೃತ್ತಿ ವಿಶ್ಲೇಷಣೆ",
    bestMarketRecommendation: "ಅತ್ಯುತ್ತಮ ಮಾರುಕಟ್ಟೆ ಸಲಹೆ",
    transportation: "ಸಾರಿಗೆ ಸಲಹೆ",
    profitCalculator: "ಲಾಭ ಲೆಕ್ಕಾಚಾರ",
    bestPrice: "ಅತ್ಯುತ್ತಮ ಬೆಲೆ",
    transportCess: "ಸಾರಿಗೆ + ಮಂಡಿ ಶುಲ್ಕ (ಅಂದಾಜು)",
    expectedProfit: "ನಿರೀಕ್ಷಿತ ಲಾಭ",
    riskFactors: "ಅಪಾಯದ ಅಂಶಗಳು",
    riskSubtitle: "ಫಲಿತಾಂಶವನ್ನು ಬದಲಾಯಿಸಬಹುದಾದ ವಿಷಯಗಳು",
    pageOverview: "ಸಾರಾಂಶ",
    actionRationale: "ಸಲಹೆಯ ಕಾರಣ",
    estimatedRevenueCurrent: "ಪ್ರಸ್ತುತ ಬೆಲೆಯಲ್ಲಿ ಅಂದಾಜು ಆದಾಯ",
    sevenDayMovement: "ನಿರೀಕ್ಷಿತ ಬದಲಾವಣೆ (7 ದಿನ)",
    aiRecommendation: "AI ಸಲಹೆ",
  },
  ta: {
    title: "சந்தை தகவல்",
    subtitle: "மண்டி விலைகள், அருகிலுள்ள சந்தைகள், விலை முன்னறிவிப்புகள் மற்றும் AI விற்பனை ஆலோசனை.",
    crop: "பயிர்",
    variety: "வகை",
    state: "மாநிலம்",
    district: "மாவட்டம்",
    quantity: "அளவு (குவிண்டால்)",
    cropPlaceholder: "தக்காளி",
    varietyPlaceholder: "ஹைப்ரிட்",
    statePlaceholder: "மகாராஷ்டிரா",
    districtPlaceholder: "புனே",
    fetching: "சந்தை தரவு பெறப்படுகிறது…",
    getIntelligence: "சந்தை தகவலைப் பெறுங்கள்",
    downloadPdf: "PDF பதிவிறக்கம்",
    analysing: "சந்தை விலைகளை பகுப்பாய்வு செய்து ஆலோசனை உருவாக்கப்படுகிறது…",
    fillFields: "பயிர், மாநிலம், மாவட்டம் மற்றும் அளவை நிரப்பவும்.",
    reportReady: "சந்தை அறிக்கை தயாராக உள்ளது!",
    fetchFailed: "சந்தை தரவைப் பெற முடியவில்லை",
    currentPrice: "தற்போதைய விலை",
    expectedMovement: "எதிர்பார்க்கப்படும் மாற்றம் (7 நாள்)",
    bestMarket: "சிறந்த சந்தை",
    estimatedRevenue: "மதிப்பிடப்பட்ட வருவாய்",
    currentPriceSub: "@ தற்போதைய விலை",
    recommendation: "AI ஆலோசனை",
    liveSignals: "தற்போதைய சந்தை நிலவரத்தின் அடிப்படையில்",
    sellToday: "இன்று விற்கவும்",
    wait: "காத்திருக்கவும்",
    confidence: "நம்பகத்தன்மை",
    trendForecast: "விலை போக்கு மற்றும் முன்னறிவிப்பு",
    chartSubtitle: "கடந்த 14 நாட்கள் + அடுத்த 7 நாட்கள் (₹/குவிண்டால்)",
    today: "இன்று",
    history: "வரலாறு",
    forecast: "முன்னறிவிப்பு",
    nearbyMarkets: "அருகிலுள்ள சந்தைகள்",
    sortedBestPrice: "சிறந்த விலைப்படி வரிசைப்படுத்தப்பட்டது",
    market: "சந்தை",
    pricePerQ: "விலை/குவிண்டால்",
    distance: "தூரம்",
    demand: "தேவை",
    arrivals: "வரத்து",
    best: "சிறந்தது",
    trendAnalysis: "விலை போக்கு பகுப்பாய்வு",
    bestMarketRecommendation: "சிறந்த சந்தை பரிந்துரை",
    transportation: "போக்குவரத்து ஆலோசனை",
    profitCalculator: "லாபக் கணக்கீடு",
    bestPrice: "சிறந்த விலை",
    transportCess: "போக்குவரத்து + மண்டி கட்டணம் (மதிப்பீடு)",
    expectedProfit: "எதிர்பார்க்கப்படும் லாபம்",
    riskFactors: "ஆபத்து காரணிகள்",
    riskSubtitle: "முடிவை மாற்றக்கூடிய விஷயங்கள்",
    pageOverview: "சுருக்கம்",
    actionRationale: "ஆலோசனைக்கான காரணம்",
    estimatedRevenueCurrent: "தற்போதைய விலையில் மதிப்பிடப்பட்ட வருவாய்",
    sevenDayMovement: "எதிர்பார்க்கப்படும் மாற்றம் (7 நாள்)",
    aiRecommendation: "AI ஆலோசனை",
  },
} as const;

function getMarketTranslations(language: "en" | "hi" | "kn" | "ta") {
  return MARKET_TRANSLATIONS[language] ?? MARKET_TRANSLATIONS.en;
}

function MarketIntelligencePage() {
  const run = useServerFn(generateMarketReport);
  const { language } = useLanguage();
  const t = getMarketTranslations(language);

  const [form, setForm] = useState<MarketInput>({
    crop: "Tomato",
    variety: "Hybrid",
    state: "Maharashtra",
    district: "Pune",
    quantityQuintal: 20,
  });

  const [report, setReport] = useState<MarketReport | null>(null);
  const [loading, setLoading] = useState(false);

  const update = <K extends keyof MarketInput>(
    k: K,
    v: MarketInput[K],
  ) => setForm((f) => ({ ...f, [k]: v }));

  const onFetch = async () => {
    if (
      !form.crop ||
      !form.state ||
      !form.district ||
      !form.quantityQuintal
    ) {
      toast.error(t.fillFields);
      return;
    }

    setLoading(true);
    setReport(null);

    try {
      const r = await run({ data: { ...form, language } });
      setReport(r);
      toast.success(t.reportReady);
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : t.fetchFailed,
      );
    } finally {
      setLoading(false);
    }
  };

  const onDownloadPdf = async () => {
    if (!report) return;

    const { default: jsPDF } = await import("jspdf");

    const doc = new jsPDF({
      unit: "pt",
      format: "a4",
    });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 48;
    const contentW = pageW - margin * 2;

    // palette
    const brand: [number, number, number] = [16, 122, 87];
    const brandDark: [number, number, number] = [10, 78, 56];
    const ink: [number, number, number] = [30, 41, 59];
    const muted: [number, number, number] = [100, 116, 139];
    const soft: [number, number, number] = [241, 245, 249];
    const border: [number, number, number] = [226, 232, 240];
    const good: [number, number, number] = [22, 163, 74];
    const warn: [number, number, number] = [202, 138, 4];
    const bad: [number, number, number] = [220, 38, 38];

    let y = 0;
    let page = 1;

    const setFill = (c: [number, number, number]) =>
      doc.setFillColor(c[0], c[1], c[2]);

    const setText = (c: [number, number, number]) =>
      doc.setTextColor(c[0], c[1], c[2]);

    const setDraw = (c: [number, number, number]) =>
      doc.setDrawColor(c[0], c[1], c[2]);

    const drawHeader = () => {
      setFill(brand);
      doc.rect(0, 0, pageW, 70, "F");

      setFill(brandDark);
      doc.rect(0, 68, pageW, 3, "F");

      setText([255, 255, 255]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("AgriAssist AI", margin, 30);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`${t.title} Report`, margin, 48);

      doc.setFontSize(9);

      const stamp = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      doc.text(stamp, pageW - margin, 30, {
        align: "right",
      });

      doc.text(
        `${report.crop} • ${report.district}, ${report.state}`,
        pageW - margin,
        48,
        { align: "right" },
      );
    };

    const drawFooter = () => {
      setText(muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      doc.text(
        `Generated by AgriAssist AI · ${t.title}`,
        margin,
        pageH - 20,
      );

      doc.text(
        `Page ${page}`,
        pageW - margin,
        pageH - 20,
        { align: "right" },
      );
    };

    const newPage = () => {
      drawFooter();
      doc.addPage();
      page += 1;
      drawHeader();
      y = 96;
    };

    const ensure = (h: number) => {
      if (y + h > pageH - 40) newPage();
    };

    const sectionTitle = (t: string) => {
      ensure(30);

      setFill(brand);
      doc.rect(margin, y, 3, 14, "F");

      setText(ink);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(t, margin + 10, y + 11);

      y += 22;
    };

    const para = (
      t: string,
      opts: {
        size?: number;
        bold?: boolean;
        color?: [number, number, number];
      } = {},
    ) => {
      const size = opts.size ?? 10;

      doc.setFont(
        "helvetica",
        opts.bold ? "bold" : "normal",
      );

      doc.setFontSize(size);
      setText(opts.color ?? ink);

      const lines = doc.splitTextToSize(t, contentW);

      ensure(lines.length * (size + 3) + 2);

      doc.text(lines, margin, y + size);
      y += lines.length * (size + 3) + 2;
    };

    const kv = (
      k: string,
      v: string,
      valueColor?: [number, number, number],
    ) => {
      ensure(16);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      setText(muted);
      doc.text(k, margin, y + 10);

      doc.setFont("helvetica", "bold");
      setText(valueColor ?? ink);

      doc.text(v, pageW - margin, y + 10, {
        align: "right",
      });

      setDraw(border);
      doc.line(
        margin,
        y + 15,
        pageW - margin,
        y + 15,
      );

      y += 18;
    };

    const bullet = (t: string) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      setText(ink);

      const lines = doc.splitTextToSize(
        t,
        contentW - 14,
      );

      ensure(lines.length * 13 + 2);

      setFill(brand);
      doc.circle(
        margin + 3,
        y + 6,
        1.6,
        "F",
      );

      doc.text(lines, margin + 12, y + 9);

      y += lines.length * 13 + 2;
    };

    const card = (
      title: string,
      body: string,
      accent: [number, number, number] = brand,
    ) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      const bodyLines = doc.splitTextToSize(
        body,
        contentW - 24,
      );

      const h = 32 + bodyLines.length * 13;

      ensure(h + 6);

      setFill(soft);

      doc.roundedRect(
        margin,
        y,
        contentW,
        h,
        6,
        6,
        "F",
      );

      setFill(accent);

      doc.roundedRect(
        margin,
        y,
        4,
        h,
        2,
        2,
        "F",
      );

      setText(accent);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(title, margin + 14, y + 16);

      setText(ink);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      doc.text(
        bodyLines,
        margin + 14,
        y + 30,
      );

      y += h + 8;
    };

    const table = (
      headers: string[],
      rows: string[][],
      widths: number[],
      alignRight: boolean[] = [],
    ) => {
      const rowH = 20;

      ensure(rowH + 4);

      setFill(brand);

      doc.roundedRect(
        margin,
        y,
        contentW,
        rowH,
        4,
        4,
        "F",
      );

      setText([255, 255, 255]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);

      let x = margin + 10;

      headers.forEach((h, i) => {
        const w = widths[i] * contentW;

        doc.text(
          h,
          alignRight[i]
            ? x + w - 20
            : x,
          y + 13,
          {
            align: alignRight[i]
              ? "right"
              : "left",
          },
        );

        x += w;
      });

      y += rowH;

      rows.forEach((r, idx) => {
        ensure(rowH);

        if (idx % 2 === 0) {
          setFill(soft);
          doc.rect(
            margin,
            y,
            contentW,
            rowH,
            "F",
          );
        }

        setText(ink);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        let x2 = margin + 10;

        r.forEach((cell, i) => {
          const w = widths[i] * contentW;

          doc.text(
            String(cell),
            alignRight[i]
              ? x2 + w - 20
              : x2,
            y + 13,
            {
              align: alignRight[i]
                ? "right"
                : "left",
            },
          );

          x2 += w;
        });

        setDraw(border);

        doc.line(
          margin,
          y + rowH,
          pageW - margin,
          y + rowH,
        );

        y += rowH;
      });

      y += 6;
    };

    const spacer = (n = 8) => (y += n);

    // --- Page 1 ---
    drawHeader();
    y = 96;

    // Executive summary card
    const actionColor =
      report.advisory.action === "SELL_TODAY"
        ? good
        : warn;

    const actionLabel =
      report.advisory.action === "SELL_TODAY"
        ? t.sellToday.toUpperCase()
        : t.wait.toUpperCase();

    ensure(96);

    setFill([248, 250, 252]);

    doc.roundedRect(
      margin,
      y,
      contentW,
      88,
      8,
      8,
      "F",
    );

    setDraw(border);

    doc.roundedRect(
      margin,
      y,
      contentW,
      88,
      8,
      8,
      "S",
    );

    setText(muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    doc.text(
      t.currentPrice.toUpperCase(),
      margin + 16,
      y + 20,
    );

    setText(ink);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);

    doc.text(
      `${inr(report.currentPrice)}/q`,
      margin + 16,
      y + 46,
    );

    doc.setFontSize(9);

    setText(
      report.priceChangePct >= 0
        ? good
        : bad,
    );

    doc.text(
      `${report.priceChangePct >= 0 ? "▲" : "▼"} ${Math.abs(report.priceChangePct)}% week over week`,
      margin + 16,
      y + 62,
    );

    setText(muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    doc.text(
      t.recommendation.toUpperCase(),
      margin + contentW / 2 + 8,
      y + 20,
    );

    setText(actionColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);

    doc.text(
      actionLabel,
      margin + contentW / 2 + 8,
      y + 44,
    );

    setText(muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    doc.text(
      `Confidence ${report.advisory.confidence}%  •  Est. profit ${inr(report.advisory.expectedProfit)}`,
      margin + contentW / 2 + 8,
      y + 62,
    );

    y += 100;

    // Overview details
    sectionTitle(t.pageOverview);

    kv(
      "Crop",
      `${report.crop} (${report.variety})`,
    );

    kv(
      "Location",
      `${report.district}, ${report.state}`,
    );

    kv(
      "Quantity",
      `${report.quantityQuintal} quintal`,
    );

    kv(
      t.sevenDayMovement,
      report.expectedMovement.summary,
      report.expectedMovement.direction ===
        "up"
        ? good
        : report.expectedMovement.direction ===
            "down"
          ? bad
          : warn,
    );

    kv(
      t.estimatedRevenueCurrent,
      inr(
        report.currentPrice *
          report.quantityQuintal,
      ),
      brand,
    );

    spacer(6);

    // AI Recommendation details
    sectionTitle(t.aiRecommendation);

    card(
      t.actionRationale,
      report.advisory.actionReason,
      actionColor,
    );

    card(
      t.trendAnalysis,
      report.advisory.trendAnalysis,
      brand,
    );

    card(
      `Best Market — ${report.advisory.bestMarket}`,
      report.advisory.bestMarketReason,
      brand,
    );

    card(
      t.transportation,
      report.advisory.transportation,
      [59, 130, 246],
    );

    card(
      `Expected Profit — ${inr(report.advisory.expectedProfit)}`,
      report.advisory.profitBreakdown,
      good,
    );

    // Risks
    sectionTitle(t.riskFactors);

    report.advisory.riskFactors.forEach((r) =>
      bullet(r),
    );

    spacer(6);

    // Nearby markets
    sectionTitle(t.nearbyMarkets);

    table(
      [
        t.market,
        t.pricePerQ,
        t.distance,
        t.demand,
        t.arrivals,
      ],
      report.nearbyMarkets.map((m) => [
        m.name +
          (m.name === report.bestMarket.name
            ? "  ★"
            : ""),
        inr(m.pricePerQuintal),
        `${m.distanceKm} km`,
        m.demand,
        `${m.arrivalQuintal} q`,
      ]),
      [0.36, 0.16, 0.14, 0.14, 0.20],
      [false, true, true, true, true],
    );

    // Price history + forecast
    sectionTitle("14-Day Price Trend");

    const trendRows: string[][] = [];

    for (
      let i = 0;
      i < report.trend.length;
      i += 2
    ) {
      const a = report.trend[i];
      const b = report.trend[i + 1];

      trendRows.push([
        fmtDate(a.date),
        inr(a.price),
        b ? fmtDate(b.date) : "",
        b ? inr(b.price) : "",
      ]);
    }

    table(
      ["Date", t.pricePerQ, "Date", t.pricePerQ],
      trendRows,
      [0.25, 0.25, 0.25, 0.25],
      [false, true, false, true],
    );

    sectionTitle("7-Day Forecast");

    table(
      ["Date", `Forecast ${t.pricePerQ}`],
      report.forecast.map((t) => [
        fmtDate(t.date),
        inr(t.price),
      ]),
      [0.5, 0.5],
      [false, true],
    );

    drawFooter();

    doc.save(
      `Market-${report.crop}-${report.district}.pdf`,
    );

    const { saveGeneratedReport } =
      await import(
        "@/lib/reports/save-client"
      );

    await saveGeneratedReport({
      title: `Market Report — ${report.crop} (${report.district})`,
      kind: "market-intelligence",
      summary: `${report.variety} • ${report.advisory?.action ?? "Advisory"} • Best: ${report.bestMarket?.name ?? "—"}`,
      doc,
      activityDetail: `Market intelligence for ${report.crop} in ${report.district}`,
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          {t.title}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {t.subtitle}
        </p>
      </header>

      <Card className="glass mb-6 border-0">
        <CardContent className="p-5">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Field label={t.crop}>
              <Input
                value={form.crop}
                onChange={(e) =>
                  update("crop", e.target.value)
                }
                placeholder={t.cropPlaceholder}
              />
            </Field>

            <Field label={t.variety}>
              <Input
                value={form.variety}
                onChange={(e) =>
                  update("variety", e.target.value)
                }
                placeholder={t.varietyPlaceholder}
              />
            </Field>

            <Field label={t.state}>
              <Input
                value={form.state}
                onChange={(e) =>
                  update("state", e.target.value)
                }
                placeholder={t.statePlaceholder}
              />
            </Field>

            <Field label={t.district}>
              <Input
                value={form.district}
                onChange={(e) =>
                  update("district", e.target.value)
                }
                placeholder={t.districtPlaceholder}
              />
            </Field>

            <Field label={t.quantity}>
              <Input
                type="number"
                min={1}
                value={form.quantityQuintal}
                onChange={(e) =>
                  update(
                    "quantityQuintal",
                    parseFloat(e.target.value) || 0,
                  )
                }
              />
            </Field>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              onClick={onFetch}
              disabled={loading}
              className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="mr-2 h-4 w-4" />
              )}

              {loading
                ? t.fetching
                : t.getIntelligence}
            </Button>

            {report && (
              <Button
                variant="outline"
                onClick={onDownloadPdf}
              >
                <Download className="mr-2 h-4 w-4" />
                {t.downloadPdf}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="rounded-xl border border-border/60 bg-white/[0.02] p-10 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-accent" />

          <p className="mt-3 text-sm text-muted-foreground">
            {t.analysing}
          </p>
        </div>
      )}

      {report && !loading && (
        <ReportView report={report} language={language} />
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>

      {children}
    </div>
  );
}

function ReportView({
  report,
  language,
}: {
  report: MarketReport;
  language: "en" | "hi" | "kn" | "ta";
}) {
  const t = getMarketTranslations(language);
  const est =
    report.currentPrice *
    report.quantityQuintal;

  const TrendIcon =
    report.expectedMovement.direction === "up"
      ? TrendingUp
      : report.expectedMovement.direction ===
          "down"
        ? TrendingDown
        : Minus;

  const chartData = [
    ...report.trend.map((t) => ({
      date: fmtDate(t.date),
      price: t.price,
      kind: "history" as const,
    })),

    ...report.forecast.map((t) => ({
      date: fmtDate(t.date),
      forecast: t.price,
      kind: "forecast" as const,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Kpi
          icon={IndianRupee}
          label={t.currentPrice}
          value={`${inr(report.currentPrice)}/q`}
          sub={`${report.priceChangePct >= 0 ? "+" : ""}${report.priceChangePct}% w/w`}
          tone={
            report.priceChangePct >= 0
              ? "up"
              : "down"
          }
        />

        <Kpi
          icon={TrendIcon}
          label={t.expectedMovement}
          value={`${report.expectedMovement.percent >= 0 ? "+" : ""}${report.expectedMovement.percent}%`}
          sub={report.expectedMovement.summary}
          tone={
            report.expectedMovement.direction ===
            "up"
              ? "up"
              : report.expectedMovement.direction ===
                  "down"
                ? "down"
                : "flat"
          }
        />

        <Kpi
          icon={Store}
          label={t.bestMarket}
          value={report.bestMarket.name}
          sub={`${inr(report.bestMarket.pricePerQuintal)}/q • ${report.bestMarket.distanceKm} km`}
        />

        <Kpi
          icon={IndianRupee}
          label={`${t.estimatedRevenue} (${report.quantityQuintal} q)`}
          value={inr(est)}
          sub={t.currentPriceSub}
          highlight
        />
      </div>

      {/* AI Recommendation */}
      <Card
        className={
          "glass border-0 " +
          (report.advisory.action ===
          "SELL_TODAY"
            ? "ring-1 ring-emerald-500/40"
            : "ring-1 ring-amber-500/40")
        }
      >
        <CardContent className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-md bg-accent/15 p-1.5 text-accent">
              <Sparkles className="h-4 w-4" />
            </div>

            <div>
              <h2 className="font-display text-base font-semibold">
                {t.recommendation}
              </h2>

              <p className="text-xs text-muted-foreground">
                {t.liveSignals}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge
              className={
                report.advisory.action ===
                "SELL_TODAY"
                  ? "gap-1 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20"
                  : "gap-1 bg-amber-500/15 text-amber-400 hover:bg-amber-500/20"
              }
            >
              {report.advisory.action ===
              "SELL_TODAY" ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}

              {report.advisory.action ===
              "SELL_TODAY"
                ? t.sellToday
                : t.wait}
            </Badge>

            <Badge
              variant="outline"
              className="gap-1"
            >
              <Timer className="h-3 w-3" />
              {t.confidence}{" "}
              {report.advisory.confidence}%
            </Badge>
          </div>

          <p className="mt-3 text-sm">
            {report.advisory.actionReason}
          </p>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card className="glass border-0">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-md bg-accent/15 p-1.5 text-accent">
              <BarChart3 className="h-4 w-4" />
            </div>

            <div>
              <h2 className="font-display text-base font-semibold">
                {t.trendForecast}
              </h2>

              <p className="text-xs text-muted-foreground">
                {t.chartSubtitle}
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 15,
                  left: 0,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="g1"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--accent))"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--accent))"
                      stopOpacity={0}
                    />
                  </linearGradient>

                  <linearGradient
                    id="g2"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                />

                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                  width={55}
                />

                <Tooltip
                  contentStyle={{
                    background:
                      "rgba(15, 23, 42, 0.95)",
                    border:
                      "1px solid rgba(148, 163, 184, 0.3)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#f8fafc",
                    boxShadow:
                      "0 8px 24px rgba(0,0,0,0.35)",
                  }}
                  labelStyle={{
                    color: "#f8fafc",
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                  itemStyle={{
                    color: "#e2e8f0",
                  }}
                  cursor={{
                    stroke:
                      "rgba(148,163,184,0.4)",
                    strokeWidth: 1,
                  }}
                  formatter={(
                    v: number,
                    name: string,
                  ) => [
                    `₹${v}/q`,
                    name,
                  ]}
                />

                <ReferenceLine
                  x={fmtDate(
                    report.trend[
                      report.trend.length - 1
                    ].date,
                  )}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="4 4"
                  label={{
                    value: t.today,
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 10,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="price"
                  name={t.history}
                  stroke="hsl(var(--accent))"
                  fill="url(#g1)"
                  strokeWidth={2}
                />

                <Area
                  type="monotone"
                  dataKey="forecast"
                  name={t.forecast}
                  stroke="hsl(var(--primary))"
                  fill="url(#g2)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Nearby markets */}
      <Card className="glass border-0">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-md bg-accent/15 p-1.5 text-accent">
              <MapPin className="h-4 w-4" />
            </div>

            <div>
              <h2 className="font-display text-base font-semibold">
                {t.nearbyMarkets}
              </h2>

              <p className="text-xs text-muted-foreground">
                {t.sortedBestPrice}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">
                    {t.market}
                  </th>

                  <th className="px-3 py-2 text-right">
                    {t.pricePerQ}
                  </th>

                  <th className="px-3 py-2 text-right">
                    {t.distance}
                  </th>

                  <th className="px-3 py-2 text-right">
                    {t.demand}
                  </th>

                  <th className="px-3 py-2 text-right">
                    {t.arrivals}
                  </th>
                </tr>
              </thead>

              <tbody>
                {report.nearbyMarkets.map(
                  (m, i) => {
                    const isBest =
                      m.name ===
                      report.bestMarket.name;

                    return (
                      <tr
                        key={i}
                        className={
                          "border-t border-border/60 " +
                          (isBest
                            ? "bg-emerald-500/5"
                            : "")
                        }
                      >
                        <td className="px-3 py-2 font-medium">
                          {m.name}{" "}
                          {isBest && (
                            <Badge className="ml-2 bg-emerald-500/15 text-emerald-400">
                              {t.best}
                            </Badge>
                          )}
                        </td>

                        <td className="px-3 py-2 text-right tabular-nums font-semibold">
                          {inr(
                            m.pricePerQuintal,
                          )}
                        </td>

                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                          {m.distanceKm} km
                        </td>

                        <td className="px-3 py-2 text-right">
                          <Badge
                            variant="outline"
                            className={
                              m.demand === "High"
                                ? "text-emerald-400"
                                : m.demand === "Low"
                                  ? "text-rose-400"
                                  : "text-amber-400"
                            }
                          >
                            {m.demand}
                          </Badge>
                        </td>

                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                          {m.arrivalQuintal} q
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* AI details */}
      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard
          icon={TrendingUp}
          title={t.trendAnalysis}
          body={report.advisory.trendAnalysis}
        />

        <InfoCard
          icon={Store}
          title={t.bestMarketRecommendation}
          body={`${report.advisory.bestMarket} — ${report.advisory.bestMarketReason}`}
        />

        <InfoCard
          icon={Truck}
          title={t.transportation}
          body={report.advisory.transportation}
        />

        <ProfitCard report={report} language={language} />
      </div>

      {/* Risks */}
      <Card className="glass border-0">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-md bg-rose-500/15 p-1.5 text-rose-400">
              <ShieldAlert className="h-4 w-4" />
            </div>

            <div>
              <h2 className="font-display text-base font-semibold">
                {t.riskFactors}
              </h2>

              <p className="text-xs text-muted-foreground">
                {t.riskSubtitle}
              </p>
            </div>
          </div>

          <ul className="grid gap-2 md:grid-cols-2">
            {report.advisory.riskFactors.map(
              (r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-lg border border-border/60 bg-white/[0.02] p-3 text-sm"
                >
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                  <span>{r}</span>
                </li>
              ),
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
  tone,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  tone?: "up" | "down" | "flat";
  highlight?: boolean;
}) {
  const toneClass =
    tone === "up"
      ? "text-emerald-400"
      : tone === "down"
        ? "text-rose-400"
        : tone === "flat"
          ? "text-amber-400"
          : "";

  return (
    <Card
      className={
        "glass border-0 " +
        (highlight
          ? "ring-1 ring-accent/40"
          : "")
      }
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon
            className={
              "h-3.5 w-3.5 " + toneClass
            }
          />
          {label}
        </div>

        <div
          className={
            "mt-1 truncate font-display text-xl font-semibold " +
            (highlight
              ? "text-accent"
              : "")
          }
        >
          {value}
        </div>

        {sub && (
          <div
            className={
              "truncate text-xs " +
              (toneClass ||
                "text-muted-foreground")
            }
          >
            {sub}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InfoCard({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
}) {
  return (
    <Card className="glass border-0">
      <CardContent className="p-5">
        <div className="mb-2 flex items-center gap-2">
          <div className="rounded-md bg-accent/15 p-1.5 text-accent">
            <Icon className="h-4 w-4" />
          </div>

          <h3 className="font-display text-sm font-semibold">
            {title}
          </h3>
        </div>

        <p className="text-sm text-muted-foreground">
          {body}
        </p>
      </CardContent>
    </Card>
  );
}

function ProfitCard({
  report,
  language,
}: {
  report: MarketReport;
  language: "en" | "hi" | "kn" | "ta";
}) {
  const t = getMarketTranslations(language);
  const gross =
    report.bestMarket.pricePerQuintal *
    report.quantityQuintal;

  return (
    <Card className="glass border-0 ring-1 ring-accent/30">
      <CardContent className="p-5">
        <div className="mb-2 flex items-center gap-2">
          <div className="rounded-md bg-accent/15 p-1.5 text-accent">
            <IndianRupee className="h-4 w-4" />
          </div>

          <h3 className="font-display text-sm font-semibold">
            {t.profitCalculator}
          </h3>
        </div>

        <div className="space-y-1 text-sm">
          <Row
            label={`${t.bestPrice} × ${report.quantityQuintal} q`}
            value={inr(gross)}
          />

          <Row
            label={t.transportCess}
            value={`− ${inr(
              gross -
                report.advisory.expectedProfit,
            )}`}
          />

          <div className="mt-2 flex items-center justify-between rounded-lg border border-accent/30 bg-accent/10 px-3 py-2">
            <span className="text-sm font-semibold">
              {t.expectedProfit}
            </span>

            <span className="text-lg font-bold text-accent">
              {inr(
                report.advisory.expectedProfit,
              )}
            </span>
          </div>

          <p className="pt-2 text-xs text-muted-foreground">
            {report.advisory.profitBreakdown}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-1.5">
      <span className="text-muted-foreground">
        {label}
      </span>

      <span className="font-medium tabular-nums">
        {value}
      </span>
    </div>
  );
}