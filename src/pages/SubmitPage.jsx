import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BarChart2, ArrowRight, ArrowLeft, Check, Shield, Zap, Clock, Search, Globe, Star, MapPin, Facebook, Loader2 } from "lucide-react";
import { storeUtmParams, getStoredUtmParams } from "../utils/utm";
import { trackEvent, EVENTS } from "../utils/tracking";

const API_BASE = import.meta.env.VITE_API_BASE || "https://pageaudit-engine.onrender.com";
const TOTAL_STEPS = 4;

const INDUSTRIES = [
  "Restaurant", "Plumber", "Electrician", "HVAC", "Roofer", "Dentist", "Salon / Barber",
  "Auto Repair", "Gym / Fitness", "Lawyer", "Real Estate", "Landscaper",
  "Cleaning Service", "Contractor", "Medical / Health", "Retail Store", "Other",
];

const CHALLENGES = [
  "Not enough new customers finding me online",
  "I have bad or very few online reviews",
  "My competitors are beating me online",
  "My website isn't working well",
  "I'm not sure where to start",
];

const TENURE = ["Less than 1 year", "1-3 years", "3-10 years", "10+ years"];
const BUDGET = ["$0 — I don't spend anything", "Under $500/mo", "$500-2,000/mo", "$2,000+/mo"];

const CHECKS = [
  { emoji: "🔍", label: "Google Business Profile", desc: "rating, reviews, hours, photos, response rate" },
  { emoji: "⭐", label: "Yelp", desc: "rating, review count, listing status" },
  { emoji: "🌐", label: "Website", desc: "speed, mobile performance, SEO" },
  { emoji: "📍", label: "NAP Consistency", desc: "name, address, phone across 20+ directories" },
  { emoji: "📘", label: "Facebook", desc: "page activity and engagement" },
  { emoji: "🏆", label: "Competitor comparison", desc: "see how you stack up side by side" },
  { emoji: "🤖", label: "AI recommendations", desc: "personalized action plan" },
];

function useCountdown(minutes) {
  const [seconds, setSeconds] = useState(minutes * 60);
  useEffect(() => {
    const t = setInterval(() => setSeconds(s => Math.max(s - 1, 0)), 1000);
    return () => clearInterval(t);
  }, []);
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function SubmitPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const incoming = location.state || {};
  const countdown = useCountdown(10);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    businessName: incoming.businessName || "",
    city: incoming.city || "",
    state: incoming.state || "",
    address: "",
    phone: "",
    website: incoming.website || "",
    email: incoming.email || "",
    industry: "",
    googleUrl: "",
    facebookUrl: incoming.facebookUrl || "",
    yelpUrl: "",
    googleClaimed: "",
    approxReviews: "",
    tenure: "",
    challenge: "",
    budget: "",
    comp1Name: "",
    comp1City: "",
    comp2Name: "",
    comp2City: "",
  });

  useEffect(() => { storeUtmParams(); trackEvent(EVENTS.INTAKE_STARTED); window.scrollTo(0, 0); }, []);
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const goTo = (n) => { setStep(n); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const heading = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
  const body = { fontFamily: "'Inter', sans-serif" };

  const canNext = () => {
    if (step === 1) return form.businessName.trim() && form.city.trim() && form.email.trim() && form.email.includes("@");
    if (step === 2) return true; // all optional
    if (step === 3) return true; // all optional
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
          customer_name: form.businessName, email: form.email, facebook_url: form.facebookUrl || null,
          facebook_not_found: !form.facebookUrl, account_type: "Business",
          goals: form.challenge || null, posting_frequency: null, content_type: null,
          website: form.website || null, city: form.city || null, business_name: form.businessName || null,
          utm_source: utm.utm_source || null, utm_campaign: utm.utm_campaign || null,
          utm_adset: utm.utm_adset || null, utm_ad: utm.utm_ad || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success || !data?.audit?.id) throw new Error(data?.error || "Failed to create audit");

      localStorage.setItem("pageAuditOrder", JSON.stringify({
        name: form.businessName, email: form.email, website: form.website,
        businessName: form.businessName, city: form.city, state: form.state,
        pageUrl: form.facebookUrl, businessType: "Business",
        auditId: data.audit.id, industry: form.industry,
        address: form.address, phone: form.phone,
        googleUrl: form.googleUrl, yelpUrl: form.yelpUrl,
        tenure: form.tenure, challenge: form.challenge, budget: form.budget,
        comp1Name: form.comp1Name, comp1City: form.comp1City,
        comp2Name: form.comp2Name, comp2City: form.comp2City,
      }));

      navigate("/audit-preview");
    } catch (err) {
      console.error("[SUBMIT ERROR]:", err);
      alert("Something went wrong. Please try again.");
    } finally { setIsSubmitting(false); }
  };

  const Input = ({ label, k, type = "text", placeholder = "", required = false, helper = "" }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c8d0dc", marginBottom: 6 }}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <input type={type} value={form[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "#fff", outline: "none", boxSizing: "border-box" }} />
      {helper && <p style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>{helper}</p>}
    </div>
  );

  const Select = ({ label, k, options, placeholder = "Select..." }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c8d0dc", marginBottom: 6 }}>{label}</label>
      <select value={form[k]} onChange={e => set(k, e.target.value)}
        style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", fontSize: 14, color: form[k] ? "#fff" : "#64748b", outline: "none", boxSizing: "border-box", appearance: "none" }}>
        <option value="" style={{ background: "#0f172a" }}>{placeholder}</option>
        {options.map(o => <option key={o} value={o} style={{ background: "#0f172a" }}>{o}</option>)}
      </select>
    </div>
  );

  const RadioGroup = ({ label, k, options }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c8d0dc", marginBottom: 10 }}>{label}</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map(o => (
          <button key={o} type="button" onClick={() => set(k, o)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: `1px solid ${form[k] === o ? "rgba(37,99,235,0.5)" : "rgba(255,255,255,0.08)"}`, background: form[k] === o ? "rgba(37,99,235,0.1)" : "rgba(255,255,255,0.02)", cursor: "pointer", textAlign: "left" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${form[k] === o ? "#2563eb" : "#4b5563"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {form[k] === o && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#2563eb" }} />}
            </div>
            <span style={{ fontSize: 14, color: form[k] === o ? "#c8d0dc" : "#94a3b8" }}>{o}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ ...body, minHeight: "100vh", background: "#0a0f1e" }}>
      {/* NAV */}
      <nav style={{ background: "rgba(10,15,30,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "14px 24px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BarChart2 style={{ width: 18, height: 18, color: "#3b82f6" }} />
            <span style={{ ...heading, fontWeight: 700, fontSize: 14, color: "#fff" }}>PageAudit Pro</span>
          </div>
          <span style={{ fontSize: 12, color: "#64748b" }}>Step {step} of {TOTAL_STEPS}</span>
        </div>
      </nav>

      {/* PROGRESS BAR */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 999, marginTop: 12 }}>
          <div style={{ height: "100%", background: "#2563eb", borderRadius: 999, transition: "width 0.4s", width: `${(step / TOTAL_STEPS) * 100}%` }} />
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <h1 style={{ ...heading, fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Tell us about your business</h1>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 28 }}>We'll scan everywhere your customers look for you</p>
            <Input label="Business Name" k="businessName" required placeholder="e.g. Joe's Plumbing" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 12 }}>
              <Input label="City" k="city" required placeholder="e.g. Dallas" />
              <Input label="State" k="state" placeholder="TX" />
            </div>
            <Input label="Street Address" k="address" placeholder="123 Main St" />
            <Input label="Business Phone" k="phone" type="tel" placeholder="(555) 123-4567" />
            <Input label="Business Website" k="website" placeholder="https://yourbusiness.com" helper="We'll run a full speed and SEO check on your site" />
            <Input label="Email Address" k="email" type="email" required placeholder="you@business.com" />
            <Select label="Industry / Category" k="industry" options={INDUSTRIES} placeholder="Select your industry..." />

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 24, padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              {[{ i: Search, l: "Google" }, { i: Star, l: "Yelp" }, { i: Facebook, l: "Facebook" }, { i: Globe, l: "Bing" }, { i: MapPin, l: "Apple Maps" }].map(({ i: Icon, l }) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 4, color: "#64748b", fontSize: 12 }}>
                  <Icon style={{ width: 14, height: 14 }} /> {l}
                </div>
              ))}
            </div>
            <p style={{ color: "#4b5563", fontSize: 11, textAlign: "center" }}>We check all of these for you</p>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <h1 style={{ ...heading, fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Your online presence</h1>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 28 }}>Help us find your existing profiles for the most accurate scan</p>
            <Input label="Google Business Profile URL" k="googleUrl" placeholder="https://maps.google.com/..." helper="Have your Google listing? Paste the URL for the most accurate results" />
            <Input label="Facebook Page URL" k="facebookUrl" placeholder="https://facebook.com/yourbusiness" />
            <Input label="Yelp Page URL" k="yelpUrl" placeholder="https://yelp.com/biz/yourbusiness" />
            <RadioGroup label="Have you claimed your Google Business Profile?" k="googleClaimed" options={["Yes", "No", "Not sure"]} />
            <Input label="Approximate number of Google reviews" k="approxReviews" type="number" placeholder="e.g. 25" helper="We'll verify this but it helps us benchmark faster" />
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <h1 style={{ ...heading, fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Your situation</h1>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 28 }}>This helps us prioritize your action plan</p>
            <RadioGroup label="How long have you been in business?" k="tenure" options={TENURE} />
            <RadioGroup label="Biggest challenge right now" k="challenge" options={CHALLENGES} />
            <Select label="Monthly marketing budget (optional)" k="budget" options={BUDGET} placeholder="Select..." />
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div>
            <h1 style={{ ...heading, fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Competitors + Review</h1>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 28 }}>We'll show you exactly how you stack up</p>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <p style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Competitor 1 (optional)</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 10 }}>
                <Input label="" k="comp1Name" placeholder="Business name" />
                <Input label="" k="comp1City" placeholder="City" />
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20, marginBottom: 28 }}>
              <p style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Competitor 2 (optional)</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 10 }}>
                <Input label="" k="comp2Name" placeholder="Business name" />
                <Input label="" k="comp2City" placeholder="City" />
              </div>
            </div>

            {/* What we'll check */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, marginBottom: 28 }}>
              <p style={{ ...heading, fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Your complete audit will check:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {CHECKS.map(c => (
                  <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>{c.emoji}</span>
                    <div>
                      <span style={{ color: "#c8d0dc", fontSize: 14, fontWeight: 600 }}>{c.label}</span>
                      <span style={{ color: "#64748b", fontSize: 12 }}> — {c.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Report summary */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <p style={{ ...heading, fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Report prepared for: {form.businessName || "Your Business"}</p>
              <p style={{ color: "#94a3b8", fontSize: 14 }}>{form.city}{form.state ? `, ${form.state}` : ""}</p>
            </div>

            {/* Pricing */}
            <div style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 16, padding: 28, textAlign: "center", marginBottom: 20 }}>
              <p style={{ color: "#64748b", fontSize: 13, marginBottom: 4 }}><span style={{ textDecoration: "line-through" }}>$197</span></p>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 2, marginBottom: 8 }}>
                <span style={{ ...heading, fontSize: 48, fontWeight: 800, color: "#fff" }}>$39</span>
              </div>
              <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>One-time payment. Yours forever.</p>

              <button onClick={handleSubmit} disabled={isSubmitting}
                style={{ width: "100%", background: "#f97316", color: "#fff", fontSize: 16, fontWeight: 700, padding: "16px 0", borderRadius: 10, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: isSubmitting ? 0.6 : 1 }}>
                {isSubmitting ? <><Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> Processing...</> : <>Claim My Complete Audit Report <ArrowRight style={{ width: 18, height: 18 }} /></>}
              </button>
              <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
                {[{ i: Shield, l: "Secure" }, { i: Check, l: "Instant access" }, { i: Clock, l: "No contracts" }].map(({ i: Icon, l }) => (
                  <span key={l} style={{ display: "flex", alignItems: "center", gap: 4, color: "#64748b", fontSize: 12 }}><Icon style={{ width: 13, height: 13 }} /> {l}</span>
                ))}
              </div>
            </div>

            <p style={{ color: "#4b5563", fontSize: 12, textAlign: "center", marginBottom: 8 }}>Agencies charge $500-2,000 for manual audits. We do it automatically for $39.</p>

            <div style={{ textAlign: "center", padding: "12px 0", borderRadius: 10, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <p style={{ color: "#f59e0b", fontSize: 13, fontWeight: 700 }}>Offer expires in {countdown}</p>
            </div>
          </div>
        )}

        {/* NAV BUTTONS */}
        <div style={{ display: "flex", justifyContent: step > 1 ? "space-between" : "flex-end", marginTop: 28 }}>
          {step > 1 && (
            <button onClick={() => goTo(step - 1)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#94a3b8", fontSize: 14, cursor: "pointer" }}>
              <ArrowLeft style={{ width: 16, height: 16 }} /> Back
            </button>
          )}
          {step < TOTAL_STEPS && (
            <button onClick={() => { if (canNext()) goTo(step + 1); }} disabled={!canNext()}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "#2563eb", color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 28px", borderRadius: 10, border: "none", cursor: "pointer", opacity: canNext() ? 1 : 0.4 }}>
              Next <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
