import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart2, CheckCircle, ArrowRight, DollarSign, Users, Calendar } from "lucide-react";

const API_BASE = "https://pageaudit-engine.onrender.com";

const EXAMPLES = [
  { team: 5, clients: 15, override: 12, label: "Small Team", net: 801 },
  { team: 10, clients: 20, override: 12, label: "Medium Team", net: 2501 },
  { team: 20, clients: 25, override: 12, label: "Large Team", net: 6501 },
];

export default function PartnerSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", businessName: "", city: "", state: "", why: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap"; document.head.appendChild(l); return () => { document.head.removeChild(l); }; }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const H = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
  const inp = (label, k, placeholder, type = "text", required = false) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c8d0dc", marginBottom: 5 }}>{label}{required && <span style={{ color: "#ef4444" }}> *</span>}</label>
      <input type={type} value={form[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "#fff", outline: "none", boxSizing: "border-box" }} />
    </div>
  );

  const handleSubmit = async () => {
    setError("");
    if (!form.fullName.trim() || !form.email.trim()) { setError("Name and email are required"); return; }
    try {
      const res = await fetch(`${API_BASE}/api/partners/apply`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSubmitted(true);
    } catch (err) { setError(err.message); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "'Inter', sans-serif" }}>
      <nav style={{ background: "rgba(10,15,30,0.9)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "14px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
          <BarChart2 style={{ width: 18, height: 18, color: "#3b82f6" }} />
          <span style={{ ...H, fontWeight: 700, fontSize: 14, color: "#fff" }}>The Agency LLC</span>
        </div>
      </nav>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 20px 80px" }}>
        {/* Steps */}
        <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 32, flexWrap: "wrap" }}>
          {["Apply", "Get Approved", "Sign Agreements", "Launch"].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: i === 0 ? "#3b82f6" : "#4b5563", background: i === 0 ? "rgba(37,99,235,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${i === 0 ? "rgba(37,99,235,0.3)" : "rgba(255,255,255,0.05)"}`, padding: "4px 10px", borderRadius: 99 }}>{i + 1}. {s}</span>
              {i < 3 && <ArrowRight style={{ width: 12, height: 12, color: "#374151" }} />}
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ ...H, fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Become a Regional Director</h1>
          <p style={{ color: "#94a3b8", fontSize: 16 }}>Build a team of consultants. Earn override commissions on every sale.</p>
        </div>

        {/* Earning cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 32 }}>
          {EXAMPLES.map(e => (
            <div key={e.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, textAlign: "center" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{e.label}</p>
              <p style={{ ...H, fontSize: 24, fontWeight: 800, color: "#10b981" }}>{"$"}{e.net.toLocaleString()}<span style={{ fontSize: 12, color: "#64748b" }}>/mo</span></p>
              <p style={{ fontSize: 10, color: "#4b5563" }}>{e.team} consultants × {e.clients} clients</p>
            </div>
          ))}
        </div>

        {/* What you get */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, marginBottom: 32 }}>
          <p style={{ ...H, fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 12 }}>What you get for $299/mo</p>
          <p style={{ color: "#10b981", fontSize: 12, fontWeight: 600, marginBottom: 12 }}>Month 1: FREE</p>
          {["Your own Regional Director portal", "Unlimited consultant accounts", "Territory assignment", "Training materials and scripts", "Weekly payout processing", "Direct support from Agency HQ", "All new features as released"].map(item => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <CheckCircle style={{ width: 14, height: 14, color: "#3b82f6", flexShrink: 0 }} />
              <span style={{ color: "#c8d0dc", fontSize: 13 }}>{item}</span>
            </div>
          ))}
        </div>

        {submitted ? (
          <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 16, padding: 32, textAlign: "center" }}>
            <CheckCircle style={{ width: 48, height: 48, color: "#10b981", margin: "0 auto 16px", display: "block" }} />
            <h2 style={{ ...H, fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Application Received!</h2>
            <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.6 }}>We review all partner applications within 48 hours. Once approved you'll receive your partner code and agreement link.</p>
          </div>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
            <h2 style={{ ...H, fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Apply Now</h2>
            {inp("Full Name", "fullName", "Your full legal name", "text", true)}
            {inp("Email Address", "email", "you@business.com", "email", true)}
            {inp("Phone Number", "phone", "(555) 123-4567", "tel")}
            {inp("Business / LLC Name", "businessName", "Your company name")}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 10 }}>
              {inp("City", "city", "Dallas")}
              {inp("State", "state", "TX")}
            </div>
            {error && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button onClick={handleSubmit} style={{ width: "100%", background: "#f97316", color: "#fff", fontSize: 16, fontWeight: 700, padding: "16px 0", borderRadius: 10, border: "none", cursor: "pointer" }}>Submit Application</button>
            <p style={{ color: "#4b5563", fontSize: 11, textAlign: "center", marginTop: 10 }}>You are applying as an independent business partner. This is not an employment application.</p>
          </div>
        )}
      </div>
    </div>
  );
}
