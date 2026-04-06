import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { BarChart2, Download, Share2, Copy, CheckCircle, AlertCircle, Search, Globe, MapPin, Star as StarIcon, Loader2, Shield, Zap, Facebook } from "lucide-react";

const API_BASE = "https://pageaudit-engine.onrender.com";

function scoreColor(s) { if (s >= 70) return "#10b981"; if (s >= 45) return "#f59e0b"; return "#ef4444"; }

const PLATFORM_ICONS = { google: Search, website: Globe, yelp: StarIcon, nap: MapPin, facebook: Facebook, bing: Globe, bbb: Shield };
const PLATFORM_LABELS = { google: "Google Business Profile", website: "Website", yelp: "Yelp", nap: "NAP Consistency", facebook: "Facebook", bing: "Bing Places", bbb: "BBB" };
const PLATFORM_MAX = { google: 30, website: 25, facebook: 15, yelp: 15, bing: 5, bbb: 5, nap: 5 };

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

  useEffect(() => { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap"; document.head.appendChild(l); return () => { document.head.removeChild(l); }; }, []);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (data) { setLoading(false); return; }
    if (!auditId) { setError("No audit ID provided."); setLoading(false); return; }
    const loadData = async () => {
      try { const r = await fetch(`${API_BASE}/api/scan/result/${auditId}`); if (r.ok) { const d = await r.json(); if (d && !d.error) { setData(d); setLoading(false); return; } } } catch {}
      await new Promise(r => setTimeout(r, 3000));
      try { const r = await fetch(`${API_BASE}/api/scan/result/${auditId}`); if (r.ok) { const d = await r.json(); if (d && !d.error) { setData(d); setLoading(false); return; } } } catch {}
      try { const r = await fetch(`${API_BASE}/api/audits/${auditId}`); if (r.ok) { const a = await r.json(); if (a?.report_text) { window.location.href = `/report/${auditId}`; return; } } } catch {}
      setError("Report not found. It may still be generating — check your dashboard in a minute."); setLoading(false);
    };
    loadData();
  }, [auditId]);

  useEffect(() => { if (!data) return; const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setBarsVisible(true); }, { threshold: 0.2 }); if (barsRef.current) obs.observe(barsRef.current); return () => obs.disconnect(); }, [data]);

  const H = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
  const handleCopyShare = () => { const url = auditId ? `${window.location.origin}/report/scan/${auditId}` : window.location.href; navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (loading) return (<div style={{ minHeight: "100vh", background: "#0a0f1e", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ textAlign: "center" }}><Loader2 style={{ width: 40, height: 40, color: "#3b82f6", animation: "spin 1s linear infinite", margin: "0 auto 16px", display: "block" }} /><style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style><p style={{ color: "#94a3b8", fontSize: 15 }}>Loading your scan report...</p></div></div>);

  if (error || !data) return (<div style={{ minHeight: "100vh", background: "#0a0f1e", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}><div style={{ textAlign: "center" }}><AlertCircle style={{ width: 48, height: 48, color: "#ef4444", margin: "0 auto 16px", display: "block" }} /><h2 style={{ ...H, color: "#fff", fontSize: 24, marginBottom: 8 }}>Report Not Found</h2><p style={{ color: "#94a3b8", fontSize: 15, marginBottom: 24 }}>{error || "We couldn't load this report."}</p><button onClick={() => navigate("/")} style={{ background: "#f97316", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Go Home</button></div></div>);

  const { overallScore, scoreLabel, platforms, allFindings, topPriorities, summary, industryContext, monthlyGoal, dataQuality, businessName, city, state, scannedAt, competitors, revenueImpact } = data;
  const sc = scoreColor(overallScore || 0);
  const W = { background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.15)" };
  const critical = (allFindings || []).filter(f => f.severity === "critical");
  const warnings = (allFindings || []).filter(f => f.severity === "warning");
  const goods = (allFindings || []).filter(f => f.severity === "good");
  const platformKeys = ["google", "website", "facebook", "yelp", "bing", "bbb", "nap"];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "'Inter', sans-serif" }}>
      {/* NAV */}
      <nav style={{ background: "rgba(10,15,30,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "14px 24px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}><BarChart2 style={{ width: 18, height: 18, color: "#3b82f6" }} /><span style={{ ...H, fontWeight: 700, fontSize: 14, color: "#fff" }}>PageAudit Pro</span></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", border: "none", color: "#94a3b8", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}><Download style={{ width: 14, height: 14 }} /> PDF</button>
            <button onClick={handleCopyShare} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", border: "none", color: copied ? "#10b981" : "#94a3b8", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{copied ? <CheckCircle style={{ width: 14, height: 14 }} /> : <Share2 style={{ width: 14, height: 14 }} />} {copied ? "Copied!" : "Share"}</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* ═══ 1. HEADER ═══ */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "#64748b", marginBottom: 8 }}>Online Presence Audit</p>
          <h1 style={{ ...H, fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, color: "#fff", marginBottom: 4 }}>{businessName || "Your Business"}</h1>
          <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 28 }}>{city}{state ? `, ${state}` : ""}{scannedAt ? ` — ${new Date(scannedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}` : ""}</p>
          {/* Score circle */}
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 140, height: 140, borderRadius: "50%", border: `5px solid ${sc}`, background: "rgba(255,255,255,0.03)" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ ...H, fontSize: 48, fontWeight: 800, color: sc, lineHeight: 1 }}>{overallScore ?? "--"}</div>
              <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>/100</div>
            </div>
          </div>
          <p style={{ color: sc, fontSize: 16, fontWeight: 700, marginTop: 10 }}>{scoreLabel || "Not Scored"}</p>
        </div>

        {/* ═══ 2. PLATFORM SCORES GRID ═══ */}
        <div ref={barsRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 32 }}>
          {platformKeys.map(key => {
            const p = platforms?.[key];
            const Icon = PLATFORM_ICONS[key] || Globe;
            const label = PLATFORM_LABELS[key] || key;
            const raw = p?.rawScore || 0;
            const max = PLATFORM_MAX[key] || 100;
            const pct = max > 0 ? Math.round((raw / max) * 100) : 0;
            const found = p?.found !== false && raw > 0;
            const barColor = pct >= 70 ? "#10b981" : pct >= 45 ? "#f59e0b" : "#ef4444";
            const borderLeft = found ? `4px solid ${barColor}` : "4px solid #d1d5db";
            const topFinding = (allFindings || []).find(f => f.platform === label || f.platform === (PLATFORM_LABELS[key] || key));
            return (
              <div key={key} style={{ ...W, padding: 18, borderLeft, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon style={{ width: 16, height: 16, color: found ? barColor : "#9ca3af" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{label}</span>
                </div>
                <div style={{ ...H, fontSize: 28, fontWeight: 800, color: found ? barColor : "#d1d5db" }}>{raw}<span style={{ fontSize: 14, color: "#9ca3af", fontWeight: 500 }}>/{max}</span></div>
                <div style={{ height: 5, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 99, background: barColor, transition: "width 1s ease-out", width: barsVisible ? `${pct}%` : "0%" }} />
                </div>
                {topFinding && <p style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.4 }}>{topFinding.title}</p>}
              </div>
            );
          })}
        </div>

        {/* ═══ 3. WHAT WE FOUND ═══ */}
        {summary && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ ...H, fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 12 }}>What We Found</h2>
            <div style={{ ...W, padding: 24 }}>
              <p style={{ color: "#374151", fontSize: 15, lineHeight: 1.7, marginBottom: industryContext ? 12 : 0 }}>{summary}</p>
              {industryContext && <p style={{ color: "#6b7280", fontSize: 13 }}>{industryContext}</p>}
              {revenueImpact && <div style={{ marginTop: 14, padding: 14, background: "#fef3c7", borderRadius: 10 }}><p style={{ color: "#92400e", fontSize: 13, fontWeight: 600 }}>{"💰 Revenue Impact: "}{revenueImpact}</p></div>}
            </div>
            {monthlyGoal && (
              <div style={{ ...W, padding: 18, marginTop: 12, borderLeft: "4px solid #3b82f6" }}>
                <p style={{ color: "#3b82f6", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Your Focus This Month</p>
                <p style={{ color: "#111827", fontSize: 15, fontWeight: 600 }}>{monthlyGoal}</p>
              </div>
            )}
          </div>
        )}

        {/* ═══ 4. TOP 3 PRIORITIES ═══ */}
        {topPriorities?.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ ...H, fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Your Top {topPriorities.length} Priorities</h2>
            <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 16 }}>Fix these first for the biggest impact</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {topPriorities.map((p, i) => (
                <div key={i} style={{ ...W, padding: 20, display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ ...H, fontSize: 18, fontWeight: 800, color: "#fff" }}>{p.priority || i + 1}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                      <h3 style={{ color: "#111827", fontSize: 15, fontWeight: 700, margin: 0 }}>{p.title}</h3>
                      {p.impact && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: p.impact === "high" ? "#fef2f2" : "#fefce8", color: p.impact === "high" ? "#dc2626" : "#ca8a04", textTransform: "uppercase" }}>{p.impact} impact</span>}
                    </div>
                    <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.6 }}>{p.description}</p>
                  </div>
                  <button onClick={() => { setQuoteModal(p.title); setQuoteForm(f => ({ ...f, name: businessName || "" })); setQuoteSubmitted(false); }}
                    style={{ background: "#f97316", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}>Get Help</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ 5. COMPETITOR COMPARISON ═══ */}
        {competitors?.competitors?.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ ...H, fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Competitor Comparison</h2>
            <div style={{ ...W, padding: 20 }}>
              {competitors.ranking && <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: competitors.ranking <= 2 ? "#10b981" : "#ef4444" }}>You rank #{competitors.ranking} of {competitors.totalInArea} businesses in your area</p>}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  <th style={{ textAlign: "left", padding: "8px 0", color: "#6b7280", fontWeight: 600 }}>Business</th>
                  <th style={{ textAlign: "center", padding: "8px 0", color: "#6b7280", fontWeight: 600 }}>Rating</th>
                  <th style={{ textAlign: "center", padding: "8px 0", color: "#6b7280", fontWeight: 600 }}>Reviews</th>
                </tr></thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#f0fdf4" }}>
                    <td style={{ padding: "10px 0", fontWeight: 700, color: "#111827" }}>{businessName} (You)</td>
                    <td style={{ textAlign: "center", fontWeight: 700, color: "#10b981" }}>{platforms?.google?.rating || "—"}</td>
                    <td style={{ textAlign: "center", fontWeight: 700, color: "#10b981" }}>{platforms?.google?.reviewCount || "—"}</td>
                  </tr>
                  {competitors.competitors.map((c, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "10px 0", color: "#374151" }}>{c.name}</td>
                      <td style={{ textAlign: "center", color: "#6b7280" }}>{c.rating}</td>
                      <td style={{ textAlign: "center", color: "#6b7280" }}>{c.reviewCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ 6. COMPLETE FINDINGS ═══ */}
        {(allFindings || []).length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ ...H, fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Complete Findings — {allFindings.length} Items</h2>

            {/* CRITICAL */}
            {critical.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ color: "#ef4444", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{"🔴 "}{critical.length} Critical Issue{critical.length > 1 ? "s" : ""}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {critical.map((f, i) => (
                    <div key={i} style={{ ...W, padding: 18, borderLeft: "4px solid #ef4444" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><span style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", textTransform: "uppercase" }}>{f.platform}</span></div>
                      <h4 style={{ color: "#111827", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{f.title}</h4>
                      <p style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.6 }}>{f.description}</p>
                      {f.impact && <p style={{ color: "#991b1b", fontSize: 12, marginTop: 8, fontStyle: "italic" }}>{f.impact}</p>}
                      {f.fix && <div style={{ marginTop: 10, padding: 12, background: "#eff6ff", borderRadius: 8 }}><p style={{ color: "#1e40af", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>How to fix</p><p style={{ color: "#374151", fontSize: 13, lineHeight: 1.6 }}>{f.fix}</p></div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WARNINGS */}
            {warnings.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ color: "#f59e0b", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{"⚠️ "}{warnings.length} Warning{warnings.length > 1 ? "s" : ""}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {warnings.map((f, i) => (
                    <div key={i} style={{ ...W, padding: 18, borderLeft: "4px solid #f59e0b" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><span style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase" }}>{f.platform}</span></div>
                      <h4 style={{ color: "#111827", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{f.title}</h4>
                      <p style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.6 }}>{f.description}</p>
                      {f.fix && <div style={{ marginTop: 10, padding: 12, background: "#eff6ff", borderRadius: 8 }}><p style={{ color: "#1e40af", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>How to fix</p><p style={{ color: "#374151", fontSize: 13, lineHeight: 1.6 }}>{f.fix}</p></div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GOOD */}
            {goods.length > 0 && (
              <div>
                <p style={{ color: "#10b981", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{"✅ "}{goods.length} Looking Good</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {goods.map((f, i) => (
                    <div key={i} style={{ ...W, padding: 14, borderLeft: "4px solid #10b981", display: "flex", alignItems: "center", gap: 10 }}>
                      <CheckCircle style={{ width: 18, height: 18, color: "#10b981", flexShrink: 0 }} />
                      <div><span style={{ fontSize: 10, fontWeight: 700, color: "#10b981", textTransform: "uppercase" }}>{f.platform} — </span><span style={{ color: "#111827", fontSize: 14, fontWeight: 600 }}>{f.title}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ 7. DATA QUALITY ═══ */}
        {dataQuality && (
          <div style={{ ...W, padding: 14, marginBottom: 32, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ color: "#6b7280", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}><Shield style={{ width: 14, height: 14 }} /> Platforms: {dataQuality.platformsFound}/{dataQuality.platformsChecked}</span>
            <span style={{ color: "#6b7280", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}><Zap style={{ width: 14, height: 14 }} /> Confidence: {data.confidence}</span>
            <span style={{ color: "#9ca3af", fontSize: 12 }}>{dataQuality.note}</span>
          </div>
        )}

        {/* ═══ 8. AGENCY SERVICES ═══ */}
        {(() => {
          const gs = platforms?.google?.rawScore; const ws = platforms?.website?.rawScore; const ns = platforms?.nap?.rawScore;
          const rc = platforms?.google?.reviewCount || 0;
          const services = [];
          if (ws != null && ws < 15) services.push({ icon: "🌐", title: "Website Rebuild", desc: `Your website scored ${ws}/25. We'll rebuild it fast, modern, and optimized.`, price: "Starting at $1,500", service: "website_build" });
          if ((gs != null && gs < 20) || rc < 20) services.push({ icon: "📍", title: "Local SEO & Google Maps", desc: `You have ${rc} reviews. We'll get you ranking higher within 90 days.`, price: "Starting at $500/mo", service: "local_seo" });
          if (rc < 20) services.push({ icon: "⭐", title: "Review Growth", desc: `You have ${rc} reviews. Top businesses have 50+. We'll get you there.`, price: "Starting at $299/mo", service: "review_management" });
          if (ns != null && ns < 3) services.push({ icon: "📋", title: "Citation Cleanup", desc: "Your info is wrong on directories. We'll fix every listing.", price: "One-time $199", service: "citation_cleanup" });
          services.push({ icon: "🚀", title: "Full Service Package", desc: "Website, SEO, reviews, social — done for you monthly.", price: "Custom pricing", service: "full_service_package" });

          return services.length > 1 ? (
            <div style={{ marginBottom: 40 }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <h2 style={{ ...H, fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Want us to fix this for you?</h2>
                <p style={{ color: "#94a3b8", fontSize: 14 }}>Our agency team handles everything. You focus on your business.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                {services.map(s => (
                  <div key={s.service} style={{ ...W, padding: 20, borderTop: s.service === "full_service_package" ? "4px solid #f97316" : "none", display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</span>
                    <h3 style={{ color: "#111827", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{s.title}</h3>
                    <p style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.5, marginBottom: 12, flex: 1 }}>{s.desc}</p>
                    <p style={{ color: "#111827", fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{s.price}</p>
                    <button onClick={() => { setQuoteModal(s.service); setQuoteForm(f => ({ ...f, name: businessName || "" })); setQuoteSubmitted(false); }}
                      style={{ width: "100%", background: "#f97316", color: "#fff", fontSize: 13, fontWeight: 700, padding: "10px 0", borderRadius: 8, border: "none", cursor: "pointer" }}>
                      {s.service === "full_service_package" ? "Schedule Consultation" : "Get Free Quote"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null;
        })()}

        {/* ═══ 9. MONITORING UPSELL ═══ */}
        <div style={{ marginBottom: 40, padding: 28, border: "2px solid rgba(249,115,22,0.3)", borderRadius: 16, background: "rgba(249,115,22,0.04)" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h2 style={{ ...H, fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Want us to monitor this every month?</h2>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>We'll rescan your business monthly and email you an updated report.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {PLANS.map(({ name, price, period, features, featured, badge }) => (
              <div key={name} style={{ ...W, padding: 20, borderTop: featured ? "4px solid #f97316" : "none", position: "relative", display: "flex", flexDirection: "column" }}>
                {badge && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#f97316", color: "#fff", fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "3px 10px", borderRadius: 99 }}>{badge}</div>}
                <p style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{name}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 14 }}>
                  <span style={{ ...H, fontSize: 26, fontWeight: 800, color: "#111827" }}>{price}</span>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>{period}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16, flex: 1 }}>
                  {features.map(f => (<div key={f} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280" }}><CheckCircle style={{ width: 14, height: 14, color: "#10b981", flexShrink: 0 }} /> {f}</div>))}
                </div>
                <button onClick={() => navigate("/submit-your-page", { state: { plan: name } })}
                  style={{ width: "100%", fontSize: 13, fontWeight: 700, color: "#fff", background: featured ? "#f97316" : "#111827", border: "none", padding: "10px 0", borderRadius: 8, cursor: "pointer" }}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SHARE */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 10 }}>Know another business owner who needs this?</p>
          <button onClick={handleCopyShare} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", border: "none", color: copied ? "#10b981" : "#94a3b8", padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {copied ? <CheckCircle style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />} {copied ? "Link Copied!" : "Copy Share Link"}
          </button>
        </div>

        {/* QUOTE MODAL */}
        {quoteModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ ...W, padding: 28, maxWidth: 400, width: "100%", position: "relative" }}>
              <button onClick={() => setQuoteModal(null)} style={{ position: "absolute", top: 12, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 22 }}>x</button>
              {quoteSubmitted ? (
                <div style={{ textAlign: "center", padding: 16 }}><CheckCircle style={{ width: 40, height: 40, color: "#10b981", margin: "0 auto 12px", display: "block" }} /><h3 style={{ ...H, fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Request Received!</h3><p style={{ color: "#6b7280", fontSize: 13 }}>We'll contact you within 24 hours.</p></div>
              ) : (
                <div>
                  <h3 style={{ ...H, fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Request a Free Quote</h3>
                  {[{ l: "Name", k: "name", p: "Your name" }, { l: "Email", k: "email", p: "you@business.com", t: "email" }, { l: "Phone", k: "phone", p: "(555) 123-4567", t: "tel" }, { l: "Best time", k: "bestTime", p: "e.g. Mornings" }].map(({ l, k, p, t }) => (
                    <div key={k} style={{ marginBottom: 10 }}><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 3 }}>{l}</label><input type={t || "text"} value={quoteForm[k]} onChange={e => setQuoteForm(f => ({ ...f, [k]: e.target.value }))} placeholder={p} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 12px", fontSize: 14, color: "#111827", outline: "none", boxSizing: "border-box" }} /></div>
                  ))}
                  <button disabled={quoteSubmitting || !quoteForm.email} onClick={async () => {
                    setQuoteSubmitting(true);
                    try { await fetch(`${API_BASE}/api/service-requests`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: quoteForm.name, email: quoteForm.email, phone: quoteForm.phone, bestTime: quoteForm.bestTime, service: quoteModal, auditId: auditId ? parseInt(auditId) : null, scanScore: overallScore || null }) }); setQuoteSubmitted(true); } catch {} finally { setQuoteSubmitting(false); }
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
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><BarChart2 style={{ width: 14, height: 14, color: "#3b82f6" }} /><span style={{ ...H, fontWeight: 700, fontSize: 13, color: "#fff" }}>PageAudit Pro</span></div>
          <p style={{ color: "#4b5563", fontSize: 11 }}>&copy; 2026 The Agency LLC</p>
        </div>
      </div>
    </div>
  );
}
