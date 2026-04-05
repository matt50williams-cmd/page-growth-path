import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Lock, AlertTriangle, AlertCircle, Shield, Zap, Clock, ArrowRight, BarChart2, Search, Globe, Facebook, MapPin, Star } from "lucide-react";

const FREE_FINDINGS = [
  {
    platform: "Google Business Profile",
    icon: "google",
    severity: "warning",
    title: "Review response rate is critically low",
    desc: "You haven't responded to 8 of your last 10 Google reviews. Google's algorithm rewards businesses that engage with reviewers — and penalizes those that don't.",
  },
  {
    platform: "Online Listings",
    icon: "listings",
    severity: "critical",
    title: "Business info inconsistent across 6 directories",
    desc: "Your phone number or address doesn't match on Bing, Apple Maps, and 4 other platforms. This confuses Google and customers trying to reach you.",
  },
  {
    platform: "Website",
    icon: "website",
    severity: "critical",
    title: "Website loads in 6.2 seconds on mobile",
    desc: "Google penalizes slow websites in search rankings. The average business site loads in under 2 seconds. Yours is 3x slower — costing you visibility and customers.",
  },
  {
    platform: "Facebook",
    icon: "facebook",
    severity: "warning",
    title: "Facebook page hasn't posted in 47 days",
    desc: "Inactive pages rank lower in Facebook search and signal to potential customers that your business may not be active or trustworthy.",
  },
];

const LOCKED_FINDINGS = [
  "Yelp profile missing key business categories",
  "Apple Maps listing has outdated hours",
  "Competitor is outranking you for 12 keywords",
];

const WHAT_YOU_GET = [
  "Full score across 20+ platforms",
  "Every issue ranked by impact",
  "Competitor comparison in your area",
  "Step-by-step fix-it plan in plain English",
  "NAP consistency check across 20+ directories",
  "Website speed and SEO analysis",
  "Monthly monitoring option available",
];

export default function TeaserResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const businessName = location.state?.businessName || "Your Business";
  const [email, setEmail] = useState("");

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const handleUnlock = () => {
    navigate("/submit-your-page", { state: { businessName, email: email.trim() } });
  };

  const syne = { fontFamily: "'Syne', sans-serif" };
  const dm = { fontFamily: "'DM Sans', sans-serif" };

  const SeverityBadge = ({ severity }) => {
    const styles = {
      critical: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", label: "Critical" },
      warning: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", label: "Warning" },
      good: { bg: "rgba(16,185,129,0.15)", color: "#10b981", label: "Good" },
    };
    const s = styles[severity] || styles.warning;
    return (
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "3px 10px", borderRadius: 999, background: s.bg, color: s.color }}>
        {s.label}
      </span>
    );
  };

  const PlatformIcon = ({ type }) => {
    const shared = { width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
    switch (type) {
      case "google": return <div style={{ ...shared, background: "rgba(37,99,235,0.15)" }}><Search style={{ width: 18, height: 18, color: "#3b82f6" }} /></div>;
      case "listings": return <div style={{ ...shared, background: "rgba(245,158,11,0.15)" }}><MapPin style={{ width: 18, height: 18, color: "#f59e0b" }} /></div>;
      case "website": return <div style={{ ...shared, background: "rgba(239,68,68,0.15)" }}><Globe style={{ width: 18, height: 18, color: "#ef4444" }} /></div>;
      case "facebook": return <div style={{ ...shared, background: "rgba(59,130,246,0.15)" }}><Facebook style={{ width: 18, height: 18, color: "#3b82f6" }} /></div>;
      default: return <div style={{ ...shared, background: "rgba(148,163,184,0.15)" }}><Star style={{ width: 18, height: 18, color: "#94a3b8" }} /></div>;
    }
  };

  return (
    <div style={{ ...dm, minHeight: "100vh", background: "#0a0f1e" }}>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(10,15,30,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BarChart2 style={{ width: 18, height: 18, color: "#3b82f6" }} />
            <span style={{ ...syne, fontWeight: 700, fontSize: 14, color: "#fff" }}>PageAudit Pro</span>
          </div>
          <button onClick={() => navigate("/")} style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}>Back to Home</button>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* TOP BAR */}
        <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 16, padding: "20px 24px", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <CheckCircle style={{ width: 20, height: 20, color: "#10b981" }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: "#10b981" }}>Scanning complete</span>
          </div>
          <h1 style={{ ...syne, fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 800, color: "#fff", marginBottom: 4 }}>{businessName}</h1>
          <p style={{ fontSize: 13, color: "#94a3b8" }}>Preliminary scan — 4 of 47 checks shown</p>
        </div>

        {/* PRELIMINARY SCORE */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 32, textAlign: "center", marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "#64748b", marginBottom: 12 }}>Preliminary Score</p>
          <div style={{ ...syne, fontSize: 72, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
            58<span style={{ fontSize: 28, color: "#64748b" }}>/100</span>
          </div>
          <p style={{ color: "#f59e0b", fontSize: 16, fontWeight: 700, marginTop: 8, marginBottom: 8 }}>Needs Attention</p>
          <p style={{ color: "#94a3b8", fontSize: 13 }}>Based on 4 of 47 checks. Full score may be lower.</p>
        </div>

        {/* FREE FINDINGS */}
        <div style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "#3b82f6", marginBottom: 16 }}>Free findings</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {FREE_FINDINGS.map(({ platform, icon, severity, title, desc }) => (
            <div key={title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <PlatformIcon type={icon} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>{platform}</span>
                    <SeverityBadge severity={severity} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6, lineHeight: 1.3 }}>{title}</h3>
                  <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* LOCKED FINDINGS */}
        <div style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "#64748b", marginBottom: 16 }}>43 more findings locked</p>
        </div>
        <div style={{ position: "relative", marginBottom: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {LOCKED_FINDINGS.map((title, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: 20, filter: "blur(3px)", opacity: 0.5, userSelect: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(148,163,184,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Lock style={{ width: 16, height: 16, color: "#64748b" }} />
                  </div>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Locked</span>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: "#94a3b8", marginTop: 2 }}>{title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Overlay */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, rgba(10,15,30,0) 0%, rgba(10,15,30,0.9) 60%)", borderRadius: 14 }}>
            <div style={{ textAlign: "center" }}>
              <Lock style={{ width: 32, height: 32, color: "#64748b", marginBottom: 12, marginLeft: "auto", marginRight: "auto", display: "block" }} />
              <p style={{ ...syne, fontSize: 20, fontWeight: 700, color: "#fff" }}>Unlock your complete audit</p>
            </div>
          </div>
        </div>

        {/* PAYWALL SECTION */}
        <div style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(37,99,235,0.03))", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 20, padding: "40px 28px", textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ ...syne, fontSize: "clamp(24px, 3.5vw, 32px)", fontWeight: 800, color: "#fff", marginBottom: 12, lineHeight: 1.15 }}>Your full 47-point audit is ready.</h2>
          <p style={{ color: "#94a3b8", fontSize: 16, lineHeight: 1.6, marginBottom: 28, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
            We found issues across Google, Yelp, Facebook, your website, and more. See everything and get your step-by-step fix-it plan.
          </p>

          {/* Email input */}
          <div style={{ maxWidth: 400, margin: "0 auto 16px" }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Where should we send your report?"
              onKeyDown={e => e.key === "Enter" && handleUnlock()}
              style={{
                width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12, padding: "16px 20px", fontSize: 15, color: "#fff", outline: "none", boxSizing: "border-box",
                textAlign: "center",
              }}
            />
          </div>

          {/* CTA Button */}
          <button onClick={handleUnlock}
            style={{
              width: "100%", maxWidth: 400, background: "#2563eb", color: "#fff", fontSize: 17, fontWeight: 700,
              padding: "18px 32px", borderRadius: 12, border: "none", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", gap: 10, margin: "0 auto 16px",
            }}>
            Unlock Full Audit — $39 <ArrowRight style={{ width: 18, height: 18 }} />
          </button>

          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
            One-time payment. Yours forever.<br />Cancel anytime if you subscribe.
          </p>

          {/* Trust badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap", color: "#64748b", fontSize: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Shield style={{ width: 14, height: 14 }} /> Secure payment</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Zap style={{ width: 14, height: 14 }} /> Instant access</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock style={{ width: 14, height: 14 }} /> 30-day guarantee</span>
          </div>
        </div>

        {/* WHAT YOU GET */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "32px 28px", marginBottom: 48 }}>
          <h3 style={{ ...syne, fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 20, textAlign: "center" }}>What's inside your full audit</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 440, margin: "0 auto" }}>
            {WHAT_YOU_GET.map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(37,99,235,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CheckCircle style={{ width: 13, height: 13, color: "#3b82f6" }} />
                </div>
                <span style={{ fontSize: 14, color: "#c8d0dc" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div style={{ textAlign: "center" }}>
          <button onClick={handleUnlock}
            style={{
              background: "#2563eb", color: "#fff", fontSize: 15, fontWeight: 600,
              padding: "16px 40px", borderRadius: 10, border: "none", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}>
            Get My Full Audit <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
          <p style={{ color: "#64748b", fontSize: 12, marginTop: 12 }}>Results delivered instantly after payment.</p>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "24px 16px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart2 style={{ width: 14, height: 14, color: "#3b82f6" }} />
            <span style={{ ...syne, fontWeight: 700, color: "#fff", fontSize: 13 }}>PageAudit Pro</span>
          </div>
          <div style={{ display: "flex", gap: 20, fontSize: 12, color: "#64748b" }}>
            <a href="/privacy" style={{ color: "#64748b", textDecoration: "none" }}>Privacy</a>
            <a href="/terms" style={{ color: "#64748b", textDecoration: "none" }}>Terms</a>
          </div>
          <p style={{ fontSize: 11, color: "#64748b" }}>&copy; 2026 The Agency LLC</p>
        </div>
      </footer>
    </div>
  );
}
