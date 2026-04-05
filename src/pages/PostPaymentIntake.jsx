import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BarChart2, ArrowRight, CheckCircle } from "lucide-react";

const INDUSTRIES = [
  "Restaurant / Food", "Plumber", "Electrician", "HVAC", "Roofer / Contractor",
  "Dentist", "Hair Salon / Barber", "Auto Repair", "Gym / Fitness", "Lawyer",
  "Real Estate Agent", "Landscaper / Lawn Care", "Cleaning Service",
  "Veterinarian", "Spa / Massage", "Medical / Health", "Retail Store", "Other",
];

export default function PostPaymentIntake() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  let order = {};
  try { order = JSON.parse(localStorage.getItem("pageAuditOrder") || "{}"); } catch {}

  const [form, setForm] = useState({
    businessName: order.businessName || order.name || "",
    city: order.city || "",
    state: order.state || "",
    address: "",
    phone: "",
    website: order.website || "",
    industry: "",
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
    // Update localStorage with new data
    const updated = { ...order, ...form };
    localStorage.setItem("pageAuditOrder", JSON.stringify(updated));
    // Go to create account
    const auditId = order.auditId || searchParams.get("audit_id");
    const sessionId = searchParams.get("session_id");
    navigate(`/create-account?session_id=${sessionId || ""}&audit_id=${auditId || ""}`, {
      state: { ...updated, auditId },
    });
  };

  const handleSkip = () => {
    const auditId = order.auditId || searchParams.get("audit_id");
    const sessionId = searchParams.get("session_id");
    navigate(`/create-account?session_id=${sessionId || ""}&audit_id=${auditId || ""}`);
  };

  const inp = (label, k, placeholder = "", helper = "", type = "text") => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c8d0dc", marginBottom: 5 }}>{label}</label>
      <input type={type} value={form[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#fff", outline: "none", boxSizing: "border-box" }} />
      {helper && <p style={{ color: "#4b5563", fontSize: 11, marginTop: 3 }}>{helper}</p>}
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

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "32px 20px 80px" }}>
        {/* SUCCESS BANNER */}
        <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: "14px 18px", marginBottom: 28, display: "flex", alignItems: "center", gap: 10 }}>
          <CheckCircle style={{ width: 20, height: 20, color: "#10b981", flexShrink: 0 }} />
          <div>
            <p style={{ color: "#10b981", fontSize: 14, fontWeight: 600 }}>Payment confirmed!</p>
            <p style={{ color: "#94a3b8", fontSize: 12 }}>Just a few details to personalize your report.</p>
          </div>
        </div>

        <h1 style={{ ...heading, fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Personalize your audit</h1>
        <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>The more we know, the more accurate your report. All fields optional.</p>

        {inp("Business Name", "businessName", "Your business name")}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: 10 }}>
          {inp("City", "city", "Dallas")}
          {inp("State", "state", "TX")}
        </div>
        {inp("Street Address", "address", "123 Main St", "Helps us check your listing accuracy across directories")}
        {inp("Business Phone", "phone", "(555) 123-4567", "We verify this matches everywhere online", "tel")}
        {inp("Business Website", "website", "https://yourbusiness.com", "We'll check speed, SEO, and mobile performance")}

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c8d0dc", marginBottom: 5 }}>Industry</label>
          <select value={form.industry} onChange={e => set("industry", e.target.value)}
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: form.industry ? "#fff" : "#64748b", outline: "none", boxSizing: "border-box", appearance: "none" }}>
            <option value="" style={{ background: "#0f172a" }}>Select your industry...</option>
            {INDUSTRIES.map(i => <option key={i} value={i} style={{ background: "#0f172a" }}>{i}</option>)}
          </select>
        </div>

        <button onClick={handleSubmit}
          style={{ width: "100%", background: "#f97316", color: "#fff", fontSize: 15, fontWeight: 700, padding: "14px 0", borderRadius: 10, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 24 }}>
          Continue <ArrowRight style={{ width: 16, height: 16 }} />
        </button>

        <button onClick={handleSkip}
          style={{ width: "100%", background: "none", border: "none", color: "#64748b", fontSize: 13, marginTop: 12, cursor: "pointer", padding: "8px 0" }}>
          Skip and run my scan →
        </button>
      </div>
    </div>
  );
}
