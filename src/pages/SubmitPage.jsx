import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Check, Search } from "lucide-react";
import { storeUtmParams, getStoredUtmParams } from "@/utils/utm";
import { trackEvent, EVENTS } from "@/utils/tracking";

const TOTAL_STEPS = 5;
const API_BASE = "https://pageaudit-engine.onrender.com";

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim() || "");
};

function StepProgress({ step }) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-400">Step {step} of {TOTAL_STEPS}</span>
        <span className="text-xs font-medium text-gray-400">{Math.round((step / TOTAL_STEPS) * 100)}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1">
        <div className="bg-[#1877F2] h-1 rounded-full transition-all duration-500" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
      </div>
    </div>
  );
}

function MultiCard({ selected, onClick, children }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left px-4 py-4 rounded-2xl border-2 transition-all duration-150 flex items-center gap-3 ${selected ? "border-[#1877F2] bg-blue-50 shadow-sm" : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"}`}>
      <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${selected ? "border-[#1877F2] bg-[#1877F2]" : "border-gray-300 bg-white"}`}>
        {selected && <Check className="w-3 h-3 text-white" />}
      </span>
      <span className={`text-sm font-medium ${selected ? "text-[#1877F2]" : "text-gray-700"}`}>{children}</span>
    </button>
  );
}

function FacebookPageLookup({ value, onChange }) {
  const [pageName, setPageName] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imgSrc, setImgSrc] = useState("");
  const [searching, setSearching] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const cleanPageName = (name) => {
    return name.trim()
      .replace(/https?:\/\/(www\.)?facebook\.com\//i, '')
      .replace(/\/$/, '')
      .replace(/\s+/g, '');
  };

  const handleSearch = async () => {
    if (!pageName.trim()) return;
    setSearching(true);
    setImgError(false);

    const cleaned = cleanPageName(pageName);
    const url = `https://www.facebook.com/${cleaned}`;
    const pic = `https://graph.facebook.com/${cleaned}/picture?type=large&redirect=true`;

    setPreviewUrl(url);
    setImgSrc(pic);
    setConfirmed(false);
    onChange("");
    setAttempts(prev => prev + 1);
    setSearching(false);
  };

  const handleConfirm = () => {
    setConfirmed(true);
    onChange(previewUrl);
  };

  const handleReset = () => {
    setConfirmed(false);
    setPreviewUrl("");
    setImgSrc("");
    setImgError(false);
    onChange("");
    // Keep pageName so they can tweak and search again
  };

  const handleChangeConfirmed = () => {
    setConfirmed(false);
    setPreviewUrl("");
    setImgSrc("");
    setImgError(false);
    setPageName("");
    onChange("");
    setAttempts(0);
  };

  return (
    <div className="space-y-4">
      {!confirmed ? (
        <>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              Your Facebook Page Name <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. RighteousNetwork or Matt's Plumbing"
                value={pageName}
                onChange={(e) => {
                  setPageName(e.target.value);
                  setPreviewUrl("");
                  setConfirmed(false);
                  setImgSrc("");
                  onChange("");
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1877F2] transition-all"
              />
              <button type="button" onClick={handleSearch}
                disabled={!pageName.trim() || searching}
                className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-5 py-3.5 text-sm font-bold rounded-2xl hover:bg-[#1457C0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                {searching ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {attempts > 0 ? 'Search Again' : 'Find'}
              </button>
            </div>

            {attempts > 0 && !previewUrl && (
              <p className="text-xs text-orange-500 mt-2 font-medium">
                💡 Try a different variation — use your exact Facebook username or page URL
              </p>
            )}

            {attempts === 0 && (
              <p className="text-xs text-gray-400 mt-2">Type your Facebook page name or username exactly as it appears</p>
            )}
          </div>

          {previewUrl && (
            <div className="bg-blue-50 border-2 border-[#1877F2] rounded-2xl p-5">
              <p className="text-xs font-bold text-[#1877F2] uppercase tracking-wide mb-4">
                Is this your page?
              </p>

              <div className="bg-white rounded-xl p-4 mb-4 flex items-center gap-4 border border-gray-100 shadow-sm">
                {!imgError ? (
                  <img
                    src={imgSrc}
                    alt={pageName}
                    onError={() => setImgError(true)}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#1877F2] flex items-center justify-center shrink-0 border-2 border-gray-100">
                    <span className="text-white font-bold text-2xl">f</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-base truncate">{pageName}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{previewUrl}</p>
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#1877F2] hover:underline font-semibold mt-1">
                    Open on Facebook ↗
                  </a>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-4">
                Click <strong>"Open on Facebook"</strong> to verify it's the right page, then confirm below.
              </p>

              <div className="flex gap-3">
                <button type="button" onClick={handleConfirm}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#1877F2] text-white px-4 py-3 text-sm font-bold rounded-xl hover:bg-[#1457C0] transition-colors">
                  <Check className="w-4 h-4" /> Yes, that's my page!
                </button>
                <button type="button" onClick={handleReset}
                  className="flex-1 border-2 border-gray-200 text-gray-600 px-4 py-3 text-sm font-semibold rounded-xl hover:border-gray-400 transition-colors">
                  Not right, try again
                </button>
              </div>

              {attempts >= 2 && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                  <p className="text-xs text-yellow-800 font-semibold mb-1">💡 Can't find your page?</p>
                  <p className="text-xs text-yellow-700">Try pasting your Facebook URL directly in the box below instead.</p>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 mb-2 font-semibold">Or paste your Facebook URL directly:</p>
            <input
              type="url"
              placeholder="https://www.facebook.com/yourbusiness"
              onChange={(e) => {
                if (e.target.value.includes('facebook.com')) {
                  onChange(e.target.value);
                  setPreviewUrl(e.target.value);
                  setConfirmed(true);
                }
              }}
              className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1877F2] transition-all"
            />
          </div>
        </>
      ) : (
        <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-5">
          <div className="flex items-center gap-4 mb-3">
            {imgSrc && !imgError ? (
              <img src={imgSrc} alt={pageName}
                className="w-14 h-14 rounded-full object-cover border-2 border-green-200 shrink-0" />
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
              <p className="text-sm font-semibold text-gray-800">{pageName}</p>
              <p className="text-xs text-green-600 truncate">{previewUrl || value}</p>
            </div>
          </div>
          <button type="button" onClick={handleChangeConfirmed}
            className="text-xs text-green-700 hover:underline font-semibold">
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
  const [urlError, setUrlError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    facebook_url: "",
    mainGoal: [],
    postingFrequency: [],
    contentType: [],
  });

  useEffect(() => {
    storeUtmParams();
    trackEvent(EVENTS.INTAKE_STARTED);
  }, []);

  const toggle = (key, val) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val],
    }));

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validateEmailField = (email) => {
    const trimmed = email?.trim() || "";
    setEmailTouched(true);
    if (!trimmed) { setEmailError("Email is required"); return false; }
    if (!isValidEmail(trimmed)) { setEmailError("Please enter a valid email address"); return false; }
    setEmailError("");
    return true;
  };

  const validateUrl = (url) => {
    if (!url.trim()) return "Please find and confirm your Facebook page above.";
    if (!url.toLowerCase().includes("facebook.com")) return "Please enter a valid Facebook URL.";
    return "";
  };

  const goToStep = (n) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const canNext = () => {
    if (step === 1) return form.name.trim() && form.email.trim() && !emailError && isValidEmail(form.email);
    if (step === 2) return !validateUrl(form.facebook_url);
    if (step === 3) return form.mainGoal.length > 0;
    if (step === 4) return form.postingFrequency.length > 0;
    if (step === 5) return form.contentType.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const utm = getStoredUtmParams() || {};
      const res = await fetch(`${API_BASE}/api/audits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name,
          email: form.email,
          facebook_url: form.facebook_url,
          account_type: "Business",
          goals: form.mainGoal.join(", "),
          posting_frequency: form.postingFrequency.join(", "),
          content_type: form.contentType.join(", "),
          utm_source: utm.utm_source || null,
          utm_campaign: utm.utm_campaign || null,
          utm_adset: utm.utm_adset || null,
          utm_ad: utm.utm_ad || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success || !data?.audit?.id) throw new Error(data?.error || "Audit creation failed");
      const auditId = data.audit.id;
      try {
        await fetch(`${API_BASE}/api/funnel/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_type: "intake_submitted",
            email: form.email,
            report_id: auditId,
            facebook_url: form.facebook_url,
            utm_source: utm.utm_source || null,
            utm_campaign: utm.utm_campaign || null,
            metadata: { name: form.name, mainGoal: form.mainGoal, postingFrequency: form.postingFrequency, contentType: form.contentType },
          }),
        });
      } catch (trackErr) { console.error("Tracking failed:", trackErr); }

      localStorage.setItem("pageAuditOrder", JSON.stringify({
        name: form.name,
        email: form.email,
        pageUrl: form.facebook_url,
        review_type: "Business",
        mainGoal: form.mainGoal,
        postingFrequency: form.postingFrequency,
        contentType: form.contentType,
        auditId,
      }));
      navigate("/analyzing");
    } catch (err) {
      console.error("[AUDIT ERROR]:", err);
      alert("Error creating audit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    "Let's Start With Your Contact Info",
    "Find Your Facebook Business Page",
    "What's Your Main Goal?",
    "How Often Do You Post?",
    "What Content Do You Post Most?",
  ];

  const stepSubs = [
    "Enter your contact info so we can send you your audit.",
    "Search for your page and confirm it's correct — no copy/pasting needed!",
    "Help us understand what you're trying to achieve.",
    "This helps us assess your current posting strategy.",
    "We'll analyze your content performance on this.",
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <span className="font-bold text-base text-black tracking-tight">PageAudit Pro</span>
        </div>
      </nav>

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <StepProgress step={step} />

          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm px-7 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{stepTitles[step - 1]}</h1>
            <p className="text-sm text-gray-400 mb-8">{stepSubs[step - 1]}</p>

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                  <input type="text" placeholder="Jane Smith" value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1877F2] transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email Address <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <input type="email" placeholder="jane@yourbusiness.com" value={form.email}
                      onChange={(e) => { set("email", e.target.value); if (emailError) setEmailError(""); }}
                      onBlur={(e) => validateEmailField(e.target.value)}
                      className={`w-full border-2 rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all pr-10 ${emailTouched && isValidEmail(form.email) ? "border-green-300 bg-green-50" : emailTouched && emailError ? "border-red-300" : "border-gray-100 focus:border-[#1877F2]"}`} />
                    {emailTouched && isValidEmail(form.email) && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {emailTouched && emailError && <p className="text-xs text-red-500 mt-1.5">{emailError}</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <FacebookPageLookup
                value={form.facebook_url}
                onChange={(url) => { set("facebook_url", url); setUrlError(""); }}
              />
            )}

            {step === 3 && (
              <div className="space-y-2">
                {["Grow followers", "Increase engagement", "Generate leads", "Build authority", "Promote a cause"].map((option) => (
                  <MultiCard key={option} selected={form.mainGoal.includes(option)} onClick={() => toggle("mainGoal", option)}>{option}</MultiCard>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-2">
                {["Daily", "A few times a week", "Weekly", "Rarely"].map((option) => (
                  <MultiCard key={option} selected={form.postingFrequency.includes(option)} onClick={() => toggle("postingFrequency", option)}>{option}</MultiCard>
                ))}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-2">
                {["Videos", "Images", "Text posts", "Mixed", "Not sure"].map((option) => (
                  <MultiCard key={option} selected={form.contentType.includes(option)} onClick={() => toggle("contentType", option)}>{option}</MultiCard>
                ))}
              </div>
            )}

            <div className={`mt-8 flex ${step > 1 ? "justify-between" : "justify-end"}`}>
              {step > 1 && (
                <button type="button" onClick={() => goToStep(step - 1)}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-black transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              <button type="button" disabled={!canNext() || isSubmitting}
                onClick={() => {
                  if (step === 1 && !validateEmailField(form.email)) return;
                  if (step === 2) {
                    const err = validateUrl(form.facebook_url);
                    if (err) { setUrlError(err); return; }
                  }
                  if (step < TOTAL_STEPS) goToStep(step + 1);
                  else handleSubmit();
                }}
                className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-6 py-3 text-sm font-semibold rounded-2xl hover:bg-[#1457C0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-100">
                {step === TOTAL_STEPS ? (isSubmitting ? "Submitting..." : "Get My Page Audit") : "Next"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


