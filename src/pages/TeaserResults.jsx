import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Lock, Shield, Zap, Clock, ArrowRight, BarChart2, Loader2, X, AlertCircle } from "lucide-react";

const API_BASE = "https://pageaudit-engine.onrender.com";

const LOCKED_TITLES = [
  { platform: "Yelp", title: "Yelp listing has critical missing information", severity: "critical" },
  { platform: "NAP Consistency", title: "Business info mismatched across 6+ directories", severity: "critical" },
  { platform: "Website Performance", title: "Mobile load speed is below Google's threshold", severity: "warning" },
  { platform: "Competitor Analysis", title: "A nearby competitor is outranking you in 3 key areas", severity: "warning" },
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

  // Extract ALL findings from scan data, sort by severity, take top 4
  const allScanFindings = [
    ...(scanData?.findings || []),
    ...(scanData?.google?.findings || []),
    ...(scanData?.allFindings || []),
  ];
  // Deduplicate by title
  const seen = new Set();
  const dedupedFindings = allScanFindings.filter(f => {
    if (seen.has(f.title)) return false;
    seen.add(f.title);
    return true;
  });
  // Sort: critical first, then warning, then good
  const severityOrder = { critical: 0, warning: 1, good: 2 };
  dedupedFindings.sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9));
  const realFindings = dedupedFindings.slice(0, 4);

  const criticalCount = dedupedFindings.filter(f => f.severity === "critical").length;
  const warningCount = dedupedFindings.filter(f => f.severity === "warning").length;
  const goodCount = dedupedFindings.filter(f => f.severity === "good").length;
  const totalIssues = criticalCount + warningCount;
  const score = scanData?.preliminaryScore ?? scanData?.google?.score ?? null;
  const allGood = criticalCount === 0 && warningCount === 0;

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

  // Top worst findings as one-liners for offer card
  const worstFindings = realFindings.filter(f => f.severity !== "good").slice(0, 3);
  const lockedCount = 43;

  return (
    <div style={{ ...body, minHeight: "100vh", background: "#0a0f1e" }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* ═══ 1. STATUS BAR ═══ */}
      <div style={{ background: "rgba(16,185,129,0.06)", borderBottom: "1px solid rgba(16,185,129,0.15)", padding: "8px 20px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
            <span style={{ color: "#10b981", fontSize: 12, fontWeight: 600 }}>Scan Complete</span>
          </div>
          <span style={{ color: "#c8d0dc", fontSize: 12, fontWeight: 600 }}>{businessName}{city ? ` — ${city}` : ""}</span>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 20px 80px" }}>

        {/* ═══ 2. HEADLINE + PILLS ═══ */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{ ...heading, fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 10 }}>
            {criticalCount > 0
              ? <>We found <span style={{ color: "#ef4444" }}>{criticalCount} critical issue{criticalCount > 1 ? "s" : ""}</span> affecting<br />{businessName}'s online presence</>
              : warningCount > 0
                ? <>We found <span style={{ color: "#f59e0b" }}>{warningCount} issue{warningCount > 1 ? "s" : ""}</span> that could be<br />costing <span style={{ color: "#f59e0b" }}>{businessName}</span> customers</>
                : <>{businessName} looks good on Google —<br />but we found issues on <span style={{ color: "#f59e0b" }}>other platforms</span></>
            }
          </h1>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            {allGood ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 999, padding: "5px 14px" }}>
                <span style={{ color: "#f59e0b", fontSize: 12, fontWeight: 600 }}>✅ Google strong — issues found elsewhere</span>
              </div>
            ) : (
              <>
                {criticalCount > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 999, padding: "5px 12px", color: "#ef4444", fontSize: 12, fontWeight: 700 }}>🔴 {criticalCount} Critical</span>}
                {warningCount > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 999, padding: "5px 12px", color: "#f59e0b", fontSize: 12, fontWeight: 700 }}>⚠️ {warningCount} Warning{warningCount > 1 ? "s" : ""}</span>}
                {goodCount > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 999, padding: "5px 12px", color: "#10b981", fontSize: 12, fontWeight: 700 }}>✅ {goodCount} Good</span>}
              </>
            )}
          </div>
        </div>

        {/* ═══ 3. THE OFFER CARD — HIGH UP ═══ */}
        <div style={{ background: "rgba(255,255,255,0.03)", borderLeft: "4px solid #f97316", border: "1px solid rgba(249,115,22,0.2)", borderLeftWidth: 4, borderRadius: 14, padding: 0, marginBottom: 36, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {/* LEFT — what we found */}
            <div style={{ padding: "22px 24px", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", marginBottom: 12 }}>What we found so far</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                {worstFindings.length > 0 ? worstFindings.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: f.severity === "critical" ? "#ef4444" : "#f59e0b", flexShrink: 0, marginTop: 5 }} />
                    <span style={{ color: "#c8d0dc", fontSize: 13, lineHeight: 1.4 }}>{f.title}</span>
                  </div>
                )) : (
                  <p style={{ color: "#94a3b8", fontSize: 13 }}>Google looks good — but other platforms need checking</p>
                )}
              </div>
              <p style={{ color: "#64748b", fontSize: 12 }}>...and <strong style={{ color: "#f59e0b" }}>{lockedCount} more issues</strong> locked</p>
            </div>

            {/* RIGHT — buy */}
            <div style={{ padding: "22px 24px" }}>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#f97316", marginBottom: 10 }}>Get every issue + exact fix</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 14 }}>
                <span style={{ color: "#64748b", fontSize: 14, textDecoration: "line-through" }}>$197</span>
                <span style={{ ...heading, fontSize: 32, fontWeight: 800, color: "#fff" }}>$39</span>
              </div>
              <button onClick={handleUnlock} disabled={processing}
                style={{ width: "100%", background: "#f97316", color: "#fff", fontSize: 15, fontWeight: 700, padding: "13px 0", borderRadius: 8, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: processing ? 0.6 : 1 }}>
                {processing ? <><Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> Processing...</> : <>Fix My Business — $39 <ArrowRight style={{ width: 16, height: 16 }} /></>}
              </button>
              {unlockError && <p style={{ color: "#ef4444", fontSize: 11, textAlign: "center", marginTop: 6 }}>{unlockError}</p>}
              <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
                {[{ i: Shield, l: "Secure" }, { i: Zap, l: "Instant" }, { i: Clock, l: "No contracts" }].map(({ i: Icon, l }) => (
                  <span key={l} style={{ display: "flex", alignItems: "center", gap: 3, color: "#64748b", fontSize: 10 }}><Icon style={{ width: 10, height: 10 }} /> {l}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ 4. FREE FINDINGS ═══ */}
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

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {LOCKED_TITLES.map((lt, i) => {
              const sevColor = lt.severity === "critical" ? "#ef4444" : "#f59e0b";
              const sevBg = lt.severity === "critical" ? "rgba(239,68,68,0.04)" : "rgba(245,158,11,0.04)";
              const sevBorder = lt.severity === "critical" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)";
              return (
                <div key={i} style={{ ...card, background: sevBg, borderColor: sevBorder, padding: 0, overflow: "hidden", position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px", borderBottom: `1px solid ${sevBorder}` }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: sevColor }}>{lt.severity === "critical" ? "🔴 Critical" : "⚠️ Warning"}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>{lt.platform}</span>
                  </div>
                  <div style={{ padding: "14px 18px" }}>
                    <p style={{ color: "#94a3b8", fontSize: 15, fontWeight: 600, filter: "blur(4px)", userSelect: "none" }}>{lt.title}</p>
                    <p style={{ color: "#64748b", fontSize: 13, marginTop: 6, filter: "blur(3px)", userSelect: "none" }}>This issue is impacting your visibility and may be driving customers to competitors in your area.</p>
                  </div>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(10,15,30,0.4)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(10,15,30,0.8)", padding: "6px 14px", borderRadius: 999 }}>
                      <Lock style={{ width: 13, height: 13, color: "#64748b" }} />
                      <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>Unlock to see this issue and fix</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ 6. CONSEQUENCES ═══ */}
        <div style={{ ...card, padding: 24, marginBottom: 32 }}>
          <p style={{ ...heading, fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Here's what's happening right now while you read this:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "Customers searching on Google are seeing outdated or missing information about " + businessName,
              "Your competitors who fixed these issues are capturing your potential customers",
              "Every directory with wrong info makes Google trust you less",
              "Each day without fixes = more lost customers you'll never know about",
            ].map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", flexShrink: 0, marginTop: 6 }} />
                <p style={{ color: "#c8d0dc", fontSize: 13, lineHeight: 1.5 }}>{line}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ 7. BOTTOM CTA ═══ */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ ...heading, fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Ready to fix {businessName}?</h2>
          <button onClick={handleUnlock} disabled={processing}
            style={{ background: "#f97316", color: "#fff", fontSize: 16, fontWeight: 700, padding: "16px 40px", borderRadius: 10, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, opacity: processing ? 0.6 : 1 }}>
            {processing ? "Processing..." : <>Get My Complete Audit — $39 <ArrowRight style={{ width: 16, height: 16 }} /></>}
          </button>
          <p style={{ color: "#4b5563", fontSize: 11, marginTop: 10 }}>One-time payment · Yours forever · Agencies charge $500–$2,000</p>
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
              style={{ width: "100%", background: "#f97316", color: "#fff", fontSize: 15, fontWeight: 700, padding: "14px 0", borderRadius: 10, border: "none", cursor: "pointer", opacity: email.includes("@") ? 1 : 0.4 }}>
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
