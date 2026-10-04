import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Lock,
  Palette,
  Globe,
  User,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { deleteMyAccount } from "@/lib/account/account.functions";
import { toast } from "sonner";
import {
  useLanguage,
  type Language,
} from "@/context/LanguageContext";

import {
  applyTheme,
  getStoredTheme,
  type Theme,
} from "@/lib/theme";

export const Route = createFileRoute("/_workspace/settings")({
  component: Settings,
});

type SettingsState = {
  theme: Theme;
  language: string;
  notify_weather: boolean;
  notify_disease: boolean;
  notify_weekly_report: boolean;
  notify_market: boolean;
  share_anon_data: boolean;
  personalised: boolean;
};

const DEFAULTS: SettingsState = {
  theme: "system",
  language: "en",
  notify_weather: true,
  notify_disease: true,
  notify_weekly_report: false,
  notify_market: true,
  share_anon_data: true,
  personalised: true,
};

const SETTINGS_TRANSLATIONS = {
  en: {
    title: "Settings",
    desc: "Manage your account, preferences and privacy.",

    appearance: "Appearance",
    appearanceDesc: "Theme and display preferences",
    theme: "Theme",
    themeHint: "Choose how AgriAssist AI looks",
    dark: "Dark",
    light: "Light",
    system: "System",

    language: "Language",
    languageDesc: "Interface and assistant language",
    languageHint: "Choose your preferred language",

    notifications: "Notifications",
    notificationsDesc: "Control what you get notified about",
    weatherAlerts: "Weather alerts",
    weatherHint: "Rain, storm, and frost warnings",
    diseaseAlerts: "Disease outbreak alerts",
    weeklyReport: "Weekly farm report",
    marketUpdates: "Market price updates",

    privacy: "Privacy",
    privacyDesc: "Control your data",
    shareData: "Share anonymised farm data",
    shareHint: "Helps improve AgriAssist AI for everyone",
    personalised: "Personalised suggestions",

    account: "Account",
    accountDesc: "Profile and login details",
    email: "Email",
    phone: "Phone",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",

    security: "Security",
    securityDesc: "Password and account removal",
    changePassword: "Change password",
    deleteAccount: "Delete account",
    permanent: "This action is permanent",

    update: "Update",
    newPassword: "New password",
    confirmPassword: "Confirm password",
    atLeast: "At least 8 characters",
    updatePassword: "Update password",
    updating: "Updating...",

    deleteTitle: "Delete your account?",
    deleteDesc:
      "This permanently removes your profile, farm data, chats, reports, and photos. This cannot be undone.",
    typeDelete: "Type DELETE to confirm",
    deleting: "Deleting...",

    passwordTooShort:
      "Password must be at least 8 characters",
    passwordMismatch: "Passwords do not match",
    passwordUpdated: "Password updated",
    accountDeleted: "Account deleted",
    deleteFailed: "Delete failed",

    checkEmail:
      "Check your inbox to confirm the new email.",
    accountUpdated: "Account details updated",
    saveFailed: "Save failed",

    languageChanged: "Language changed to",
    themeChanged: "Theme changed to",

    english: "English",
    hindi: "हिन्दी",
    kannada: "ಕನ್ನಡ",
    tamil: "தமிழ்",
  },

  hi: {
    title: "सेटिंग्स",
    desc: "अपने खाते, प्राथमिकताओं और गोपनीयता को प्रबंधित करें।",

    appearance: "दिखावट",
    appearanceDesc: "थीम और डिस्प्ले प्राथमिकताएँ",
    theme: "थीम",
    themeHint: "AgriAssist AI कैसा दिखे, चुनें",
    dark: "डार्क",
    light: "लाइट",
    system: "सिस्टम",

    language: "भाषा",
    languageDesc: "इंटरफेस और सहायक की भाषा",
    languageHint: "अपनी पसंदीदा भाषा चुनें",

    notifications: "सूचनाएँ",
    notificationsDesc:
      "आपको मिलने वाली सूचनाओं को नियंत्रित करें",
    weatherAlerts: "मौसम अलर्ट",
    weatherHint:
      "बारिश, तूफान और पाले की चेतावनियाँ",
    diseaseAlerts: "फसल रोग अलर्ट",
    weeklyReport: "साप्ताहिक खेत रिपोर्ट",
    marketUpdates: "मंडी भाव अपडेट",

    privacy: "गोपनीयता",
    privacyDesc: "अपने डेटा को नियंत्रित करें",
    shareData: "गुमनाम खेत डेटा साझा करें",
    shareHint:
      "AgriAssist AI को सभी के लिए बेहतर बनाने में मदद करता है",
    personalised: "व्यक्तिगत सुझाव",

    account: "खाता",
    accountDesc: "प्रोफ़ाइल और लॉगिन विवरण",
    email: "ईमेल",
    phone: "फ़ोन",
    cancel: "रद्द करें",
    save: "सहेजें",
    saving: "सहेजा जा रहा है...",

    security: "सुरक्षा",
    securityDesc: "पासवर्ड और खाता हटाना",
    changePassword: "पासवर्ड बदलें",
    deleteAccount: "खाता हटाएँ",
    permanent: "यह कार्रवाई स्थायी है",

    update: "अपडेट करें",
    newPassword: "नया पासवर्ड",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    atLeast: "कम से कम 8 अक्षर",
    updatePassword: "पासवर्ड अपडेट करें",
    updating: "अपडेट हो रहा है...",

    deleteTitle: "क्या आप अपना खाता हटाना चाहते हैं?",
    deleteDesc:
      "यह आपकी प्रोफ़ाइल, खेत का डेटा, चैट, रिपोर्ट और फ़ोटो स्थायी रूप से हटा देगा। इसे वापस नहीं किया जा सकता।",
    typeDelete: "पुष्टि के लिए DELETE लिखें",
    deleting: "हटाया जा रहा है...",

    passwordTooShort:
      "पासवर्ड कम से कम 8 अक्षरों का होना चाहिए",
    passwordMismatch: "पासवर्ड मेल नहीं खाते",
    passwordUpdated: "पासवर्ड अपडेट हो गया",
    accountDeleted: "खाता हटा दिया गया",
    deleteFailed: "खाता हटाना विफल रहा",

    checkEmail:
      "नया ईमेल पुष्टि करने के लिए अपना इनबॉक्स देखें।",
    accountUpdated: "खाते का विवरण अपडेट हो गया",
    saveFailed: "सहेजना विफल रहा",

    languageChanged: "भाषा बदलकर",
    themeChanged: "थीम बदलकर",

    english: "English",
    hindi: "हिन्दी",
    kannada: "ಕನ್ನಡ",
    tamil: "தமிழ்",
  },

  kn: {
    title: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    desc: "ನಿಮ್ಮ ಖಾತೆ, ಆದ್ಯತೆಗಳು ಮತ್ತು ಗೌಪ್ಯತೆಯನ್ನು ನಿರ್ವಹಿಸಿ.",

    appearance: "ನೋಟ",
    appearanceDesc: "ಥೀಮ್ ಮತ್ತು ಪ್ರದರ್ಶನ ಆದ್ಯತೆಗಳು",
    theme: "ಥೀಮ್",
    themeHint:
      "AgriAssist AI ಹೇಗೆ ಕಾಣಬೇಕು ಎಂಬುದನ್ನು ಆರಿಸಿ",
    dark: "ಡಾರ್ಕ್",
    light: "ಲೈಟ್",
    system: "ಸಿಸ್ಟಮ್",

    language: "ಭಾಷೆ",
    languageDesc: "ಇಂಟರ್ಫೇಸ್ ಮತ್ತು ಸಹಾಯಕ ಭಾಷೆ",
    languageHint:
      "ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆರಿಸಿ",

    notifications: "ಅಧಿಸೂಚನೆಗಳು",
    notificationsDesc:
      "ನಿಮಗೆ ಬರುವ ಅಧಿಸೂಚನೆಗಳನ್ನು ನಿಯಂತ್ರಿಸಿ",
    weatherAlerts: "ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು",
    weatherHint:
      "ಮಳೆ, ಬಿರುಗಾಳಿ ಮತ್ತು ಹಿಮ ಎಚ್ಚರಿಕೆಗಳು",
    diseaseAlerts: "ಬೆಳೆ ರೋಗ ಎಚ್ಚರಿಕೆಗಳು",
    weeklyReport: "ವಾರದ ಕೃಷಿ ವರದಿ",
    marketUpdates: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ನವೀಕರಣಗಳು",

    privacy: "ಗೌಪ್ಯತೆ",
    privacyDesc: "ನಿಮ್ಮ ಡೇಟಾವನ್ನು ನಿಯಂತ್ರಿಸಿ",
    shareData:
      "ಅನಾಮಧೇಯ ಕೃಷಿ ಡೇಟಾವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ",
    shareHint:
      "ಎಲ್ಲರಿಗೂ AgriAssist AI ಅನ್ನು ಉತ್ತಮಗೊಳಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ",
    personalised: "ವೈಯಕ್ತಿಕ ಸಲಹೆಗಳು",

    account: "ಖಾತೆ",
    accountDesc: "ಪ್ರೊಫೈಲ್ ಮತ್ತು ಲಾಗಿನ್ ವಿವರಗಳು",
    email: "ಇಮೇಲ್",
    phone: "ಫೋನ್",
    cancel: "ರದ್ದುಮಾಡಿ",
    save: "ಉಳಿಸಿ",
    saving: "ಉಳಿಸಲಾಗುತ್ತಿದೆ...",

    security: "ಭದ್ರತೆ",
    securityDesc:
      "ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತು ಖಾತೆ ಅಳಿಸುವಿಕೆ",
    changePassword: "ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿಸಿ",
    deleteAccount: "ಖಾತೆ ಅಳಿಸಿ",
    permanent: "ಈ ಕ್ರಿಯೆ ಶಾಶ್ವತವಾಗಿದೆ",

    update: "ನವೀಕರಿಸಿ",
    newPassword: "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್",
    confirmPassword:
      "ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ",
    atLeast: "ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳು",
    updatePassword: "ಪಾಸ್‌ವರ್ಡ್ ನವೀಕರಿಸಿ",
    updating: "ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ...",

    deleteTitle: "ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಅಳಿಸಬೇಕೇ?",
    deleteDesc:
      "ಇದು ನಿಮ್ಮ ಪ್ರೊಫೈಲ್, ಕೃಷಿ ಡೇಟಾ, ಚಾಟ್‌ಗಳು, ವರದಿಗಳು ಮತ್ತು ಫೋಟೋಗಳನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸುತ್ತದೆ. ಇದನ್ನು ಹಿಂತಿರುಗಿಸಲಾಗುವುದಿಲ್ಲ.",
    typeDelete:
      "ದೃಢೀಕರಿಸಲು DELETE ಎಂದು ಟೈಪ್ ಮಾಡಿ",
    deleting: "ಅಳಿಸಲಾಗುತ್ತಿದೆ...",

    passwordTooShort:
      "ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳಿರಬೇಕು",
    passwordMismatch:
      "ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ",
    passwordUpdated:
      "ಪಾಸ್‌ವರ್ಡ್ ನವೀಕರಿಸಲಾಗಿದೆ",
    accountDeleted: "ಖಾತೆ ಅಳಿಸಲಾಗಿದೆ",
    deleteFailed: "ಅಳಿಸುವಿಕೆ ವಿಫಲವಾಗಿದೆ",

    checkEmail:
      "ಹೊಸ ಇಮೇಲ್ ದೃಢೀಕರಿಸಲು ನಿಮ್ಮ ಇನ್‌ಬಾಕ್ಸ್ ಪರಿಶೀಲಿಸಿ.",
    accountUpdated:
      "ಖಾತೆಯ ವಿವರಗಳನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ",
    saveFailed: "ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ",

    languageChanged: "ಭಾಷೆ ಬದಲಾಯಿಸಲಾಗಿದೆ:",
    themeChanged: "ಥೀಮ್ ಬದಲಾಯಿಸಲಾಗಿದೆ:",

    english: "English",
    hindi: "हिन्दी",
    kannada: "ಕನ್ನಡ",
    tamil: "தமிழ்",
  },

  ta: {
    title: "அமைப்புகள்",
    desc:
      "உங்கள் கணக்கு, விருப்பங்கள் மற்றும் தனியுரிமையை நிர்வகிக்கவும்.",

    appearance: "தோற்றம்",
    appearanceDesc:
      "தீம் மற்றும் காட்சி விருப்பங்கள்",
    theme: "தீம்",
    themeHint:
      "AgriAssist AI எப்படி தோன்ற வேண்டும் என்பதைத் தேர்வு செய்யவும்",
    dark: "டார்க்",
    light: "லைட்",
    system: "சிஸ்டம்",

    language: "மொழி",
    languageDesc:
      "இடைமுகம் மற்றும் உதவியாளர் மொழி",
    languageHint:
      "உங்கள் விருப்பமான மொழியைத் தேர்வு செய்யவும்",

    notifications: "அறிவிப்புகள்",
    notificationsDesc:
      "நீங்கள் பெறும் அறிவிப்புகளைக் கட்டுப்படுத்தவும்",
    weatherAlerts: "வானிலை எச்சரிக்கைகள்",
    weatherHint:
      "மழை, புயல் மற்றும் பனி எச்சரிக்கைகள்",
    diseaseAlerts: "பயிர் நோய் எச்சரிக்கைகள்",
    weeklyReport: "வாராந்திர பண்ணை அறிக்கை",
    marketUpdates: "சந்தை விலை புதுப்பிப்புகள்",

    privacy: "தனியுரிமை",
    privacyDesc:
      "உங்கள் தரவைக் கட்டுப்படுத்தவும்",
    shareData:
      "பெயரில்லா பண்ணை தரவைப் பகிரவும்",
    shareHint:
      "அனைவருக்கும் AgriAssist AI-ஐ மேம்படுத்த உதவுகிறது",
    personalised: "தனிப்பயன் பரிந்துரைகள்",

    account: "கணக்கு",
    accountDesc:
      "சுயவிவரம் மற்றும் உள்நுழைவு விவரங்கள்",
    email: "மின்னஞ்சல்",
    phone: "தொலைபேசி",
    cancel: "ரத்து",
    save: "சேமி",
    saving: "சேமிக்கப்படுகிறது...",

    security: "பாதுகாப்பு",
    securityDesc:
      "கடவுச்சொல் மற்றும் கணக்கு நீக்கம்",
    changePassword:
      "கடவுச்சொல்லை மாற்றவும்",
    deleteAccount: "கணக்கை நீக்கு",
    permanent:
      "இந்த செயல் நிரந்தரமானது",

    update: "புதுப்பி",
    newPassword: "புதிய கடவுச்சொல்",
    confirmPassword:
      "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
    atLeast: "குறைந்தது 8 எழுத்துகள்",
    updatePassword:
      "கடவுச்சொல்லைப் புதுப்பிக்கவும்",
    updating: "புதுப்பிக்கப்படுகிறது...",

    deleteTitle:
      "உங்கள் கணக்கை நீக்க வேண்டுமா?",
    deleteDesc:
      "இது உங்கள் சுயவிவரம், பண்ணை தரவு, அரட்டைகள், அறிக்கைகள் மற்றும் புகைப்படங்களை நிரந்தரமாக நீக்கும். இதை மாற்ற முடியாது.",
    typeDelete:
      "உறுதிப்படுத்த DELETE என உள்ளிடவும்",
    deleting: "நீக்கப்படுகிறது...",

    passwordTooShort:
      "கடவுச்சொல் குறைந்தது 8 எழுத்துகள் இருக்க வேண்டும்",
    passwordMismatch:
      "கடவுச்சொற்கள் பொருந்தவில்லை",
    passwordUpdated:
      "கடவுச்சொல் புதுப்பிக்கப்பட்டது",
    accountDeleted: "கணக்கு நீக்கப்பட்டது",
    deleteFailed: "நீக்குதல் தோல்வியடைந்தது",

    checkEmail:
      "புதிய மின்னஞ்சலை உறுதிப்படுத்த உங்கள் இன்பாக்ஸைப் பார்க்கவும்.",
    accountUpdated:
      "கணக்கு விவரங்கள் புதுப்பிக்கப்பட்டன",
    saveFailed: "சேமிக்க முடியவில்லை",

    languageChanged: "மொழி மாற்றப்பட்டது:",
    themeChanged: "தீம் மாற்றப்பட்டது:",

    english: "English",
    hindi: "हिन्दी",
    kannada: "ಕನ್ನಡ",
    tamil: "தமிழ்",
  },
} as const;

function getSettingsTranslations(
  language: Language,
) {
  return (
    SETTINGS_TRANSLATIONS[language] ??
    SETTINGS_TRANSLATIONS.en
  );
}

/* ---------------------------------------------------------
   CHANGE PASSWORD
--------------------------------------------------------- */

function ChangePasswordDialog() {
  const { language } = useLanguage();
  const t = getSettingsTranslations(language);

  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (pw.length < 8) {
      return toast.error(
        t.passwordTooShort,
      );
    }

    if (pw !== confirm) {
      return toast.error(
        t.passwordMismatch,
      );
    }

    setBusy(true);

    const { error } =
      await supabase.auth.updateUser({
        password: pw,
      });

    setBusy(false);

    if (error) {
      return toast.error(
        error.message,
      );
    }

    toast.success(
      t.passwordUpdated,
    );

    setPw("");
    setConfirm("");
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
        >
          {t.update}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t.changePassword}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">
              {t.newPassword}
            </Label>

            <Input
              type="password"
              value={pw}
              onChange={(e) =>
                setPw(e.target.value)
              }
              placeholder={t.atLeast}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              {t.confirmPassword}
            </Label>

            <Input
              type="password"
              value={confirm}
              onChange={(e) =>
                setConfirm(e.target.value)
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={busy}
          >
            {t.cancel}
          </Button>

          <Button
            onClick={submit}
            disabled={busy}
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.updating}
              </>
            ) : (
              t.updatePassword
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------------------------------
   DELETE ACCOUNT
--------------------------------------------------------- */

function DeleteAccountDialog() {
  const { language } = useLanguage();
  const t = getSettingsTranslations(language);

  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] =
    useState("");
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();
  const deleteFn =
    useServerFn(deleteMyAccount);

  async function submit() {
    if (confirmText !== "DELETE") {
      return toast.error(
        t.typeDelete,
      );
    }

    setBusy(true);

    try {
      await deleteFn({});

      await supabase.auth.signOut();

      toast.success(
        t.accountDeleted,
      );

      navigate({
        to: "/login",
        replace: true,
      });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : t.deleteFailed,
      );

      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
        >
          {t.deleteAccount}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t.deleteTitle}
          </DialogTitle>

          <DialogDescription>
            {t.deleteDesc}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label className="text-xs">
            {t.typeDelete}
          </Label>

          <Input
            value={confirmText}
            onChange={(e) =>
              setConfirmText(
                e.target.value,
              )
            }
            placeholder="DELETE"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() =>
              setOpen(false)
            }
            disabled={busy}
          >
            {t.cancel}
          </Button>

          <Button
            variant="destructive"
            onClick={submit}
            disabled={
              busy ||
              confirmText !== "DELETE"
            }
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.deleting}
              </>
            ) : (
              t.deleteAccount
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------------------------------
   SECTION
--------------------------------------------------------- */

function Section({
  icon: Icon,
  title,
  desc,
  children,
}: any) {
  return (
    <Card className="glass border-0">
      <CardContent className="p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-lg bg-accent/15 p-2 text-accent">
            <Icon className="h-4 w-4" />
          </div>

          <div>
            <h2 className="font-display text-base font-semibold">
              {title}
            </h2>

            <p className="text-xs text-muted-foreground">
              {desc}
            </p>
          </div>
        </div>

        <Separator className="mb-4" />

        {children}
      </CardContent>
    </Card>
  );
}

/* ---------------------------------------------------------
   ROW
--------------------------------------------------------- */

function Row({
  label,
  hint,
  children,
}: any) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div>
        <Label className="text-sm">
          {label}
        </Label>

        {hint && (
          <p className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}
      </div>

      <div>{children}</div>
    </div>
  );
}

/* ---------------------------------------------------------
   SETTINGS PAGE
--------------------------------------------------------- */

function Settings() {
  const {
    language,
    setLanguage,
  } = useLanguage();

  const t =
    getSettingsTranslations(language);

  const [userId, setUserId] =
    useState<string | null>(null);

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [originalEmail, setOriginalEmail] =
    useState("");

  const [originalPhone, setOriginalPhone] =
    useState("");

  const [s, setS] =
    useState<SettingsState>(
      DEFAULTS,
    );

  const [loading, setLoading] =
    useState(true);

  const [savingAcct, setSavingAcct] =
    useState(false);

  /* -------------------------------------------------------
     LOAD SETTINGS
  ------------------------------------------------------- */

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      const {
        data: userData,
      } =
        await supabase.auth.getUser();

      const user =
        userData.user;

      if (!user) {
        if (active) {
          setLoading(false);
        }

        return;
      }

      if (!active) return;

      setUserId(user.id);

      const [
        { data: profile },
        { data: settings },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "email, phone, preferred_language",
          )
          .eq("id", user.id)
          .maybeSingle(),

        supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (!active) return;

      const em =
        profile?.email ||
        user.email ||
        "";

      const ph =
        profile?.phone ||
        "";

      setEmail(em);
      setOriginalEmail(em);

      setPhone(ph);
      setOriginalPhone(ph);

      /*
       * Local storage is intentionally checked first.
       *
       * This means the theme selected from the topbar
       * remains the current theme even if the database
       * still contains an older value.
       */
      const storedTheme =
        getStoredTheme();

      if (settings) {
        const databaseTheme =
          settings.theme;

        const theme: Theme =
          storedTheme !== "system" ||
          databaseTheme === "system"
            ? storedTheme
            : databaseTheme === "light" ||
                databaseTheme === "dark"
              ? (databaseTheme as Theme)
              : storedTheme;

        const loadedSettings:
          SettingsState = {
          theme,
          language:
            settings.language ||
            DEFAULTS.language,

          notify_weather:
            settings.notify_weather ??
            DEFAULTS.notify_weather,

          notify_disease:
            settings.notify_disease ??
            DEFAULTS.notify_disease,

          notify_weekly_report:
            settings.notify_weekly_report ??
            DEFAULTS.notify_weekly_report,

          notify_market:
            settings.notify_market ??
            DEFAULTS.notify_market,

          share_anon_data:
            settings.share_anon_data ??
            DEFAULTS.share_anon_data,

          personalised:
            settings.personalised ??
            DEFAULTS.personalised,
        };

        setS(loadedSettings);

        setLanguage(
          loadedSettings.language as Language,
        );

        applyTheme(
          loadedSettings.theme,
        );

        localStorage.setItem(
          "agriassist-language",
          loadedSettings.language,
        );
      } else {
        const localLanguage =
          localStorage.getItem(
            "agriassist-language",
          );

        const theme =
          getStoredTheme();

        setS((prev) => ({
          ...prev,
          theme,
        }));

        applyTheme(theme);

        if (
          localLanguage &&
          [
            "en",
            "hi",
            "kn",
            "ta",
          ].includes(localLanguage)
        ) {
          setS((prev) => ({
            ...prev,
            language:
              localLanguage,
          }));

          setLanguage(
            localLanguage as Language,
          );
        } else if (
          profile?.preferred_language
        ) {
          setS((prev) => ({
            ...prev,
            language:
              profile.preferred_language,
          }));

          setLanguage(
            profile.preferred_language as Language,
          );
        }
      }

      setLoading(false);
    }

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  /* -------------------------------------------------------
     KEEP SETTINGS IN SYNC WITH TOPBAR
  ------------------------------------------------------- */

  useEffect(() => {
    const handleThemeChange =
      (event: Event) => {
        const customEvent =
          event as CustomEvent<Theme>;

        const nextTheme =
          customEvent.detail;

        setS((current) => ({
          ...current,
          theme: nextTheme,
        }));
      };

    window.addEventListener(
      "agriassist-theme-change",
      handleThemeChange,
    );

    return () => {
      window.removeEventListener(
        "agriassist-theme-change",
        handleThemeChange,
      );
    };
  }, []);

  /* -------------------------------------------------------
     UPDATE SETTINGS
  ------------------------------------------------------- */

  async function updateSettings(
    patch: Partial<SettingsState>,
  ) {
    if (!userId) return;

    const next: SettingsState = {
      ...s,
      ...patch,
    };

    setS(next);

    /* Theme */
    if (patch.theme) {
      const theme =
        patch.theme as Theme;

      applyTheme(theme);

      localStorage.setItem(
        "agriassist-theme",
        theme,
      );
    }

    /* Language */
    if (patch.language) {
      setLanguage(
        patch.language as Language,
      );

      localStorage.setItem(
        "agriassist-language",
        patch.language,
      );
    }

    /* Save to Supabase */
    const { error } =
      await supabase
        .from("user_settings")
        .upsert(
          {
            user_id: userId,
            ...next,
          },
          {
            onConflict: "user_id",
          },
        );

    if (error) {
      toast.error(
        error.message,
      );
      return;
    }

    /* Update preferred language */
    if (patch.language) {
      const {
        error: profileError,
      } = await supabase
        .from("profiles")
        .update({
          preferred_language:
            patch.language,
        })
        .eq("id", userId);

      if (profileError) {
        toast.error(
          profileError.message,
        );
        return;
      }
    }

    /* Theme notification */
    if (patch.theme) {
      const themeName =
        patch.theme === "dark"
          ? t.dark
          : patch.theme === "light"
            ? t.light
            : t.system;

      toast.success(
        `${t.themeChanged} ${themeName}`,
      );
    }

    /* Language notification */
    if (patch.language) {
      const nextT =
        getSettingsTranslations(
          patch.language as Language,
        );

      const names: Record<
        string,
        string
      > = {
        en: nextT.english,
        hi: nextT.hindi,
        kn: nextT.kannada,
        ta: nextT.tamil,
      };

      toast.success(
        `${nextT.languageChanged} ${
          names[patch.language] ||
          patch.language
        }`,
      );
    }
  }

  /* -------------------------------------------------------
     ACCOUNT SAVE
  ------------------------------------------------------- */

  async function saveAccount() {
    if (!userId) return;

    setSavingAcct(true);

    try {
      const { error } =
        await supabase
          .from("profiles")
          .update({
            email: email || null,
            phone: phone || null,
          })
          .eq("id", userId);

      if (error) {
        throw error;
      }

      if (
        email &&
        email !== originalEmail
      ) {
        const {
          error: emailError,
        } =
          await supabase.auth.updateUser(
            {
              email,
            },
          );

        if (emailError) {
          throw emailError;
        }

        toast.info(
          t.checkEmail,
        );
      }

      setOriginalEmail(email);
      setOriginalPhone(phone);

      toast.success(
        t.accountUpdated,
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : t.saveFailed,
      );
    } finally {
      setSavingAcct(false);
    }
  }

  const acctDirty =
    email !== originalEmail ||
    phone !== originalPhone;

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  if (loading) {
    return (
      <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  /* -------------------------------------------------------
     UI
  ------------------------------------------------------- */

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-10">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          {t.title}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {t.desc}
        </p>
      </header>

      <div className="space-y-5">
        {/* APPEARANCE */}

        <Section
          icon={Palette}
          title={t.appearance}
          desc={t.appearanceDesc}
        >
          <Row
            label={t.theme}
            hint={t.themeHint}
          >
            <Select
              value={s.theme}
              onValueChange={(value) =>
                updateSettings({
                  theme:
                    value as Theme,
                })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="dark">
                  {t.dark}
                </SelectItem>

                <SelectItem value="light">
                  {t.light}
                </SelectItem>

                <SelectItem value="system">
                  {t.system}
                </SelectItem>
              </SelectContent>
            </Select>
          </Row>
        </Section>

        {/* LANGUAGE */}

        <Section
          icon={Globe}
          title={t.language}
          desc={t.languageDesc}
        >
          <Row
            label={t.language}
            hint={t.languageHint}
          >
            <Select
              value={language}
              onValueChange={(value) =>
                updateSettings({
                  language: value,
                })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="en">
                  {t.english}
                </SelectItem>

                <SelectItem value="hi">
                  {t.hindi}
                </SelectItem>

                <SelectItem value="kn">
                  {t.kannada}
                </SelectItem>

                <SelectItem value="ta">
                  {t.tamil}
                </SelectItem>
              </SelectContent>
            </Select>
          </Row>
        </Section>

        {/* NOTIFICATIONS */}

        <Section
          icon={Bell}
          title={t.notifications}
          desc={t.notificationsDesc}
        >
          <Row
            label={t.weatherAlerts}
            hint={t.weatherHint}
          >
            <Switch
              checked={
                s.notify_weather
              }
              onCheckedChange={(value) =>
                updateSettings({
                  notify_weather:
                    value,
                })
              }
            />
          </Row>

          <Row
            label={t.diseaseAlerts}
          >
            <Switch
              checked={
                s.notify_disease
              }
              onCheckedChange={(value) =>
                updateSettings({
                  notify_disease:
                    value,
                })
              }
            />
          </Row>

          <Row
            label={t.weeklyReport}
          >
            <Switch
              checked={
                s.notify_weekly_report
              }
              onCheckedChange={(value) =>
                updateSettings({
                  notify_weekly_report:
                    value,
                })
              }
            />
          </Row>

          <Row
            label={t.marketUpdates}
          >
            <Switch
              checked={
                s.notify_market
              }
              onCheckedChange={(value) =>
                updateSettings({
                  notify_market:
                    value,
                })
              }
            />
          </Row>
        </Section>

        {/* PRIVACY */}

        <Section
          icon={ShieldCheck}
          title={t.privacy}
          desc={t.privacyDesc}
        >
          <Row
            label={t.shareData}
            hint={t.shareHint}
          >
            <Switch
              checked={
                s.share_anon_data
              }
              onCheckedChange={(value) =>
                updateSettings({
                  share_anon_data:
                    value,
                })
              }
            />
          </Row>

          <Row
            label={t.personalised}
          >
            <Switch
              checked={
                s.personalised
              }
              onCheckedChange={(value) =>
                updateSettings({
                  personalised:
                    value,
                })
              }
            />
          </Row>
        </Section>

        {/* ACCOUNT */}

        <Section
          icon={User}
          title={t.account}
          desc={t.accountDesc}
        >
          <Row label={t.email}>
            <Input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              className="w-64"
            />
          </Row>

          <Row label={t.phone}>
            <Input
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value,
                )
              }
              placeholder="+91 ..."
              className="w-64"
            />
          </Row>

          <div className="mt-2 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={
                !acctDirty ||
                savingAcct
              }
              onClick={() => {
                setEmail(
                  originalEmail,
                );
                setPhone(
                  originalPhone,
                );
              }}
            >
              {t.cancel}
            </Button>

            <Button
              size="sm"
              disabled={
                !acctDirty ||
                savingAcct
              }
              onClick={saveAccount}
            >
              {savingAcct ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.saving}
                </>
              ) : (
                t.save
              )}
            </Button>
          </div>
        </Section>

        {/* SECURITY */}

        <Section
          icon={Lock}
          title={t.security}
          desc={t.securityDesc}
        >
          <Row
            label={
              t.changePassword
            }
          >
            <ChangePasswordDialog />
          </Row>

          <Row
            label={
              t.deleteAccount
            }
            hint={t.permanent}
          >
            <DeleteAccountDialog />
          </Row>
        </Section>
      </div>
    </div>
  );
}