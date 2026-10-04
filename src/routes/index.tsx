import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import {
  ArrowRight,
  Sparkles,
  ScanLine,
  CloudSun,
  Landmark,
  LineChart,
  MessageSquare,
  ShieldCheck,
  Globe,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Logo } from "@/components/agriassist/Logo";
import { supabase } from "@/integrations/supabase/client";
import {
  clearAuthRedirectParams,
  completeAuthRedirect,
  hasAuthRedirectParams,
} from "@/lib/auth-redirect";
import heroImg from "@/assets/hero-farm.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "AgriAssist AI — AI for Indian Farmers",
      },
      {
        name: "description",
        content:
          "AI-powered guidance built for Indian farmers. Diagnose crop disease, get weather-aware advice, mandi prices and government schemes — in your language.",
      },
      {
        property: "og:title",
        content: "AgriAssist AI — AI for Indian Farmers",
      },
      {
        property: "og:description",
        content: "The AI operating system for Indian agriculture.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: MessageSquare, key: "chat" },
  { icon: ScanLine, key: "disease" },
  { icon: CloudSun, key: "weather" },
  { icon: Landmark, key: "schemes" },
  { icon: LineChart, key: "market" },
  { icon: ShieldCheck, key: "private" },
];

const STEPS = [
  { n: "01", key: "step1" },
  { n: "02", key: "step2" },
  { n: "03", key: "step3" },
];

const BENEFITS = ["benefit1","benefit2","benefit3","benefit4","benefit5","benefit6"];

const FAQ = [
  { key: "faq1" },
  { key: "faq2" },
  { key: "faq3" },
  { key: "faq4" },
  { key: "faq5" },
];

const LANDING_TRANSLATIONS = {
  en: {
    features:"Features", how:"How it works", faq:"FAQ", signIn:"Sign in", getStarted:"Get started",
    builtFor:"Built for Indian farmers 🇮🇳", hero1:"AI that speaks", hero2:"your farm's", hero3:"language.",
    heroDesc:"AgriAssist AI helps Indian farmers diagnose crop diseases, plan around the monsoon, track mandi prices and discover Kisan schemes — all in one place, in your language.",
    learnMore:"Learn more", featuresTitle:"Everything an Indian farm needs, in one chat.",
    featuresDesc:"From crop health to weather, markets and government schemes, AgriAssist AI brings essential farming intelligence together.",
    howTitle:"From question to decision, in seconds.", benefits:"Benefits",
    benefitsTitle:"Grow more. Waste less. Farm smarter.",
    benefitsDesc:"AgriAssist AI is designed around the real decisions farmers make every day — from crop health and irrigation to markets and government support.",
    openAI:"Open AgriAssist AI", workspace:"See the workspace", faqTitle:"Questions, answered.",
    ctaTitle:"Ready to make better farming decisions?", ctaDesc:"Access AI-powered crop, weather, market and government scheme assistance in one farming workspace.", openWorkspace:"Open workspace",
    chatTitle:"AI Chat Assistant", chatDesc:"Ask anything about your farm — in Hindi, Kannada, Tamil or English.",
    diseaseTitle:"Crop Disease Scanner", diseaseDesc:"Snap a leaf. AgriAssist AI identifies the disease and suggests a remedy that works in India.",
    weatherTitle:"Monsoon & Weather", weatherDesc:"Weather-aware guidance for smarter irrigation, spraying and harvest.",
    schemesTitle:"Government Schemes", schemesDesc:"Discover Kisan schemes, subsidies and insurance you may qualify for.",
    marketTitle:"Mandi Prices", marketDesc:"Track mandi rates and get sell-timing guidance for your crop.",
    privateTitle:"Private by Design", privateDesc:"Your farm data stays yours. Your conversations are protected.",
    step1Title:"Set up your farm", step1Desc:"Tell AgriAssist AI about your crops, soil and district. Takes under a minute.",
    step2Title:"Ask or upload", step2Desc:"Type a question, upload a photo of a leaf, or use voice — in your language.",
    step3Title:"Act with confidence", step3Desc:"Get a clear recommendation with reasoning tailored to Indian conditions.",
    benefit1:"Reduce crop loss with early disease detection", benefit2:"Save water with smart irrigation timing", benefit3:"Unlock Kisan subsidies you may qualify for", benefit4:"Sell at the right price with mandi guidance", benefit5:"Works in हिन्दी, ಕನ್ನಡ, தமிழ் & English", benefit6:"One workspace for every farming decision",
    faq1q:"Is AgriAssist AI free to use?", faq1a:"Yes. AgriAssist AI is completely free to use. Sign in to access the AI tools and your personalized farming workspace.",
    faq2q:"Does it work in Indian languages?", faq2a:"Yes. AgriAssist AI supports English, Hindi, Kannada and Tamil.",
    faq3q:"Do I need internet all the time?", faq3a:"You need internet for AI features, while some essential information and past reports can remain available in the application.",
    faq4q:"How accurate is the disease detection?", faq4a:"AgriAssist AI provides AI-based disease analysis to help identify common crop problems. Always confirm major treatment decisions with a qualified agricultural expert.",
    faq5q:"Is my data safe?", faq5a:"Yes. Your farming information is protected, and you can manage your information through the application.",
    footer1:"Built for smart farming in India 🇮🇳",
  },
  hi: {
    features:"सुविधाएँ", how:"यह कैसे काम करता है", faq:"सामान्य प्रश्न", signIn:"साइन इन", getStarted:"शुरू करें", builtFor:"भारतीय किसानों के लिए बनाया गया 🇮🇳",
    hero1:"AI जो बोलता है", hero2:"आपके खेत की", hero3:"भाषा।", heroDesc:"AgriAssist AI भारतीय किसानों को फसल रोग पहचानने, मानसून के अनुसार योजना बनाने, मंडी भाव देखने और किसान योजनाएँ जानने में मदद करता है — आपकी भाषा में, एक ही जगह।",
    learnMore:"और जानें", featuresTitle:"एक भारतीय खेत के लिए जरूरी सब कुछ, एक ही चैट में।", featuresDesc:"फसल स्वास्थ्य से लेकर मौसम, बाजार और सरकारी योजनाओं तक, AgriAssist AI जरूरी कृषि जानकारी को एक जगह लाता है।",
    howTitle:"सवाल से निर्णय तक, कुछ ही सेकंड में।", benefits:"लाभ", benefitsTitle:"ज्यादा उगाएँ। कम बर्बाद करें। समझदारी से खेती करें।", benefitsDesc:"AgriAssist AI किसानों के रोज़मर्रा के वास्तविक फैसलों को ध्यान में रखकर बनाया गया है — फसल स्वास्थ्य, सिंचाई, बाजार और सरकारी सहायता से लेकर।",
    openAI:"AgriAssist AI खोलें", workspace:"वर्कस्पेस देखें", faqTitle:"आपके सवालों के जवाब।", ctaTitle:"क्या आप खेती के बेहतर फैसले लेने के लिए तैयार हैं?", ctaDesc:"एक ही कृषि वर्कस्पेस में फसल, मौसम, बाजार और सरकारी योजना की AI सहायता पाएँ।", openWorkspace:"वर्कस्पेस खोलें",
    chatTitle:"AI चैट सहायक", chatDesc:"अपने खेत के बारे में कुछ भी पूछें — हिंदी, कन्नड़, तमिल या अंग्रेज़ी में।", diseaseTitle:"फसल रोग स्कैनर", diseaseDesc:"पत्ते की फोटो लें। AgriAssist AI रोग पहचानकर भारत में उपयोगी उपचार सुझाता है।", weatherTitle:"मानसून और मौसम", weatherDesc:"बेहतर सिंचाई, छिड़काव और कटाई के लिए मौसम आधारित मार्गदर्शन।", schemesTitle:"सरकारी योजनाएँ", schemesDesc:"किसान योजनाएँ, सब्सिडी और बीमा खोजें जिनके लिए आप पात्र हो सकते हैं।", marketTitle:"मंडी भाव", marketDesc:"मंडी भाव देखें और अपनी फसल बेचने के सही समय की जानकारी पाएँ।", privateTitle:"गोपनीयता के साथ", privateDesc:"आपके खेत का डेटा आपका ही रहता है। आपकी बातचीत सुरक्षित रहती है।",
    step1Title:"अपना खेत सेट करें", step1Desc:"AgriAssist AI को अपनी फसल, मिट्टी और जिले के बारे में बताएँ। इसमें एक मिनट से भी कम समय लगता है।", step2Title:"पूछें या अपलोड करें", step2Desc:"सवाल लिखें, पत्ते की फोटो अपलोड करें या अपनी भाषा में आवाज़ का उपयोग करें।", step3Title:"विश्वास के साथ निर्णय लें", step3Desc:"भारतीय परिस्थितियों के अनुसार स्पष्ट और उपयोगी सलाह पाएँ।",
    benefit1:"रोग की जल्दी पहचान से फसल नुकसान कम करें", benefit2:"सही सिंचाई समय से पानी बचाएँ", benefit3:"उपलब्ध किसान सब्सिडी की जानकारी पाएँ", benefit4:"मंडी की जानकारी से सही भाव पर बेचें", benefit5:"हिन्दी, ಕನ್ನಡ, தமிழ் और English में उपलब्ध", benefit6:"खेती के हर फैसले के लिए एक वर्कस्पेस",
    faq1q:"क्या AgriAssist AI इस्तेमाल करना मुफ्त है?", faq1a:"हाँ। AgriAssist AI पूरी तरह मुफ्त है। AI टूल्स और आपके व्यक्तिगत कृषि वर्कस्पेस के लिए साइन इन करें।", faq2q:"क्या यह भारतीय भाषाओं में काम करता है?", faq2a:"हाँ। AgriAssist AI अंग्रेज़ी, हिंदी, कन्नड़ और तमिल को सपोर्ट करता है।", faq3q:"क्या हर समय इंटरनेट चाहिए?", faq3a:"AI सुविधाओं के लिए इंटरनेट चाहिए। कुछ जरूरी जानकारी और पुरानी रिपोर्ट ऐप में उपलब्ध रह सकती हैं।", faq4q:"रोग पहचान कितनी सटीक है?", faq4a:"AgriAssist AI सामान्य फसल समस्याओं की पहचान में मदद करने के लिए AI विश्लेषण देता है। बड़े उपचार निर्णय योग्य कृषि विशेषज्ञ से जरूर पुष्टि करें।", faq5q:"क्या मेरा डेटा सुरक्षित है?", faq5a:"हाँ। आपकी कृषि जानकारी सुरक्षित रखी जाती है और आप ऐप के माध्यम से अपनी जानकारी प्रबंधित कर सकते हैं।", footer1:"भारत में स्मार्ट खेती के लिए बनाया गया 🇮🇳",
  },
  kn: {
    features:"ವೈಶಿಷ್ಟ್ಯಗಳು", how:"ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ", faq:"FAQ", signIn:"ಸೈನ್ ಇನ್", getStarted:"ಪ್ರಾರಂಭಿಸಿ", builtFor:"ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ 🇮🇳",
    hero1:"ನಿಮ್ಮ ಹೊಲದ", hero2:"ಭಾಷೆಯನ್ನು ಮಾತನಾಡುವ", hero3:"AI.", heroDesc:"AgriAssist AI ಭಾರತೀಯ ರೈತರಿಗೆ ಬೆಳೆ ರೋಗಗಳನ್ನು ಗುರುತಿಸಲು, ಮಳೆಗಾಲದ ಯೋಜನೆ ಮಾಡಲು, ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ತಿಳಿಯಲು ಮತ್ತು ರೈತ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ — ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ, ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ.",
    learnMore:"ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ", featuresTitle:"ಭಾರತೀಯ ಹೊಲಕ್ಕೆ ಬೇಕಾದ ಎಲ್ಲವೂ ಒಂದೇ ಚಾಟ್‌ನಲ್ಲಿ.", featuresDesc:"ಬೆಳೆ ಆರೋಗ್ಯದಿಂದ ಹವಾಮಾನ, ಮಾರುಕಟ್ಟೆ ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳವರೆಗೆ ಅಗತ್ಯ ಕೃಷಿ ಮಾಹಿತಿಯನ್ನು AgriAssist AI ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ನೀಡುತ್ತದೆ.",
    howTitle:"ಪ್ರಶ್ನೆಯಿಂದ ನಿರ್ಧಾರಕ್ಕೆ, ಕೆಲವೇ ಸೆಕೆಂಡುಗಳಲ್ಲಿ.", benefits:"ಲಾಭಗಳು", benefitsTitle:"ಹೆಚ್ಚು ಬೆಳೆಯಿರಿ. ಕಡಿಮೆ ವ್ಯರ್ಥ ಮಾಡಿ. ಚಾಣಾಕ್ಷವಾಗಿ ಕೃಷಿ ಮಾಡಿ.", benefitsDesc:"ಬೆಳೆ ಆರೋಗ್ಯ, ನೀರಾವರಿ, ಮಾರುಕಟ್ಟೆ ಮತ್ತು ಸರ್ಕಾರಿ ನೆರವು ಸೇರಿದಂತೆ ರೈತರು ಪ್ರತಿದಿನ ತೆಗೆದುಕೊಳ್ಳುವ ನೈಜ ನಿರ್ಧಾರಗಳನ್ನು ಗಮನದಲ್ಲಿಟ್ಟುಕೊಂಡು AgriAssist AI ನಿರ್ಮಿಸಲಾಗಿದೆ.",
    openAI:"AgriAssist AI ತೆರೆಯಿರಿ", workspace:"ವರ್ಕ್‌ಸ್ಪೇಸ್ ನೋಡಿ", faqTitle:"ನಿಮ್ಮ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಗಳು.", ctaTitle:"ಉತ್ತಮ ಕೃಷಿ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಲು ಸಿದ್ಧರಿದ್ದೀರಾ?", ctaDesc:"ಒಂದೇ ಕೃಷಿ ವರ್ಕ್‌ಸ್ಪೇಸ್‌ನಲ್ಲಿ ಬೆಳೆ, ಹವಾಮಾನ, ಮಾರುಕಟ್ಟೆ ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ AI ಸಹಾಯ ಪಡೆಯಿರಿ.", openWorkspace:"ವರ್ಕ್‌ಸ್ಪೇಸ್ ತೆರೆಯಿರಿ",
    chatTitle:"AI ಚಾಟ್ ಸಹಾಯಕ", chatDesc:"ನಿಮ್ಮ ಹೊಲದ ಬಗ್ಗೆ ಏನು ಬೇಕಾದರೂ ಕೇಳಿ — ಕನ್ನಡ, ಹಿಂದಿ, ತಮಿಳು ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ.", diseaseTitle:"ಬೆಳೆ ರೋಗ ಸ್ಕ್ಯಾನರ್", diseaseDesc:"ಎಲೆಯ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ. AgriAssist AI ರೋಗವನ್ನು ಗುರುತಿಸಿ ಭಾರತಕ್ಕೆ ಸೂಕ್ತ ಪರಿಹಾರ ಸೂಚಿಸುತ್ತದೆ.", weatherTitle:"ಮಳೆಗಾಲ ಮತ್ತು ಹವಾಮಾನ", weatherDesc:"ಉತ್ತಮ ನೀರಾವರಿ, ಸಿಂಪಡಣೆ ಮತ್ತು ಕೊಯ್ಲಿಗಾಗಿ ಹವಾಮಾನ ಆಧಾರಿತ ಮಾರ್ಗದರ್ಶನ.", schemesTitle:"ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು", schemesDesc:"ನೀವು ಅರ್ಹರಾಗಿರಬಹುದಾದ ರೈತ ಯೋಜನೆಗಳು, ಸಬ್ಸಿಡಿ ಮತ್ತು ವಿಮೆಯನ್ನು ಹುಡುಕಿ.", marketTitle:"ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು", marketDesc:"ಮಾರುಕಟ್ಟೆ ದರಗಳನ್ನು ನೋಡಿ ಮತ್ತು ಬೆಳೆ ಮಾರಾಟದ ಸರಿಯಾದ ಸಮಯದ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ.", privateTitle:"ಗೌಪ್ಯತೆಯೊಂದಿಗೆ", privateDesc:"ನಿಮ್ಮ ಹೊಲದ ಡೇಟಾ ನಿಮ್ಮದೇ. ನಿಮ್ಮ ಸಂಭಾಷಣೆಗಳು ಸುರಕ್ಷಿತವಾಗಿರುತ್ತವೆ.",
    step1Title:"ನಿಮ್ಮ ಹೊಲವನ್ನು ಹೊಂದಿಸಿ", step1Desc:"ನಿಮ್ಮ ಬೆಳೆ, ಮಣ್ಣು ಮತ್ತು ಜಿಲ್ಲೆಯ ಬಗ್ಗೆ AgriAssist AI ಗೆ ತಿಳಿಸಿ. ಒಂದು ನಿಮಿಷಕ್ಕಿಂತ ಕಡಿಮೆ ಸಮಯ ಬೇಕಾಗುತ್ತದೆ.", step2Title:"ಕೇಳಿ ಅಥವಾ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ", step2Desc:"ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ, ಎಲೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಧ್ವನಿ ಬಳಸಿ.", step3Title:"ವಿಶ್ವಾಸದಿಂದ ನಿರ್ಧರಿಸಿ", step3Desc:"ಭಾರತೀಯ ಪರಿಸ್ಥಿತಿಗೆ ಅನುಗುಣವಾದ ಸ್ಪಷ್ಟ ಸಲಹೆ ಪಡೆಯಿರಿ.",
    benefit1:"ಆರಂಭಿಕ ರೋಗ ಪತ್ತೆಯಿಂದ ಬೆಳೆ ನಷ್ಟ ಕಡಿಮೆ ಮಾಡಿ", benefit2:"ಸರಿಯಾದ ನೀರಾವರಿ ಸಮಯದಿಂದ ನೀರು ಉಳಿಸಿ", benefit3:"ಲಭ್ಯವಿರುವ ರೈತ ಸಬ್ಸಿಡಿಗಳ ಮಾಹಿತಿ ಪಡೆಯಿರಿ", benefit4:"ಮಾರುಕಟ್ಟೆ ಮಾರ್ಗದರ್ಶನದಿಂದ ಸರಿಯಾದ ಬೆಲೆಗೆ ಮಾರಾಟ ಮಾಡಿ", benefit5:"ಹಿಂದಿ, ಕನ್ನಡ, தமிழ் ಮತ್ತು English ನಲ್ಲಿ ಲಭ್ಯ", benefit6:"ಪ್ರತಿ ಕೃಷಿ ನಿರ್ಧಾರಕ್ಕೆ ಒಂದೇ ವರ್ಕ್‌ಸ್ಪೇಸ್",
    faq1q:"AgriAssist AI ಉಚಿತವೇ?", faq1a:"ಹೌದು. AgriAssist AI ಸಂಪೂರ್ಣ ಉಚಿತ. AI ಸಾಧನಗಳು ಮತ್ತು ವೈಯಕ್ತಿಕ ಕೃಷಿ ವರ್ಕ್‌ಸ್ಪೇಸ್‌ಗಾಗಿ ಸೈನ್ ಇನ್ ಮಾಡಿ.", faq2q:"ಇದು ಭಾರತೀಯ ಭಾಷೆಗಳಲ್ಲಿ ಕೆಲಸ ಮಾಡುತ್ತದೆಯೇ?", faq2a:"ಹೌದು. AgriAssist AI ಇಂಗ್ಲಿಷ್, ಹಿಂದಿ, ಕನ್ನಡ ಮತ್ತು ತಮಿಳನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ.", faq3q:"ಯಾವಾಗಲೂ ಇಂಟರ್ನೆಟ್ ಬೇಕೇ?", faq3a:"AI ಸೌಲಭ್ಯಗಳಿಗೆ ಇಂಟರ್ನೆಟ್ ಅಗತ್ಯ. ಕೆಲವು ಅಗತ್ಯ ಮಾಹಿತಿ ಮತ್ತು ಹಳೆಯ ವರದಿಗಳು ಅಪ್ಲಿಕೇಶನ್‌ನಲ್ಲಿ ಲಭ್ಯವಿರಬಹುದು.", faq4q:"ರೋಗ ಪತ್ತೆ ಎಷ್ಟು ನಿಖರ?", faq4a:"ಸಾಮಾನ್ಯ ಬೆಳೆ ಸಮಸ್ಯೆಗಳನ್ನು ಗುರುತಿಸಲು AgriAssist AI AI ಆಧಾರಿತ ವಿಶ್ಲೇಷಣೆ ನೀಡುತ್ತದೆ. ಪ್ರಮುಖ ಚಿಕಿತ್ಸಾ ನಿರ್ಧಾರಗಳನ್ನು ಕೃಷಿ ತಜ್ಞರಿಂದ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.", faq5q:"ನನ್ನ ಡೇಟಾ ಸುರಕ್ಷಿತವೇ?", faq5a:"ಹೌದು. ನಿಮ್ಮ ಕೃಷಿ ಮಾಹಿತಿಯನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಇರಿಸಲಾಗುತ್ತದೆ ಮತ್ತು ಅಪ್ಲಿಕೇಶನ್ ಮೂಲಕ ನಿರ್ವಹಿಸಬಹುದು.", footer1:"ಭಾರತದಲ್ಲಿ ಚಾಣಾಕ್ಷ ಕೃಷಿಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ 🇮🇳",
  },
  ta: {
    features:"அம்சங்கள்", how:"இது எப்படி வேலை செய்கிறது", faq:"FAQ", signIn:"உள்நுழைக", getStarted:"தொடங்குங்கள்", builtFor:"இந்திய விவசாயிகளுக்காக உருவாக்கப்பட்டது 🇮🇳",
    hero1:"உங்கள் பண்ணையின்", hero2:"மொழியைப் பேசும்", hero3:"AI.", heroDesc:"AgriAssist AI இந்திய விவசாயிகளுக்கு பயிர் நோய்களை கண்டறியவும், பருவமழைக்கு ஏற்ப திட்டமிடவும், சந்தை விலைகளை கண்காணிக்கவும், விவசாய திட்டங்களை அறியவும் உதவுகிறது — உங்கள் மொழியில், ஒரே இடத்தில்.",
    learnMore:"மேலும் அறிக", featuresTitle:"இந்திய பண்ணைக்கு தேவையான அனைத்தும் ஒரே அரட்டையில்.", featuresDesc:"பயிர் ஆரோக்கியம் முதல் வானிலை, சந்தை மற்றும் அரசு திட்டங்கள் வரை தேவையான விவசாய தகவல்களை AgriAssist AI ஒரே இடத்தில் வழங்குகிறது.",
    howTitle:"கேள்வியிலிருந்து முடிவுக்கு, சில விநாடிகளில்.", benefits:"நன்மைகள்", benefitsTitle:"அதிகம் விளைவிக்கவும். குறைவாக வீணாக்கவும். புத்திசாலித்தனமாக விவசாயம் செய்யவும்.", benefitsDesc:"பயிர் ஆரோக்கியம், நீர்ப்பாசனம், சந்தை மற்றும் அரசு உதவி உள்ளிட்ட விவசாயிகள் தினமும் எடுக்கும் உண்மையான முடிவுகளை கருத்தில் கொண்டு AgriAssist AI உருவாக்கப்பட்டுள்ளது.",
    openAI:"AgriAssist AI திறக்கவும்", workspace:"வொர்க்ஸ்பேஸைப் பார்க்கவும்", faqTitle:"உங்கள் கேள்விகளுக்கான பதில்கள்.", ctaTitle:"சிறந்த விவசாய முடிவுகளை எடுக்க தயாரா?", ctaDesc:"ஒரே விவசாய வொர்க்ஸ்பேஸில் பயிர், வானிலை, சந்தை மற்றும் அரசு திட்டங்களுக்கான AI உதவியைப் பெறுங்கள்.", openWorkspace:"வொர்க்ஸ்பேஸ் திறக்கவும்",
    chatTitle:"AI அரட்டை உதவியாளர்", chatDesc:"உங்கள் பண்ணை பற்றி எதையும் கேளுங்கள் — தமிழ், இந்தி, கன்னடம் அல்லது ஆங்கிலத்தில்.", diseaseTitle:"பயிர் நோய் ஸ்கேனர்", diseaseDesc:"இலையின் புகைப்படத்தை எடுக்கவும். AgriAssist AI நோயை கண்டறிந்து இந்தியாவுக்கு ஏற்ற தீர்வை பரிந்துரைக்கும்.", weatherTitle:"பருவமழை மற்றும் வானிலை", weatherDesc:"சிறந்த நீர்ப்பாசனம், தெளிப்பு மற்றும் அறுவடைக்கான வானிலை வழிகாட்டுதல்.", schemesTitle:"அரசு திட்டங்கள்", schemesDesc:"நீங்கள் தகுதி பெறக்கூடிய விவசாய திட்டங்கள், மானியங்கள் மற்றும் காப்பீடுகளை கண்டறியுங்கள்.", marketTitle:"சந்தை விலைகள்", marketDesc:"சந்தை விலைகளை கண்காணித்து பயிரை விற்க சரியான நேரத்திற்கான வழிகாட்டுதலைப் பெறுங்கள்.", privateTitle:"தனியுரிமையுடன்", privateDesc:"உங்கள் பண்ணை தரவு உங்களுடையதே. உங்கள் உரையாடல்கள் பாதுகாக்கப்படுகின்றன.",
    step1Title:"உங்கள் பண்ணையை அமைக்கவும்", step1Desc:"உங்கள் பயிர், மண் மற்றும் மாவட்டத்தை AgriAssist AI-க்கு தெரிவிக்கவும். ஒரு நிமிடத்திற்கும் குறைவாக ஆகும்.", step2Title:"கேளுங்கள் அல்லது பதிவேற்றுங்கள்", step2Desc:"கேள்வியை எழுதுங்கள், இலையின் புகைப்படத்தை பதிவேற்றுங்கள் அல்லது உங்கள் மொழியில் குரலைப் பயன்படுத்துங்கள்.", step3Title:"நம்பிக்கையுடன் முடிவு எடுக்கவும்", step3Desc:"இந்திய சூழலுக்கு ஏற்ற தெளிவான பரிந்துரையைப் பெறுங்கள்.",
    benefit1:"ஆரம்ப நோய் கண்டறிதலால் பயிர் இழப்பைக் குறைக்கவும்", benefit2:"சரியான நீர்ப்பாசன நேரத்தால் தண்ணீரை சேமிக்கவும்", benefit3:"கிடைக்கக்கூடிய விவசாய மானியங்களை அறியவும்", benefit4:"சந்தை வழிகாட்டுதலுடன் சரியான விலையில் விற்கவும்", benefit5:"இந்தி, ಕನ್ನಡ, தமிழ் மற்றும் English-ல் கிடைக்கும்", benefit6:"ஒவ்வொரு விவசாய முடிவுக்கும் ஒரே வொர்க்ஸ்பேஸ்",
    faq1q:"AgriAssist AI இலவசமாக பயன்படுத்த முடியுமா?", faq1a:"ஆம். AgriAssist AI முற்றிலும் இலவசம். AI கருவிகள் மற்றும் தனிப்பயனாக்கப்பட்ட விவசாய வொர்க்ஸ்பேஸைப் பயன்படுத்த உள்நுழையுங்கள்.", faq2q:"இது இந்திய மொழிகளில் செயல்படுமா?", faq2a:"ஆம். AgriAssist AI ஆங்கிலம், இந்தி, கன்னடம் மற்றும் தமிழை ஆதரிக்கிறது.", faq3q:"எப்போதும் இணையம் தேவையா?", faq3a:"AI அம்சங்களுக்கு இணையம் தேவை. சில முக்கிய தகவல்கள் மற்றும் பழைய அறிக்கைகள் பயன்பாட்டில் கிடைக்கலாம்.", faq4q:"நோய் கண்டறிதல் எவ்வளவு துல்லியமானது?", faq4a:"பொதுவான பயிர் பிரச்சினைகளை கண்டறிய AgriAssist AI AI அடிப்படையிலான பகுப்பாய்வை வழங்குகிறது. முக்கிய சிகிச்சை முடிவுகளை வேளாண் நிபுணரிடம் உறுதிப்படுத்தவும்.", faq5q:"எனது தரவு பாதுகாப்பானதா?", faq5a:"ஆம். உங்கள் விவசாய தகவல்கள் பாதுகாக்கப்படுகின்றன, மேலும் பயன்பாட்டின் மூலம் அவற்றை நிர்வகிக்கலாம்.", footer1:"இந்தியாவில் புத்திசாலித்தனமான விவசாயத்திற்காக உருவாக்கப்பட்டது 🇮🇳",
  },
} as const;

function getLandingTranslations(language: string) {
  return LANDING_TRANSLATIONS[language as keyof typeof LANDING_TRANSLATIONS] ?? LANDING_TRANSLATIONS.en;
}

function Landing() {
  return (
    <LanguageProvider>
      <LandingContent />
    </LanguageProvider>
  );
}

function LandingContent() {
  const { language } = useLanguage();
  const t = getLandingTranslations(language);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const goToDashboard = () =>
      navigate({
        to: "/dashboard",
        replace: true,
      });

    async function finishPendingSignIn() {
      if (hasAuthRedirectParams()) {
        const result = await completeAuthRedirect();

        if (!active) return;

        clearAuthRedirectParams("/");

        if (result.ok) {
          goToDashboard();
          return;
        }
      }

      const { data } = await supabase.auth.getSession();

      if (active && data.session) {
        goToDashboard();
      }
    }

    finishPendingSignIn();

    const { data: sub } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (
          session &&
          (event === "SIGNED_IN" || event === "INITIAL_SESSION")
        ) {
          goToDashboard();
        }
      },
    );

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-accent"
            >
              Features
            </a>

            <a
              href="#how"
              className="text-sm text-muted-foreground transition-colors hover:text-accent"
            >
              How it works
            </a>

            <a
              href="#faq"
              className="text-sm text-muted-foreground transition-colors hover:text-accent"
            >
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                {t.signIn}
              </Button>
            </Link>

            <Link to="/register">
              <Button
                size="sm"
                className="bg-gradient-primary text-primary-foreground shadow-glow"
              >
                {t.getStarted}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="pointer-events-none absolute inset-0 bg-gradient-hero" />

        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,oklch(1_0_0_/_0.08)_1px,transparent_0)] [background-size:32px_32px]" />

        <div className="relative mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="glass mx-auto inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              {t.builtFor}
            </div>

            <h1 className="mt-6 font-display text-5xl leading-[1.05] font-semibold tracking-tight md:text-7xl">
              {t.hero1}
              <br />
              <span className="text-gradient">{t.hero2}</span> {t.hero3}
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
              {t.heroDesc}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register">
                <Button
                  size="lg"
                  className="h-12 gap-2 rounded-full bg-gradient-primary px-6 text-primary-foreground shadow-glow hover:opacity-95"
                >
                  {t.getStarted}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <a href="#how">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full px-6"
                >
                  {t.learnMore}
                </Button>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative mx-auto mt-14 max-w-5xl"
          >
            <div className="glass overflow-hidden rounded-3xl shadow-glow">
              <img
                src={heroImg}
                alt="Indian farmer using AgriAssist AI on a smartphone in a paddy field"
                width={1600}
                height={1200}
                className="h-[420px] w-full object-cover md:h-[520px]"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-t border-border/60 py-20 md:py-28"
      >
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-2xl">
            <div className="text-xs font-medium tracking-widest text-accent uppercase">
              {t.features}
            </div>

            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-5xl">
              Everything an Indian farm needs, in one chat.
            </h2>

            <p className="mt-4 text-muted-foreground">
              {t.featuresDesc}
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={t[`${f.key}Title` as keyof typeof t]}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.05,
                }}
              >
                <Card className="glass h-full border-0 transition-transform hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="inline-flex rounded-xl bg-gradient-primary p-2.5 shadow-glow">
                      <f.icon className="h-5 w-5 text-primary-foreground" />
                    </div>

                    <h3 className="mt-4 font-display text-lg font-semibold">
                      {t[`${f.key}Title` as keyof typeof t]}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {t[`${f.key}Desc` as keyof typeof t]}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how"
        className="border-t border-border/60 py-20 md:py-28"
      >
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-2xl">
            <div className="text-xs font-medium tracking-widest text-accent uppercase">
              {t.how}
            </div>

            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-5xl">
              {t.howTitle}
            </h2>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <Card key={s.n} className="glass border-0">
                <CardContent className="p-6">
                  <div className="text-gradient font-display text-4xl font-semibold">
                    {s.n}
                  </div>

                  <h3 className="mt-3 font-display text-lg font-semibold">
                    {t[`${s.key}Title` as keyof typeof t]}
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {t[`${s.key}Desc` as keyof typeof t]}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-border/60 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 md:grid-cols-2 md:items-center">
          <div>
            <div className="text-xs font-medium tracking-widest text-accent uppercase">
              {t.benefits}
            </div>

            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-5xl">
              {t.benefitsTitle}
            </h2>

            <p className="mt-4 text-muted-foreground">
              {t.benefitsDesc}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button className="bg-gradient-primary text-primary-foreground shadow-glow">
                  {t.openAI}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Link to="/dashboard">
                <Button variant="outline">
                  <Globe className="mr-2 h-4 w-4" />
                  {t.workspace}
                </Button>
              </Link>
            </div>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <li
                key={t[b as keyof typeof t]}
                className="glass flex items-start gap-3 rounded-xl p-4"
              >
                <div className="mt-0.5 rounded-full bg-accent/20 p-1 text-accent">
                  <Check className="h-3.5 w-3.5" />
                </div>

                <span className="text-sm">{t[b as keyof typeof t]}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="border-t border-border/60 py-20 md:py-28"
      >
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center">
            <div className="text-xs font-medium tracking-widest text-accent uppercase">
              {t.faq}
            </div>

            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-5xl">
              {t.faqTitle}
            </h2>
          </div>

          <Accordion type="single" collapsible className="mt-10">
            {FAQ.map((f, i) => (
              <AccordionItem
                key={i}
                value={`f${i}`}
                className="border-border/60"
              >
                <AccordionTrigger className="text-left">
                  {t[`${f.key}q` as keyof typeof t]}
                </AccordionTrigger>

                <AccordionContent className="text-muted-foreground">
                  {t[`${f.key}a` as keyof typeof t]}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/60 py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4">
          <div className="glass relative overflow-hidden rounded-3xl p-10 text-center md:p-14">
            <div className="pointer-events-none absolute inset-0 bg-gradient-hero opacity-70" />

            <div className="relative">
              <div className="mx-auto mb-5 inline-flex rounded-full bg-accent/10 p-3 text-accent">
                <Sparkles className="h-6 w-6" />
              </div>

              <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
                {t.ctaTitle}
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                {t.ctaDesc}
              </p>

              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="h-12 gap-2 rounded-full bg-gradient-primary px-6 text-primary-foreground shadow-glow"
                  >
                    {t.openWorkspace}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-full px-6"
                  >
                    {t.signIn}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <Logo />

          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AgriAssist AI. Built in Bhopal, India.
          </div>

          <div className="text-xs text-muted-foreground">
            {t.footer1}
          </div>
        </div>
      </footer>
    </div>
  );
}