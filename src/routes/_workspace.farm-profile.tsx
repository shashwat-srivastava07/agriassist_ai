import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

export const Route = createFileRoute("/_workspace/farm-profile")({
  component: FarmProfile,
});

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

type ProfileState = {
  farmerName: string;
  email: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  farmSize: string;
  primaryCrop: string;
  soil: string;
  water: string;
  language: string;
  avatarUrl: string;
};


const PROFILE_TRANSLATIONS = {
  en: {
    title: "Farm Onboarding",
    subtitle: "The more we know about your farm, the sharper AgriAssist AI's advice becomes.",
    profileCompletion: "Profile completion",
    complete: "complete",
    allSet: "All set",
    left: "left",
    yourName: "Your name",
    farmerName: "Farmer Name",
    email: "Email",
    phone: "Phone",
    village: "Village / Farm Location",
    district: "District",
    state: "State",
    farmSize: "Farm Size (acres)",
    currentCrops: "Current Crops",
    soilType: "Soil Type",
    waterSource: "Water Source",
    preferredLanguage: "Preferred Language",
    loamy: "Loamy",
    clay: "Clay",
    sandy: "Sandy",
    blackCotton: "Black cotton",
    red: "Red",
    borewell: "Borewell",
    canal: "Canal",
    rainFed: "Rain-fed",
    river: "River",
    english: "English",
    hindi: "Hindi",
    kannada: "Kannada",
    tamil: "Tamil",
    cancel: "Cancel",
    saving: "Saving…",
    saveChanges: "Save changes",
    imageUnder5: "Image must be under 5 MB",
    photoUpdated: "Profile photo updated",
    uploadFailed: "Upload failed",
    signInFirst: "Please sign in first",
    profileSaved: "Profile saved",
    saveFailed: "Save failed",
    changesDiscarded: "Changes discarded",
    avatar: "Avatar",
    requiredFarmerName: "Farmer Name",
    requiredFarmLocation: "Farm Location",
    requiredFarmSize: "Farm Size",
    requiredCurrentCrops: "Current Crops",
    requiredSoilType: "Soil Type",
    requiredWaterSource: "Water Source",
    requiredLanguage: "Preferred Language",
  },
  hi: {
    title: "फार्म प्रोफ़ाइल",
    subtitle: "हम आपके खेत के बारे में जितना अधिक जानेंगे, AgriAssist AI की सलाह उतनी बेहतर होगी।",
    profileCompletion: "प्रोफ़ाइल पूर्णता",
    complete: "पूर्ण",
    allSet: "सब तैयार है",
    left: "बाकी",
    yourName: "आपका नाम",
    farmerName: "किसान का नाम",
    email: "ईमेल",
    phone: "फ़ोन",
    village: "गांव / खेत का स्थान",
    district: "जिला",
    state: "राज्य",
    farmSize: "खेत का आकार (एकड़)",
    currentCrops: "वर्तमान फसलें",
    soilType: "मिट्टी का प्रकार",
    waterSource: "पानी का स्रोत",
    preferredLanguage: "पसंदीदा भाषा",
    loamy: "दोमट",
    clay: "चिकनी मिट्टी",
    sandy: "रेतीली",
    blackCotton: "काली कपास मिट्टी",
    red: "लाल मिट्टी",
    borewell: "बोरवेल",
    canal: "नहर",
    rainFed: "वर्षा आधारित",
    river: "नदी",
    english: "अंग्रेज़ी",
    hindi: "हिन्दी",
    kannada: "कन्नड़",
    tamil: "तमिल",
    cancel: "रद्द करें",
    saving: "सहेजा जा रहा है…",
    saveChanges: "बदलाव सहेजें",
    imageUnder5: "चित्र 5 MB से कम होना चाहिए",
    photoUpdated: "प्रोफ़ाइल फ़ोटो अपडेट हो गई",
    uploadFailed: "अपलोड विफल रहा",
    signInFirst: "कृपया पहले साइन इन करें",
    profileSaved: "प्रोफ़ाइल सहेजी गई",
    saveFailed: "सहेजना विफल रहा",
    changesDiscarded: "बदलाव हटा दिए गए",
    avatar: "प्रोफ़ाइल चित्र",
    requiredFarmerName: "किसान का नाम",
    requiredFarmLocation: "खेत का स्थान",
    requiredFarmSize: "खेत का आकार",
    requiredCurrentCrops: "वर्तमान फसलें",
    requiredSoilType: "मिट्टी का प्रकार",
    requiredWaterSource: "पानी का स्रोत",
    requiredLanguage: "पसंदीदा भाषा",
  },
  kn: {
    title: "ಫಾರ್ಮ್ ಪ್ರೊಫೈಲ್",
    subtitle: "ನಿಮ್ಮ ಹೊಲದ ಬಗ್ಗೆ ನಾವು ಹೆಚ್ಚು ತಿಳಿದಷ್ಟೂ AgriAssist AI ಯ ಸಲಹೆ ಇನ್ನಷ್ಟು ಉತ್ತಮವಾಗುತ್ತದೆ.",
    profileCompletion: "ಪ್ರೊಫೈಲ್ ಪೂರ್ಣತೆ",
    complete: "ಪೂರ್ಣ",
    allSet: "ಎಲ್ಲವೂ ಸಿದ್ಧ",
    left: "ಉಳಿದಿದೆ",
    yourName: "ನಿಮ್ಮ ಹೆಸರು",
    farmerName: "ರೈತರ ಹೆಸರು",
    email: "ಇಮೇಲ್",
    phone: "ಫೋನ್",
    village: "ಗ್ರಾಮ / ಹೊಲದ ಸ್ಥಳ",
    district: "ಜಿಲ್ಲೆ",
    state: "ರಾಜ್ಯ",
    farmSize: "ಹೊಲದ ಗಾತ್ರ (ಎಕರೆ)",
    currentCrops: "ಪ್ರಸ್ತುತ ಬೆಳೆಗಳು",
    soilType: "ಮಣ್ಣಿನ ವಿಧ",
    waterSource: "ನೀರಿನ ಮೂಲ",
    preferredLanguage: "ಆದ್ಯತೆಯ ಭಾಷೆ",
    loamy: "ಲೋಮಿ ಮಣ್ಣು",
    clay: "ಜೇಡಿಮಣ್ಣು",
    sandy: "ಮರಳು ಮಣ್ಣು",
    blackCotton: "ಕಪ್ಪು ಹತ್ತಿ ಮಣ್ಣು",
    red: "ಕೆಂಪು ಮಣ್ಣು",
    borewell: "ಬೋರ್‌ವೆಲ್",
    canal: "ಕಾಲುವೆ",
    rainFed: "ಮಳೆ ಆಧಾರಿತ",
    river: "ನದಿ",
    english: "ಇಂಗ್ಲಿಷ್",
    hindi: "ಹಿಂದಿ",
    kannada: "ಕನ್ನಡ",
    tamil: "ತಮಿಳು",
    cancel: "ರದ್ದುಮಾಡಿ",
    saving: "ಉಳಿಸಲಾಗುತ್ತಿದೆ…",
    saveChanges: "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ",
    imageUnder5: "ಚಿತ್ರವು 5 MB ಗಿಂತ ಕಡಿಮೆ ಇರಬೇಕು",
    photoUpdated: "ಪ್ರೊಫೈಲ್ ಫೋಟೋ ನವೀಕರಿಸಲಾಗಿದೆ",
    uploadFailed: "ಅಪ್‌ಲೋಡ್ ವಿಫಲವಾಗಿದೆ",
    signInFirst: "ದಯವಿಟ್ಟು ಮೊದಲು ಸೈನ್ ಇನ್ ಮಾಡಿ",
    profileSaved: "ಪ್ರೊಫೈಲ್ ಉಳಿಸಲಾಗಿದೆ",
    saveFailed: "ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ",
    changesDiscarded: "ಬದಲಾವಣೆಗಳನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ",
    avatar: "ಪ್ರೊಫೈಲ್ ಚಿತ್ರ",
    requiredFarmerName: "ರೈತರ ಹೆಸರು",
    requiredFarmLocation: "ಹೊಲದ ಸ್ಥಳ",
    requiredFarmSize: "ಹೊಲದ ಗಾತ್ರ",
    requiredCurrentCrops: "ಪ್ರಸ್ತುತ ಬೆಳೆಗಳು",
    requiredSoilType: "ಮಣ್ಣಿನ ವಿಧ",
    requiredWaterSource: "ನೀರಿನ ಮೂಲ",
    requiredLanguage: "ಆದ್ಯತೆಯ ಭಾಷೆ",
  },
  ta: {
    title: "பண்ணை சுயவிவரம்",
    subtitle: "உங்கள் பண்ணையைப் பற்றி நாங்கள் அதிகம் அறிந்தால், AgriAssist AI-ன் ஆலோசனை இன்னும் சிறப்பாக இருக்கும்.",
    profileCompletion: "சுயவிவர நிறைவு",
    complete: "முடிந்தது",
    allSet: "அனைத்தும் தயார்",
    left: "மீதம்",
    yourName: "உங்கள் பெயர்",
    farmerName: "விவசாயி பெயர்",
    email: "மின்னஞ்சல்",
    phone: "தொலைபேசி",
    village: "கிராமம் / பண்ணை இருப்பிடம்",
    district: "மாவட்டம்",
    state: "மாநிலம்",
    farmSize: "பண்ணை அளவு (ஏக்கர்)",
    currentCrops: "தற்போதைய பயிர்கள்",
    soilType: "மண் வகை",
    waterSource: "நீர் மூலம்",
    preferredLanguage: "விருப்ப மொழி",
    loamy: "வண்டல் மண்",
    clay: "களிமண்",
    sandy: "மணல் மண்",
    blackCotton: "கரிசல் மண்",
    red: "செம்மண்",
    borewell: "ஆழ்துளைக் கிணறு",
    canal: "கால்வாய்",
    rainFed: "மழை சார்ந்த",
    river: "ஆறு",
    english: "ஆங்கிலம்",
    hindi: "இந்தி",
    kannada: "கன்னடம்",
    tamil: "தமிழ்",
    cancel: "ரத்து செய்",
    saving: "சேமிக்கப்படுகிறது…",
    saveChanges: "மாற்றங்களைச் சேமிக்கவும்",
    imageUnder5: "படம் 5 MB-க்கு குறைவாக இருக்க வேண்டும்",
    photoUpdated: "சுயவிவரப் படம் புதுப்பிக்கப்பட்டது",
    uploadFailed: "பதிவேற்றம் தோல்வியடைந்தது",
    signInFirst: "முதலில் உள்நுழையவும்",
    profileSaved: "சுயவிவரம் சேமிக்கப்பட்டது",
    saveFailed: "சேமிக்க முடியவில்லை",
    changesDiscarded: "மாற்றங்கள் நிராகரிக்கப்பட்டன",
    avatar: "சுயவிவரப் படம்",
    requiredFarmerName: "விவசாயி பெயர்",
    requiredFarmLocation: "பண்ணை இருப்பிடம்",
    requiredFarmSize: "பண்ணை அளவு",
    requiredCurrentCrops: "தற்போதைய பயிர்கள்",
    requiredSoilType: "மண் வகை",
    requiredWaterSource: "நீர் மூலம்",
    requiredLanguage: "விருப்ப மொழி",
  },
} as const;

function getProfileTranslations(language: string) {
  return (
    PROFILE_TRANSLATIONS[
      language as keyof typeof PROFILE_TRANSLATIONS
    ] ?? PROFILE_TRANSLATIONS.en
  );
}

const EMPTY: ProfileState = {
  farmerName: "",
  email: "",
  phone: "",
  village: "",
  district: "",
  state: "",
  farmSize: "",
  primaryCrop: "",
  soil: "loamy",
  water: "borewell",
  language: "en",
  avatarUrl: "",
};

const REQUIRED: { key: keyof ProfileState; labelKey: keyof typeof PROFILE_TRANSLATIONS.en }[] = [
  { key: "farmerName", labelKey: "requiredFarmerName" },
  { key: "village", labelKey: "requiredFarmLocation" },
  { key: "farmSize", labelKey: "requiredFarmSize" },
  { key: "primaryCrop", labelKey: "requiredCurrentCrops" },
  { key: "soil", labelKey: "requiredSoilType" },
  { key: "water", labelKey: "requiredWaterSource" },
  { key: "language", labelKey: "requiredLanguage" },
];

function initialsOf(name: string, email: string) {
  const src = (name || email || "FA").trim();
  return src.slice(0, 2).toUpperCase();
}

function FarmProfile() {
  const { language, setLanguage } = useLanguage();
  const t = getProfileTranslations(language);

  const [p, setP] = useState<ProfileState>(EMPTY);
  const [original, setOriginal] = useState<ProfileState>(EMPTY);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProfileState>(
    k: K,
    v: ProfileState[K],
  ) => setP((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const [{ data: profile }, { data: farm }] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle(),

        supabase
          .from("farms")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at")
          .limit(1)
          .maybeSingle(),
      ]);

      const meta = (user.user_metadata ?? {}) as Record<
        string,
        string | undefined
      >;

      const loaded: ProfileState = {
        farmerName:
          profile?.full_name ||
          meta.full_name ||
          meta.name ||
          "",

        email: profile?.email || user.email || "",
        phone: profile?.phone || "",
        village: farm?.village || "",
        district: farm?.district || "",
        state: farm?.state || "",
        farmSize:
          farm?.farm_size_acres != null
            ? String(farm.farm_size_acres)
            : "",
        primaryCrop: farm?.primary_crop || "",
        soil: farm?.soil_type || "loamy",
        water: farm?.water_source || "borewell",
        language: profile?.preferred_language || "en",
        avatarUrl:
          profile?.avatar_url ||
          meta.avatar_url ||
          "",
      };

      const supportedLanguage =
        loaded.language === "hi" ||
        loaded.language === "kn" ||
        loaded.language === "ta"
          ? loaded.language
          : "en";

      loaded.language = supportedLanguage;

      setP(loaded);
      setOriginal(loaded);
      setLanguage(supportedLanguage);
      setLoading(false);
    })();
  }, []);

  const completion = useMemo(() => {
    const filled = REQUIRED.filter(
      (f) =>
        String(p[f.key] ?? "")
          .trim()
          .length > 0,
    ).length;

    return Math.round((filled / REQUIRED.length) * 100);
  }, [p]);

  const dirty = useMemo(
    () => JSON.stringify(p) !== JSON.stringify(original),
    [p, original],
  );

  async function handleAvatar(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];

    if (!file || !userId) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t.imageUnder5);
      return;
    }

    setUploading(true);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          upsert: true,
          contentType: file.type,
        });

      if (upErr) throw upErr;

      const { data: signed } = await supabase.storage
        .from("avatars")
        .createSignedUrl(path, 60 * 60 * 24 * 365);

      const url = signed?.signedUrl || "";

      set("avatarUrl", url);

      // persist immediately
      await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", userId);

      setOriginal((o) => ({
        ...o,
        avatarUrl: url,
      }));

      toast.success(t.photoUpdated);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t.uploadFailed,
      );
    } finally {
      setUploading(false);

      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  }

  async function handleSave() {
    if (!userId) {
      toast.error(t.signInFirst);
      return;
    }

    setSaving(true);

    try {
      const profilePayload = {
        id: userId,
        full_name: p.farmerName || null,
        email: p.email || null,
        phone: p.phone || null,
        preferred_language: p.language || "en",
        avatar_url: p.avatarUrl || null,
      };

      const { error: pErr } = await supabase
        .from("profiles")
        .upsert(profilePayload, { onConflict: "id" });

      if (pErr) throw pErr;

      const { data: existingFarm } = await supabase
        .from("farms")
        .select("id")
        .eq("user_id", userId)
        .order("created_at")
        .limit(1)
        .maybeSingle();

      const farmPayload = {
        user_id: userId,
        name: "My Farm",
        village: p.village || null,
        district: p.district || null,
        state: p.state || null,
        farm_size_acres: p.farmSize
          ? Number(p.farmSize)
          : null,
        primary_crop: p.primaryCrop || null,
        soil_type: p.soil || null,
        water_source: p.water || null,
      };

      const { error: fErr } = existingFarm
        ? await supabase
            .from("farms")
            .update(farmPayload)
            .eq("id", existingFarm.id)
        : await supabase
            .from("farms")
            .insert(farmPayload);

      if (fErr) throw fErr;

      setOriginal(p);
      toast.success(t.profileSaved);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t.saveFailed,
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setP(original);
    toast.message(t.changesDiscarded);
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl items-center justify-center px-4 py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const initials = initialsOf(p.farmerName, p.email);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-10">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          {t.title}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {t.subtitle}
        </p>
      </header>

      <Card className="glass mb-4 border-0">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                {t.profileCompletion}
              </div>

              <div className="mt-1 font-display text-2xl font-semibold">
                {completion}%{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  {t.complete}
                </span>
              </div>
            </div>

            <Badge
              className={cn(
                "rounded-full",
                completion === 100
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-amber-500/15 text-amber-300",
              )}
            >
              {completion === 100
                ? t.allSet
                : `${REQUIRED.length - Math.round((completion / 100) * REQUIRED.length)} ${t.left}`}
            </Badge>
          </div>

          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>

          <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
            {REQUIRED.map((f) => {
              const done =
                String(p[f.key] ?? "")
                  .trim()
                  .length > 0;

              return (
                <li
                  key={f.key}
                  className="flex items-center gap-2 text-xs"
                >
                  {done ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                  )}

                  <span
                    className={cn(
                      done
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {t[f.labelKey]}
                  </span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <Card className="glass border-0">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-5">
            <div className="relative">
              <Avatar className="h-20 w-20 ring-2 ring-primary/30">
                {p.avatarUrl && (
                  <AvatarImage
                    src={p.avatarUrl}
                    alt={p.farmerName || t.avatar}
                  />
                )}

                <AvatarFallback className="bg-gradient-primary text-xl text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatar}
              />

              <Button
                size="icon"
                className="absolute -right-1 -bottom-1 h-7 w-7 rounded-full bg-accent text-accent-foreground shadow-glow"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>

            <div>
              <div className="font-display text-lg font-semibold capitalize">
                {p.farmerName || t.yourName}
              </div>

              <div className="text-sm text-muted-foreground">
                {[p.village, p.state]
                  .filter(Boolean)
                  .join(", ") || p.email}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Field label={t.farmerName}>
              <Input
                value={p.farmerName}
                placeholder={t.yourName}
                onChange={(e) =>
                  set("farmerName", e.target.value)
                }
              />
            </Field>

            <Field label={t.email}>
              <Input
                type="email"
                value={p.email}
                onChange={(e) =>
                  set("email", e.target.value)
                }
              />
            </Field>

            <Field label={t.phone}>
              <Input
                value={p.phone}
                placeholder="+91 …"
                onChange={(e) =>
                  set("phone", e.target.value)
                }
              />
            </Field>

            <Field label={t.village}>
              <Input
                value={p.village}
                onChange={(e) =>
                  set("village", e.target.value)
                }
              />
            </Field>

            <Field label={t.district}>
              <Input
                value={p.district}
                onChange={(e) =>
                  set("district", e.target.value)
                }
              />
            </Field>

            <Field label={t.state}>
              <Input
                value={p.state}
                onChange={(e) =>
                  set("state", e.target.value)
                }
              />
            </Field>

            <Field label={t.farmSize}>
              <Input
                type="number"
                value={p.farmSize}
                onChange={(e) =>
                  set("farmSize", e.target.value)
                }
              />
            </Field>

            <Field label={t.currentCrops}>
              <Input
                value={p.primaryCrop}
                onChange={(e) =>
                  set("primaryCrop", e.target.value)
                }
              />
            </Field>

            <Field label={t.soilType}>
              <Select
                value={p.soil}
                onValueChange={(v) => set("soil", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="loamy">{t.loamy}</SelectItem>
                  <SelectItem value="clay">{t.clay}</SelectItem>
                  <SelectItem value="sandy">{t.sandy}</SelectItem>
                  <SelectItem value="black">{t.blackCotton}</SelectItem>
                  <SelectItem value="red">{t.red}</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label={t.waterSource}>
              <Select
                value={p.water}
                onValueChange={(v) => set("water", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="borewell">{t.borewell}</SelectItem>
                  <SelectItem value="canal">{t.canal}</SelectItem>
                  <SelectItem value="rain">{t.rainFed}</SelectItem>
                  <SelectItem value="river">{t.river}</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label={t.preferredLanguage}>
              <Select
                value={p.language}
                onValueChange={(v) => { set("language", v); setLanguage(v as "en" | "hi" | "kn" | "ta"); }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="en">{t.english}</SelectItem>
                  <SelectItem value="hi">{t.hindi}</SelectItem>
                  <SelectItem value="kn">{t.kannada}</SelectItem>
                  <SelectItem value="ta">{t.tamil}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="mt-8 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={!dirty || saving}
            >
              {t.cancel}
            </Button>

            <Button
              className="bg-gradient-primary text-primary-foreground shadow-glow"
              onClick={handleSave}
              disabled={!dirty || saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.saving}
                </>
              ) : (
                t.saveChanges
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}