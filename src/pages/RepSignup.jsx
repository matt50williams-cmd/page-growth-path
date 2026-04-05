import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart2, DollarSign, Users, Calendar, CheckCircle, ArrowRight } from "lucide-react";

const STEPS = [
  { num: 1, label: "Apply", active: true },
  { num: 2, label: "Get Approved", active: false },
  { num: 3, label: "Sign Agreement", active: false },
  { num: 4, label: "Start Earning", active: false },
];

export default function RepSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", city: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const syne = { fontFamily: "'Syne', sans-serif" };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    setError("");
    if (!form.full_name.trim()) { setError("Full name is required"); return; }
    if (!form.email.trim() || !form.email.includes("@")) { setError("Valid email is required"); return; }
    if (!form.phone.trim()) { setError("Phone number is required"); return; }
    localStorage.setItem("pageaudit_rep_application", JSON.stringify({ ...form, submitted_at: new Date().toISOString() }));
    setSubmitted(true);
  };

  const inp = (label, key, type = "text", placeholder = "") => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>{label}</label>
      <input type={type} value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "12px 14px", fontSize: 14, color: "#fff", outline: "none", boxSizing: "border-box" }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{ background: "rgba(10,15,30,0.9)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "16px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BarChart2 style={{ width: 20, height: 20, color: "#3b82f6" }} />
            <span style={{ ...syne, fontWeight: 700, fontSize: 15, color: "#fff" }}>PageAudit Pro</span>
          </div>
          <button onClick={() => navigate("/login")} style={{ fontSize: 13, color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}>Already a rep? Login</button>
        </div>
      </nav>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 20px 80px" }}>
        {/* Step indicator */}
        <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 40 }}>
          {STEPS.map((s, i) => (
            <div key={s.num} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, background: s.active ? "rgba(37,99,235,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${s.active ? "rgba(37,99,235,0.3)" : "rgba(255,255,255,0.05)"}` }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: s.active ? "#2563eb" : "rgba(255,255,255,0.1)", color: s.active ? "#fff" : "#64748b", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.num}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: s.active ? "#3b82f6" : "#64748b" }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <ArrowRight style={{ width: 14, height: 14, color: "#374151" }} />}
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ ...syne, fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Become a Sales Rep</h1>
          <p style={{ color: "#94a3b8", fontSize: 16 }}>Earn $60 per audit + up to $30/mo per active customer</p>
        </div>

        {/* Earning cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
          {[
            { icon: DollarSign, val: "$60", label: "per audit closed" },
            { icon: Users, val: "Up to $30/mo", label: "per active customer" },
            { icon: Calendar, val: "Paid weekly", label: "every Monday" },
          ].map(({ icon: Icon, val, label }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, textAlign: "center" }}>
              <Icon style={{ width: 20, height: 20, color: "#3b82f6", margin: "0 auto 8px", display: "block" }} />
              <p style={{ ...syne, fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{val}</p>
              <p style={{ fontSize: 12, color: "#64748b" }}>{label}</p>
            </div>
          ))}
        </div>

        {submitted ? (
          <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 16, padding: 32, textAlign: "center" }}>
            <CheckCircle style={{ width: 48, height: 48, color: "#10b981", margin: "0 auto 16px", display: "block" }} />
            <h2 style={{ ...syne, fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Application Received!</h2>
            <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.6, maxWidth: 460, margin: "0 auto" }}>
              We review all applications within 24 hours. Once approved you will receive an email with your rep code and a link to sign your independent contractor agreement.
            </p>
          </div>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 28 }}>
            {inp("Full Name *", "full_name", "text", "Your full legal name")}
            {inp("Email Address *", "email", "email", "you@example.com")}
            {inp("Phone Number *", "phone", "tel", "(555) 123-4567")}
            {inp("City / Area", "city", "text", "e.g. Dallas, TX")}

            {error && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <button onClick={handleSubmit} style={{ width: "100%", background: "#2563eb", color: "#fff", fontSize: 16, fontWeight: 700, padding: "16px 0", borderRadius: 10, border: "none", cursor: "pointer", marginBottom: 12 }}>
              Submit Application
            </button>

            <p style={{ textAlign: "center", color: "#64748b", fontSize: 12, lineHeight: 1.5 }}>
              You are applying as an independent contractor. This is not an employment application. The Agency LLC does not withhold taxes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
