import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import FacebookUrlHelper from "@/components/FacebookUrlHelper";
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
        <span className="text-xs font-medium text-gray-400">
          Step {step} of {TOTAL_STEPS}
        </span>
        <span className="text-xs font-medium text-gray-400">
          {Math.round((step / TOTAL_STEPS) * 100)}%
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1">
        <div
          className="bg-[#1877F2] h-1 rounded-full transition-all duration-500"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>
    </div>
  );
}

function MultiCard({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-4 rounded-2xl border-2 transition-all duration-150 flex items-center gap-3 ${
        selected
          ? "border-[#1877F2] bg-blue-50 shadow-sm"
          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
      }`}
    >
      <span
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
          selected ? "border-[#1877F2] bg-[#1877F2]" : "border-gray-300 bg-white"
        }`}
      >
        {selected && <Check className="w-3 h-3 text-white" />}
      </span>
      <span
        className={`text-sm font-medium ${
          selected ? "text-[#1877F2]" : "text-gray-700"
        }`}
      >
        {children}
      </span>
    </button>
  );
}

function TextInput({ label, required, error, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        {...props}
        className={`w-full border-2 rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all bg-white ${
          error
            ? "border-red-300 focus:border-red-400"
            : "border-gray-100 focus:border-[#1877F2]"
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}

export default function SubmitPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [emailError, setEmailError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [showHelper, setShowHelper] = useState(false);
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
      [key]: f[key].includes(val)
        ? f[key].filter((x) => x !== val)
        : [...f[key], val],
    }));

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

  const validateUrl = (url) => {
    if (!url.trim()) return "Please enter your Facebook Business Page URL.";
    if (!url.toLowerCase().includes("facebook.com")) {
      return "Please enter a valid Facebook URL.";
    }
    return "";
  };

  const goToStep = (n) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const canNext = () => {
    if (step === 1) {
      return (
        form.name.trim() &&
        form.email.trim() &&
        !emailError &&
        isValidEmail(form.email)
      );
    }
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
        headers: {
          "Content-Type": "application/json",
        },
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

      if (!res.ok || !data?.success || !data?.audit?.id) {
        throw new Error(data?.error || "Audit creation failed");
      }

      const auditId = data.audit.id;

      try {
        await fetch(`${API_BASE}/api/funnel/track`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_type: "intake_submitted",
            email: form.email,
            report_id: auditId,
            facebook_url: form.facebook_url,
            utm_source: utm.utm_source || null,
            utm_campaign: utm.utm_campaign || null,
            utm_adset: utm.utm_adset || null,
            utm_ad: utm.utm_ad || null,
            metadata: {
              name: form.name,
              mainGoal: form.mainGoal,
              postingFrequency: form.postingFrequency,
              contentType: form.contentType,
            },
          }),
        });
      } catch (trackErr) {
        console.error("Tracking failed:", trackErr);
      }

      const order = {
        name: form.name,
        email: form.email,
        pageUrl: form.facebook_url,
        review_type: "Business",
        mainGoal: form.mainGoal,
        postingFrequency: form.postingFrequency,
        contentType: form.contentType,
        auditId,
      };

      localStorage.setItem("pageAuditOrder", JSON.stringify(order));
      navigate("/analyzing");
    } catch (err) {
      console.error("[AUDIT ERROR]:", err);
      alert("Error creating audit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepCTAs = [
    "Next",
    "Next",
    "Next",
    "Next",
    isSubmitting ? "Submitting..." : "Get My Page Audit",
  ];

  const stepTitles = [
    "Let's Start With Your Contact Info",
    "Enter Your Facebook Business Page URL",
    "What's Your Main Goal?",
    "How Often Do You Post?",
    "What Content Do You Post Most?",
  ];

  const stepSubs = [
    "Enter your contact info so we can send you your audit.",
    "So we can analyze your page and generate your audit.",
    "Help us understand what you're trying to achieve.",
    "This helps us assess your current posting strategy.",
    "We'll analyze your content performance on this.",
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <span className="font-bold text-base text-black tracking-tight">
            PageAudit Pro
          </span>
        </div>
      </nav>

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <StepProgress step={step} />

          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm px-7 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {stepTitles[step - 1]}
            </h1>
            <p className="text-sm text-gray-400 mb-8">{stepSubs[step - 1]}</p>

            {step === 1 && (
              <div className="space-y-5">
                <TextInput
                  label="Full Name"
                  required
                  type="text"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Email Address
                    <span className="text-red-400 ml-1">*</span>
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
                      className={`w-full border-2 rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all pr-10 ${
                        emailTouched && isValidEmail(form.email)
                          ? "border-green-300 focus:border-green-400 bg-green-50"
                          : emailTouched && emailError
                            ? "border-red-300 focus:border-red-400"
                            : "border-gray-100 focus:border-[#1877F2]"
                      }`}
                    />

                    {emailTouched && isValidEmail(form.email) && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg
                          className="w-5 h-5 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {emailTouched && emailError && (
                    <p className="text-xs text-red-500 mt-1.5">{emailError}</p>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <TextInput
                  label="Facebook Business Page URL"
                  required
                  type="url"
                  placeholder="facebook.com/yourbusiness"
                  value={form.facebook_url}
                  onChange={(e) => {
                    set("facebook_url", e.target.value);
                    setUrlError("");
                  }}
                  error={
                    urlError ||
                    (form.facebook_url.trim() &&
                    !form.facebook_url.toLowerCase().includes("facebook.com")
                      ? "Must be a valid Facebook URL"
                      : "")
                  }
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-2">
                {[
                  "Grow followers",
                  "Increase engagement",
                  "Generate leads",
                  "Build authority",
                  "Promote a cause",
                ].map((option) => (
                  <MultiCard
                    key={option}
                    selected={form.mainGoal.includes(option)}
                    onClick={() => toggle("mainGoal", option)}
                  >
                    {option}
                  </MultiCard>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-2">
                {["Daily", "A few times a week", "Weekly", "Rarely"].map(
                  (option) => (
                    <MultiCard
                      key={option}
                      selected={form.postingFrequency.includes(option)}
                      onClick={() => toggle("postingFrequency", option)}
                    >
                      {option}
                    </MultiCard>
                  ),
                )}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-2">
                {["Videos", "Images", "Text posts", "Mixed", "Not sure"].map(
                  (option) => (
                    <MultiCard
                      key={option}
                      selected={form.contentType.includes(option)}
                      onClick={() => toggle("contentType", option)}
                    >
                      {option}
                    </MultiCard>
                  ),
                )}
              </div>
            )}

            <div
              className={`mt-8 flex ${step > 1 ? "justify-between" : "justify-end"}`}
            >
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
                  if (step === 1) {
                    if (!validateEmailField(form.email)) return;
                  }

                  if (step === 2) {
                    const urlValidationError = validateUrl(form.facebook_url);
                    if (urlValidationError) {
                      setUrlError(urlValidationError);
                      return;
                    }
                  }

                  if (step < TOTAL_STEPS) goToStep(step + 1);
                  else handleSubmit();
                }}
                className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-6 py-3 text-sm font-semibold rounded-2xl hover:bg-[#1457C0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-100"
              >
                {stepCTAs[step - 1]} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <FacebookUrlHelper
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
      />
    </div>
  );
}