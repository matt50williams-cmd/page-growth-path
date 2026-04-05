import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BarChart2, Search, Check, Star, Shield, Zap, Clock, ChevronRight } from "lucide-react";

const PLATFORMS = ["Google", "Yelp", "Facebook", "Bing", "Apple Maps", "Your Website", "NAP Consistency", "Competitors", "+20 more"];

const STEPS = [
  { num: "01", title: "Enter your business", desc: "Type your business name and city. That's it — no account, no login, no credit card." },
  { num: "02", title: "We scan everything", desc: "Our AI checks Google, Yelp, Facebook, Bing, Apple Maps, your website, and 20+ platforms in 60 seconds." },
  { num: "03", title: "Get your score and plan", desc: "See exactly where you stand, what's broken, and a step-by-step plan to fix it — in plain English." },
];

const SCORE_BARS = [
  { label: "Google Business Profile", score: 88, badge: "Verified", color: "#10b981" },
  { label: "Facebook Presence", score: 52, badge: "Limited", color: "#f59e0b" },
  { label: "Yelp Profile", score: 71, badge: "Verified", color: "#f59e0b" },
  { label: "Website SEO", score: 45, badge: "Verified", color: "#ef4444" },
  { label: "NAP Consistency", score: 63, badge: "Limited", color: "#f59e0b" },
];

const PLANS = [
  { name: "One-Time Audit", price: "$39", period: "one time", features: ["Full online presence scan", "Score across 20+ platforms", "Top issues + action plan", "7-day fix-it roadmap", "Competitor snapshot"], featured: false },
  { name: "Monthly Monitor", price: "$49", period: "/mo", features: ["Everything in One-Time", "Monthly re-scans", "Score tracking over time", "Email alerts for new issues", "Priority support"], featured: false },
  { name: "Pro Monitor", price: "$79", period: "/mo", features: ["Everything in Monthly", "Weekly re-scans", "Competitor tracking", "Review monitoring", "SEO keyword tracking"], featured: false },
  { name: "Pro + Review Booster", price: "$99", period: "/mo", features: ["Everything in Pro", "Automated review requests", "Review response templates", "Google review QR codes", "Reputation dashboard", "Social media scheduler"], featured: true, badge: "Best Value" },
];

const TESTIMONIALS = [
  { name: "Mike R.", biz: "Plumbing Company Owner", text: "I had no idea my Google listing had the wrong phone number. Customers were calling my old number for months. This scan caught it in 30 seconds — would've taken me forever to figure out on my own." },
  { name: "Sarah T.", biz: "Restaurant Owner", text: "We were completely invisible on Apple Maps and Bing. The report showed us exactly what was missing and we fixed it in one afternoon. Already seeing more walk-ins from people who say they found us online." },
  { name: "Dave K.", biz: "Auto Shop Owner", text: "My competitor had half our experience but was outranking us everywhere. The competitor analysis showed me exactly why and the action plan told me what to do about it. Worth every penny." },
];

const FAQS = [
  { q: "Is this really free?", a: "The initial scan is 100% free — no account, no credit card. You'll see your overall score and top issues instantly. The full detailed report with your action plan is available for a one-time $39.99." },
  { q: "How long does the scan take?", a: "About 60 seconds. Our AI checks 20+ platforms simultaneously and generates your score in real time." },
  { q: "What platforms do you check?", a: "Google Business Profile, Yelp, Facebook, Bing Places, Apple Maps, your website SEO, directory listings, NAP consistency, review sites, and competitor positioning." },
  { q: "Do I need a website to use this?", a: "No. We scan your business across all platforms. If you do have a website, we'll include a full SEO analysis as a bonus." },
  { q: "How is this different from free SEO tools?", a: "Free tools check one thing. We check everything — your entire online presence across 20+ platforms — and give you a specific, prioritized plan written for your business." },
];

export default function Home() {
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState("");
  const [businessName2, setBusinessName2] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [scoreVisible, setScoreVisible] = useState(false);
  const scoreRef = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap";
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
    navigate("/submit-your-page", { state: { businessName: (name || "").trim() } });
  };

  const syne = { fontFamily: "'Syne', sans-serif" };
  const dm = { fontFamily: "'DM Sans', sans-serif" };

  return (
    <div className="min-h-screen" style={{ ...dm, background: "#0a0f1e" }}>

      {/* NAVBAR */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(10,15,30,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BarChart2 style={{ width: 20, height: 20, color: "#3b82f6" }} />
            <span style={{ ...syne, fontWeight: 700, fontSize: 15, color: "#fff", letterSpacing: "-0.01em" }}>PageAudit Pro</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => navigate("/login")} style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8", background: "none", border: "none", padding: "8px 16px", cursor: "pointer" }}>Login</button>
            <button onClick={() => navigate("/submit-your-page")} style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: "#2563eb", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer" }}>Scan My Business Free</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: 140, paddingBottom: 80, paddingLeft: 16, paddingRight: 16, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 80, left: "25%", width: 500, height: 500, background: "rgba(37,99,235,0.06)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999, padding: "8px 16px", marginBottom: 32 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>Free scan — no account needed</span>
          </div>
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

          <h1 style={{ ...syne, fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.02em" }}>
            You're an expert at running your business.{" "}
            <span style={{ background: "linear-gradient(90deg, #3b82f6, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>We make sure the internet knows it.</span>
          </h1>

          <p style={{ color: "#94a3b8", fontSize: "clamp(16px, 2vw, 20px)", lineHeight: 1.6, marginBottom: 40, maxWidth: 640, marginLeft: "auto", marginRight: "auto" }}>
            Find out exactly how your business looks online — before your customers do. We scan Google, Yelp, Facebook, Bing, and 20+ platforms and give you a real score, real problems, and a real plan. In 60 seconds.
          </p>

          {/* Scan Box */}
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 8 }}>
              <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
                <Search style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", width: 18, height: 18, color: "#64748b" }} />
                <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleScan(businessName)} placeholder="e.g. Joe's Plumbing Dallas TX"
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 15, padding: "16px 16px 16px 48px", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, outline: "none", boxSizing: "border-box" }} />
              </div>
              <button onClick={() => handleScan(businessName)}
                style={{ background: "#2563eb", color: "#fff", fontWeight: 600, fontSize: 15, padding: "16px 32px", borderRadius: 12, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                Scan Free <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap", marginTop: 16, color: "#64748b", fontSize: 13 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Shield style={{ width: 14, height: 14 }} /> No account needed</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Zap style={{ width: 14, height: 14 }} /> No credit card</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock style={{ width: 14, height: 14 }} /> Results in 60 seconds</span>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORMS BAR */}
      <section style={{ padding: "48px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "#64748b", marginBottom: 20 }}>We check everywhere your customers look</p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
            {PLATFORMS.map(p => (
              <span key={p} style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", padding: "8px 16px", borderRadius: 999 }}>{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* PAIN SECTION */}
      <section style={{ padding: "80px 16px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ ...syne, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: "#fff", marginBottom: 24, lineHeight: 1.15 }}>Right now, someone is googling your business.</h2>
          <div style={{ color: "#94a3b8", fontSize: 17, lineHeight: 1.7, textAlign: "center" }}>
            <p style={{ marginBottom: 20 }}>They're checking your hours. Reading your reviews. Comparing you to the business that showed up first. And if your Google listing has the wrong phone number, your Yelp page has one review from 2019, or your Facebook page looks abandoned — <span style={{ color: "#fff", fontWeight: 600 }}>they're choosing someone else.</span></p>
            <p style={{ marginBottom: 20 }}>The worst part? You have no idea it's happening. Your website might be invisible to Google. Your business might not even show up on Apple Maps. A competitor with half your experience could be outranking you everywhere.</p>
            <p style={{ color: "#fff", fontWeight: 600, fontSize: 19 }}>You can't fix what you can't see. That's why we built this.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "80px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "#3b82f6", textAlign: "center", marginBottom: 12 }}>How it works</p>
          <h2 style={{ ...syne, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: "#fff", textAlign: "center", marginBottom: 56 }}>Three steps. Sixty seconds. Full picture.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28 }}>
                <span style={{ ...syne, fontSize: 40, fontWeight: 800, color: "rgba(37,99,235,0.2)", display: "block", marginBottom: 16 }}>{num}</span>
                <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{title}</h3>
                <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCORE PREVIEW */}
      <section ref={scoreRef} style={{ padding: "80px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 48, alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "#3b82f6", marginBottom: 12 }}>Your online health report</p>
            <h2 style={{ ...syne, fontSize: "clamp(28px, 3.5vw, 38px)", fontWeight: 800, color: "#fff", marginBottom: 20, lineHeight: 1.15 }}>See exactly where you stand — and what to fix first.</h2>
            <p style={{ color: "#94a3b8", fontSize: 17, lineHeight: 1.7, marginBottom: 24 }}>Your scan gives you a score across every platform that matters. No jargon, no fluff — just a clear picture of what's working, what's broken, and the exact steps to fix it.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["Overall score across 20+ platforms", "Top 3 issues ranked by impact", "Step-by-step fix-it plan in plain English", "Competitor comparison in your area"].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(37,99,235,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check style={{ width: 12, height: 12, color: "#3b82f6" }} />
                  </div>
                  <span style={{ color: "#c8d0dc", fontSize: 14 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24, position: "relative" }}>
            <div style={{ position: "absolute", top: -12, right: -12, background: "#2563eb", color: "#fff", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 12px", borderRadius: 999 }}>Sample</div>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <p style={{ color: "#64748b", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 8 }}>Overall Online Score</p>
              <div style={{ ...syne, fontSize: 64, fontWeight: 800, color: "#fff", lineHeight: 1 }}>61<span style={{ fontSize: 24, color: "#64748b" }}>/100</span></div>
              <p style={{ color: "#f59e0b", fontSize: 14, fontWeight: 600, marginTop: 4 }}>Needs Improvement</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {SCORE_BARS.map(({ label, score, badge, color }) => (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ color: "#94a3b8", fontSize: 13 }}>{label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: badge === "Verified" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: badge === "Verified" ? "#10b981" : "#f59e0b" }}>{badge}</span>
                      <span style={{ fontWeight: 700, fontSize: 13, color }}>{score}/100</span>
                    </div>
                  </div>
                  <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 999, background: color, transition: "width 1s ease-out", width: scoreVisible ? `${score}%` : "0%" }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
              <p style={{ color: "#64748b", fontSize: 12 }}>Based on a scan of <span style={{ color: "#fff", fontWeight: 600 }}>24 platforms</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "80px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "#3b82f6", textAlign: "center", marginBottom: 12 }}>Simple pricing</p>
          <h2 style={{ ...syne, fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 800, color: "#fff", textAlign: "center", marginBottom: 48 }}>Scan free. Upgrade when you're ready.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {PLANS.map(({ name, price, period, features, featured, badge }) => (
              <div key={name} style={{ background: featured ? "rgba(37,99,235,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${featured ? "rgba(37,99,235,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 16, padding: 24, position: "relative", display: "flex", flexDirection: "column" }}>
                {badge && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#2563eb", color: "#fff", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 14px", borderRadius: 999 }}>{badge}</div>}
                <p style={{ color: featured ? "#3b82f6" : "#64748b", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{name}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 20 }}>
                  <span style={{ ...syne, fontSize: 32, fontWeight: 800, color: "#fff" }}>{price}</span>
                  <span style={{ fontSize: 14, color: "#64748b" }}>{period}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24, flex: 1 }}>
                  {features.map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: featured ? "#c8d0dc" : "#94a3b8" }}>
                      <Check style={{ width: 14, height: 14, color: "#3b82f6", flexShrink: 0 }} /> {f}
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate("/submit-your-page")}
                  style={{ width: "100%", fontSize: 13, fontWeight: 600, color: "#fff", background: featured ? "#2563eb" : "transparent", border: featured ? "none" : "1px solid rgba(255,255,255,0.2)", padding: "12px 0", borderRadius: 8, cursor: "pointer" }}>
                  {featured ? "Get Started" : "Choose Plan"}
                </button>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", color: "#64748b", fontSize: 13, marginTop: 24 }}>Competitors like Birdeye charge $299–599/month for less.</p>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "80px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "#3b82f6", textAlign: "center", marginBottom: 12 }}>What business owners say</p>
          <h2 style={{ ...syne, fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 800, color: "#fff", textAlign: "center", marginBottom: 48 }}>Real results from real businesses.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {TESTIMONIALS.map(({ name, biz, text }) => (
              <div key={name} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
                <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} style={{ width: 16, height: 16, fill: "#f59e0b", color: "#f59e0b" }} />)}
                </div>
                <p style={{ color: "#c8d0dc", fontSize: 14, lineHeight: 1.65, marginBottom: 20 }}>"{text}"</p>
                <div>
                  <p style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{name}</p>
                  <p style={{ color: "#64748b", fontSize: 12 }}>{biz}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "80px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "#3b82f6", textAlign: "center", marginBottom: 12 }}>FAQ</p>
          <h2 style={{ ...syne, fontSize: 30, fontWeight: 800, color: "#fff", textAlign: "center", marginBottom: 40 }}>Common questions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FAQS.map(({ q, a }, i) => (
              <div key={q} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", paddingRight: 16 }}>{q}</span>
                  <ChevronRight style={{ width: 16, height: 16, color: "#64748b", flexShrink: 0, transition: "transform 0.2s", transform: openFaq === i ? "rotate(90deg)" : "none" }} />
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 20px 16px" }}>
                    <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6 }}>{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "80px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ ...syne, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: "#fff", marginBottom: 20, lineHeight: 1.15 }}>
            Find out where you stand.
            <br />
            <span style={{ background: "linear-gradient(90deg, #3b82f6, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Right now. Free.</span>
          </h2>
          <p style={{ color: "#94a3b8", fontSize: 17, marginBottom: 32 }}>Free scan. 60 seconds. No account needed.</p>
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 8 }}>
              <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
                <Search style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", width: 18, height: 18, color: "#64748b" }} />
                <input type="text" value={businessName2} onChange={e => setBusinessName2(e.target.value)} onKeyDown={e => e.key === "Enter" && handleScan(businessName2)} placeholder="Your business name + city"
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 15, padding: "16px 16px 16px 48px", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, outline: "none", boxSizing: "border-box" }} />
              </div>
              <button onClick={() => handleScan(businessName2)}
                style={{ background: "#2563eb", color: "#fff", fontWeight: 600, fontSize: 15, padding: "16px 32px", borderRadius: 12, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                Scan Free <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap", marginTop: 16, color: "#64748b", fontSize: 13 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Shield style={{ width: 14, height: 14 }} /> No account needed</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Zap style={{ width: 14, height: 14 }} /> No credit card</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock style={{ width: 14, height: 14 }} /> Results in 60 seconds</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "32px 16px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart2 style={{ width: 16, height: 16, color: "#3b82f6" }} />
            <span style={{ ...syne, fontWeight: 700, color: "#fff", fontSize: 14 }}>PageAudit Pro</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 12, color: "#64748b" }}>
            <a href="/privacy" style={{ color: "#64748b", textDecoration: "none" }}>Privacy</a>
            <a href="/terms" style={{ color: "#64748b", textDecoration: "none" }}>Terms</a>
            <a href="mailto:support@pageauditpros.com" style={{ color: "#64748b", textDecoration: "none" }}>Support</a>
          </div>
          <p style={{ fontSize: 12, color: "#64748b" }}>&copy; 2026 The Agency LLC</p>
        </div>
      </footer>
    </div>
  );
}
