import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, CheckCircle, Shield, Clock, BarChart2 } from "lucide-react";
import { trackEvent, EVENTS } from "@/utils/tracking";

const API_BASE = "https://pageaudit-engine.onrender.com";

function useCountdown(minutes) {
  const [seconds, setSeconds] = useState(minutes * 60);
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    if (seconds <= 0) { setExpired(true); return; }
    const timer = setInterval(() => {
      setSeconds(prev => { if (prev <= 1) { setExpired(true); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return { display: `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`, expired };
}

export default function PreviewReport() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unlocking, setUnlocking] = useState(false);
  const orderRef = useRef(null);
  const { display: timerDisplay, expired: timerExpired } = useCountdown(10);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => {
    const savedOrder = localStorage.getItem("pageAuditOrder");
    if (!savedOrder) { setError("No audit order found. Please start a new audit."); setLoading(false); return; }
    const orderData = JSON.parse(savedOrder);
    orderRef.current = orderData;
    setOrder(orderData);
    trackEvent(EVENTS.PREVIEW_VIEWED, { email: orderData.email }).catch(() => {});
    setLoading(false);
  }, []);

  const handleUnlock = useCallback(async () => {
    const currentOrder = orderRef.current;
    if (!currentOrder) return;
    trackEvent(EVENTS.UNLOCK_CLICKED, { email: currentOrder.email }).catch(() => {});
    setUnlocking(true);
    try {
      const res = await fetch(`${API_BASE}/api/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audit_id: currentOrder.auditId,
          email: currentOrder.email,
          customer_name: currentOrder.name || currentOrder.businessName,
          rep_code: localStorage.getItem("pageaudit_rep_code") || null,
        }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { throw new Error(data.error || "No checkout URL returned"); }
    } catch (err) {
      console.error("Stripe error:", err);
      alert("Something went wrong. Please try again.");
      setUnlocking(false);
    }
  }, []);

  const heading = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
  const body = { fontFamily: "'Inter', sans-serif" };

  if (loading) return (
    <div style={{ ...body, minHeight: "100vh", background: "#0a0f1e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "3px solid rgba(37,99,235,0.2)", borderTop: "3px solid #2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ ...body, minHeight: "100vh", background: "#0a0f1e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: 20 }}>
        <h2 style={{ ...heading, color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h2>
        <p style={{ color: "#94a3b8", fontSize: 15, marginBottom: 24 }}>{error}</p>
        <button onClick={() => navigate("/submit-your-page")} style={{ background: "#2563eb", color: "#fff", border: "none", padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Try Again</button>
      </div>
    </div>
  );

  if (unlocking) return (
    <div style={{ ...body, minHeight: "100vh", background: "#0a0f1e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 64, height: 64, border: "4px solid rgba(37,99,235,0.2)", borderTop: "4px solid #2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} />
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        <h2 style={{ ...heading, color: "#fff", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Preparing Your Checkout</h2>
        <p style={{ color: "#94a3b8", fontSize: 15 }}>Redirecting to secure payment...</p>
      </div>
    </div>
  );

  return (
    <div style={{ ...body, minHeight: "100vh", background: "#0a0f1e" }}>
      {/* NAV */}
      <nav style={{ background: "rgba(10,15,30,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "14px 24px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
          <BarChart2 style={{ width: 18, height: 18, color: "#3b82f6" }} />
          <span style={{ ...heading, fontWeight: 700, fontSize: 14, color: "#fff" }}>PageAudit Pro</span>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 20px 80px" }}>
        {/* HERO */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "#3b82f6", marginBottom: 16 }}>Your Online Presence Audit</p>
          <h1 style={{ ...heading, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#fff", marginBottom: 12, lineHeight: 1.1 }}>
            Your Complete Audit Report<br />Is Ready — Claim It Now
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 16, marginBottom: 8, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
            Agencies charge $500–$2,000 for this. Get the same insights for $39.
          </p>
          {order && <p style={{ color: "#64748b", fontSize: 14 }}>Prepared for <strong style={{ color: "#c8d0dc" }}>{order.businessName || order.name}</strong></p>}
        </div>

        {/* PRICING CARD */}
        <div style={{ maxWidth: 400, margin: "0 auto 48px", background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 20, padding: 32, textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#3b82f6", marginBottom: 16 }}>Limited Launch Pricing</p>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 4 }}>Regular price: <span style={{ textDecoration: "line-through" }}>$197</span></p>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 2, marginBottom: 4 }}>
            <span style={{ ...heading, fontSize: 56, fontWeight: 800, color: "#fff" }}>$39</span>
          </div>
          <p style={{ color: "#10b981", fontSize: 14, fontWeight: 600, marginBottom: 20 }}>You save $158</p>

          <button onClick={handleUnlock} disabled={unlocking}
            style={{ width: "100%", background: "#2563eb", color: "#fff", fontSize: 16, fontWeight: 700, padding: "16px 0", borderRadius: 10, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: unlocking ? 0.6 : 1 }}>
            {unlocking ? <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> : <ArrowRight style={{ width: 18, height: 18 }} />}
            {unlocking ? "Redirecting..." : "Claim My Report →"}
          </button>

          <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: timerExpired ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)", border: `1px solid ${timerExpired ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)"}` }}>
            <p style={{ color: timerExpired ? "#ef4444" : "#f59e0b", fontSize: 13, fontWeight: 700 }}>
              {timerExpired ? "Your hold has expired — claim now" : `Offer expires in ${timerDisplay}`}
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
            {[{ i: Shield, l: "Secure payment" }, { i: CheckCircle, l: "Instant access" }, { i: Clock, l: "No contracts" }].map(({ i: Icon, l }) => (
              <span key={l} style={{ display: "flex", alignItems: "center", gap: 4, color: "#64748b", fontSize: 11 }}><Icon style={{ width: 12, height: 12 }} /> {l}</span>
            ))}
          </div>

          <p style={{ color: "#4b5563", fontSize: 11, marginTop: 12 }}>
            By purchasing you agree to our{" "}
            <a href="/terms" target="_blank" style={{ color: "#3b82f6", textDecoration: "none" }}>Terms</a> and{" "}
            <a href="/privacy" target="_blank" style={{ color: "#3b82f6", textDecoration: "none" }}>Privacy Policy</a>
          </p>
        </div>

        {/* WHAT'S INCLUDED */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "#3b82f6", textAlign: "center", marginBottom: 20 }}>What's Inside Your Report</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            {[
              { emoji: "🔍", title: "Google Business Audit", desc: "Complete analysis of your Google listing, reviews, ratings, hours, and photos." },
              { emoji: "⭐", title: "Yelp & Review Analysis", desc: "How your reviews compare and what's hurting your reputation." },
              { emoji: "🌐", title: "Website Speed & SEO", desc: "Mobile performance, load time, and search engine optimization check." },
              { emoji: "📍", title: "NAP Consistency Check", desc: "Your name, address, and phone verified across 20+ directories." },
              { emoji: "🏆", title: "Competitor Comparison", desc: "See exactly how you stack up against your local competitors." },
              { emoji: "🤖", title: "AI Action Plan", desc: "Personalized step-by-step recommendations to improve your score." },
            ].map(({ emoji, title, desc }) => (
              <div key={title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, display: "flex", gap: 12 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{emoji}</span>
                <div>
                  <p style={{ color: "#c8d0dc", fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{title}</p>
                  <p style={{ color: "#64748b", fontSize: 12, lineHeight: 1.5 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div style={{ textAlign: "center" }}>
          <h2 style={{ ...heading, fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Don't let your audit expire</h2>
          <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 20 }}>
            {timerExpired ? "Your hold has expired. Claim your report now." : `We're holding your report for another ${timerDisplay}.`}
          </p>
          <button onClick={handleUnlock} disabled={unlocking}
            style={{ background: "#2563eb", color: "#fff", fontSize: 15, fontWeight: 700, padding: "14px 36px", borderRadius: 10, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, opacity: unlocking ? 0.6 : 1 }}>
            {unlocking ? "Redirecting..." : "Yes — Claim My Report for $39 →"}
          </button>
          <p style={{ color: "#4b5563", fontSize: 11, marginTop: 12 }}>🔒 Secure · One-time · Instant access</p>
        </div>
      </div>
    </div>
  );
}
