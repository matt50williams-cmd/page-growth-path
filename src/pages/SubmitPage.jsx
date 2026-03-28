import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Search, Globe, MapPin, Lightbulb, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { storeUtmParams, getStoredUtmParams } from "@/utils/utm";
import { trackEvent, EVENTS } from "@/utils/tracking";

const TOTAL_STEPS = 7;
const API_BASE = "https://pageaudit-engine.onrender.com";

const FB_PHOTO = (username) => {
  const idMatch = String(username).match(/id=(\d+)/);
  if (idMatch) return `${API_BASE}/api/fb-photo/${idMatch[1]}`;
  const numericOnly = String(username).match(/^\d+$/);
  if (numericOnly) return `${API_BASE}/api/fb-photo/${username}`;
  return `${API_BASE}/api/fb-photo/${encodeURIComponent(username)}`;
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim() || "");

const BUSINESS_TYPES = [
  { value: "plumbing", label: "🔧 Plumbing" },
  { value: "hvac", label: "❄️ HVAC / Heating & Cooling" },
  { value: "roofing", label: "🏠 Roofing" },
  { value: "electrical", label: "⚡ Electrical" },
  { value: "restaurant", label: "🍽️ Restaurant / Food" },
  { value: "retail", label: "🛍️ Retail / Shop" },
  { value: "health", label: "💊 Health & Wellness" },
  { value: "realestate", label: "🏡 Real Estate" },
  { value: "attorney", label: "⚖️ Attorney / Legal" },
  { value: "dental", label: "🦷 Dental / Medical" },
  { value: "auto", label: "🚗 Auto Repair" },
  { value: "other", label: "📋 Other" },
];

const DID_YOU_KNOW = [
  "Pages that post 4–5 times per week grow 3x faster than those that post randomly.",
  "Facebook's algorithm rewards pages that respond to comments within the first 30 minutes.",
  "Local businesses that mention their city in posts see up to 40% more reach from nearby customers.",
  "Pages with a complete About section rank higher in Facebook search results.",
  "Video posts get 5x more reach than image posts on Facebook — even short 60-second videos.",
  "The best time to post for most businesses is between 1pm–4pm on weekdays.",
  "Businesses that respond to reviews get 35% more engagement on their posts.",
];

function DidYouKnow({ index }) {
  return (
    <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-start gap-3">
      <Lightbulb className="w-4 h-4 text-[#1877F2] shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-bold text-[#1877F2] uppercase tracking-wide mb-0.5">Did You Know?</p>
        <p className="text-xs text-gray-600 leading-relaxed">{DID_YOU_KNOW[index % DID_YOU_KNOW.length]}</p>
      </div>
    </div>
  );
}

function WhyWeAsk({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        Why do we ask this?
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {open && (
        <div className="mt-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
          <p className="text-xs text-gray-600 leading-relaxed">{children}</p>
        </div>
      )}
    </div>
  );
}

function StepProgress({ step }) {
  const messages = [
    "Let's get started! 🚀",
    "Great! Keep going...",
    "You're doing great!",
    "Almost there...",
    "Two more steps!",
    "One more step!",
    "Final step!",
  ];

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[#1877F2]">{messages[step - 1]}</span>
        <span className="text-xs font-medium text-gray-400">Step {step} of {TOTAL_STEPS}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-[#1877F2] to-[#2563eb] h-2 rounded-full transition-all duration-500"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>
    </div>
  );
}

function OptionCard({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-4 rounded-2xl border-2 transition-all duration-150 flex items-center gap-3 ${
        selected
          ? "border-[#1877F2] bg-blue-50 shadow-sm"
          : "border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm"
      }`}
    >
      <span
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
          selected ? "border-[#1877F2] bg-[#1877F2]" : "border-gray-300 bg-white"
        }`}
      >
        {selected && <Check className="w-3 h-3 text-white" />}
      </span>
      <span className={`text-sm font-medium ${selected ? "text-[#1877F2]" : "text-gray-700"}`}>
        {children}
      </span>
    </button>
  );
}

function isValidFbUrl(url) {
  if (!url) return false;
  if (!url.includes("facebook.com")) return false;
  if (url.includes("NOT_FOUND")) return false;

  if (url.includes("profile.php")) {
    return url.includes("id=") && /id=\d+/.test(url);
  }

  const username = url
    .replace(/https?:\/\/(www\.)?facebook\.com\//i, "")
    .replace(/\/$/, "")
    .split("?")[0]
    .split("/")[0];

  if (!username) return false;
  if (username.length <= 3) return false;

  const blocked = [
    "sharer",
    "share",
    "dialog",
    "login",
    "plugins",
    "pages",
    "groups",
    "events",
    "marketplace",
    "watch",
    "gaming",
    "ads",
    "business",
    "help",
    "policies",
    "legal",
    "photo",
    "photos",
    "video",
    "videos",
    "home",
    "about",
    "posts",
    "reels",
    "reviews",
    "notifications",
    "messages",
    "search",
    "hashtag",
    "stories",
  ];

  return !blocked.includes(username.toLowerCase());
}

function getDisplayName(url, fallback = "") {
  if (!url) return fallback;

  if (url.includes("profile.php")) {
    const idMatch = url.match(/id=(\d+)/);
    return idMatch ? `Page ID: ${idMatch[1]}` : fallback;
  }

  return (
    url
      .replace(/https?:\/\/(www\.)?facebook\.com\//i, "")
      .replace(/\/$/, "")
      .split("?")[0]
      .split("/")[0] || fallback
  );
}

function getPhotoKey(url) {
  if (!url) return "";

  if (url.includes("profile.php")) {
    const idMatch = url.match(/id=(\d+)/);
    return idMatch ? idMatch[1] : "";
  }

  return url
    .replace(/https?:\/\/(www\.)?facebook\.com\//i, "")
    .replace(/\/$/, "")
    .split("?")[0]
    .split("/")[0];
}

function FacebookPageFinder({
  value,
  onChange,
  email,
  website,
  businessName,
  preloadedCandidates,
  scrapeLoading,
}) {
  const [pageName, setPageName] = useState(businessName || "");
  const [confirmed, setConfirmed] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imgSrc, setImgSrc] = useState("");
  const [imgError, setImgError] = useState(false);
  const [candidates, setCandidates] = useState(preloadedCandidates || []);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [pasteUrl, setPasteUrl] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (preloadedCandidates?.length) {
      setCandidates(preloadedCandidates);
      setCandidateIndex(0);

      const first = preloadedCandidates[0];
      setPreviewUrl(first);
      setImgSrc(FB_PHOTO(getPhotoKey(first)));
      setImgError(false);
    }
  }, [preloadedCandidates]);

  const applyCandidate = (url) => {
    if (!url || !isValidFbUrl(url)) return;
    setPreviewUrl(url);
    setImgSrc(FB_PHOTO(getPhotoKey(url)));
    setImgError(false);
  };

  const handleSearch = async () => {
    if (!pageName.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/api/find-facebook-page`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: pageName.trim(),
          website_url: website || null,
          city: null,
          email: email || null,
        }),
      });

      const data = await res.json();
      const found = Array.isArray(data?.candidates)
        ? data.candidates.filter((u) => isValidFbUrl(u))
        : [];

      setCandidates(found);
      setCandidateIndex(0);
      onChange("");
      setConfirmed(false);

      if (found.length) {
        applyCandidate(found[0]);
      } else {
        setPreviewUrl("");
        setImgSrc("");
      }
    } catch (err) {
      console.error("Facebook finder search failed:", err);
      setCandidates([]);
      setPreviewUrl("");
      setImgSrc("");
    }
  };

  const handleConfirm = () => {
    if (!previewUrl) return;
    setConfirmed(true);
    onChange(previewUrl);
  };

  const handleNextCandidate = () => {
    if (!candidates.length) return;
    const nextIndex = candidateIndex + 1;
    if (nextIndex >= candidates.length) return;

    setCandidateIndex(nextIndex);
    applyCandidate(candidates[nextIndex]);
    onChange("");
    setConfirmed(false);
  };

  const handlePaste = (e) => {
    const val = e.target.value;
    setPasteUrl(val);

    if (val.includes("facebook.com") && isValidFbUrl(val)) {
      setCandidates([val]);
      setCandidateIndex(0);
      setPreviewUrl(val);
      setImgSrc(FB_PHOTO(getPhotoKey(val)));
      setImgError(false);
      setConfirmed(true);
      onChange(val);
    }
  };

  const handleStartOver = () => {
    setConfirmed(false);
    setPreviewUrl("");
    setImgSrc("");
    setImgError(false);
    setCandidates([]);
    setCandidateIndex(0);
    setPasteUrl("");
    setPageName(businessName || "");
    onChange("");
  };

  const currentName = getDisplayName(previewUrl, pageName.trim());

  return (
    <div className="space-y-4">
      {!confirmed ? (
        <>
          {scrapeLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-blue-200 border-t-[#1877F2] rounded-full animate-spin shrink-0" />
              <p className="text-xs text-blue-700 font-medium">🔍 Searching for your Facebook page automatically...</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              Facebook Page Name <span className="text-gray-400 font-normal text-xs">(optional)</span>
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Allred Heating or Righteous Law"
                value={pageName}
                onChange={(e) => {
                  setPageName(e.target.value);
                  setPreviewUrl("");
                  setImgSrc("");
                  setCandidates([]);
                  setCandidateIndex(0);
                  onChange("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1877F2] transition-all"
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={!pageName.trim()}
                className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-5 py-3.5 text-sm font-bold rounded-2xl hover:bg-[#1457C0] transition-colors disabled:opacity-40 shrink-0"
              >
                <Search className="w-4 h-4" /> Find
              </button>
            </div>

            {(email || website) && (
              <p className="text-xs text-green-600 mt-1.5 font-medium">
                ✓ Using your {website ? "website + " : ""}business name to find better matches
              </p>
            )}
          </div>

          {previewUrl && (
            <div className="bg-blue-50 border-2 border-[#1877F2] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-[#1877F2] uppercase tracking-wide">Is this your page?</p>
                {candidates.length > 1 && (
                  <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded-full border border-gray-200">
                    {candidateIndex + 1} of {candidates.length}
                  </span>
                )}
              </div>

              <div className="bg-white rounded-xl p-4 mb-4 flex items-center gap-4 border border-gray-100 shadow-sm">
                {!imgError ? (
                  <img
                    src={imgSrc}
                    alt={currentName}
                    onError={() => setImgError(true)}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#1877F2] flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-2xl">f</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-base truncate">{currentName}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{previewUrl}</p>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#1877F2] hover:underline font-semibold mt-1 inline-block"
                  >
                    Open on Facebook ↗
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#1877F2] text-white px-4 py-3 text-sm font-bold rounded-xl hover:bg-[#1457C0] transition-colors"
                >
                  <Check className="w-4 h-4" /> Yes, that's it!
                </button>

                <button
                  type="button"
                  onClick={handleNextCandidate}
                  disabled={candidateIndex >= candidates.length - 1}
                  className="flex-1 border-2 border-gray-200 text-gray-600 px-4 py-3 text-sm font-semibold rounded-xl hover:border-gray-400 transition-colors disabled:opacity-40"
                >
                  {candidateIndex < candidates.length - 1
                    ? `Next → (${candidates.length - candidateIndex - 1} left)`
                    : "No more matches"}
                </button>
              </div>
            </div>
          )}

          {!previewUrl && !scrapeLoading && (
            <div className="space-y-3">
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4 text-center">
                <p className="text-sm font-bold text-yellow-800 mb-1">😕 We haven’t found your page yet</p>
                <p className="text-xs text-yellow-700">Try searching by page name or paste your Facebook URL directly below.</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowHelp(!showHelp)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <span>📖 How to find your Facebook URL</span>
                  {showHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showHelp && (
                  <div className="px-4 pb-4 border-t border-gray-100 space-y-3 pt-3">
                    {[
                      { n: "1", icon: "📱", t: "Open Facebook", d: "Go to facebook.com or open the app" },
                      { n: "2", icon: "🔍", t: "Find your page", d: "Click on your business page name" },
                      { n: "3", icon: "🔗", t: "Copy the URL", d: "Copy everything in the address bar — even if it looks like profile.php?id=..." },
                      { n: "4", icon: "📋", t: "Paste it below", d: "Paste in the box below — we handle all URL formats!" },
                    ].map(({ n, icon, t, d }) => (
                      <div key={n} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#1877F2] flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-bold">{n}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {icon} {t}
                          </p>
                          <p className="text-xs text-gray-500">{d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 mb-2 font-semibold">Or paste your Facebook URL directly:</p>
            <p className="text-xs text-gray-400 mb-2">Works with any format — including profile.php?id=... links!</p>
            <input
              type="url"
              placeholder="https://www.facebook.com/yourbusiness"
              value={pasteUrl}
              onChange={handlePaste}
              className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1877F2] transition-all"
            />
          </div>
        </>
      ) : (
        <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-5">
          <div className="flex items-center gap-4 mb-3">
            {imgSrc && !imgError ? (
              <img
                src={imgSrc}
                alt={currentName}
                className="w-14 h-14 rounded-full object-cover border-2 border-green-200 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#1877F2] flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xl">f</span>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <p className="font-bold text-green-800 text-sm">Page Confirmed!</p>
              </div>
              <p className="text-sm font-semibold text-gray-800">{currentName}</p>
              <p className="text-xs text-green-600 truncate">{previewUrl || value}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartOver}
            className="text-xs text-green-700 hover:underline font-semibold"
          >
            Not right? Start over
          </button>
        </div>
      )}
    </div>
  );
}

export default function SubmitPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [emailError, setEmailError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preloadedCandidates, setPreloadedCandidates] = useState([]);
  const [seoScore, setSeoScore] = useState(null);
  const [scrapeLoading, setScrapeLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    businessName: "",
    website: "",
    businessType: "",
    city: "",
    facebook_url: "",
    mainGoal: [],
    postingFrequency: "",
    contentType: "",
  });

  useEffect(() => {
    storeUtmParams();
    trackEvent(EVENTS.INTAKE_STARTED);
  }, []);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validateEmailField = (email) => {
    const trimmed = email?.trim() || "";
    setEmailTouched(true);

    if (!trimmed) {
      setEmailError("Email is required");
      return false;
    }

    if (!isValidEmail(trimmed)) {
      setEmailError("Please enter a valid email address");
      return false;
    }

    setEmailError("");
    return true;
  };

  const fireBackgroundScrape = async () => {
    if (!form.businessName && !form.website) return;

    setScrapeLoading(true);

    try {
      if (form.website) {
        const scrapeRes = await fetch(`${API_BASE}/api/website/scrape`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            website_url: form.website || null,
            business_name: form.businessName || form.name,
            email: form.email,
            city: form.city || null,
          }),
        });

        const scrapeData = await scrapeRes.json();
        if (scrapeData?.seo_score) setSeoScore(scrapeData.seo_score);
      }

      const fbRes = await fetch(`${API_BASE}/api/find-facebook-page`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: form.businessName || form.name,
          city: form.city || null,
          website_url: form.website || null,
        }),
      });

      const fbData = await fbRes.json();
      const candidates = Array.isArray(fbData?.candidates)
        ? fbData.candidates.filter((u) => isValidFbUrl(u))
        : [];

      setPreloadedCandidates(candidates);
    } catch (err) {
      console.error("Background scrape failed:", err);
    } finally {
      setScrapeLoading(false);
    }
  };

  const goToStep = (n) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const canNext = () => {
    if (step === 1) return form.name.trim() && form.email.trim() && form.businessName.trim() && !emailError && isValidEmail(form.email);
    if (step === 2) return !!form.businessType;
    if (step === 3) return !!form.city.trim();
    if (step === 4) return form.mainGoal.length > 0;
    if (step === 5) return !!form.postingFrequency;
    if (step === 6) return !!form.contentType;
    if (step === 7) return true;
    return true;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const utm = getStoredUtmParams() || {};
      const fbUrl = form.facebook_url || "";

      const res = await fetch(`${API_BASE}/api/audits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name,
          email: form.email,
          facebook_url: fbUrl,
          account_type: form.businessType,
          goals: form.mainGoal.join(", "),
          posting_frequency: form.postingFrequency,
          content_type: form.contentType,
          utm_source: utm.utm_source || null,
          utm_campaign: utm.utm_campaign || null,
          utm_adset: utm.utm_adset || null,
          utm_ad: utm.utm_ad || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success || !data?.audit?.id) {
        throw new Error(data?.error || "Audit creation failed");
      }

      const auditId = data.audit.id;

      localStorage.setItem(
        "pageAuditOrder",
        JSON.stringify({
          name: form.name,
          email: form.email,
          website: form.website,
          businessName: form.businessName,
          pageUrl: fbUrl,
          businessType: form.businessType,
          city: form.city,
          review_type: form.businessType || "Business",
          mainGoal: form.mainGoal,
          postingFrequency: form.postingFrequency,
          contentType: form.contentType,
          seoScore: seoScore,
          auditId,
        })
      );

      navigate("/analyzing");
    } catch (err) {
      console.error("[AUDIT ERROR]:", err);
      alert("Error creating audit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-base text-black tracking-tight">PageAudit Pro</span>
          {scrapeLoading && (
            <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
              <div className="w-3 h-3 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
              Finding your page...
            </div>
          )}
        </div>
      </nav>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <StepProgress step={step} />

          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm px-6 py-7">
            {step === 1 && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Let's get started!</h1>
                <p className="text-sm text-gray-400 mb-6">Tell us about yourself so we can personalize your audit.</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                      Your Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#1877F2] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="jane@yourbusiness.com"
                        value={form.email}
                        onChange={(e) => {
                          set("email", e.target.value);
                          if (emailError) setEmailError("");
                        }}
                        onBlur={(e) => validateEmailField(e.target.value)}
                        className={`w-full border-2 rounded-2xl px-4 py-3.5 text-sm focus:outline-none transition-all pr-10 ${
                          emailTouched && isValidEmail(form.email)
                            ? "border-green-300 bg-green-50"
                            : emailTouched && emailError
                            ? "border-red-300"
                            : "border-gray-100 focus:border-[#1877F2]"
                        }`}
                      />
                      {emailTouched && isValidEmail(form.email) && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Check className="w-5 h-5 text-green-500" />
                        </div>
                      )}
                    </div>
                    {emailTouched && emailError && <p className="text-xs text-red-500 mt-1.5">{emailError}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                      Business Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Allred Heating or Righteous Law"
                      value={form.businessName}
                      onChange={(e) => set("businessName", e.target.value)}
                      className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#1877F2] transition-all"
                    />
                    <WhyWeAsk>
                      We use your business name to automatically find your Facebook page and search for local competitors in your area.
                    </WhyWeAsk>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                      <Globe className="w-4 h-4 inline mr-1 text-[#1877F2]" />
                      Business Website <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://yourbusiness.com"
                      value={form.website}
                      onChange={(e) => set("website", e.target.value)}
                      className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#1877F2] transition-all"
                    />
                    <div className="mt-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 flex items-start gap-2">
                      <span className="text-green-500 text-sm shrink-0">🎁</span>
                      <p className="text-xs text-green-700 font-medium">
                        Add your website and get a <strong>FREE Website SEO Score</strong> included with your audit — limited time bonus!
                      </p>
                    </div>
                    <WhyWeAsk>
                      We scan your website to automatically find your Facebook page and include a free SEO score showing how Google sees your site.
                    </WhyWeAsk>
                  </div>
                </div>

                <DidYouKnow index={0} />
              </div>
            )}

            {step === 2 && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">What type of business are you?</h1>
                <p className="text-sm text-gray-400 mb-6">We use this to give you industry-specific strategies.</p>

                <div className="grid grid-cols-2 gap-2">
                  {BUSINESS_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => set("businessType", value)}
                      className={`text-left px-3 py-3 rounded-2xl border-2 transition-all text-sm font-medium ${
                        form.businessType === value
                          ? "border-[#1877F2] bg-blue-50 text-[#1877F2]"
                          : "border-gray-100 bg-white hover:border-blue-200 text-gray-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <WhyWeAsk>
                  Different business types need completely different Facebook strategies. We tailor your entire report to your specific industry.
                </WhyWeAsk>

                <DidYouKnow index={1} />
              </div>
            )}

            {step === 3 && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">What city is your business in?</h1>
                <p className="text-sm text-gray-400 mb-6">We pull local data to make your report more accurate.</p>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    <MapPin className="w-4 h-4 inline mr-1 text-[#1877F2]" />
                    City & State
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dallas, TX or Seattle, WA"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#1877F2] transition-all"
                  />
                </div>

                <WhyWeAsk>
                  We pull real-time data on what's working for {form.businessType || "businesses"} in your area right now.
                </WhyWeAsk>

                <DidYouKnow index={2} />
              </div>
            )}

            {step === 4 && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">What's your main goal?</h1>
                <p className="text-sm text-gray-400 mb-6">Your entire action plan is built around this.</p>

                <div className="space-y-2">
                  {[
                    { val: "Grow followers", icon: "👥" },
                    { val: "Increase engagement", icon: "💬" },
                    { val: "Generate leads", icon: "💰" },
                    { val: "Build authority", icon: "⭐" },
                    { val: "Promote a cause", icon: "❤️" },
                  ].map(({ val, icon }) => (
                    <OptionCard
                      key={val}
                      selected={form.mainGoal.includes(val)}
                      onClick={() => {
                        set(
                          "mainGoal",
                          form.mainGoal.includes(val)
                            ? form.mainGoal.filter((x) => x !== val)
                            : [...form.mainGoal, val]
                        );
                      }}
                    >
                      {icon} {val}
                    </OptionCard>
                  ))}
                </div>

                <WhyWeAsk>
                  We write your 7-day action plan and 30-day roadmap specifically around this goal.
                </WhyWeAsk>

                <DidYouKnow index={3} />
              </div>
            )}

            {step === 5 && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">How often do you post?</h1>
                <p className="text-sm text-gray-400 mb-6">This helps us assess your current posting strategy.</p>

                <div className="space-y-2">
                  {[
                    { val: "Daily", icon: "🔥" },
                    { val: "A few times a week", icon: "📅" },
                    { val: "Weekly", icon: "📆" },
                    { val: "Rarely or never", icon: "😴" },
                  ].map(({ val, icon }) => (
                    <OptionCard
                      key={val}
                      selected={form.postingFrequency === val}
                      onClick={() => set("postingFrequency", val)}
                    >
                      {icon} {val}
                    </OptionCard>
                  ))}
                </div>

                <WhyWeAsk>Posting frequency is one of the biggest factors in Facebook reach.</WhyWeAsk>

                <DidYouKnow index={4} />
              </div>
            )}

            {step === 6 && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">What do you post most?</h1>
                <p className="text-sm text-gray-400 mb-6">We'll analyze your content performance on this.</p>

                <div className="space-y-2">
                  {[
                    { val: "Videos", icon: "🎥" },
                    { val: "Images", icon: "📸" },
                    { val: "Text posts", icon: "✍️" },
                    { val: "Mixed content", icon: "🎨" },
                    { val: "Not sure yet", icon: "🤔" },
                  ].map(({ val, icon }) => (
                    <OptionCard
                      key={val}
                      selected={form.contentType === val}
                      onClick={() => set("contentType", val)}
                    >
                      {icon} {val}
                    </OptionCard>
                  ))}
                </div>

                <WhyWeAsk>Different content types perform very differently on Facebook.</WhyWeAsk>

                <DidYouKnow index={5} />
              </div>
            )}

            {step === 7 && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {preloadedCandidates.length ? "We found your page! 🎉" : "Find Your Facebook Page"}
                </h1>
                <p className="text-sm text-gray-400 mb-6">
                  {preloadedCandidates.length
                    ? "We found this automatically — is it correct?"
                    : "We'll search using your business name and website to help find the right Facebook page."}
                </p>

                <FacebookPageFinder
                  value={form.facebook_url}
                  onChange={(url) => set("facebook_url", url)}
                  email={form.email}
                  website={form.website}
                  businessName={form.businessName}
                  preloadedCandidates={preloadedCandidates}
                  scrapeLoading={scrapeLoading}
                />

                <DidYouKnow index={6} />
              </div>
            )}

            <div className={`mt-8 flex ${step > 1 ? "justify-between" : "justify-end"}`}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => goToStep(step - 1)}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-black transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}

              <button
                type="button"
                disabled={!canNext() || isSubmitting}
                onClick={() => {
                  if (step === 1 && !validateEmailField(form.email)) return;
                  if (step === 3) fireBackgroundScrape();
                  if (step < TOTAL_STEPS) goToStep(step + 1);
                  else handleSubmit();
                }}
                className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-6 py-3.5 text-sm font-bold rounded-2xl hover:bg-[#1457C0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-100"
              >
                {step === TOTAL_STEPS ? (isSubmitting ? "Submitting..." : "Get My Audit →") : "Next →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





