import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Lock, Shield, Zap, Clock, ArrowRight, BarChart2, Loader2, X, AlertCircle, ExternalLink } from "lucide-react";

const API_BASE = "https://pageaudit-engine.onrender.com";

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

  // Normalize findings from both old format {title, severity, description} and new format {icon, text}
  const rawFindings = [
    ...(scanData?.findings || []),
    ...(scanData?.allFindings || []),
    ...(scanData?.google?.findings || []),
  ];
  const normalizedFindings = rawFindings.map(f => ({
    title: f.title || f.text || "",
    severity: f.severity || f.icon || "warning",
    description: f.description || "",
    platform: f.platform || "Google",
    fix: f.fix || "",
  }));
  const seen = new Set();
  const dedupedFindings = normalizedFindings.filter(f => {
    if (!f.title || seen.has(f.title)) return false;
    seen.add(f.title);
    return true;
  });
  const severityOrder = { critical: 0, warning: 1, good: 2 };
  dedupedFindings.sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9));
  const realFindings = dedupedFindings.slice(0, 4);

  const criticalCount = dedupedFindings.filter(f => f.severity === "critical").length;
  const warningCount = dedupedFindings.filter(f => f.severity === "warning").length;
  const goodCount = dedupedFindings.filter(f => f.severity === "good").length;
  const score = scanData?.score ?? scanData?.preliminaryScore ?? scanData?.google?.score ?? null;
  const scoreLabel = scanData?.scoreLabel || (score >= 75 ? "Strong" : score >= 60 ? "Needs Work" : score >= 45 ? "Critical" : score != null ? "Emergency" : null);
  const scoreColor = score >= 75 ? "#10b981" : score >= 45 ? "#f59e0b" : "#ef4444";
  const allGood = criticalCount === 0 && warningCount === 0;

  // Google data from scan
  const rating = scanData?.rating || scanData?.google?.rating || null;
  const reviewCount = scanData?.reviewCount || scanData?.google?.reviewCount || null;
  const address = scanData?.address || scanData?.google?.address || null;

  const handleUnlock = () => {
    if (!email.trim() || !email.includes("@")) { setShowEmailModal(true); return; }
    goToCheckout();
  };

  const goToCheckout = async () => {
    if (!email.trim() || !email.includes("@")) return;
    setProcessing(true);
    setUnlockError("");
    try {
      let bizData = {};
      try { bizData = JSON.parse(localStorage.getItem("pageaudit_business_data") || "{}"); } catch {}
      const auditRes = await fetch(`${API_BASE}/api/audits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_name: businessName, email: email.trim(), business_name: businessName, city: city || "", account_type: "Business", website: bizData.website || null }),
      });
      const auditData = await auditRes.json();
      if (!auditRes.ok || !auditData?.audit?.id) throw new Error(auditData?.error || "Failed");
      localStorage.setItem("pageAuditOrder", JSON.stringify({ name: businessName, email: email.trim(), businessName, city, state, auditId: auditData.audit.id, website: bizData.website || "", address: bizData.address || "", phone: bizData.phone || "" }));
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

  const H = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
  const W = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14 };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#f9fafb" }}>

      {/* ═══ NAV ═══ */}
      <nav style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #e5e7eb", padding: "14px 24px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart2 style={{ width: 20, height: 20, color: "#2563eb" }} />
            <span style={{ ...H, fontWeight: 800, fontSize: 16, color: "#0f172a" }}>PageAudit<span style={{ color: "#2563eb" }}>Pro</span></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
            <span style={{ color: "#059669", fontSize: 13, fontWeight: 600 }}>Scan Complete</span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* ═══ HEADER ═══ */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ ...H, fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: "#0f172a", lineHeight: 1.15, marginBottom: 6, letterSpacing: "-0.02em" }}>
            {criticalCount > 0
              ? <>We found <span style={{ color: "#ef4444" }}>{criticalCount} critical issue{criticalCount > 1 ? "s" : ""}</span> affecting {businessName}</>
              : warningCount > 0
                ? <>{warningCount} issue{warningCount > 1 ? "s" : ""} may be costing <span style={{ color: "#f59e0b" }}>{businessName}</span> customers</>
                : <>{businessName} looks solid — <span style={{ color: "#2563eb" }}>room to improve</span></>
            }
          </h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>{businessName}{city ? ` — ${city}` : ""}{state ? `, ${state}` : ""}</p>

          {/* Score + severity pills */}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            {criticalCount > 0 && <span style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 100, padding: "5px 14px", color: "#dc2626", fontSize: 12, fontWeight: 700 }}>{criticalCount} Critical</span>}
            {warningCount > 0 && <span style={{ background: "#fffbeb", border: "1px solid #fed7aa", borderRadius: 100, padding: "5px 14px", color: "#d97706", fontSize: 12, fontWeight: 700 }}>{warningCount} Warning{warningCount > 1 ? "s" : ""}</span>}
            {goodCount > 0 && <span style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 100, padding: "5px 14px", color: "#059669", fontSize: 12, fontWeight: 700 }}>{goodCount} Good</span>}
          </div>
        </div>

        {/* ═══ SCORE + GOOGLE SNAPSHOT ═══ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 32 }}>
          {/* Score card */}
          {score != null && (
            <div style={{ ...W, padding: 28, textAlign: "center" }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af", marginBottom: 8 }}>Preliminary Score</p>
              <div style={{ ...H, fontSize: 56, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{score}<span style={{ fontSize: 24, color: "#d1d5db" }}>/100</span></div>
              <p style={{ fontSize: 14, fontWeight: 600, color: scoreColor, marginTop: 4 }}>{scoreLabel}</p>
              <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>Based on Google Business Profile only</p>
            </div>
          )}
          {/* Google snapshot */}
          <div style={{ ...W, padding: 28 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af", marginBottom: 12 }}>Google Business Profile</p>
            {rating != null && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ ...H, fontSize: 28, fontWeight: 800, color: "#0f172a" }}>{rating}</span>
                <div style={{ display: "flex", gap: 1 }}>
                  {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.round(rating) ? "#f59e0b" : "#e5e7eb", fontSize: 16 }}>&#9733;</span>)}
                </div>
                {reviewCount != null && <span style={{ fontSize: 13, color: "#64748b" }}>({reviewCount} reviews)</span>}
              </div>
            )}
            {address && <p style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>{address}</p>}
            <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Website", "Facebook", "Yelp", "Competitors"].map(p => (
                <span key={p} style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4 }}>
                  <Lock style={{ width: 10, height: 10 }} /> {p}
                </span>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 10 }}>Full scan checks all platforms</p>
          </div>
        </div>

        {/* ═══ FREE FINDINGS ═══ */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#2563eb", marginBottom: 14 }}>Free Preview — What We Found</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {realFindings.map((f, i) => {
              const isCritical = f.severity === "critical";
              const isGood = f.severity === "good";
              const borderColor = isCritical ? "#ef4444" : isGood ? "#10b981" : "#f59e0b";
              return (
                <div key={i} style={{ ...W, borderLeft: `4px solid ${borderColor}`, overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: borderColor, textTransform: "uppercase", background: isCritical ? "#fef2f2" : isGood ? "#ecfdf5" : "#fffbeb", padding: "2px 8px", borderRadius: 4 }}>{isCritical ? "Critical" : isGood ? "Good" : "Warning"}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" }}>{f.platform}</span>
                    </div>
                    <h3 style={{ ...H, fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 6, lineHeight: 1.3 }}>{f.title}</h3>
                    {f.description && <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>{f.description}</p>}

                    {/* Blurred fix — teaser */}
                    {!isGood && f.fix && (
                      <div style={{ position: "relative", marginTop: 8 }}>
                        <div style={{ background: "#eff6ff", borderRadius: 8, padding: 12 }}>
                          <p style={{ color: "#1e40af", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>How to fix</p>
                          <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.5, filter: "blur(4px)", userSelect: "none" }}>{f.fix}</p>
                        </div>
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.6)", borderRadius: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#fff", border: "1px solid #e5e7eb", padding: "5px 14px", borderRadius: 100, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                            <Lock style={{ width: 12, height: 12, color: "#9ca3af" }} />
                            <span style={{ color: "#6b7280", fontSize: 12, fontWeight: 600 }}>Unlock full report</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ LOCKED PLATFORMS ═══ */}
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ ...H, fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>More Issues Found on Other Platforms</h2>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 16 }}>Your full report includes Yelp, Facebook, website analysis, NAP consistency, and competitor comparison.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {[
              { platform: "Yelp", issue: "Listing may have critical gaps" },
              { platform: "Facebook", issue: "Page activity appears limited" },
              { platform: "Website", issue: "SEO and speed issues detected" },
              { platform: "Competitors", issue: "Nearby businesses may be ahead" },
            ].map(({ platform, issue }) => (
              <div key={platform} style={{ ...W, padding: 18, position: "relative", overflow: "hidden" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#2563eb", textTransform: "uppercase", marginBottom: 6 }}>{platform}</p>
                <p style={{ fontSize: 13, color: "#9ca3af", filter: "blur(3px)", userSelect: "none" }}>{issue}</p>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(249,250,251,0.5)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#fff", border: "1px solid #e5e7eb", padding: "5px 12px", borderRadius: 100, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <Lock style={{ width: 11, height: 11, color: "#9ca3af" }} />
                    <span style={{ color: "#6b7280", fontSize: 11, fontWeight: 600 }}>Locked</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ CTA CARD ═══ */}
        <div style={{ ...W, border: "2px solid #2563eb", borderRadius: 18, overflow: "hidden", marginBottom: 36 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            <div style={{ padding: "28px 24px", borderRight: "1px solid #f1f5f9" }}>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#2563eb", marginBottom: 14 }}>Your full report includes</p>
              {["Every issue across all platforms with exact fixes", "Website, Facebook, and Yelp verified screenshots", "Side-by-side competitor comparison", "Priority fix recommendation", "30-day action plan"].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <CheckCircle style={{ width: 15, height: 15, color: "#10b981", flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: "#374151" }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                <span style={{ ...H, fontSize: 40, fontWeight: 800, color: "#0f172a" }}>$99</span>
                <span style={{ fontSize: 14, color: "#9ca3af", textDecoration: "line-through" }}>$299</span>
              </div>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>One-time payment. Yours forever.</p>
              <button onClick={handleUnlock} disabled={processing}
                style={{ width: "100%", background: "#2563eb", color: "#fff", fontSize: 16, fontWeight: 700, padding: "14px 0", borderRadius: 10, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: processing ? 0.6 : 1, boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }}>
                {processing ? <><Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> Processing...</> : <>Unlock Full Report <ArrowRight style={{ width: 16, height: 16 }} /></>}
              </button>
              <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
              {unlockError && <p style={{ color: "#ef4444", fontSize: 12, textAlign: "center", marginTop: 8 }}>{unlockError}</p>}
              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12 }}>
                {[{ i: Shield, l: "Secure checkout" }, { i: Zap, l: "Instant delivery" }].map(({ i: Icon, l }) => (
                  <span key={l} style={{ display: "flex", alignItems: "center", gap: 4, color: "#9ca3af", fontSize: 11, fontWeight: 500 }}><Icon style={{ width: 12, height: 12 }} /> {l}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ WHAT HAPPENS NEXT ═══ */}
        <div style={{ ...W, padding: 24, marginBottom: 36 }}>
          <h3 style={{ ...H, fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>What happens if you don't fix this?</h3>
          {[
            `Customers searching for businesses like ${businessName} are finding competitors first`,
            "Every directory with wrong info makes Google trust your business less",
            "Competitors who fix their profiles first will stay ahead",
          ].map((line, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
              <AlertCircle style={{ width: 16, height: 16, color: "#ef4444", flexShrink: 0, marginTop: 2 }} />
              <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.5, margin: 0 }}>{line}</p>
            </div>
          ))}
        </div>

        {/* ═══ BOTTOM CTA ═══ */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ ...H, fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>Ready to fix {businessName}'s online presence?</h2>
          <button onClick={handleUnlock} disabled={processing}
            style={{ background: "#2563eb", color: "#fff", fontSize: 16, fontWeight: 700, padding: "16px 40px", borderRadius: 10, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, opacity: processing ? 0.6 : 1, boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }}>
            {processing ? "Processing..." : <>Unlock Full Report — $99 <ArrowRight style={{ width: 16, height: 16 }} /></>}
          </button>
          <p style={{ color: "#9ca3af", fontSize: 12, marginTop: 10 }}>One-time payment · Instant delivery · Agencies charge $500–$2,000</p>
        </div>
      </div>

      {/* ═══ EMAIL MODAL ═══ */}
      {showEmailModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, maxWidth: 400, width: "100%", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <button onClick={() => setShowEmailModal(false)} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X style={{ width: 18, height: 18 }} /></button>
            <h3 style={{ ...H, fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Where should we send your report?</h3>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Enter your email to continue to secure checkout.</p>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@business.com" autoFocus
              onKeyDown={e => { if (e.key === "Enter" && email.includes("@")) { setShowEmailModal(false); goToCheckout(); } }}
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 16px", fontSize: 15, color: "#0f172a", outline: "none", boxSizing: "border-box", marginBottom: 14 }} />
            <button onClick={() => { if (email.includes("@")) { setShowEmailModal(false); goToCheckout(); } }}
              disabled={!email.includes("@") || processing}
              style={{ width: "100%", background: "#2563eb", color: "#fff", fontSize: 15, fontWeight: 700, padding: "14px 0", borderRadius: 10, border: "none", cursor: "pointer", opacity: email.includes("@") ? 1 : 0.4 }}>
              {processing ? "Processing..." : "Continue to Payment →"}
            </button>
            <p style={{ color: "#9ca3af", fontSize: 11, textAlign: "center", marginTop: 10 }}>Secure checkout by Stripe. We'll never spam you.</p>
          </div>
        </div>
      )}

      {/* ═══ FOOTER ═══ */}
      <footer style={{ borderTop: "1px solid #e5e7eb", padding: "24px 16px", background: "#fff" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart2 style={{ width: 14, height: 14, color: "#2563eb" }} />
            <span style={{ ...H, fontWeight: 700, color: "#0f172a", fontSize: 13 }}>PageAudit<span style={{ color: "#2563eb" }}>Pro</span></span>
          </div>
          <div style={{ display: "flex", gap: 20, fontSize: 12, color: "#64748b" }}>
            <a href="/privacy" style={{ color: "#64748b", textDecoration: "none" }}>Privacy</a>
            <a href="/terms" style={{ color: "#64748b", textDecoration: "none" }}>Terms</a>
          </div>
          <p style={{ fontSize: 11, color: "#9ca3af" }}>&copy; 2026 PageAudit Pro</p>
        </div>
      </footer>
    </div>
  );
}
