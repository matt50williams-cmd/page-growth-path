import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowLeft, Globe, MapPin, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { findFacebookCandidates } from "../api/facebook";
import { storeUtmParams, getStoredUtmParams } from "../utils/utm";
import { trackEvent, EVENTS } from "../utils/tracking";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const API_BASE = import.meta.env.VITE_API_BASE || "https://pageaudit-engine.onrender.com";
const TOTAL_STEPS = 6;

function StepProgress({ step }) {
  const labels = ["Let's go!", "Great! Keep going...", "You're doing great!", "Almost there...", "Two more steps!", "Final step!"];
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[#1877F2]">{labels[step - 1]}</span>
        <span className="text-xs text-gray-400 font-medium">Step {step} of {TOTAL_STEPS}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-[#1877F2] rounded-full transition-all duration-500" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
      </div>
    </div>
  );
}

function WhyWeAsk({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
        <span className="text-gray-300">?</span> Why do we ask this?
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && <p className="text-xs text-gray-500 mt-1.5 pl-1">{children}</p>}
    </div>
  );
}

const DID_YOU_KNOW = [
  "Pages that post 4-5 times per week grow 3x faster than those that post randomly.",
  "Facebook's algorithm rewards pages that respond to comments within the first 30 minutes.",
  "Local businesses that mention their city in posts see up to 40% more reach from nearby customers.",
  "Pages with a complete About section rank higher in Facebook search results.",
  "Video posts get 5x more reach than image posts on Facebook - even short 60-second videos.",
  "The best time to post for most businesses is between 1pm-4pm on weekdays.",
  "Businesses that respond to reviews get 35% more engagement on their posts.",
];

function DidYouKnow({ index }) {
  return (
    <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-start gap-2">
      <span className="text-blue-400 text-sm shrink-0">💡</span>
      <div>
        <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-0.5">Did you know?</p>
        <p className="text-xs text-blue-600">{DID_YOU_KNOW[index % DID_YOU_KNOW.length]}</p>
      </div>
    </div>
  );
}

function OptionCard({ selected, onClick, children }) {
  return (
    <button type="button" onClick={onClick} className={`w-full text-left px-4 py-3.5 rounded-2xl border-2 transition-all text-sm font-medium flex items-center gap-2 ${selected ? "border-[#1877F2] bg-blue-50 text-[#1877F2]" : "border-gray-100 bg-white hover:border-blue-200 text-gray-700"}`}>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? "border-[#1877F2] bg-[#1877F2]" : "border-gray-300"}`}>
        {selected && <Check className="w-3 h-3 text-white" />}
      </div>
      {children}
    </button>
  );
}

function HelpFindPage({ businessName, city, onUrlFound, onSkip }) {
  const [pasteUrl, setPasteUrl] = useState("");

  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">We already found your #1 problem!</h2>
      <p className="text-sm text-gray-500 leading-relaxed mb-1">If we can't find your Facebook page, neither can your customers.</p>
      <p className="text-sm text-gray-500 leading-relaxed mb-6">Your audit will include a step-by-step visibility fix.</p>

      <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="w-full bg-[#1877F2] text-white text-base font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#1457C0] transition-colors mb-4">
        Open Facebook <ExternalLink className="w-4 h-4" />
      </a>

      <p className="text-xs text-gray-400 mb-2">Find your page, copy the URL, and paste it here:</p>
      <input type="url" placeholder="https://www.facebook.com/yourbusiness" value={pasteUrl} onChange={(e) => setPasteUrl(e.target.value)} className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm text-center focus:outline-none focus:border-[#1877F2] transition-all" />
      {pasteUrl && pasteUrl.includes("facebook.com") && (
        <button type="button" onClick={() => onUrlFound(pasteUrl)} className="mt-3 w-full bg-green-500 text-white text-sm font-bold py-3.5 rounded-2xl hover:bg-green-600 transition-colors">
          Use This URL
        </button>
      )}

      <button type="button" onClick={onSkip} className="mt-4 text-sm text-[#1877F2] font-semibold hover:underline">
        Skip for now — include this fix in my report
      </button>
    </div>
  );
}

function FacebookPageFinder({ value, onChange, businessName, website, city, email, websiteLogoUrl, preloadedCandidates, scrapeLoading }) {
  const [searchName, setSearchName] = useState(businessName || "");
  const [candidates, setCandidates] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedUrl, setConfirmedUrl] = useState("");
  const [confirmedName, setConfirmedName] = useState("");
  const [rejectedUrls, setRejectedUrls] = useState([]);
  const [showHelper, setShowHelper] = useState(false);
  const [pasteUrl, setPasteUrl] = useState("");
  const [cardIndex, setCardIndex] = useState(0);

  useEffect(() => {
    if (preloadedCandidates?.length && !searched) {
      setCandidates(preloadedCandidates);
      setSearched(true);
    }
  }, [preloadedCandidates]);

  useEffect(() => { setSearchName(businessName || ""); }, [businessName]);

  const handleSearch = async () => {
    if (!searchName.trim()) return;
    setSearching(true);
    setSearched(false);
    setCandidates([]);
    setRejectedUrls([]);
    setShowHelper(false);
    setCardIndex(0);
    try {
      const result = await findFacebookCandidates({ pageName: searchName, businessName: searchName, website: website || null, email: email || null, city: city || null });
      if (result.candidates?.length) {
        setCandidates(result.candidates);
      } else {
        setShowHelper(true);
      }
    } catch (err) {
      setShowHelper(true);
    } finally {
      setSearching(false);
      setSearched(true);
    }
  };

  const handleConfirm = (url) => {
    setConfirmedUrl(url);
    setConfirmedName(searchName || businessName || "");
    setConfirmed(true);
    setShowHelper(false);
    onChange(url);
  };

  // Normalize candidate to object format (handles both string and object)
  const getUrl = (c) => typeof c === 'string' ? c : c.url;

  const handleNotMine = () => {
    const url = getUrl(visibleCandidates[cardIndex]);
    const newRejected = [...rejectedUrls, url];
    setRejectedUrls(newRejected);
    const remaining = candidates.filter(c => !newRejected.includes(getUrl(c)));
    if (remaining.length === 0) {
      setShowHelper(true);
    } else {
      setCardIndex(Math.min(cardIndex, remaining.length - 1));
    }
  };

  const handleStartOver = () => {
    setConfirmed(false);
    setConfirmedUrl("");
    setConfirmedName("");
    setCandidates([]);
    setSearched(false);
    setRejectedUrls([]);
    setShowHelper(false);
    setPasteUrl("");
    setCardIndex(0);
    onChange("");
  };

  const visibleCandidates = candidates.filter(c => !rejectedUrls.includes(getUrl(c)));
  const currentCandidate = visibleCandidates[cardIndex];
  const currentUrl = currentCandidate ? getUrl(currentCandidate) : null;

  if (confirmed) {
    return (
      <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-green-800 text-sm">Page Confirmed!</p>
            <p className="text-sm font-semibold text-gray-800">{confirmedName}</p>
            <p className="text-xs text-green-600 truncate max-w-xs">{confirmedUrl}</p>
          </div>
        </div>
        <p className="text-xs text-green-700 font-medium text-center mb-2">Your audit will analyze this page in detail.</p>
        <button type="button" onClick={handleStartOver} className="w-full text-xs text-gray-400 hover:text-gray-600 py-1">Not right? Start over</button>
      </div>
    );
  }

  if (showHelper) {
    return <HelpFindPage businessName={businessName} city={city} onUrlFound={handleConfirm} onSkip={() => { onChange("skip"); }} />;
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">Facebook Page Name <span className="text-gray-400 font-normal">(optional)</span></label>
        <div className="flex gap-2">
          <input type="text" placeholder={businessName || "Your business name"} value={searchName} onChange={(e) => setSearchName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="flex-1 border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#1877F2] transition-all" />
          <button type="button" onClick={handleSearch} disabled={searching || scrapeLoading} className="bg-[#1877F2] text-white px-5 py-3.5 rounded-2xl text-sm font-bold hover:bg-[#1457C0] transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0">
            {searching || scrapeLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Finding...</> : <><span>🔍</span> Find</>}
          </button>
        </div>
      </div>

      {searched && visibleCandidates.length > 0 && currentUrl && (
        <div>
          {visibleCandidates.length > 1 && (
            <p className="text-xs text-gray-400 text-center mb-3">{cardIndex + 1} of {visibleCandidates.length} possible matches</p>
          )}

          <div className="border-2 border-blue-100 bg-blue-50 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              {currentCandidate?.image ? (
                <img src={currentCandidate.image} alt="" className="w-12 h-12 rounded-full object-cover shrink-0 bg-gray-200" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              ) : null}
              <div className={`w-12 h-12 rounded-full bg-[#1877F2] items-center justify-center shrink-0 ${currentCandidate?.image ? 'hidden' : 'flex'}`}>
                <span className="text-white text-lg font-bold">{(currentCandidate?.name || searchName || businessName || "?").charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-gray-900 truncate">{currentCandidate?.name || searchName || businessName}</p>
                {currentCandidate?.followers && (
                  <p className="text-xs text-gray-600 font-medium">{currentCandidate.followers} followers</p>
                )}
                <p className="text-xs text-gray-400 truncate">{currentUrl}</p>
              </div>
            </div>

            <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-[#1877F2] text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#1457C0] transition-colors mb-3">
              Open This Page <ExternalLink className="w-4 h-4" />
            </a>

            <button type="button" onClick={() => handleConfirm(currentUrl)} className="w-full bg-green-500 text-white text-base font-bold py-4 rounded-xl hover:bg-green-600 transition-colors">
              Yes, That's Mine!
            </button>

            <button type="button" onClick={handleNotMine} className="w-full text-sm text-gray-400 hover:text-gray-600 py-3">
              Not mine{visibleCandidates.length > 1 && cardIndex < visibleCandidates.length - 1 ? " — show next" : ""}
            </button>
          </div>

          {visibleCandidates.length > 1 && (
            <div className="flex justify-center gap-3 mt-3">
              <button type="button" disabled={cardIndex === 0} onClick={() => setCardIndex(cardIndex - 1)} className="text-sm text-[#1877F2] font-semibold disabled:text-gray-300 disabled:cursor-not-allowed">
                <ArrowLeft className="w-4 h-4 inline mr-1" />Previous
              </button>
              <button type="button" disabled={cardIndex >= visibleCandidates.length - 1} onClick={() => setCardIndex(cardIndex + 1)} className="text-sm text-[#1877F2] font-semibold disabled:text-gray-300 disabled:cursor-not-allowed">
                Next<ArrowLeft className="w-4 h-4 inline ml-1 rotate-180" />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-500 mb-2 font-semibold">Or paste your Facebook URL directly:</p>
        <input type="url" placeholder="https://www.facebook.com/yourbusiness" value={pasteUrl} onChange={(e) => { setPasteUrl(e.target.value); if (e.target.value.includes("facebook.com")) onChange(e.target.value); }} className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1877F2] transition-all" />
        {pasteUrl && pasteUrl.includes("facebook.com") && (
          <button type="button" onClick={() => handleConfirm(pasteUrl)} className="mt-2 w-full bg-green-500 text-white text-sm font-bold py-3 rounded-2xl hover:bg-green-600 transition-colors">Use This URL</button>
        )}
      </div>

      <p className="text-center text-xs text-gray-400">
        Can't find it?{" "}
        <button type="button" onClick={() => setShowHelper(true)} className="text-[#1877F2] font-semibold hover:underline">Get help</button>
      </p>
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
  const [websiteLogoUrl, setWebsiteLogoUrl] = useState("");
  const [scrapeLoading, setScrapeLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", businessName: "", website: "", city: "", facebook_url: "", mainGoal: [], postingFrequency: "", contentType: "",
  });

  useEffect(() => { storeUtmParams(); trackEvent(EVENTS.INTAKE_STARTED); }, []);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validateEmailField = (email) => {
    const trimmed = email?.trim() || "";
    setEmailTouched(true);
    if (!trimmed) { setEmailError("Email is required"); return false; }
    if (!isValidEmail(trimmed)) { setEmailError("Please enter a valid email address"); return false; }
    setEmailError("");
    return true;
  };

  const fireBackgroundScrape = async () => {
    if (!form.businessName && !form.website) return;
    setScrapeLoading(true);
    try {
      const result = await findFacebookCandidates({ pageName: form.businessName || form.name, businessName: form.businessName || form.name, website: form.website || null, email: form.email || null, city: form.city || null });
      setPreloadedCandidates(result.candidates?.length ? result.candidates : []);

      if (form.website) {
        try {
          const scrapeRes = await fetch(`${API_BASE}/api/website/scrape`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ website_url: form.website, business_name: form.businessName || null, city: form.city || null }),
          });
          const scrapeData = await scrapeRes.json();
          if (scrapeData.seo_score) setSeoScore(scrapeData.seo_score);
          if (scrapeData.logo_url) setWebsiteLogoUrl(scrapeData.logo_url);
          else setWebsiteLogoUrl("");
        } catch (err) {
          console.error("Website scrape failed:", err);
        }
      }
    } catch (err) {
      console.error("Background scrape failed:", err);
    } finally {
      setScrapeLoading(false);
    }
  };

  const goToStep = (n) => { setStep(n); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const canNext = () => {
    if (step === 1) return form.name.trim() && form.email.trim() && !emailError && isValidEmail(form.email);
    if (step === 2) return form.businessName.trim() && form.city.trim();
    if (step === 3) return form.mainGoal.length > 0;
    if (step === 4) return !!form.postingFrequency;
    if (step === 5) return !!form.contentType;
    if (step === 6) return true;
    return true;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const utm = getStoredUtmParams() || {};
      const fbUrl = form.facebook_url === "skip" ? "" : form.facebook_url || "";
      const facebookNotFound = !fbUrl || form.facebook_url === "skip";
      const res = await fetch(`${API_BASE}/api/audits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name, email: form.email, facebook_url: fbUrl,
          facebook_not_found: facebookNotFound,
          account_type: "Business", goals: form.mainGoal.join(", "),
          posting_frequency: form.postingFrequency, content_type: form.contentType,
          website: form.website || null, city: form.city || null, business_name: form.businessName || null,
          utm_source: utm.utm_source || null, utm_campaign: utm.utm_campaign || null,
          utm_adset: utm.utm_adset || null, utm_ad: utm.utm_ad || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success || !data?.audit?.id) throw new Error(data?.error || "Audit creation failed");
      localStorage.setItem("pageAuditOrder", JSON.stringify({
        name: form.name, email: form.email, website: form.website, businessName: form.businessName,
        pageUrl: fbUrl, businessType: "Business", city: form.city, review_type: "Business",
        mainGoal: form.mainGoal, postingFrequency: form.postingFrequency, contentType: form.contentType,
        seoScore: seoScore, facebookNotFound: facebookNotFound, auditId: data.audit.id,
      }));
      const seoValue = seoScore?.score ?? seoScore;
      console.log("[SEO SCORE DEBUG]:", { raw: seoScore, sending: seoValue, auditId: data.audit.id });
      fetch(`${API_BASE}/api/audits/${data.audit.id}/seo-score`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ score: seoValue }) }).catch((err) => console.error("[SEO SCORE SAVE ERROR]:", err)); navigate("/audit-preview");
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
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Your Name <span className="text-red-400">*</span></label>
                    <input type="text" placeholder="Jane Smith" value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#1877F2] transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email Address <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <input type="email" placeholder="jane@yourbusiness.com" value={form.email} onChange={(e) => { set("email", e.target.value); if (emailError) setEmailError(""); }} onBlur={(e) => validateEmailField(e.target.value)} className={`w-full border-2 rounded-2xl px-4 py-3.5 text-sm focus:outline-none transition-all pr-10 ${emailTouched && isValidEmail(form.email) ? "border-green-300 bg-green-50" : emailTouched && emailError ? "border-red-300" : "border-gray-100 focus:border-[#1877F2]"}`} />
                      {emailTouched && isValidEmail(form.email) && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Check className="w-5 h-5 text-green-500" /></div>}
                    </div>
                    {emailTouched && emailError && <p className="text-xs text-red-500 mt-1.5">{emailError}</p>}
                  </div>
                </div>
                <DidYouKnow index={0} />
              </div>
            )}

            {step === 2 && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Tell us about your business</h1>
                <p className="text-sm text-gray-400 mb-6">We'll use this to find your Facebook page and personalize your report.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Business Name <span className="text-red-400">*</span></label>
                    <input type="text" placeholder="e.g. Allred Heating or Righteous Law" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#1877F2] transition-all" />
                    <WhyWeAsk>We use your business name to automatically find your Facebook page and search for local competitors in your area.</WhyWeAsk>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                      <Globe className="w-4 h-4 inline mr-1 text-[#1877F2]" />
                      Business Website <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input type="url" placeholder="https://yourbusiness.com" value={form.website} onChange={(e) => set("website", e.target.value)} className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#1877F2] transition-all" />
                    <div className="mt-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 flex items-start gap-2">
                      <span className="text-green-500 text-sm shrink-0">🎁</span>
                      <p className="text-xs text-green-700 font-medium">Add your website and get a <strong>FREE Website SEO Score</strong> included with your audit - limited time bonus!</p>
                    </div>
                    <WhyWeAsk>We scan your website to automatically find your Facebook page and include a free SEO score showing how Google sees your site.</WhyWeAsk>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                      <MapPin className="w-4 h-4 inline mr-1 text-[#1877F2]" />
                      City and State <span className="text-red-400">*</span>
                    </label>
                    <input type="text" placeholder="e.g. Dallas, TX or Seattle, WA" value={form.city} onChange={(e) => set("city", e.target.value)} className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#1877F2] transition-all" />
                    <WhyWeAsk>We pull real-time data on what is working for businesses in your area right now.</WhyWeAsk>
                  </div>
                </div>
                <DidYouKnow index={2} />
              </div>
            )}

            {step === 3 && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">What's your main goal?</h1>
                <p className="text-sm text-gray-400 mb-6">Your entire action plan is built around this.</p>
                <div className="space-y-2">
                  {[{ val: "Grow followers", icon: "👥" }, { val: "Increase engagement", icon: "💬" }, { val: "Generate leads", icon: "💰" }, { val: "Build authority", icon: "⭐" }, { val: "Promote a cause", icon: "❤️" }].map(({ val, icon }) => (
                    <OptionCard key={val} selected={form.mainGoal.includes(val)} onClick={() => set("mainGoal", form.mainGoal.includes(val) ? form.mainGoal.filter((x) => x !== val) : [...form.mainGoal, val])}>
                      {icon} {val}
                    </OptionCard>
                  ))}
                </div>
                <WhyWeAsk>We write your 7-day action plan and 30-day roadmap specifically around this goal.</WhyWeAsk>
                <DidYouKnow index={3} />
              </div>
            )}

            {step === 4 && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">How often do you post?</h1>
                <p className="text-sm text-gray-400 mb-6">This helps us assess your current posting strategy.</p>
                <div className="space-y-2">
                  {[{ val: "Daily", icon: "🔥" }, { val: "A few times a week", icon: "📅" }, { val: "Weekly", icon: "🗓" }, { val: "Rarely or never", icon: "😴" }].map(({ val, icon }) => (
                    <OptionCard key={val} selected={form.postingFrequency === val} onClick={() => set("postingFrequency", val)}>{icon} {val}</OptionCard>
                  ))}
                </div>
                <WhyWeAsk>Posting frequency is one of the biggest factors in Facebook reach.</WhyWeAsk>
                <DidYouKnow index={4} />
              </div>
            )}

            {step === 5 && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">What do you post most?</h1>
                <p className="text-sm text-gray-400 mb-6">We'll analyze your content performance on this.</p>
                <div className="space-y-2">
                  {[{ val: "Videos", icon: "🎥" }, { val: "Images", icon: "📸" }, { val: "Text posts", icon: "✍️" }, { val: "Mixed content", icon: "🎨" }, { val: "Not sure yet", icon: "🤔" }].map(({ val, icon }) => (
                    <OptionCard key={val} selected={form.contentType === val} onClick={() => set("contentType", val)}>{icon} {val}</OptionCard>
                  ))}
                </div>
                <WhyWeAsk>Different content types perform very differently on Facebook.</WhyWeAsk>
                <DidYouKnow index={5} />
              </div>
            )}

            {step === 6 && (
              <div>
                {!form.facebook_url && (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                      {preloadedCandidates.length ? "We found some possible matches!" : "Find Your Facebook Page"}
                    </h1>
                    <p className="text-sm text-gray-400 mb-4">
                      {preloadedCandidates.length ? "Confirm which one is yours." : "We'll search using your business name and website to help find the right Facebook page."}
                    </p>
                  </>
                )}
                <FacebookPageFinder
                  value={form.facebook_url}
                  onChange={(url) => set("facebook_url", url)}
                  email={form.email}
                  website={form.website}
                  city={form.city}
                  businessName={form.businessName}
                  websiteLogoUrl={websiteLogoUrl}
                  preloadedCandidates={preloadedCandidates}
                  scrapeLoading={scrapeLoading}
                />
                <DidYouKnow index={6} />
              </div>
            )}

            <div className={`mt-8 flex ${step > 1 ? "justify-between" : "justify-end"}`}>
              {step > 1 && (
                <button type="button" onClick={() => goToStep(step - 1)} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-black transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              <button type="button" disabled={!canNext() || isSubmitting} onClick={() => { if (step === 1 && !validateEmailField(form.email)) return; if (step === 2) fireBackgroundScrape(); if (step < TOTAL_STEPS) goToStep(step + 1); else handleSubmit(); }} className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-6 py-3.5 text-sm font-bold rounded-2xl hover:bg-[#1457C0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-100">
                {step === TOTAL_STEPS ? (isSubmitting ? "Submitting..." : "Get My Audit →") : "Next →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



