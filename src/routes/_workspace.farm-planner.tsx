import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useServerFn } from "@tanstack/react-start";
import {
  Sprout,
  Droplets,
  FlaskConical,
  Bug,
  ShieldAlert,
  Scissors,
  TrendingUp,
  IndianRupee,
  Wallet,
  Download,
  Loader2,
  Calendar,
  MapPin,
  Lightbulb,
  Layers,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  generateFarmPlan,
  type FarmPlan,
  type PlannerInput,
  type ScheduleItem,
} from "@/lib/farm-planner/planner.functions";

export const Route = createFileRoute("/_workspace/farm-planner")({
  component: FarmPlannerPage,
});

const SOIL_TYPES = [
  "Black (Regur)",
  "Red",
  "Alluvial",
  "Sandy",
  "Loamy",
  "Clay",
  "Laterite",
];

const IRRIGATION_SOURCES = [
  "Well",
  "Borewell",
  "Canal",
  "Drip",
  "Sprinkler",
  "Rainfed",
  "River",
  "Pond",
];

const PLANNER_TRANSLATIONS = {
  en: {
    title: "Farm Planner",
    subtitle: "Professional seasonal plan — calendar, inputs, costs and profit projection for your crop.",
    crop: "Crop",
    state: "State",
    district: "District",
    landSize: "Land Size (acres)",
    soilType: "Soil Type",
    irrigationSource: "Irrigation Source",
    sowingDate: "Sowing Date",
    cropPlaceholder: "Tomato, Cotton, Wheat…",
    statePlaceholder: "Maharashtra",
    districtPlaceholder: "Buldhana",
    generating: "Generating plan…",
    generate: "Generate Farm Plan",
    downloadPdf: "Download PDF",
    building: "Building your seasonal plan… this may take up to a minute.",
    farmPlanReady: "Farm plan ready!",
    fillRequired: "Please fill crop, state, district and sowing date.",
    failed: "Failed to generate plan",
    seasonalPlan: "Seasonal Farm Plan",
    cropCalendar: "Crop Calendar",
    cropCalendarSub: "Growth stages across the full season",
    irrigationSchedule: "Irrigation Schedule",
    irrigationSub: "When and how much to water",
    fertilizerSchedule: "Fertilizer Schedule",
    fertilizerSub: "2 product options, dose per 20L sprayer",
    pestMonitoring: "Pest Monitoring",
    pestSub: "Pest problems + treatment options",
    diseasePrevention: "Disease Prevention",
    diseaseSub: "Prevent common diseases for your crop",
    harvestTimeline: "Harvest Timeline",
    readyIndicators: "Ready-to-harvest indicators",
    postHarvest: "Post-harvest handling",
    costBreakdown: "Cost Breakdown",
    totalFor: "Total for",
    category: "Category",
    detail: "Detail",
    amount: "Amount",
    totalCost: "Total Cost",
    estimatedProfit: "Estimated Profit",
    fullCycle: "Full-cycle calculation",
    yieldPerAcre: "Yield per acre",
    totalYield: "Total yield",
    marketPrice: "Market price",
    grossRevenue: "Gross revenue",
    netProfit: "Net Profit",
    roi: "ROI",
    assumptions: "Assumptions",
    proTips: "Pro Tips",
    estimatedYield: "Estimated Yield",
    grossRevenueKpi: "Gross Revenue",
    totalCostKpi: "Total Cost",
    netProfitKpi: "Net Profit",
    categories: "categories",
    quintal: "quintal",
    option: "Option",
    forYourLand: "For your land:",
    dose20L: "Dose per 20L pump:",
    purpose: "Purpose:",
    price: "Price:",
    window: "Window:",
    indicators: "Indicators:",
    postHarvestLabel: "Post-harvest:",
    tips: "Tips",
    planTitle: "Farm Plan",
    generatedSeasonal: "Generated seasonal plan for",
  },
  hi: {
    title: "फार्म प्लानर",
    subtitle: "आपकी फसल के लिए मौसम आधारित योजना — कैलेंडर, इनपुट, लागत और लाभ का अनुमान।",
    crop: "फसल",
    state: "राज्य",
    district: "जिला",
    landSize: "भूमि का आकार (एकड़)",
    soilType: "मिट्टी का प्रकार",
    irrigationSource: "सिंचाई का स्रोत",
    sowingDate: "बुवाई की तारीख",
    cropPlaceholder: "टमाटर, कपास, गेहूं…",
    statePlaceholder: "महाराष्ट्र",
    districtPlaceholder: "बुलढाणा",
    generating: "योजना तैयार हो रही है…",
    generate: "फार्म प्लान बनाएं",
    downloadPdf: "PDF डाउनलोड करें",
    building: "आपकी मौसम आधारित योजना तैयार की जा रही है… इसमें एक मिनट तक लग सकता है।",
    farmPlanReady: "फार्म प्लान तैयार है!",
    fillRequired: "कृपया फसल, राज्य, जिला और बुवाई की तारीख भरें।",
    failed: "प्लान तैयार नहीं हो सका",
    seasonalPlan: "मौसम आधारित फार्म प्लान",
    cropCalendar: "फसल कैलेंडर",
    cropCalendarSub: "पूरे मौसम में फसल के विकास चरण",
    irrigationSchedule: "सिंचाई कार्यक्रम",
    irrigationSub: "कब और कितनी सिंचाई करनी है",
    fertilizerSchedule: "खाद एवं उर्वरक कार्यक्रम",
    fertilizerSub: "20 लीटर स्प्रेयर के लिए 2 उत्पाद विकल्प और मात्रा",
    pestMonitoring: "कीट निगरानी",
    pestSub: "कीट समस्याएं और उपचार विकल्प",
    diseasePrevention: "रोग रोकथाम",
    diseaseSub: "आपकी फसल में सामान्य रोगों से बचाव",
    harvestTimeline: "कटाई की समय-सीमा",
    readyIndicators: "कटाई के लिए तैयार होने के संकेत",
    postHarvest: "कटाई के बाद प्रबंधन",
    costBreakdown: "लागत का विवरण",
    totalFor: "कुल",
    category: "श्रेणी",
    detail: "विवरण",
    amount: "राशि",
    totalCost: "कुल लागत",
    estimatedProfit: "अनुमानित लाभ",
    fullCycle: "पूरे चक्र की गणना",
    yieldPerAcre: "प्रति एकड़ उपज",
    totalYield: "कुल उपज",
    marketPrice: "बाजार भाव",
    grossRevenue: "कुल आय",
    netProfit: "शुद्ध लाभ",
    roi: "आरओआई",
    assumptions: "अनुमान",
    proTips: "उपयोगी सुझाव",
    estimatedYield: "अनुमानित उपज",
    grossRevenueKpi: "कुल आय",
    totalCostKpi: "कुल लागत",
    netProfitKpi: "शुद्ध लाभ",
    categories: "श्रेणियां",
    quintal: "क्विंटल",
    option: "विकल्प",
    forYourLand: "आपकी भूमि के लिए:",
    dose20L: "20 लीटर पंप की मात्रा:",
    purpose: "उद्देश्य:",
    price: "कीमत:",
    window: "समय-सीमा:",
    indicators: "संकेत:",
    postHarvestLabel: "कटाई के बाद:",
    tips: "सुझाव",
    planTitle: "फार्म प्लान",
    generatedSeasonal: "मौसम आधारित योजना तैयार की गई",
  },
  kn: {
    title: "ಫಾರ್ಮ್ ಪ್ಲಾನರ್",
    subtitle: "ನಿಮ್ಮ ಬೆಳೆಗೆ ಋತುಮಾನ ಆಧಾರಿತ ಯೋಜನೆ — ಕ್ಯಾಲೆಂಡರ್, ಒಳಾಂಶಗಳು, ವೆಚ್ಚ ಮತ್ತು ಲಾಭದ ಅಂದಾಜು.",
    crop: "ಬೆಳೆ",
    state: "ರಾಜ್ಯ",
    district: "ಜಿಲ್ಲೆ",
    landSize: "ಭೂಮಿ ಗಾತ್ರ (ಎಕರೆ)",
    soilType: "ಮಣ್ಣಿನ ವಿಧ",
    irrigationSource: "ನೀರಾವರಿ ಮೂಲ",
    sowingDate: "ಬಿತ್ತನೆ ದಿನಾಂಕ",
    cropPlaceholder: "ಟೊಮ್ಯಾಟೊ, ಹತ್ತಿ, ಗೋಧಿ…",
    statePlaceholder: "ಮಹಾರಾಷ್ಟ್ರ",
    districtPlaceholder: "ಬುಲ್ಧಾಣಾ",
    generating: "ಯೋಜನೆ ಸಿದ್ಧವಾಗುತ್ತಿದೆ…",
    generate: "ಫಾರ್ಮ್ ಪ್ಲಾನ್ ರಚಿಸಿ",
    downloadPdf: "PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    building: "ನಿಮ್ಮ ಋತುಮಾನ ಯೋಜನೆಯನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ… ಇದಕ್ಕೆ ಒಂದು ನಿಮಿಷದವರೆಗೆ ಬೇಕಾಗಬಹುದು.",
    farmPlanReady: "ಫಾರ್ಮ್ ಪ್ಲಾನ್ ಸಿದ್ಧವಾಗಿದೆ!",
    fillRequired: "ದಯವಿಟ್ಟು ಬೆಳೆ, ರಾಜ್ಯ, ಜಿಲ್ಲೆ ಮತ್ತು ಬಿತ್ತನೆ ದಿನಾಂಕವನ್ನು ನಮೂದಿಸಿ.",
    failed: "ಯೋಜನೆ ಸಿದ್ಧಪಡಿಸಲು ವಿಫಲವಾಗಿದೆ",
    seasonalPlan: "ಋತುಮಾನ ಫಾರ್ಮ್ ಪ್ಲಾನ್",
    cropCalendar: "ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್",
    cropCalendarSub: "ಪೂರ್ಣ ಋತುವಿನ ಬೆಳವಣಿಗೆ ಹಂತಗಳು",
    irrigationSchedule: "ನೀರಾವರಿ ವೇಳಾಪಟ್ಟಿ",
    irrigationSub: "ಯಾವಾಗ ಮತ್ತು ಎಷ್ಟು ನೀರು ನೀಡಬೇಕು",
    fertilizerSchedule: "ರಸಗೊಬ್ಬರ ವೇಳಾಪಟ್ಟಿ",
    fertilizerSub: "20L ಸ್ಪ್ರೇಯರ್‌ಗೆ 2 ಉತ್ಪನ್ನ ಆಯ್ಕೆಗಳು ಮತ್ತು ಪ್ರಮಾಣ",
    pestMonitoring: "ಕೀಟ ಮೇಲ್ವಿಚಾರಣೆ",
    pestSub: "ಕೀಟ ಸಮಸ್ಯೆಗಳು ಮತ್ತು ಚಿಕಿತ್ಸಾ ಆಯ್ಕೆಗಳು",
    diseasePrevention: "ರೋಗ ತಡೆಗಟ್ಟುವಿಕೆ",
    diseaseSub: "ನಿಮ್ಮ ಬೆಳೆಯಲ್ಲಿ ಸಾಮಾನ್ಯ ರೋಗಗಳನ್ನು ತಡೆಯಿರಿ",
    harvestTimeline: "ಕೊಯ್ಲು ಸಮಯರೇಖೆ",
    readyIndicators: "ಕೊಯ್ಲಿಗೆ ಸಿದ್ಧವಾಗಿರುವ ಸೂಚನೆಗಳು",
    postHarvest: "ಕೊಯ್ಲಿನ ನಂತರದ ನಿರ್ವಹಣೆ",
    costBreakdown: "ವೆಚ್ಚದ ವಿವರ",
    totalFor: "ಒಟ್ಟು",
    category: "ವರ್ಗ",
    detail: "ವಿವರ",
    amount: "ಮೊತ್ತ",
    totalCost: "ಒಟ್ಟು ವೆಚ್ಚ",
    estimatedProfit: "ಅಂದಾಜು ಲಾಭ",
    fullCycle: "ಪೂರ್ಣ ಚಕ್ರದ ಲೆಕ್ಕಾಚಾರ",
    yieldPerAcre: "ಪ್ರತಿ ಎಕರೆಗೆ ಇಳುವರಿ",
    totalYield: "ಒಟ್ಟು ಇಳುವರಿ",
    marketPrice: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ",
    grossRevenue: "ಒಟ್ಟು ಆದಾಯ",
    netProfit: "ನಿವ್ವಳ ಲಾಭ",
    roi: "ROI",
    assumptions: "ಅಂದಾಜುಗಳು",
    proTips: "ಉಪಯುಕ್ತ ಸಲಹೆಗಳು",
    estimatedYield: "ಅಂದಾಜು ಇಳುವರಿ",
    grossRevenueKpi: "ಒಟ್ಟು ಆದಾಯ",
    totalCostKpi: "ಒಟ್ಟು ವೆಚ್ಚ",
    netProfitKpi: "ನಿವ್ವಳ ಲಾಭ",
    categories: "ವರ್ಗಗಳು",
    quintal: "ಕ್ವಿಂಟಲ್",
    option: "ಆಯ್ಕೆ",
    forYourLand: "ನಿಮ್ಮ ಭೂಮಿಗೆ:",
    dose20L: "20L ಪಂಪ್‌ಗೆ ಪ್ರಮಾಣ:",
    purpose: "ಉದ್ದೇಶ:",
    price: "ಬೆಲೆ:",
    window: "ಸಮಯಾವಧಿ:",
    indicators: "ಸೂಚನೆಗಳು:",
    postHarvestLabel: "ಕೊಯ್ಲಿನ ನಂತರ:",
    tips: "ಸಲಹೆಗಳು",
    planTitle: "ಫಾರ್ಮ್ ಪ್ಲಾನ್",
    generatedSeasonal: "ಋತುಮಾನ ಯೋಜನೆ ರಚಿಸಲಾಗಿದೆ",
  },
  ta: {
    title: "பண்ணை திட்டமிடுபவர்",
    subtitle: "உங்கள் பயிருக்கான பருவகால திட்டம் — காலண்டர், உள்ளீடுகள், செலவுகள் மற்றும் லாப மதிப்பீடு.",
    crop: "பயிர்",
    state: "மாநிலம்",
    district: "மாவட்டம்",
    landSize: "நில அளவு (ஏக்கர்)",
    soilType: "மண் வகை",
    irrigationSource: "நீர்ப்பாசன மூலம்",
    sowingDate: "விதைப்பு தேதி",
    cropPlaceholder: "தக்காளி, பருத்தி, கோதுமை…",
    statePlaceholder: "மகாராஷ்டிரா",
    districtPlaceholder: "புல்தானா",
    generating: "திட்டம் தயாராகிறது…",
    generate: "பண்ணை திட்டத்தை உருவாக்கவும்",
    downloadPdf: "PDF பதிவிறக்கவும்",
    building: "உங்கள் பருவகால திட்டம் தயாராகிறது… இதற்கு ஒரு நிமிடம் வரை ஆகலாம்.",
    farmPlanReady: "பண்ணை திட்டம் தயாராக உள்ளது!",
    fillRequired: "பயிர், மாநிலம், மாவட்டம் மற்றும் விதைப்பு தேதியை நிரப்பவும்.",
    failed: "திட்டத்தை உருவாக்க முடியவில்லை",
    seasonalPlan: "பருவகால பண்ணை திட்டம்",
    cropCalendar: "பயிர் காலண்டர்",
    cropCalendarSub: "முழு பருவத்தின் வளர்ச்சி நிலைகள்",
    irrigationSchedule: "நீர்ப்பாசன அட்டவணை",
    irrigationSub: "எப்போது மற்றும் எவ்வளவு நீர் வழங்க வேண்டும்",
    fertilizerSchedule: "உர அட்டவணை",
    fertilizerSub: "20L தெளிப்பானுக்கான 2 தயாரிப்பு விருப்பங்கள் மற்றும் அளவு",
    pestMonitoring: "பூச்சி கண்காணிப்பு",
    pestSub: "பூச்சி பிரச்சினைகள் மற்றும் சிகிச்சை விருப்பங்கள்",
    diseasePrevention: "நோய் தடுப்பு",
    diseaseSub: "உங்கள் பயிரில் பொதுவான நோய்களைத் தடுக்கவும்",
    harvestTimeline: "அறுவடை காலவரிசை",
    readyIndicators: "அறுவடைக்கு தயாரான அறிகுறிகள்",
    postHarvest: "அறுவடைக்குப் பிந்தைய மேலாண்மை",
    costBreakdown: "செலவு விவரம்",
    totalFor: "மொத்தம்",
    category: "வகை",
    detail: "விவரம்",
    amount: "தொகை",
    totalCost: "மொத்த செலவு",
    estimatedProfit: "மதிப்பிடப்பட்ட லாபம்",
    fullCycle: "முழு சுழற்சி கணக்கீடு",
    yieldPerAcre: "ஏக்கருக்கு மகசூல்",
    totalYield: "மொத்த மகசூல்",
    marketPrice: "சந்தை விலை",
    grossRevenue: "மொத்த வருவாய்",
    netProfit: "நிகர லாபம்",
    roi: "ROI",
    assumptions: "அனுமானங்கள்",
    proTips: "பயனுள்ள குறிப்புகள்",
    estimatedYield: "மதிப்பிடப்பட்ட மகசூல்",
    grossRevenueKpi: "மொத்த வருவாய்",
    totalCostKpi: "மொத்த செலவு",
    netProfitKpi: "நிகர லாபம்",
    categories: "வகைகள்",
    quintal: "குவிண்டால்",
    option: "விருப்பம்",
    forYourLand: "உங்கள் நிலத்திற்கு:",
    dose20L: "20L பம்ப் அளவு:",
    purpose: "நோக்கம்:",
    price: "விலை:",
    window: "காலவரம்பு:",
    indicators: "அறிகுறிகள்:",
    postHarvestLabel: "அறுவடைக்குப் பின்:",
    tips: "குறிப்புகள்",
    planTitle: "பண்ணை திட்டம்",
    generatedSeasonal: "பருவகால திட்டம் உருவாக்கப்பட்டது",
  },
} as const;

function getPlannerTranslations(language: string) {
  return PLANNER_TRANSLATIONS[
    language as keyof typeof PLANNER_TRANSLATIONS
  ] ?? PLANNER_TRANSLATIONS.en;
}


function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function inr(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function FarmPlannerPage() {
  const run = useServerFn(generateFarmPlan);
  const { language } = useLanguage();
  const t = getPlannerTranslations(language);

  const [form, setForm] = useState<PlannerInput>({
    crop: "Tomato",
    state: "Maharashtra",
    district: "",
    landSizeAcres: 1,
    soilType: "Black (Regur)",
    irrigationSource: "Drip",
    sowingDate: todayISO(),
  });

  const [plan, setPlan] = useState<FarmPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const update = <K extends keyof PlannerInput>(
    k: K,
    v: PlannerInput[K],
  ) => setForm((f) => ({ ...f, [k]: v }));

  const onGenerate = async () => {
    if (
      !form.crop ||
      !form.state ||
      !form.district ||
      !form.sowingDate
    ) {
      toast.error(
        t.fillRequired,
      );
      return;
    }

    setLoading(true);
    setPlan(null);

    try {
      const p = await run({ data: { ...form, language } as PlannerInput });
      setPlan(p);
      toast.success(t.farmPlanReady);
    } catch (e) {
      console.error(e);
      toast.error(
        e instanceof Error
          ? e.message
          : t.failed,
      );
    } finally {
      setLoading(false);
    }
  };

  const onDownloadPdf = async () => {
    if (!plan) return;

    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF({
      unit: "pt",
      format: "a4",
    });

    const pageW = doc.internal.pageSize.getWidth();
    const margin = 40;
    let y = margin;

    const line = (
      text: string,
      size = 10,
      bold = false,
      color: [number, number, number] = [30, 30, 30],
    ) => {
      if (y > 780) {
        doc.addPage();
        y = margin;
      }

      doc.setFont(
        "helvetica",
        bold ? "bold" : "normal",
      );

      doc.setFontSize(size);
      doc.setTextColor(
        color[0],
        color[1],
        color[2],
      );

      const wrapped = doc.splitTextToSize(
        text,
        pageW - margin * 2,
      );

      doc.text(wrapped, margin, y);
      y += wrapped.length * (size + 3);
    };

    const gap = (n = 8) => (y += n);

    const hr = () => {
      if (y > 780) {
        doc.addPage();
        y = margin;
      }

      doc.setDrawColor(200);
      doc.line(
        margin,
        y,
        pageW - margin,
        y,
      );
      y += 10;
    };

    line(
      t.planTitle + " — " + t.seasonalPlan,
      18,
      true,
      [20, 100, 60],
    );

    line(
      `${plan.crop}  •  ${plan.location}  •  ${plan.landSizeAcres} acres  •  ${plan.season}`,
      10,
      false,
      [90, 90, 90],
    );

    gap();

    line(plan.summary, 10);

    hr();

    line(
      t.cropCalendar,
      14,
      true,
      [20, 80, 140],
    );

    plan.calendar.forEach((s) => {
      line(
        `• ${s.stage}  (${fmtDate(s.startDate)} → ${fmtDate(s.endDate)})`,
        11,
        true,
      );

      s.activities.forEach((a) =>
        line(`   – ${a}`, 10),
      );
    });

    hr();

    line(
      t.irrigationSchedule,
      14,
      true,
      [20, 80, 140],
    );

    plan.irrigation.forEach((i) =>
      line(
        `• ${fmtDate(i.date)} — ${i.stage} — ${i.method} — ${i.quantity}. ${i.notes}`,
        10,
      ),
    );

    hr();

    const scheduleBlock = (
      title: string,
      items: ScheduleItem[],
    ) => {
      line(
        title,
        14,
        true,
        [20, 80, 140],
      );

      items.forEach((it) => {
        line(
          `• ${fmtDate(it.date)} — ${it.stage}${it.problem ? ` — ${it.problem}` : ""}`,
          11,
          true,
        );

        line(
          `${t.purpose} ${it.purpose}`,
          10,
        );

        it.options.forEach((o, idx) => {
          line(
            `${t.option} ${idx + 1}: ${o.name}`,
            10,
            true,
          );

          line(
            `${t.price} ${o.price}  |  ${t.forYourLand} ${o.quantityForLand}  |  ${t.dose20L} ${o.dosePer20LPump}`,
            9,
          );

          if (o.notes) {
            line(
              `     Note: ${o.notes}`,
              9,
            );
          }
        });
      });

      hr();
    };

    scheduleBlock(
      t.fertilizerSchedule,
      plan.fertilizer,
    );

    scheduleBlock(
      t.pestMonitoring,
      plan.pest,
    );

    scheduleBlock(
      t.diseasePrevention,
      plan.disease,
    );

    line(
      t.harvestTimeline,
      14,
      true,
      [20, 80, 140],
    );

    line(
      `${t.window} ${fmtDate(plan.harvest.fromDate)} → ${fmtDate(plan.harvest.toDate)}`,
      10,
    );

    line(
      t.indicators,
      10,
      true,
    );

    plan.harvest.indicators.forEach((x) =>
      line(`  • ${x}`, 10),
    );

    line(
      t.postHarvestLabel,
      10,
      true,
    );

    plan.harvest.postHarvest.forEach((x) =>
      line(`  • ${x}`, 10),
    );

    hr();

    line(
      t.costBreakdown,
      14,
      true,
      [20, 80, 140],
    );

    let total = 0;

    plan.costs.forEach((c) => {
      total += c.amount;

      line(
        `• ${c.category}: ${inr(c.amount)} — ${c.detail}`,
        10,
      );
    });

    line(
      `${t.totalCost}: ${inr(total)}`,
      11,
      true,
    );

    hr();

    line(
      t.estimatedProfit,
      14,
      true,
      [20, 80, 140],
    );

    line(
      `${t.yieldPerAcre}: ${plan.profit.yieldQuintalPerAcre} q/acre × ${plan.landSizeAcres} acres = ${plan.profit.totalYieldQuintal} q`,
      10,
    );

    line(
      `${t.marketPrice}: ${inr(plan.profit.marketPricePerQuintal)}/q`,
      10,
    );

    line(
      `${t.grossRevenue}: ${inr(plan.profit.grossRevenue)}`,
      10,
    );

    line(
      `${t.totalCost}: ${inr(plan.profit.totalCost)}`,
      10,
    );

    line(
      `${t.netProfit}: ${inr(plan.profit.netProfit)}  |  ${t.roi}: ${plan.profit.roiPercent}%`,
      11,
      true,
      [20, 120, 60],
    );

    plan.profit.assumptions.forEach((a) =>
      line(`  • ${a}`, 9, false, [
        110,
        110,
        110,
      ]),
    );

    if (plan.tips.length) {
      hr();

      line(
        t.tips,
        14,
        true,
        [20, 80, 140],
      );

      plan.tips.forEach((t) =>
        line(`• ${t}`, 10),
      );
    }

    const filename = `FarmPlan-${plan.crop}-${plan.location.replace(/\s+/g, "_")}.pdf`;

    doc.save(filename);

    const { saveGeneratedReport } = await import(
      "@/lib/reports/save-client"
    );

    await saveGeneratedReport({
      title: `Farm Plan — ${plan.crop} (${plan.location})`,
      kind: "farm-plan",
      summary: `${plan.landSizeAcres} acres • ${plan.season} • Net profit ${inr(plan.profit.netProfit)}`,
      doc,
      activityDetail: `Generated seasonal plan for ${plan.crop}`,
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

      {/* Form */}
      <Card className="glass mb-6 border-0">
        <CardContent className="p-5">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Field label={t.crop}>
              <Input
                value={form.crop}
                onChange={(e) =>
                  update("crop", e.target.value)
                }
                placeholder={t.cropPlaceholder}
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

            <Field label={t.landSize}>
              <Input
                type="number"
                min={0.1}
                step={0.1}
                value={form.landSizeAcres}
                onChange={(e) =>
                  update(
                    "landSizeAcres",
                    parseFloat(e.target.value) || 0,
                  )
                }
              />
            </Field>

            <Field label={t.soilType}>
              <Select
                value={form.soilType}
                onValueChange={(v) =>
                  update("soilType", v)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {SOIL_TYPES.map((s) => (
                    <SelectItem
                      key={s}
                      value={s}
                    >
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={t.irrigationSource}>
              <Select
                value={form.irrigationSource}
                onValueChange={(v) =>
                  update("irrigationSource", v)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {IRRIGATION_SOURCES.map((s) => (
                    <SelectItem
                      key={s}
                      value={s}
                    >
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={t.sowingDate}>
              <Input
                type="date"
                value={form.sowingDate}
                onChange={(e) =>
                  update(
                    "sowingDate",
                    e.target.value,
                  )
                }
              />
            </Field>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              onClick={onGenerate}
              disabled={loading}
              className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sprout className="mr-2 h-4 w-4" />
              )}

              {loading
                ? t.generating
                : t.generate}
            </Button>

            {plan && (
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
            Building your seasonal plan… this may take up to
            a minute.
          </p>
        </div>
      )}

      {plan && !loading && (
        <PlanView plan={plan} language={language} />
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

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="rounded-md bg-accent/15 p-1.5 text-accent">
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <h2 className="font-display text-base font-semibold">
          {title}
        </h2>

        {subtitle && (
          <p className="text-xs text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function TimelineDot() {
  return (
    <span className="absolute left-[-25px] top-2 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-background" />
  );
}

function PlanView({
  plan,
  language,
}: {
  plan: FarmPlan;
  language: string;
}) {
  const t = getPlannerTranslations(language);
  const totalCost = plan.costs.reduce(
    (s, c) => s + c.amount,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="glass border-0">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge
              variant="secondary"
              className="gap-1"
            >
              <Sprout className="h-3 w-3" />
              {plan.crop}
            </Badge>

            <Badge
              variant="secondary"
              className="gap-1"
            >
              <MapPin className="h-3 w-3" />
              {plan.location}
            </Badge>

            <Badge
              variant="secondary"
              className="gap-1"
            >
              <Layers className="h-3 w-3" />
              {plan.landSizeAcres} acres
            </Badge>

            <Badge
              variant="secondary"
              className="gap-1"
            >
              <Calendar className="h-3 w-3" />
              {plan.season}
            </Badge>
          </div>

          <p className="mt-3 text-sm">
            {plan.summary}
          </p>
        </CardContent>
      </Card>

      {/* Quick KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Kpi
          icon={TrendingUp}
          label={t.estimatedYield}
          value={`${plan.profit.totalYieldQuintal} q`}
          sub={`${plan.profit.yieldQuintalPerAcre} q/acre`}
        />

        <Kpi
          icon={IndianRupee}
          label={t.grossRevenueKpi}
          value={inr(plan.profit.grossRevenue)}
          sub={`@ ${inr(plan.profit.marketPricePerQuintal)}/q`}
        />

        <Kpi
          icon={Wallet}
          label={t.totalCostKpi}
          value={inr(totalCost)}
          sub={`${plan.costs.length} ${t.categories}`}
        />

        <Kpi
          icon={TrendingUp}
          label={t.netProfitKpi}
          value={inr(plan.profit.netProfit)}
          sub={`ROI ${plan.profit.roiPercent}%`}
          highlight
        />
      </div>

      {/* Crop Calendar */}
      <Card className="glass border-0">
        <CardContent className="p-5">
          <SectionHeader
            icon={Calendar}
            title={t.cropCalendar}
            subtitle={t.cropCalendarSub}
          />

          <ol className="relative ml-2 space-y-4 border-l border-border pl-7">
            {plan.calendar.map((s, i) => (
              <li
                key={i}
                className="relative"
              >
                <TimelineDot />

                <div className="flex flex-wrap items-baseline gap-2">
                  <div className="text-sm font-semibold">
                    {s.stage}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {fmtDate(s.startDate)} →{" "}
                    {fmtDate(s.endDate)}
                  </div>
                </div>

                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm text-muted-foreground">
                  {s.activities.map((a, j) => (
                    <li key={j}>{a}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Irrigation */}
      <Card className="glass border-0">
        <CardContent className="p-5">
          <SectionHeader
            icon={Droplets}
            title={t.irrigationSchedule}
            subtitle={t.irrigationSub}
          />

          <ol className="relative ml-2 space-y-3 border-l border-border pl-5">
            {plan.irrigation.map((i, idx) => (
              <li
                key={idx}
                className="relative"
              >
                <TimelineDot />

                <div className="flex flex-wrap items-baseline gap-2">
                  <div className="text-sm font-semibold">
                    {fmtDate(i.date)}
                  </div>

                  <Badge
                    variant="outline"
                    className="text-[10px]"
                  >
                    {i.stage}
                  </Badge>

                  <Badge
                    variant="outline"
                    className="text-[10px]"
                  >
                    {i.method}
                  </Badge>

                  <div className="text-xs text-muted-foreground">
                    {i.quantity}
                  </div>
                </div>

                {i.notes && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {i.notes}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <ScheduleCard
        language={language}
        icon={FlaskConical}
        title={t.fertilizerSchedule}
        subtitle={t.fertilizerSub}
        items={plan.fertilizer}
      />

      <ScheduleCard
        language={language}
        icon={Bug}
        title={t.pestMonitoring}
        subtitle={t.pestSub}
        items={plan.pest}
      />

      <ScheduleCard
        language={language}
        icon={ShieldAlert}
        title={t.diseasePrevention}
        subtitle={t.diseaseSub}
        items={plan.disease}
      />

      {/* Harvest */}
      <Card className="glass border-0">
        <CardContent className="p-5">
          <SectionHeader
            icon={Scissors}
            title={t.harvestTimeline}
            subtitle={`${fmtDate(plan.harvest.fromDate)} → ${fmtDate(plan.harvest.toDate)}`}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.readyIndicators}
              </div>

              <ul className="list-disc space-y-1 pl-4 text-sm">
                {plan.harvest.indicators.map(
                  (x, i) => (
                    <li key={i}>{x}</li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.postHarvest}
              </div>

              <ul className="list-disc space-y-1 pl-4 text-sm">
                {plan.harvest.postHarvest.map(
                  (x, i) => (
                    <li key={i}>{x}</li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Costs */}
      <Card className="glass border-0">
        <CardContent className="p-5">
          <SectionHeader
            icon={Wallet}
            title={t.costBreakdown}
            subtitle={`${t.totalFor} ${plan.landSizeAcres} acres`}
          />

          <div className="overflow-hidden rounded-lg border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">
                    {t.category}
                  </th>
                  <th className="px-3 py-2 text-left">
                    {t.detail}
                  </th>
                  <th className="px-3 py-2 text-right">
                    {t.amount}
                  </th>
                </tr>
              </thead>

              <tbody>
                {plan.costs.map((c, i) => (
                  <tr
                    key={i}
                    className="border-t border-border/60"
                  >
                    <td className="px-3 py-2 font-medium">
                      {c.category}
                    </td>

                    <td className="px-3 py-2 text-muted-foreground">
                      {c.detail}
                    </td>

                    <td className="px-3 py-2 text-right tabular-nums">
                      {inr(c.amount)}
                    </td>
                  </tr>
                ))}

                <tr className="border-t border-border/60 bg-white/[0.03]">
                  <td
                    className="px-3 py-2 font-semibold"
                    colSpan={2}
                  >
                    {t.totalCost}
                  </td>

                  <td className="px-3 py-2 text-right font-semibold tabular-nums">
                    {inr(totalCost)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Profit */}
      <Card className="glass border-0">
        <CardContent className="p-5">
          <SectionHeader
            icon={TrendingUp}
            title={t.estimatedProfit}
            subtitle={t.fullCycle}
          />

          <div className="grid gap-2 text-sm">
            <Row
              label={t.yieldPerAcre}
              value={`${plan.profit.yieldQuintalPerAcre} quintal`}
            />

            <Row
              label={`${t.totalYield} (${plan.landSizeAcres} acres)`}
              value={`${plan.profit.totalYieldQuintal} quintal`}
            />

            <Row
              label={t.marketPrice}
              value={`${inr(plan.profit.marketPricePerQuintal)} / quintal`}
            />

            <Row
              label={t.grossRevenue}
              value={inr(plan.profit.grossRevenue)}
            />

            <Row
              label={t.totalCost}
              value={inr(plan.profit.totalCost)}
            />

            <div className="mt-2 flex items-center justify-between rounded-lg border border-accent/30 bg-accent/10 px-3 py-2">
              <div className="text-sm font-semibold">
                {t.netProfit}
              </div>

              <div className="text-lg font-bold text-accent">
                {inr(plan.profit.netProfit)}{" "}
                <span className="text-xs font-medium text-muted-foreground">
                  • ROI {plan.profit.roiPercent}%
                </span>
              </div>
            </div>
          </div>

          {plan.profit.assumptions.length > 0 && (
            <div className="mt-4">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.assumptions}
              </div>

              <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
                {plan.profit.assumptions.map(
                  (a, i) => (
                    <li key={i}>{a}</li>
                  ),
                )}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      {plan.tips.length > 0 && (
        <Card className="glass border-0">
          <CardContent className="p-5">
            <SectionHeader
              icon={Lightbulb}
              title={t.proTips}
            />

            <ul className="list-disc space-y-1 pl-4 text-sm">
              {plan.tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
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
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>

        <div className="mt-1 font-display text-xl font-semibold">
          {value}
        </div>

        {sub && (
          <div className="text-xs text-muted-foreground">
            {sub}
          </div>
        )}
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

function ScheduleCard({
  language,
  icon,
  title,
  subtitle,
  items,
}: {
  language: string;
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  items: ScheduleItem[];
}) {
  const t = getPlannerTranslations(language);

  return (
    <Card className="glass border-0">
      <CardContent className="p-5">
        <SectionHeader
          icon={icon}
          title={title}
          subtitle={subtitle}
        />

        <ol className="relative ml-2 space-y-5 border-l border-border pl-5">
          {items.map((it, idx) => (
            <li
              key={idx}
              className="relative"
            >
              <TimelineDot />

              <div className="flex flex-wrap items-baseline gap-2">
                <div className="text-sm font-semibold">
                  {fmtDate(it.date)}
                </div>

                <Badge
                  variant="outline"
                  className="text-[10px]"
                >
                  {it.stage}
                </Badge>

                {it.problem && (
                  <Badge
                    variant="secondary"
                    className="text-[10px]"
                  >
                    {it.problem}
                  </Badge>
                )}
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                {it.purpose}
              </p>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {it.options.map((o, oi) => (
                  <div
                    key={oi}
                    className="rounded-lg border border-border/60 bg-white/[0.02] p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold">
                        {t.option} {oi + 1}: {o.name}
                      </div>

                      <Badge className="bg-accent/15 text-accent hover:bg-accent/20">
                        {o.price}
                      </Badge>
                    </div>

                    <div className="mt-2 grid gap-1 text-xs">
                      <div>
                        <span className="text-muted-foreground">
                          {t.forYourLand}{" "}
                        </span>

                        <span className="font-medium">
                          {o.quantityForLand}
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-foreground">
                          {t.dose20L}{" "}
                        </span>

                        <span className="font-medium">
                          {o.dosePer20LPump}
                        </span>
                      </div>

                      {o.notes && (
                        <div className="text-muted-foreground">
                          {o.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}