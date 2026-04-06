import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Search, Check, Star, Shield, Zap, Clock, ChevronRight, BarChart2 } from "lucide-react";

const PLATFORMS = ["Google", "Yelp", "Facebook", "Your Website", "NAP Consistency", "Competitors"];

const STEPS = [
  { num: "01", title: "Enter your business", desc: "Type your business name and city. That's it — no account, no login, no credit card." },
  { num: "02", title: "We scan everything", desc: "Our system checks Google, Yelp, Facebook, your website, and compares you to local competitors." },
  { num: "03", title: "See what to fix first", desc: "Get a clear score, specific issues ranked by impact, and a step-by-step plan — in plain English." },
];

const SCORE_BARS = [
  { label: "Google Business Profile", score: 68, color: "#22c55e" },
  { label: "Facebook Presence", score: 52, color: "#f59e0b" },
  { label: "Yelp Profile", score: 71, color: "#22c55e" },
  { label: "Website SEO", score: 45, color: "#f59e0b" },
  { label: "NAP Consistency", score: 63, color: "#ef4444" },
];

const PLANS = [
  {
    name: "Basic", price: "$99", period: "one-time", featured: false,
    desc: "Clear snapshot of where you stand across every platform.",
    features: ["Full scan across all platforms", "Overall score + section scores", "Top issues with fixes", "2 competitor comparison", "7-day action plan"],
  },
  {
    name: "Advanced", price: "$129", period: "one-time", featured: true, badge: "Most Popular",
    desc: "See where you're losing to competitors and exactly how to close the gap.",
    features: ["Everything in Basic", "3 competitor deep comparison", "Competitive gap analysis", "Stronger impact insights", "Detailed priority recommendations"],
  },
  {
    name: "Competitive", price: "$149", period: "one-time", featured: false,
    desc: "Full competitive intelligence. Know exactly who is winning your customers and why.",
    features: ["Everything in Advanced", "Full competitive positioning", "Opportunities to overtake competitors", "Revenue impact analysis", "Consequences of inaction"],
  },
];

const TESTIMONIALS = [
  { name: "Mike R.", biz: "Marketing Company Owner", text: "I had no idea my Google listing had the wrong phone number. Customers were calling my old number for months. This scan caught it in 30 seconds — would've taken me forever to figure out on my own." },
  { name: "Sarah T.", biz: "Restaurant Owner", text: "We were completely invisible on Apple Maps and Bing. The report showed us exactly what was missing and we fixed it in one afternoon. Already seeing more walk-ins." },
  { name: "Dave K.", biz: "Auto Shop Owner", text: "My competitor had half our experience but was outranking us everywhere. The competitor analysis showed me exactly why and the action plan told me what to do about it." },
];

const FAQS = [
  { q: "Is the free scan really free?", a: "Yes. The free scan gives you a quick score and your top 3 issues. No account, no credit card, no obligation. Upgrade only if you want the full picture." },
  { q: "How long does the scan take?", a: "The free scan takes about 60 seconds. The full paid scan takes 1-2 minutes as it does a deeper analysis across more platforms and competitors." },
  { q: "What platforms do you check?", a: "Google Business Profile, Yelp, Facebook, your website's SEO and speed, NAP consistency across the web, and local competitor positioning." },
  { q: "Do I need a website to use this?", a: "No. We'll scan whatever you have. If you don't have a website, that's one of the issues we'll flag — along with exactly how to fix it." },
  { q: "How is this different from free SEO tools?", a: "Free SEO tools check your website only. We scan your entire online presence — Google, Yelp, Facebook, NAP consistency — and compare you directly to local competitors. We tell you what's costing you customers, not just what's technically wrong." },
];

function ScanBar({ value, onChange, onScan, dark = false, inputId = "", scanError = "" }) {
  return (
    <div>
      <div style={{
        display: "flex", maxWidth: 540, margin: "0 auto",
        background: dark ? "#1e293b" : "#fff",
        border: `2px solid ${dark ? "#334155" : "#e2e8f0"}`,
        borderRadius: 12, overflow: "hidden",
        boxShadow: dark ? "none" : "0 2px 12px rgba(0,0,0,0.05)",
        transition: "border-color 0.2s",
      }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", width: 18, height: 18, color: dark ? "#64748b" : "#94a3b8" }} />
          <input type="text" id={inputId || undefined} value={value} onChange={e => onChange(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onScan(value)}
            placeholder="e.g. Joe's Plumbing Dallas TX"
            style={{
              width: "100%", padding: "16px 16px 16px 48px", fontSize: 16, border: "none", outline: "none",
              background: "transparent", color: dark ? "#fff" : "#0f172a", boxSizing: "border-box",
              fontFamily: "'Inter', sans-serif",
            }} />
        </div>
        <button onClick={() => onScan(value)} style={{
          background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 15,
          padding: "16px 28px", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
          transition: "background 0.15s",
        }}
          onMouseOver={e => e.currentTarget.style.background = "#1d4ed8"}
          onMouseOut={e => e.currentTarget.style.background = "#2563eb"}>
          Scan Free <ArrowRight style={{ width: 16, height: 16 }} />
        </button>
      </div>
      {scanError && <p style={{ color: "#ef4444", fontSize: 13, fontWeight: 600, textAlign: "center", marginTop: 10 }}>{scanError}</p>}
      <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", marginTop: 16, fontSize: 13, color: dark ? "#64748b" : "#94a3b8", fontWeight: 500 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Shield style={{ width: 13, height: 13 }} /> No account needed</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Zap style={{ width: 13, height: 13 }} /> No credit card</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Clock style={{ width: 13, height: 13 }} /> Results in 60 seconds</span>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState("");
  const [businessName2, setBusinessName2] = useState("");
  const [openFaq, setOpenFaq] = useState(/** @type {number|null} */ (null));
  const [scoreVisible, setScoreVisible] = useState(false);
  const scoreRef = useRef(null);
  const [scanError, setScanError] = useState("");

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setScoreVisible(true);
    }, { threshold: 0.3 });
    if (scoreRef.current) observer.observe(scoreRef.current);
    return () => observer.disconnect();
  }, []);

  const handleScan = (name) => {
    const raw = (name || "").trim();
    if (!raw) { setScanError("Please enter a business name and city"); return; }
    if (raw.split(/\s+/).length < 2) { setScanError("Please include both business name and city (e.g. Joe's Pizza Dallas TX)"); return; }
    setScanError("");
    const stateMatch = raw.match(/\b([A-Z]{2})\s*$/);
    const st = stateMatch ? stateMatch[1] : "";
    const withoutState = st ? raw.slice(0, -st.length).trim().replace(/,\s*$/, "") : raw;
    const parts = withoutState.split(/\s+/);
    let biz = raw, ct = "";
    if (parts.length >= 3) {
      const cityWords = parts.length >= 4 ? parts.slice(-2) : parts.slice(-1);
      ct = cityWords.join(" ");
      biz = parts.slice(0, parts.length - cityWords.length).join(" ");
    }
    navigate("/scanning", { state: { businessName: biz || raw, city: ct, state: st } });
  };

  const h = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
  const b = { fontFamily: "'Inter', sans-serif" };

  return (
    <div style={{ ...b, background: "#fff", color: "#1a1a2e", minHeight: "100vh" }}>

      {/* ═══ NAV ═══ */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart2 style={{ width: 22, height: 22, color: "#2563eb" }} />
            <span style={{ ...h, fontWeight: 800, fontSize: 18, color: "#0f172a", letterSpacing: "-0.01em" }}>PageAudit<span style={{ color: "#2563eb" }}>Pro</span></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <a href="#how" style={{ fontSize: 14, fontWeight: 500, color: "#475569", textDecoration: "none" }}>How It Works</a>
            <a href="#pricing" style={{ fontSize: 14, fontWeight: 500, color: "#475569", textDecoration: "none" }}>Pricing</a>
            <button onClick={() => navigate("/login")} style={{ fontSize: 14, fontWeight: 500, color: "#475569", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Login</button>
            <button onClick={() => document.getElementById("heroInput")?.focus()} style={{ fontSize: 14, fontWeight: 600, color: "#fff", background: "#2563eb", border: "none", padding: "10px 22px", borderRadius: 8, cursor: "pointer", transition: "background 0.15s" }}
              onMouseOver={e => e.currentTarget.style.background = "#1d4ed8"}
              onMouseOut={e => e.currentTarget.style.background = "#2563eb"}>
              Scan My Business
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{ paddingTop: 140, paddingBottom: 88, background: "#fafbfc", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -300, right: -300, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -200, left: -200, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.03) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1, padding: "0 24px" }}>
          <div style={{ display: "inline-block", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 100, padding: "7px 18px", fontSize: 13, fontWeight: 600, color: "#6b7280", marginBottom: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            Free scan <span style={{ color: "#2563eb" }}>&mdash; no account needed</span>
          </div>
          <h1 style={{ ...h, fontSize: "clamp(34px, 5vw, 54px)", fontWeight: 800, lineHeight: 1.08, color: "#0f172a", marginBottom: 24, letterSpacing: "-0.025em" }}>
            Your competitors are<br />getting your customers.<br /><span style={{ color: "#2563eb" }}>Find out why.</span>
          </h1>
          <p style={{ fontSize: "clamp(16px, 1.8vw, 19px)", color: "#64748b", lineHeight: 1.65, maxWidth: 580, margin: "0 auto 40px", letterSpacing: "-0.01em" }}>
            See exactly how your business looks online compared to competitors. Google, Yelp, Facebook, your website &mdash; scanned in 60 seconds.
          </p>
          <ScanBar value={businessName} onChange={setBusinessName} onScan={handleScan} inputId="heroInput" scanError={scanError} />
        </div>
      </section>

      {/* ═══ PLATFORM STRIP ═══ */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "28px 16px", textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 16 }}>We check everywhere your customers look</p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
          {PLATFORMS.map(p => (
            <span key={p} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, color: "#374151", letterSpacing: "-0.01em" }}>{p}</span>
          ))}
        </div>
      </div>

      {/* ═══ PROBLEM ═══ */}
      <section style={{ background: "#f9fafb", padding: "96px 16px", textAlign: "center", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ maxWidth: 660, margin: "0 auto" }}>
          <h2 style={{ ...h, fontSize: "clamp(26px, 3.5vw, 36px)", fontWeight: 800, color: "#0f172a", lineHeight: 1.2, marginBottom: 28, letterSpacing: "-0.02em" }}>
            Right now, someone is searching<br />for a business <span style={{ color: "#2563eb" }}>just like yours.</span>
          </h2>
          <p style={{ fontSize: 17, color: "#64748b", lineHeight: 1.75, marginBottom: 16 }}>
            They're checking your reviews. Comparing your rating to the business next door. Looking at your website on their phone. Scrolling your Facebook page.
          </p>
          <p style={{ fontSize: 17, color: "#64748b", lineHeight: 1.75, marginBottom: 36 }}>
            If your Google listing has the wrong number, your Yelp has one review from 2019, or your website has no phone number &mdash; <strong style={{ color: "#0f172a" }}>they're choosing someone else.</strong>
          </p>
          <div style={{ display: "inline-block", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>You can't fix what you can't see. <span style={{ color: "#2563eb" }}>That's why we built this.</span></p>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how" style={{ padding: "96px 16px", background: "#fff" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#2563eb", textAlign: "center", marginBottom: 12 }}>How It Works</p>
          <h2 style={{ ...h, fontSize: "clamp(26px, 3.5vw, 36px)", fontWeight: 800, color: "#0f172a", textAlign: "center", marginBottom: 16, letterSpacing: "-0.02em" }}>Three steps. Sixty seconds. Full picture.</h2>
          <p style={{ fontSize: 17, color: "#64748b", textAlign: "center", maxWidth: 540, margin: "0 auto 56px" }}>No login, no setup, no technical knowledge needed.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 28 }}>
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 14, padding: "36px 28px", textAlign: "left", position: "relative", transition: "box-shadow 0.2s" }}
                onMouseOver={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.05)"}
                onMouseOut={e => e.currentTarget.style.boxShadow = "none"}>
                <span style={{ ...h, fontSize: 13, fontWeight: 800, color: "#2563eb", display: "inline-block", background: "#eff6ff", borderRadius: 6, padding: "4px 10px", marginBottom: 16, letterSpacing: "0.02em" }}>STEP {num}</span>
                <h3 style={{ ...h, fontSize: 19, fontWeight: 700, color: "#0f172a", marginBottom: 10, letterSpacing: "-0.01em" }}>{title}</h3>
                <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SCORE PREVIEW ═══ */}
      <section ref={scoreRef} style={{ padding: "96px 16px", background: "#f9fafb", borderTop: "1px solid #f1f5f9" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
          <div style={{ padding: "0 8px" }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#2563eb", marginBottom: 12 }}>Your Online Health Report</p>
            <h2 style={{ ...h, fontSize: "clamp(26px, 3vw, 34px)", fontWeight: 800, color: "#0f172a", lineHeight: 1.2, marginBottom: 18, letterSpacing: "-0.02em" }}>See exactly where you stand &mdash; and what's costing you customers.</h2>
            <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.7, marginBottom: 28 }}>Your scan gives you a score across every platform that matters. No jargon, no fluff &mdash; just a clear picture of what's working, what's broken, and the exact steps to fix it.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
              {["Overall score across all platforms", "Top 3 issues ranked by business impact", "Side-by-side competitor comparison", "Step-by-step fix guide in plain English", "Screenshots of what your customers actually see"].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check style={{ width: 13, height: 13, color: "#22c55e" }} />
                  </div>
                  <span style={{ fontSize: 15, color: "#374151" }}>{item}</span>
                </div>
              ))}
            </div>
            <button onClick={() => document.getElementById("heroInput")?.focus() || window.scrollTo({ top: 0, behavior: "smooth" })}
              style={{ background: "#2563eb", color: "#fff", fontWeight: 600, fontSize: 16, padding: "14px 32px", borderRadius: 10, border: "none", cursor: "pointer", boxShadow: "0 2px 8px rgba(37,99,235,0.25)", transition: "background 0.15s" }}
              onMouseOver={e => e.currentTarget.style.background = "#1d4ed8"}
              onMouseOut={e => e.currentTarget.style.background = "#2563eb"}>
              Scan My Business Free
            </button>
          </div>
          <div style={{ background: "#fff", borderRadius: 18, padding: 36, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Overall Online Score</p>
              <span style={{ background: "#eff6ff", color: "#2563eb", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4, textTransform: "uppercase" }}>Sample</span>
            </div>
            <div style={{ ...h, fontSize: 68, fontWeight: 800, color: "#f59e0b", lineHeight: 1 }}>61<span style={{ fontSize: 28, color: "#d1d5db" }}>/100</span></div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#f59e0b", marginBottom: 28 }}>Needs Improvement</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {SCORE_BARS.map(({ label, score, color }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 13, color: "#6b7280", width: 160, flexShrink: 0, fontWeight: 500 }}>{label}</span>
                  <div style={{ flex: 1, height: 6, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 3, background: color, transition: "width 1.2s ease-out", width: scoreVisible ? `${score}%` : "0%" }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1f2937", width: 32, textAlign: "right" }}>{score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" style={{ padding: "96px 16px", background: "#fff" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#2563eb", textAlign: "center", marginBottom: 12 }}>Simple Pricing</p>
          <h2 style={{ ...h, fontSize: "clamp(26px, 3.5vw, 36px)", fontWeight: 800, color: "#0f172a", textAlign: "center", marginBottom: 14, letterSpacing: "-0.02em" }}>Choose the depth of insight you need.</h2>
          <p style={{ fontSize: 17, color: "#64748b", textAlign: "center", maxWidth: 520, margin: "0 auto 56px" }}>Same platforms. Same accuracy. More competitive intelligence at higher tiers.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 24 }}>
            {PLANS.map(({ name, price, period, features, featured, badge, desc }) => (
              <div key={name} style={{
                background: "#fff", border: featured ? "2px solid #2563eb" : "1px solid #e5e7eb",
                borderRadius: 18, padding: "40px 28px", position: "relative", display: "flex", flexDirection: "column",
                boxShadow: featured ? "0 8px 32px rgba(37,99,235,0.1)" : "0 1px 4px rgba(0,0,0,0.03)",
                transition: "box-shadow 0.2s",
              }}
                onMouseOver={e => { if (!featured) e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)"; }}
                onMouseOut={e => { if (!featured) e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.03)"; }}>
                {badge && <div style={{ position: "absolute", top: -13, right: 20, background: "#2563eb", color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.04em" }}>{badge}</div>}
                <p style={{ fontSize: 13, fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{name}</p>
                <div style={{ ...h, fontSize: 46, fontWeight: 800, color: "#0f172a", lineHeight: 1, marginBottom: 4 }}>{price}</div>
                <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 18, fontWeight: 500 }}>{period}</p>
                <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.55, marginBottom: 24 }}>{desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32, flex: 1 }}>
                  {features.map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#374151" }}>
                      <Check style={{ width: 15, height: 15, color: "#22c55e", flexShrink: 0, marginTop: 2 }} /> {f}
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate("/submit-your-page")} style={{
                  width: "100%", fontSize: 15, fontWeight: 600, padding: "14px 0", borderRadius: 10, cursor: "pointer",
                  transition: "opacity 0.15s",
                  ...(featured
                    ? { background: "#2563eb", color: "#fff", border: "none", boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }
                    : name === "Competitive"
                    ? { background: "#0f172a", color: "#fff", border: "none" }
                    : { background: "transparent", color: "#2563eb", border: "2px solid #2563eb" }),
                }}
                  onMouseOver={e => e.currentTarget.style.opacity = "0.9"}
                  onMouseOut={e => e.currentTarget.style.opacity = "1"}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 28, fontSize: 14, color: "#9ca3af" }}>Add monthly monitoring for $29/mo &mdash; track your score, competitors, and progress over time.</p>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section style={{ padding: "96px 16px", background: "#f9fafb", borderTop: "1px solid #f1f5f9" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#2563eb", textAlign: "center", marginBottom: 12 }}>What Business Owners Say</p>
          <h2 style={{ ...h, fontSize: "clamp(26px, 3.5vw, 36px)", fontWeight: 800, color: "#0f172a", textAlign: "center", marginBottom: 56, letterSpacing: "-0.02em" }}>Real results from real businesses.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {TESTIMONIALS.map(({ name, biz, text }) => (
              <div key={name} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 32 }}>
                <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} style={{ width: 16, height: 16, fill: "#f59e0b", color: "#f59e0b" }} />)}
                </div>
                <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.65, marginBottom: 20, fontStyle: "italic" }}>"{text}"</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{name}</p>
                <p style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>{biz}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section style={{ padding: "96px 16px", background: "#fff" }}>
        <div style={{ maxWidth: 660, margin: "0 auto" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#2563eb", textAlign: "center", marginBottom: 12 }}>FAQ</p>
          <h2 style={{ ...h, fontSize: 30, fontWeight: 800, color: "#0f172a", textAlign: "center", marginBottom: 44, letterSpacing: "-0.02em" }}>Common questions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQS.map(({ q, a }, i) => (
              <div key={q} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", transition: "box-shadow 0.2s" }}
                onMouseOver={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.03)"}
                onMouseOut={e => e.currentTarget.style.boxShadow = "none"}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", paddingRight: 16 }}>{q}</span>
                  <ChevronRight style={{ width: 16, height: 16, color: "#9ca3af", flexShrink: 0, transition: "transform 0.2s", transform: openFaq === i ? "rotate(90deg)" : "none" }} />
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 22px 18px" }}>
                    <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.65, margin: 0 }}>{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section style={{ background: "#0f172a", padding: "96px 16px", textAlign: "center" }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <h2 style={{ ...h, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: "#fff", marginBottom: 14, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            Find out where you stand.<br /><span style={{ color: "#60a5fa" }}>Right now. Free.</span>
          </h2>
          <p style={{ fontSize: 17, color: "#94a3b8", marginBottom: 36 }}>60 seconds. No account. No credit card.</p>
          <ScanBar value={businessName2} onChange={setBusinessName2} onScan={handleScan} dark scanError={scanError} />
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: "#0f172a", borderTop: "1px solid #1e293b", padding: "28px 16px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart2 style={{ width: 16, height: 16, color: "#2563eb" }} />
            <span style={{ ...h, fontWeight: 700, color: "#fff", fontSize: 14 }}>PageAudit<span style={{ color: "#2563eb" }}>Pro</span></span>
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 12, color: "#64748b" }}>
            <a href="/privacy" style={{ color: "#64748b", textDecoration: "none" }}>Privacy</a>
            <a href="/terms" style={{ color: "#64748b", textDecoration: "none" }}>Terms</a>
          </div>
          <p style={{ fontSize: 12, color: "#4b5563" }}>&copy; 2026 PageAudit Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
