import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BarChart2, ArrowRight, CheckCircle, MapPin, Phone, Globe, Building } from "lucide-react";

const INDUSTRIES = [
  "Restaurant / Food", "Plumber", "Electrician", "HVAC", "Roofer / Contractor",
  "Dentist", "Hair Salon / Barber", "Auto Repair", "Gym / Fitness", "Lawyer",
  "Real Estate Agent", "Landscaper / Lawn Care", "Cleaning Service",
  "Veterinarian", "Spa / Massage", "Medical / Health", "Retail Store", "Other",
];

const CHALLENGES = [
  "Not enough new customers finding me online",
  "I have bad or very few online reviews",
  "My competitors are beating me online",
  "My website isn't working well",
  "I'm not sure where to start",
];

export default function PostPaymentIntake() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  let order = {};
  try { order = JSON.parse(localStorage.getItem("pageAuditOrder") || "{}"); } catch {}
  let bizData = {};
  try { bizData = JSON.parse(localStorage.getItem("pageaudit_business_data") || "{}"); } catch {}

  const [form, setForm] = useState({
    businessName: bizData.businessName || order.businessName || order.name || "",
    address: bizData.address || order.address || "",
    phone: bizData.phone || order.phone || "",
    website: bizData.website || order.website || "",
    city: bizData.city || order.city || "",
    state: bizData.state || order.state || "",
    industry: "",
    challenge: "",
  });

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const heading = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

  const handleSubmit = () => {
    const updated = { ...order, ...form, businessName: form.businessName, city: form.city, state: form.state, website: form.website, address: form.address, phone: form.phone, industry: form.industry, challenge: form.challenge };
    localStorage.setItem("pageAuditOrder", JSON.stringify(updated));
    // Also update business data
    localStorage.setItem("pageaudit_business_data", JSON.stringify({ ...bizData, ...form }));
    const auditId = order.auditId || searchParams.get("audit_id");
    const sessionId = searchParams.get("session_id");
    navigate(`/create-account?session_id=${sessionId || ""}&audit_id=${auditId || ""}`);
  };

  const handleSkip = () => {
    const auditId = order.auditId || searchParams.get("audit_id");
    const sessionId = searchParams.get("session_id");
    navigate(`/create-account?session_id=${sessionId || ""}&audit_id=${auditId || ""}`);
  };

  const hasData = form.businessName || form.address || form.phone || form.website;

  const inp = (label, k, placeholder, Icon) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c8d0dc", marginBottom: 5 }}>{label}</label>
      <div style={{ position: "relative" }}>
        {Icon && <Icon style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#4b5563" }} />}
        <input type="text" value={form[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder}
          style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${form[k] ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, padding: Icon ? "11px 14px 11px 36px" : "11px 14px", fontSize: 14, color: "#fff", outline: "none", boxSizing: "border-box" }} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "'Inter', sans-serif" }}>
      <nav style={{ background: "rgba(10,15,30,0.9)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "14px 24px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
          <BarChart2 style={{ width: 18, height: 18, color: "#3b82f6" }} />
          <span style={{ ...heading, fontWeight: 700, fontSize: 14, color: "#fff" }}>PageAudit Pro</span>
        </div>
      </nav>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "28px 20px 80px" }}>
        {/* SUCCESS BANNER */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 24 }}>
          <CheckCircle style={{ width: 20, height: 20, color: "#10b981", flexShrink: 0 }} />
          <div>
            <p style={{ color: "#10b981", fontSize: 14, fontWeight: 600 }}>Payment confirmed!</p>
            <p style={{ color: "#94a3b8", fontSize: 12 }}>Just confirm your details below.</p>
          </div>
        </div>

        <h1 style={{ ...heading, fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Confirm your business details</h1>
        <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 24 }}>We pulled this from Google. Is everything correct?</p>

        {/* CONFIRMATION CARD */}
        {hasData && (
          <div style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 12, padding: 18, marginBottom: 24 }}>
            {form.businessName && <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><CheckCircle style={{ width: 16, height: 16, color: "#10b981", flexShrink: 0 }} /><span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>{form.businessName}</span></div>}
            {form.address && <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><MapPin style={{ width: 14, height: 14, color: "#64748b", flexShrink: 0 }} /><span style={{ color: "#c8d0dc", fontSize: 13 }}>{form.address}{form.city ? `, ${form.city}` : ""}{form.state ? ` ${form.state}` : ""}</span></div>}
            {form.phone && <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><Phone style={{ width: 14, height: 14, color: "#64748b", flexShrink: 0 }} /><span style={{ color: "#c8d0dc", fontSize: 13 }}>{form.phone}</span></div>}
            {form.website && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Globe style={{ width: 14, height: 14, color: "#64748b", flexShrink: 0 }} /><span style={{ color: "#3b82f6", fontSize: 13 }}>{form.website}</span></div>}
          </div>
        )}

        {/* EDITABLE FIELDS */}
        <p style={{ color: "#64748b", fontSize: 12, marginBottom: 12 }}>Edit anything that's wrong:</p>
        {inp("Business Name", "businessName", "Your business name", Building)}
        {inp("Address", "address", "123 Main St", MapPin)}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: 10 }}>
          {inp("City", "city", "Dallas")}
          {inp("State", "state", "TX")}
        </div>
        {inp("Phone", "phone", "(555) 123-4567", Phone)}
        {inp("Website", "website", "https://yourbusiness.com", Globe)}

        {/* INDUSTRY */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c8d0dc", marginBottom: 5 }}>Industry</label>
          <select value={form.industry} onChange={e => set("industry", e.target.value)}
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: form.industry ? "#fff" : "#64748b", outline: "none", boxSizing: "border-box", appearance: "none" }}>
            <option value="" style={{ background: "#0f172a" }}>Select your industry...</option>
            {INDUSTRIES.map(i => <option key={i} value={i} style={{ background: "#0f172a" }}>{i}</option>)}
          </select>
        </div>

        {/* CHALLENGE */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c8d0dc", marginBottom: 5 }}>Biggest challenge right now</label>
          <select value={form.challenge} onChange={e => set("challenge", e.target.value)}
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: form.challenge ? "#fff" : "#64748b", outline: "none", boxSizing: "border-box", appearance: "none" }}>
            <option value="" style={{ background: "#0f172a" }}>Select...</option>
            {CHALLENGES.map(c => <option key={c} value={c} style={{ background: "#0f172a" }}>{c}</option>)}
          </select>
        </div>

        <button onClick={handleSubmit}
          style={{ width: "100%", background: "#f97316", color: "#fff", fontSize: 16, fontWeight: 700, padding: "15px 0", borderRadius: 10, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          Looks Good — Run My Audit <ArrowRight style={{ width: 16, height: 16 }} />
        </button>

        <button onClick={handleSkip}
          style={{ width: "100%", background: "none", border: "none", color: "#64748b", fontSize: 13, marginTop: 10, cursor: "pointer", padding: "8px 0" }}>
          Skip — run my scan now
        </button>
      </div>
    </div>
  );
}
