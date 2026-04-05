import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { BarChart2, Download, Share2, Copy, CheckCircle, AlertTriangle, AlertCircle, Search, Globe, MapPin, Star as StarIcon, Loader2, ArrowRight, Shield, Clock, Zap, Facebook } from "lucide-react";

const API_BASE = "https://pageaudit-engine.onrender.com";

const SCORE_COLORS = { excellent: "#10b981", good: "#3b82f6", average: "#f59e0b", needsWork: "#f97316", poor: "#ef4444" };
function scoreColor(s) { if (s >= 85) return SCORE_COLORS.excellent; if (s >= 70) return SCORE_COLORS.good; if (s >= 55) return SCORE_COLORS.average; if (s >= 40) return SCORE_COLORS.needsWork; return SCORE_COLORS.poor; }

const PLATFORM_ICONS = { google: Search, website: Globe, yelp: StarIcon, nap: MapPin, facebook: Facebook };
const PLATFORM_LABELS = { google: "Google Business Profile", website: "Website Performance", yelp: "Yelp", nap: "NAP Consistency", facebook: "Facebook" };

const PLANS = [
  { name: "Monthly Monitor", price: "$49", period: "/mo", features: ["Monthly re-scans", "Score tracking", "Email alerts"], featured: false },
  { name: "Pro Monitor", price: "$79", period: "/mo", features: ["Weekly re-scans", "Competitor tracking", "Review monitoring"], featured: false },
  { name: "Pro + Review Booster", price: "$99", period: "/mo", features: ["Everything in Pro", "Automated review requests", "Reputation dashboard"], featured: true, badge: "Most Popular" },
];

export default function ScanReport() {
  const { auditId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(location.state?.scanData || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(null);
  const [quoteModal, setQuoteModal] = useState(null);
  const [quoteForm, setQuoteForm] = useState({ name: "", email: "", phone: "", bestTime: "" });
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [barsVisible, setBarsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const barsRef = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (data) { setLoading(false); return; }
    if (!auditId) { setError("No audit ID provided."); setLoading(false); return; }
    fetch(`${API_BASE}/api/scan/result/${auditId}`)
      .then(r => { if (!r.ok) throw new Error("Not found"); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [auditId]);

  useEffect(() => {
    if (!data) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setBarsVisible(true); }, { threshold: 0.2 });
    if (barsRef.current) observer.observe(barsRef.current);
    return () => observer.disconnect();
  }, [data]);

  const syne = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

  const handleCopyShare = () => {
    const url = auditId ? `${window.location.origin}/report/scan/${auditId}` : window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <Loader2 style={{ width: 40, height: 40, color: "#3b82f6", animation: "spin 1s linear infinite", margin: "0 auto 16px", display: "block" }} />
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        <p style={{ color: "#94a3b8", fontSize: 15 }}>Loading your scan report...</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <AlertCircle style={{ width: 48, height: 48, color: "#ef4444", margin: "0 auto 16px", display: "block" }} />
        <h2 style={{ ...syne, color: "#fff", fontSize: 24, marginBottom: 8 }}>Report Not Found</h2>
        <p style={{ color: "#94a3b8", fontSize: 15, marginBottom: 24 }}>{error || "We couldn't load this report."}</p>
        <button onClick={() => navigate("/")} style={{ background: "#2563eb", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Go Home</button>
      </div>
    </div>
  );

  const { overallScore, scoreLabel, platforms, allFindings, topPriorities, summary, industryContext, monthlyGoal, dataQuality, businessName, city, state, scannedAt } = data;
  const sc = scoreColor(overallScore || 0);
  const card = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 24 };

  // Group findings by platform
  const findingsByPlatform = {};
  (allFindings || []).forEach(f => {
    const key = f.platform || "Other";
    if (!findingsByPlatform[key]) findingsByPlatform[key] = [];
    findingsByPlatform[key].push(f);
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "'Inter', sans-serif" }}>
      {/* NAV */}
      <nav style={{ background: "rgba(10,15,30,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "14px 24px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BarChart2 style={{ width: 18, height: 18, color: "#3b82f6" }} />
            <span style={{ ...syne, fontWeight: 700, fontSize: 14, color: "#fff" }}>PageAudit Pro</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}><Download style={{ width: 14, height: 14 }} /> PDF</button>
            <button onClick={handleCopyShare} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: copied ? "#10b981" : "#94a3b8", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{copied ? <CheckCircle style={{ width: 14, height: 14 }} /> : <Share2 style={{ width: 14, height: 14 }} />} {copied ? "Copied!" : "Share"}</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* 1. REPORT HEADER */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ ...syne, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: "#fff", marginBottom: 4 }}>{businessName || "Your Business"}</h1>
          <p style={{ color: "#94a3b8", fontSize: 15, marginBottom: 24 }}>{city}{state ? `, ${state}` : ""} {scannedAt ? `— Scanned ${new Date(scannedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}` : ""}</p>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.03)", border: `2px solid ${sc}`, borderRadius: 20, padding: "24px 48px", textAlign: "center" }}>
            <div style={{ ...syne, fontSize: 72, fontWeight: 800, color: sc, lineHeight: 1 }}>{overallScore ?? "--"}<span style={{ fontSize: 28, color: "#64748b" }}>/100</span></div>
            <p style={{ color: sc, fontSize: 16, fontWeight: 700, marginTop: 4 }}>{scoreLabel || "Not Scored"}</p>
          </div>
        </div>

        {/* 2. SCORE OVERVIEW */}
        <div ref={barsRef} style={{ ...card, marginBottom: 32 }}>
          <h2 style={{ ...syne, fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 20 }}>Platform Scores</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {["google", "website", "yelp", "nap", "facebook"].map(key => {
              const p = platforms?.[key];
              const Icon = PLATFORM_ICONS[key] || Globe;
              const label = PLATFORM_LABELS[key] || key;
              const score = p?.score;
              const found = p?.found !== false && score !== null && score !== undefined;
              const conf = p?.confidence || (found ? "medium" : "low");
              const confLabel = conf === "high" ? "Verified" : conf === "medium" ? "Limited" : "Not Found";
              const confColor = conf === "high" ? "#10b981" : conf === "medium" ? "#f59e0b" : "#64748b";
              const barColor = found ? (score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444") : "#374151";
              return (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon style={{ width: 16, height: 16, color: found ? "#94a3b8" : "#4b5563" }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: found ? "#c8d0dc" : "#4b5563" }}>{label}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: `${confColor}15`, color: confColor }}>{confLabel}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: found ? "#fff" : "#4b5563" }}>{found ? `${score}/100` : p?.message || "—"}</span>
                    </div>
                  </div>
                  <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 999, background: barColor, transition: "width 1s ease-out", width: barsVisible && found ? `${score}%` : "0%" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. AI SUMMARY */}
        {summary && (
          <div style={{ ...card, marginBottom: 32 }}>
            <h2 style={{ ...syne, fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 12 }}>What We Found</h2>
            <p style={{ color: "#c8d0dc", fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>{summary}</p>
            {industryContext && <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>{industryContext}</p>}
            {monthlyGoal && (
              <div style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 10, padding: 16 }}>
                <p style={{ color: "#3b82f6", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Your Focus This Month</p>
                <p style={{ color: "#c8d0dc", fontSize: 15, fontWeight: 600 }}>{monthlyGoal}</p>
              </div>
            )}
          </div>
        )}

        {/* 4. TOP PRIORITIES */}
        {topPriorities?.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ ...syne, fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Your Top {topPriorities.length} Priorities</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Fix these first for the biggest impact</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {topPriorities.map((p, i) => {
                const impactColor = p.impact === "high" ? "#ef4444" : p.impact === "medium" ? "#f59e0b" : "#10b981";
                const effortColor = p.effort === "easy" ? "#10b981" : p.effort === "medium" ? "#f59e0b" : "#ef4444";
                return (
                  <div key={i} style={{ ...card, display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${impactColor}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ ...syne, fontSize: 16, fontWeight: 800, color: impactColor }}>{p.priority || i + 1}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                        <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: 0 }}>{p.title}</h3>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: `${impactColor}15`, color: impactColor, textTransform: "uppercase" }}>{p.impact} impact</span>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: `${effortColor}15`, color: effortColor, textTransform: "uppercase" }}>{p.effort} effort</span>
                      </div>
                      <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6 }}>{p.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. ALL FINDINGS */}
        {allFindings?.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ ...syne, fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Complete Findings — {allFindings.length} Issues Found</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Grouped by platform</p>
            {Object.entries(findingsByPlatform).map(([platform, findings]) => (
              <div key={platform} style={{ marginBottom: 24 }}>
                <h3 style={{ color: "#94a3b8", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>{platform}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {findings.map((f, i) => {
                    const sevIcon = f.severity === "critical" ? "🔴" : f.severity === "warning" ? "⚠️" : "✅";
                    const sevBg = f.severity === "critical" ? "rgba(239,68,68,0.1)" : f.severity === "warning" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)";
                    const sevBorder = f.severity === "critical" ? "rgba(239,68,68,0.2)" : f.severity === "warning" ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)";
                    const sevColor = f.severity === "critical" ? "#ef4444" : f.severity === "warning" ? "#f59e0b" : "#10b981";
                    return (
                      <div key={i} style={{ background: sevBg, border: `1px solid ${sevBorder}`, borderRadius: 12, padding: 18 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 14 }}>{sevIcon}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: sevColor, letterSpacing: "0.05em" }}>{f.severity}</span>
                        </div>
                        <h4 style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{f.title}</h4>
                        <p style={{ color: "#c8d0dc", fontSize: 14, lineHeight: 1.6 }}>{f.description}</p>
                        {f.severity !== "good" && f.impact && (
                          <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 8, fontStyle: "italic" }}>{f.impact}</p>
                        )}
                        {f.severity !== "good" && f.fix && (
                          <div style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 8, padding: 12, marginTop: 10 }}>
                            <p style={{ color: "#3b82f6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>How to fix</p>
                            <p style={{ color: "#c8d0dc", fontSize: 13, lineHeight: 1.6 }}>{f.fix}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 6. DATA QUALITY */}
        {dataQuality && (
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: 16, marginBottom: 32, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Shield style={{ width: 14, height: 14, color: "#64748b" }} />
              <span style={{ color: "#64748b", fontSize: 12 }}>Platforms checked: {dataQuality.platformsFound}/{dataQuality.platformsChecked}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Zap style={{ width: 14, height: 14, color: "#64748b" }} />
              <span style={{ color: "#64748b", fontSize: 12 }}>Confidence: {data.confidence}</span>
            </div>
            <span style={{ color: "#4b5563", fontSize: 12 }}>{dataQuality.note}</span>
          </div>
        )}

        {/* 7. AGENCY SERVICES UPSELL */}
        {(() => {
          const gs = platforms?.google?.score; const ws = platforms?.website?.score; const ns = platforms?.nap?.score;
          const rc = platforms?.google?.reviewCount || 0;
          const services = [];
          if (ws != null && ws < 60) services.push({ icon: "🌐", title: "Website Rebuild", desc: `Your website scored ${ws}/100. We'll rebuild it fast, modern, and optimized for Google.`, price: "Starting at $1,500", service: "website_build" });
          if ((gs != null && gs < 70) || rc < 20) services.push({ icon: "📍", title: "Local SEO & Google Maps", desc: `You have ${rc} reviews and your Google score is ${gs || '—'}/100. We'll get you ranking higher within 90 days.`, price: "Starting at $500/mo", service: "local_seo" });
          if (rc < 20) services.push({ icon: "⭐", title: "Review Growth Service", desc: `You have ${rc} Google reviews. Top businesses in your area have 50+. We'll get you there.`, price: "Starting at $299/mo", service: "review_management" });
          if (ns != null && ns < 70) services.push({ icon: "📋", title: "Citation Cleanup", desc: "Your business info is wrong on multiple directories. We'll fix every listing.", price: "One-time $199", service: "citation_cleanup" });
          services.push({ icon: "🚀", title: "Full Service Package", desc: "Let us handle everything. Website, SEO, reviews, social media — done for you monthly.", price: "Custom pricing", service: "full_service_package" });

          return services.length > 1 ? (
            <div style={{ marginBottom: 48 }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <h2 style={{ ...syne, fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Want us to fix this for you?</h2>
                <p style={{ color: "#94a3b8", fontSize: 15 }}>Based on your audit results, our agency team can handle everything.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
                {services.map(s => (
                  <div key={s.service} style={{ background: s.service === "full_service_package" ? "rgba(249,115,22,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${s.service === "full_service_package" ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.08)"}`, borderRadius: 14, padding: 22, display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</span>
                    <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{s.title}</h3>
                    <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.5, marginBottom: 14, flex: 1 }}>{s.desc}</p>
                    <p style={{ color: "#c8d0dc", fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{s.price}</p>
                    <button onClick={() => { setQuoteModal(s.service); setQuoteForm(f => ({ ...f, name: data?.businessName || "", email: "" })); setQuoteSubmitted(false); }}
                      style={{ width: "100%", background: "#f97316", color: "#fff", fontSize: 13, fontWeight: 700, padding: "12px 0", borderRadius: 8, border: "none", cursor: "pointer" }}>
                      {s.service === "full_service_package" ? "Schedule Free Consultation" : "Get Free Quote"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null;
        })()}

        {/* 8. MONITORING UPSELL */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h2 style={{ ...syne, fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Want us to monitor this every month?</h2>
            <p style={{ color: "#94a3b8", fontSize: 15 }}>We'll automatically rescan your business every month and email you an updated report.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            {PLANS.map(({ name, price, period, features, featured, badge }) => (
              <div key={name} style={{ background: featured ? "rgba(37,99,235,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${featured ? "rgba(37,99,235,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 14, padding: 22, position: "relative", display: "flex", flexDirection: "column" }}>
                {badge && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#2563eb", color: "#fff", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "3px 12px", borderRadius: 999 }}>{badge}</div>}
                <p style={{ color: featured ? "#3b82f6" : "#64748b", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{name}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 16 }}>
                  <span style={{ ...syne, fontSize: 28, fontWeight: 800, color: "#fff" }}>{price}</span>
                  <span style={{ fontSize: 13, color: "#64748b" }}>{period}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20, flex: 1 }}>
                  {features.map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: featured ? "#c8d0dc" : "#94a3b8" }}>
                      <CheckCircle style={{ width: 14, height: 14, color: "#3b82f6", flexShrink: 0 }} /> {f}
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate("/submit-your-page", { state: { plan: name } })}
                  style={{ width: "100%", fontSize: 13, fontWeight: 700, color: "#fff", background: featured ? "#f97316" : "transparent", border: featured ? "none" : "1px solid rgba(255,255,255,0.2)", padding: "10px 0", borderRadius: 8, cursor: "pointer" }}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 8. SHARE */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 12 }}>Know another business owner who needs this?</p>
          <button onClick={handleCopyShare}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: copied ? "#10b981" : "#94a3b8", padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {copied ? <CheckCircle style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
            {copied ? "Link Copied!" : "Copy Share Link"}
          </button>
        </div>

        {/* QUOTE MODAL */}
        {quoteModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 28, maxWidth: 400, width: "100%", position: "relative" }}>
              <button onClick={() => setQuoteModal(null)} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 20 }}>x</button>
              {quoteSubmitted ? (
                <div style={{ textAlign: "center", padding: 16 }}>
                  <CheckCircle style={{ width: 40, height: 40, color: "#10b981", margin: "0 auto 12px", display: "block" }} />
                  <h3 style={{ ...syne, fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Request Received!</h3>
                  <p style={{ color: "#94a3b8", fontSize: 13 }}>Someone from The Agency will contact you within 24 hours.</p>
                </div>
              ) : (
                <div>
                  <h3 style={{ ...syne, fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Request a Free Quote</h3>
                  {[
                    { l: "Name", k: "name", p: "Your name" },
                    { l: "Email", k: "email", p: "you@business.com", t: "email" },
                    { l: "Phone", k: "phone", p: "(555) 123-4567", t: "tel" },
                    { l: "Best time to reach you", k: "bestTime", p: "e.g. Mornings" },
                  ].map(({ l, k, p, t }) => (
                    <div key={k} style={{ marginBottom: 10 }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 4 }}>{l}</label>
                      <input type={t || "text"} value={quoteForm[k]} onChange={e => setQuoteForm(f => ({ ...f, [k]: e.target.value }))} placeholder={p}
                        style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 12px", fontSize: 14, color: "#fff", outline: "none", boxSizing: "border-box" }} />
                    </div>
                  ))}
                  <button disabled={quoteSubmitting || !quoteForm.email} onClick={async () => {
                    setQuoteSubmitting(true);
                    try {
                      await fetch(`${API_BASE}/api/service-requests`, { method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: quoteForm.name, email: quoteForm.email, phone: quoteForm.phone, bestTime: quoteForm.bestTime, service: quoteModal, auditId: auditId ? parseInt(auditId) : null, scanScore: overallScore || null, rep_code: localStorage.getItem("pageaudit_rep_code") || null }) });
                      setQuoteSubmitted(true);
                    } catch {} finally { setQuoteSubmitting(false); }
                  }} style={{ width: "100%", background: "#f97316", color: "#fff", fontSize: 15, fontWeight: 700, padding: "14px 0", borderRadius: 8, border: "none", cursor: "pointer", marginTop: 8, opacity: quoteForm.email ? 1 : 0.4 }}>
                    {quoteSubmitting ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart2 style={{ width: 14, height: 14, color: "#3b82f6" }} />
            <span style={{ ...syne, fontWeight: 700, fontSize: 13, color: "#fff" }}>PageAudit Pro</span>
          </div>
          <p style={{ color: "#4b5563", fontSize: 11 }}>&copy; 2026 The Agency LLC</p>
        </div>
      </div>
    </div>
  );
}
