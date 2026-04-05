import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Lock, Shield, Zap, Clock, ArrowRight, BarChart2, Loader2, X, AlertCircle } from "lucide-react";

const API_BASE = "https://pageaudit-engine.onrender.com";

const LOCKED_TITLES = [
  { platform: "Yelp", title: "Yelp listing has critical missing information" },
  { platform: "NAP Consistency", title: "Business info mismatched across 6+ directories" },
  { platform: "Competitor Gap", title: "Competitor is outranking you in 3 key areas" },
];

const COST_LINES = {
  critical: [
    "This is actively driving customers to your competitors right now.",
    "Every day this goes unfixed, potential customers choose someone else.",
    "This costs the average local business $500-2,000/month in lost revenue.",
  ],
  warning: [
    "This makes your business appear less trustworthy to new customers.",
    "Fixing this alone could increase your customer inquiries by 20-30%.",
    "Your competitors who fixed this are capturing the customers you're missing.",
  ],
};

export default function TeaserResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const businessName = location.state?.businessName || "Your Business";
  const scanData = location.state?.scanData || null;
  const city = location.state?.city || scanData?.city || "";
  const state = location.state?.state || scanData?.state || "";

  const [email, setEmail] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [unlockError, setUnlockError] = useState("");

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Extract real findings from scan data
  const realFindings = scanData?.findings || scanData?.google?.findings || [];
  const criticalCount = realFindings.filter(f => f.severity === "critical").length;
  const warningCount = realFindings.filter(f => f.severity === "warning").length;
  const goodCount = realFindings.filter(f => f.severity === "good").length;
  const totalIssues = criticalCount + warningCount;
  const score = scanData?.preliminaryScore ?? scanData?.google?.score ?? null;

  const handleUnlock = () => {
    if (!email.trim() || !email.includes("@")) { setShowEmailModal(true); return; }
    goToCheckout();
  };

  const goToCheckout = async () => {
    if (!email.trim() || !email.includes("@")) return;
    setProcessing(true);
    setUnlockError("");
    try {
      const auditRes = await fetch(`${API_BASE}/api/audits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_name: businessName, email: email.trim(), business_name: businessName, city: city || "", account_type: "Business" }),
      });
      const auditData = await auditRes.json();
      if (!auditRes.ok || !auditData?.audit?.id) throw new Error(auditData?.error || "Failed");
      localStorage.setItem("pageAuditOrder", JSON.stringify({ name: businessName, email: email.trim(), businessName, city, state, auditId: auditData.audit.id }));
      const stripeRes = await fetch(`${API_BASE}/api/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audit_id: auditData.audit.id, email: email.trim(), customer_name: businessName, rep_code: localStorage.getItem("pageaudit_rep_code") || null }),
      });
      const stripeData = await stripeRes.json();
      if (stripeData.url) { window.location.href = stripeData.url; }
      else throw new Error(stripeData.error || "Checkout failed");
    } catch (err) {
      setUnlockError(err.message || "Something went wrong.");
      setProcessing(false);
    }
  };

  const heading = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
  const body = { fontFamily: "'Inter', sans-serif" };
  const card = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14 };

  return (
    <div style={{ ...body, minHeight: "100vh", background: "#0a0f1e" }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* ═══ SECTION 1 — STATUS BAR ═══ */}
      <div style={{ background: "rgba(16,185,129,0.06)", borderBottom: "1px solid rgba(16,185,129,0.15)", padding: "10px 20px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
            <span style={{ color: "#10b981", fontSize: 13, fontWeight: 600 }}>Scan Complete</span>
          </div>
          <span style={{ color: "#c8d0dc", fontSize: 13, fontWeight: 600 }}>{businessName}{city ? ` — ${city}` : ""}</span>
          <span style={{ color: "#64748b", fontSize: 12 }}>4 of 47 checks shown</span>
        </div>
      </div>

      {/* NAV */}
      <nav style={{ padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
          <BarChart2 style={{ width: 18, height: 18, color: "#3b82f6" }} />
          <span style={{ ...heading, fontWeight: 700, fontSize: 14, color: "#fff" }}>PageAudit Pro</span>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "36px 20px 80px" }}>

        {/* ═══ SECTION 2 — DIAGNOSIS HEADER ═══ */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ ...heading, fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 12 }}>
            We found {totalIssues > 0 ? totalIssues : "potential"} issue{totalIssues !== 1 ? "s" : ""} affecting<br />
            <span style={{ color: "#ef4444" }}>{businessName}</span>'s online presence
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 15, maxWidth: 560, margin: "0 auto 24px", lineHeight: 1.6 }}>
            These problems are costing you customers every single day. Here's what we found.
          </p>

          {/* Stat pills */}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            {criticalCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 999, padding: "6px 14px" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
                <span style={{ color: "#ef4444", fontSize: 13, fontWeight: 700 }}>{criticalCount} Critical</span>
              </div>
            )}
            {warningCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 999, padding: "6px 14px" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
                <span style={{ color: "#f59e0b", fontSize: 13, fontWeight: 700 }}>{warningCount} Warning{warningCount > 1 ? "s" : ""}</span>
              </div>
            )}
            {goodCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 999, padding: "6px 14px" }}>
                <CheckCircle style={{ width: 14, height: 14, color: "#10b981" }} />
                <span style={{ color: "#10b981", fontSize: 13, fontWeight: 700 }}>{goodCount} Looking Good</span>
              </div>
            )}
          </div>
        </div>

        {/* ═══ SECTION 3 — FREE FINDINGS ═══ */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#3b82f6", marginBottom: 16 }}>Free Preview — What We Found So Far</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {realFindings.map((f, i) => {
              const isCritical = f.severity === "critical";
              const isWarning = f.severity === "warning";
              const isGood = f.severity === "good";
              const borderColor = isCritical ? "rgba(239,68,68,0.25)" : isWarning ? "rgba(245,158,11,0.25)" : "rgba(16,185,129,0.25)";
              const bgColor = isCritical ? "rgba(239,68,68,0.04)" : isWarning ? "rgba(245,158,11,0.04)" : "rgba(16,185,129,0.04)";
              const sevColor = isCritical ? "#ef4444" : isWarning ? "#f59e0b" : "#10b981";
              const costLine = !isGood ? (COST_LINES[f.severity] || COST_LINES.warning)[i % 3] : null;

              return (
                <div key={i} style={{ ...card, background: bgColor, borderColor, padding: 0, overflow: "hidden" }}>
                  {/* Header row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: `1px solid ${borderColor}` }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: sevColor }}>{isCritical ? "🔴 Critical" : isWarning ? "⚠️ Warning" : "✅ Good"}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>{f.platform}</span>
                  </div>

                  <div style={{ padding: "16px 18px" }}>
                    <h3 style={{ ...heading, fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 8, lineHeight: 1.3 }}>{f.title}</h3>
                    <p style={{ color: "#c8d0dc", fontSize: 14, lineHeight: 1.65, marginBottom: isGood ? 0 : 14 }}>{f.description}</p>

                    {!isGood && costLine && (
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 14 }}>
                        <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>💸</span>
                        <div>
                          <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>What this costs you</p>
                          <p style={{ color: "#e2e8f0", fontSize: 14, lineHeight: 1.5 }}>{costLine}</p>
                        </div>
                      </div>
                    )}

                    {!isGood && f.fix && (
                      <div style={{ position: "relative" }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>🔧</span>
                          <div>
                            <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>The Fix</p>
                            <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.5, filter: "blur(4px)", userSelect: "none" }}>{f.fix}</p>
                          </div>
                        </div>
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: `linear-gradient(transparent, ${isCritical ? "rgba(239,68,68,0.04)" : "rgba(245,158,11,0.04)"})` }} />
                        <div style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 4 }}>
                          <Lock style={{ width: 12, height: 12, color: "#64748b" }} />
                          <span style={{ color: "#64748b", fontSize: 11, fontWeight: 600 }}>Unlock full report to see fix</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ SECTION 4 — LOCKED FINDINGS ═══ */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ ...heading, fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 4 }}>43 More Issues Found</h2>
          <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 20 }}>Including problems with your Yelp listing, NAP consistency, competitor gaps, and more.</p>

          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {LOCKED_TITLES.map((lt, i) => (
                <div key={i} style={{ ...card, padding: "16px 18px", filter: "blur(3px)", opacity: 0.4, userSelect: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Lock style={{ width: 16, height: 16, color: "#64748b" }} />
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{lt.platform}</span>
                      <p style={{ color: "#94a3b8", fontSize: 15, fontWeight: 600 }}>{lt.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, rgba(10,15,30,0) 0%, rgba(10,15,30,0.95) 70%)", borderRadius: 14 }}>
              <div style={{ textAlign: "center" }}>
                <Lock style={{ width: 28, height: 28, color: "#64748b", margin: "0 auto 8px", display: "block" }} />
                <p style={{ ...heading, fontSize: 16, fontWeight: 700, color: "#fff" }}>Unlock to see all findings</p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ SECTION 5 — THE PAYWALL ═══ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 48 }}>
          {/* LEFT — Problem summary */}
          <div style={{ padding: "4px 0" }}>
            <h2 style={{ ...heading, fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 16, lineHeight: 1.3 }}>
              Here's what's happening to {businessName} right now while you read this:
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Customers searching on Google are seeing outdated or missing information",
                "Your competitors who fixed these issues are capturing your potential customers",
                "Every directory with wrong info makes Google trust you less",
                "Each day without fixes = more lost customers you'll never know about",
              ].map((line, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", flexShrink: 0, marginTop: 6 }} />
                  <p style={{ color: "#c8d0dc", fontSize: 14, lineHeight: 1.6 }}>{line}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Offer card */}
          <div style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 16, padding: 28 }}>
            <p style={{ ...heading, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#3b82f6", marginBottom: 16, textAlign: "center" }}>Get Your Complete Fix-It Plan</p>

            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <span style={{ color: "#64748b", fontSize: 14, textDecoration: "line-through" }}>$197</span>
              <span style={{ color: "#64748b", fontSize: 14 }}> → </span>
              <span style={{ ...heading, fontSize: 36, fontWeight: 800, color: "#fff" }}>$39</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {[
                "All 47 checks analyzed",
                "Every issue ranked by impact",
                "Exact fix for every problem",
                "AI action plan for your specific business",
                "Competitor comparison",
              ].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle style={{ width: 16, height: 16, color: "#10b981", flexShrink: 0 }} />
                  <span style={{ color: "#c8d0dc", fontSize: 13 }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Email if not captured */}
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address"
              onKeyDown={e => { if (e.key === "Enter") handleUnlock(); }}
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "#fff", outline: "none", boxSizing: "border-box", textAlign: "center", marginBottom: 10 }} />

            <button onClick={handleUnlock} disabled={processing}
              style={{ width: "100%", background: "#2563eb", color: "#fff", fontSize: 16, fontWeight: 700, padding: "16px 0", borderRadius: 10, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: processing ? 0.6 : 1 }}>
              {processing ? <><Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> Processing...</> : <>Fix My Business — $39 <ArrowRight style={{ width: 18, height: 18 }} /></>}
            </button>

            {unlockError && <p style={{ color: "#ef4444", fontSize: 12, textAlign: "center", marginTop: 8 }}>{unlockError}</p>}

            <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 12, flexWrap: "wrap" }}>
              {[{ i: Shield, l: "Secure" }, { i: Zap, l: "Instant access" }, { i: Clock, l: "No contracts" }].map(({ i: Icon, l }) => (
                <span key={l} style={{ display: "flex", alignItems: "center", gap: 4, color: "#64748b", fontSize: 11 }}><Icon style={{ width: 12, height: 12 }} /> {l}</span>
              ))}
            </div>

            <p style={{ color: "#4b5563", fontSize: 11, textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
              One-time payment. Yours forever.<br />
              By purchasing you agree to our <a href="/terms" target="_blank" style={{ color: "#3b82f6", textDecoration: "none" }}>Terms</a> and <a href="/privacy" target="_blank" style={{ color: "#3b82f6", textDecoration: "none" }}>Privacy Policy</a>
            </p>
          </div>
        </div>

        {/* ═══ SOCIAL PROOF ═══ */}
        <div style={{ ...card, padding: 20, marginBottom: 48, textAlign: "center" }}>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 4 }}>Agencies charge <strong style={{ color: "#c8d0dc" }}>$500–$2,000</strong> for manual audits.</p>
          <p style={{ color: "#64748b", fontSize: 13 }}>We do it automatically with AI for <strong style={{ color: "#2563eb" }}>$39</strong>.</p>
        </div>

        {/* ═══ BOTTOM CTA ═══ */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <button onClick={handleUnlock} disabled={processing}
            style={{ background: "#2563eb", color: "#fff", fontSize: 15, fontWeight: 700, padding: "14px 36px", borderRadius: 10, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, opacity: processing ? 0.6 : 1 }}>
            {processing ? "Processing..." : "Get My Complete Audit — $39 →"}
          </button>
        </div>
      </div>

      {/* ═══ EMAIL MODAL ═══ */}
      {showEmailModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 28, maxWidth: 400, width: "100%", position: "relative" }}>
            <button onClick={() => setShowEmailModal(false)} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X style={{ width: 18, height: 18 }} /></button>
            <h3 style={{ ...heading, fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Where should we send your report?</h3>
            <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>Enter your email to continue to secure payment.</p>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@business.com" autoFocus
              onKeyDown={e => { if (e.key === "Enter" && email.includes("@")) { setShowEmailModal(false); goToCheckout(); } }}
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "14px 16px", fontSize: 15, color: "#fff", outline: "none", boxSizing: "border-box", marginBottom: 14 }} />
            <button onClick={() => { if (email.includes("@")) { setShowEmailModal(false); goToCheckout(); } }}
              disabled={!email.includes("@") || processing}
              style={{ width: "100%", background: "#2563eb", color: "#fff", fontSize: 15, fontWeight: 700, padding: "14px 0", borderRadius: 10, border: "none", cursor: "pointer", opacity: email.includes("@") ? 1 : 0.4 }}>
              {processing ? "Processing..." : "Continue to Payment →"}
            </button>
            <p style={{ color: "#4b5563", fontSize: 11, textAlign: "center", marginTop: 10 }}>Secure checkout by Stripe. We'll never spam you.</p>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "24px 16px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart2 style={{ width: 14, height: 14, color: "#3b82f6" }} />
            <span style={{ ...heading, fontWeight: 700, color: "#fff", fontSize: 13 }}>PageAudit Pro</span>
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
