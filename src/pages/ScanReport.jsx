import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { BarChart2, Download, Share2, Copy, CheckCircle, AlertCircle, Search, Globe, Star as StarIcon, Loader2, Shield, Zap, ExternalLink, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Plus } from "lucide-react";

const API_BASE = "https://pageaudit-engine.onrender.com";

function scoreColor(s) { if (s >= 70) return "#10b981"; if (s >= 45) return "#f59e0b"; return "#ef4444"; }

// Score card icons are defined inline in scoreCards array

const PLANS = [
  { name: "Monthly Monitor", price: "$49", period: "/mo", features: ["Monthly re-scans", "Score tracking", "Email alerts"], featured: false },
  { name: "Pro Monitor", price: "$79", period: "/mo", features: ["Weekly re-scans", "Competitor tracking", "Review monitoring"], featured: false },
  { name: "Pro + Review Booster", price: "$99", period: "/mo", features: ["Everything in Pro", "Automated review requests", "Reputation dashboard"], featured: true, badge: "Most Popular" },
];

function SnapshotCard({ platform, url, snapshot }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden", transition: "box-shadow 0.2s" }}
      onMouseOver={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"}
      onMouseOut={e => e.currentTarget.style.boxShadow = "none"}>
      <div style={{ height: 180, background: "#f3f4f6", position: "relative", overflow: "hidden" }}>
        {snapshot ? (
          <img src={snapshot} alt={`${platform} screenshot`} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af", fontSize: 13, fontWeight: 500 }}>Snapshot not available</div>
        )}
      </div>
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{platform}</span>
          {url && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "#ecfdf5", color: "#059669", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              <CheckCircle style={{ width: 10, height: 10 }} /> Verified
            </span>
          )}
        </div>
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, color: "#2563eb", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
            Visit <ExternalLink style={{ width: 12, height: 12 }} />
          </a>
        )}
      </div>
    </div>
  );
}

function FindingCard({ f, snapshot }) {
  const borderColor = f.severity === "critical" ? "#ef4444" : f.severity === "warning" ? "#f59e0b" : "#10b981";
  const sevLabel = f.severity === "critical" ? "Critical" : f.severity === "warning" ? "Warning" : "Good";
  const sevBg = f.severity === "critical" ? "#fef2f2" : f.severity === "warning" ? "#fffbeb" : "#ecfdf5";
  const sevColor = f.severity === "critical" ? "#dc2626" : f.severity === "warning" ? "#d97706" : "#059669";

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, borderLeft: `4px solid ${borderColor}`, overflow: "hidden" }}>
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: sevColor, background: sevBg, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" }}>{sevLabel}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>{f.platform}</span>
        </div>
        <h4 style={{ color: "#0f172a", fontSize: 15, fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>{f.title}</h4>
        {f.description && <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.65, marginBottom: 8 }}>{f.description}</p>}

        {snapshot && (
          <div style={{ margin: "12px 0", borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb", maxHeight: 120 }}>
            <img src={snapshot} alt="Page screenshot" style={{ width: "100%", height: 120, objectFit: "cover", objectPosition: "top", display: "block" }} />
          </div>
        )}

        {f.impact && <p style={{ color: "#991b1b", fontSize: 13, fontStyle: "italic", marginBottom: 8 }}>{f.impact}</p>}
        {f.estimatedLoss && <p style={{ color: "#92400e", fontSize: 12, fontWeight: 600, background: "#fef3c7", padding: "8px 12px", borderRadius: 8, marginBottom: 8 }}>{f.estimatedLoss}</p>}
        {f.fix && (
          <div style={{ padding: 14, background: "#eff6ff", borderRadius: 10, marginTop: 8 }}>
            <p style={{ color: "#1e40af", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>How to fix</p>
            <p style={{ color: "#1e3a5f", fontSize: 13, lineHeight: 1.6 }}>{f.fix}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ThreatBadge({ level }) {
  const colors = { high: { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" }, medium: { bg: "#fffbeb", text: "#d97706", border: "#fde68a" }, low: { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" } };
  const c = colors[level?.toLowerCase()] || colors.low;
  return <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.04em" }}>{level || "Unknown"}</span>;
}

function UrgencyBadge({ level }) {
  const colors = { high: { bg: "#fef2f2", text: "#dc2626" }, medium: { bg: "#fffbeb", text: "#d97706" }, low: { bg: "#f0fdf4", text: "#16a34a" } };
  const c = colors[level?.toLowerCase()] || colors.medium;
  return <span style={{ background: c.bg, color: c.text, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100, textTransform: "uppercase" }}>{level}</span>;
}

function FrequencyBadge({ freq }) {
  const colors = { high: "#2563eb", medium: "#7c3aed", low: "#6b7280" };
  return <span style={{ background: `${colors[freq?.toLowerCase()] || "#6b7280"}15`, color: colors[freq?.toLowerCase()] || "#6b7280", fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4 }}>{freq}</span>;
}

function CompetitorIntelligenceSection({ auditId, profiles, changes, competitorList, businessName, city, W, H }) {
  const [activeTab, setActiveTab] = useState("intelligence");
  const [expandedCards, setExpandedCards] = useState({});
  const [addName, setAddName] = useState("");
  const [addCity, setAddCity] = useState("");
  const [adding, setAdding] = useState(false);
  const [localProfiles, setLocalProfiles] = useState(profiles || []);
  const [localChanges, setLocalChanges] = useState(changes || []);

  const toggleCard = (name) => setExpandedCards(prev => ({ ...prev, [name]: !prev[name] }));

  const handleAddCompetitor = async () => {
    if (!addName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`${API_BASE}/api/audits/${auditId}/update-competitors`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitors: [{ name: addName.trim(), city: addCity.trim() || city || "" }] })
      });
      if (res.ok) {
        const intel = await fetch(`${API_BASE}/api/audits/${auditId}/competitor-intelligence`);
        if (intel.ok) { const d = await intel.json(); setLocalProfiles(d.profiles || []); setLocalChanges(d.changes || []); }
        setAddName(""); setAddCity("");
      }
    } catch (e) { console.error("Add competitor failed:", e); }
    setAdding(false);
  };

  const hasChanges = localChanges.length > 0;

  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ ...H, fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Competitor Intelligence</h2>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>Deep analysis of your competitors' online presence and reputation</p>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "2px solid #e5e7eb" }}>
        <button onClick={() => setActiveTab("intelligence")} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, color: activeTab === "intelligence" ? "#2563eb" : "#6b7280", borderBottom: activeTab === "intelligence" ? "2px solid #2563eb" : "2px solid transparent", marginBottom: -2, background: "none", border: "none", borderBottomWidth: 2, borderBottomStyle: "solid", borderBottomColor: activeTab === "intelligence" ? "#2563eb" : "transparent", cursor: "pointer" }}>Intelligence</button>
        {hasChanges && <button onClick={() => setActiveTab("changes")} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, color: activeTab === "changes" ? "#2563eb" : "#6b7280", borderBottom: activeTab === "changes" ? "2px solid #2563eb" : "2px solid transparent", marginBottom: -2, background: "none", border: "none", borderBottomWidth: 2, borderBottomStyle: "solid", borderBottomColor: activeTab === "changes" ? "#2563eb" : "transparent", cursor: "pointer" }}>Changes {localChanges.length > 0 && <span style={{ background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 100, marginLeft: 6 }}>{localChanges.length}</span>}</button>}
      </div>

      {/* INTELLIGENCE TAB */}
      {activeTab === "intelligence" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {localProfiles.length === 0 ? (
            <div style={{ ...W, padding: 24, textAlign: "center" }}>
              <p style={{ color: "#64748b", fontSize: 14, marginBottom: 6 }}>No competitor intelligence yet.</p>
              <p style={{ color: "#9ca3af", fontSize: 13 }}>Add competitors below to start gathering intelligence.</p>
            </div>
          ) : localProfiles.map((p, idx) => {
            const research = p.raw_research || {};
            const expanded = expandedCards[p.competitor_name];
            const praiseThemes = p.top_praise_themes || research.reviewAnalysis?.praiseThemes || [];
            const complaintThemes = p.top_complaint_themes || research.reviewAnalysis?.complaintThemes || [];
            const advantages = p.competitive_advantages || research.competitiveProfile?.uniqueAdvantages || [];
            const weaknesses = p.competitive_weaknesses || research.competitiveProfile?.exploitableWeaknesses || [];
            const keyIntel = research.keyIntelligence || "";

            return (
              <div key={idx} style={{ ...W, overflow: "hidden" }}>
                {/* Header row */}
                <div onClick={() => toggleCard(p.competitor_name)} style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: expanded ? "#f8fafc" : "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{p.competitor_name}</span>
                    {p.google_rating && <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 13, color: "#f59e0b", fontWeight: 600 }}>★ {p.google_rating}</span>}
                    {p.google_review_count != null && <span style={{ fontSize: 12, color: "#6b7280" }}>{p.google_review_count} reviews</span>}
                    <ThreatBadge level={p.overall_threat_level} />
                  </div>
                  {expanded ? <ChevronUp style={{ width: 18, height: 18, color: "#9ca3af" }} /> : <ChevronDown style={{ width: 18, height: 18, color: "#9ca3af" }} />}
                </div>

                {/* Expanded details */}
                {expanded && (
                  <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Praise themes */}
                    {praiseThemes.length > 0 && (
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#059669", textTransform: "uppercase", marginBottom: 8 }}>What customers love about them</p>
                        {praiseThemes.map((t, i) => (
                          <div key={i} style={{ marginBottom: 8, padding: "8px 12px", background: "#f0fdf4", borderRadius: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#15803d" }}>{typeof t === "string" ? t : t.theme}</span>
                              {t.frequency && <FrequencyBadge freq={t.frequency} />}
                            </div>
                            {t.examplePhrases?.length > 0 && <p style={{ fontSize: 12, color: "#6b7280", fontStyle: "italic" }}>"{t.examplePhrases[0]}"</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Complaint themes */}
                    {complaintThemes.length > 0 && (
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", marginBottom: 8 }}>Their problems</p>
                        {complaintThemes.map((t, i) => {
                          const isResolved = t.trend?.toLowerCase() === "decreasing" && t.lastSeenApprox && !t.lastSeenApprox.includes("recent");
                          const isEmerging = t.trend?.toLowerCase() === "increasing" && (!t.lastSeenApprox || t.lastSeenApprox.includes("recent"));
                          return (
                            <div key={i} style={{ marginBottom: 8, padding: "8px 12px", background: isResolved ? "#f9fafb" : isEmerging ? "#fef2f2" : "#fff7ed", borderRadius: 8, opacity: isResolved ? 0.6 : 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: isResolved ? "#9ca3af" : isEmerging ? "#dc2626" : "#92400e" }}>{typeof t === "string" ? t : t.theme}</span>
                                {t.trend && (
                                  <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    {t.trend.toLowerCase() === "increasing" && <TrendingUp style={{ width: 12, height: 12, color: "#dc2626" }} />}
                                    {t.trend.toLowerCase() === "decreasing" && <TrendingDown style={{ width: 12, height: 12, color: "#16a34a" }} />}
                                    {t.trend.toLowerCase() === "stable" && <Minus style={{ width: 12, height: 12, color: "#6b7280" }} />}
                                  </span>
                                )}
                                {isResolved && <span style={{ fontSize: 10, fontWeight: 600, color: "#6b7280" }}>Resolved ✓</span>}
                                {isEmerging && <span style={{ fontSize: 10, fontWeight: 700, color: "#dc2626" }}>Emerging ⚠️</span>}
                                {t.frequency && <FrequencyBadge freq={t.frequency} />}
                              </div>
                              {t.examplePhrases?.length > 0 && <p style={{ fontSize: 12, color: "#6b7280", fontStyle: "italic" }}>"{t.examplePhrases[0]}"</p>}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Competitive advantages */}
                    {advantages.length > 0 && (
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", marginBottom: 8 }}>Why customers choose them over you</p>
                        {advantages.map((a, i) => <p key={i} style={{ fontSize: 13, color: "#374151", marginBottom: 4, paddingLeft: 12 }}>• {typeof a === "string" ? a : a.advantage || JSON.stringify(a)}</p>)}
                      </div>
                    )}

                    {/* Exploitable weaknesses */}
                    {weaknesses.length > 0 && (
                      <div style={{ padding: 14, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", marginBottom: 8 }}>Their weak spots — where you can win</p>
                        {weaknesses.map((w, i) => <p key={i} style={{ fontSize: 13, color: "#15803d", marginBottom: 4, paddingLeft: 12, fontWeight: 500 }}>• {typeof w === "string" ? w : JSON.stringify(w)}</p>)}
                      </div>
                    )}

                    {/* Key intelligence callout */}
                    {keyIntel && (
                      <div style={{ padding: 16, background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe" }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", textTransform: "uppercase", marginBottom: 6 }}>Key Intelligence</p>
                        <p style={{ fontSize: 14, color: "#1e40af", lineHeight: 1.6 }}>{keyIntel}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CHANGES TAB */}
      {activeTab === "changes" && hasChanges && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {localChanges.map((ch, idx) => {
            const ratingDelta = parseFloat(ch.rating_change) || 0;
            const reviewDelta = ch.review_count_change || 0;
            const analysis = ch.analysis || {};
            const newThreats = ch.new_complaint_themes || analysis.newThreats || [];
            const newOpps = ch.resolved_complaint_themes || analysis.newOpportunities || [];
            return (
              <div key={idx} style={{ ...W, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{ch.competitor_name}</span>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>—</span>
                  <span style={{ fontSize: 13, color: "#374151", fontStyle: "italic" }}>{ch.summary || analysis.headline || "Changes detected"}</span>
                </div>

                <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
                  {/* Rating change */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>Rating:</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 14, fontWeight: 700, color: ratingDelta > 0 ? "#dc2626" : ratingDelta < 0 ? "#16a34a" : "#6b7280" }}>
                      {ratingDelta > 0 ? <TrendingUp style={{ width: 14, height: 14 }} /> : ratingDelta < 0 ? <TrendingDown style={{ width: 14, height: 14 }} /> : <Minus style={{ width: 14, height: 14 }} />}
                      {ratingDelta > 0 ? "+" : ""}{ratingDelta.toFixed(1)}
                    </span>
                  </div>
                  {/* Review count change */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>Reviews:</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: reviewDelta > 0 ? "#dc2626" : reviewDelta < 0 ? "#16a34a" : "#6b7280" }}>
                      {reviewDelta > 0 ? "+" : ""}{reviewDelta}
                    </span>
                  </div>
                  {/* Velocity */}
                  {ch.threat_level_change && <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 12, color: "#6b7280" }}>Momentum:</span><span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{ch.threat_level_change}</span></div>}
                </div>

                {/* New threats */}
                {newThreats.length > 0 && (
                  <div style={{ marginBottom: 10, padding: 12, background: "#fef2f2", borderRadius: 8 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", marginBottom: 6 }}>New threats this month</p>
                    {newThreats.map((t, i) => <p key={i} style={{ fontSize: 13, color: "#991b1b", marginBottom: 2 }}>• {typeof t === "string" ? t : JSON.stringify(t)}</p>)}
                  </div>
                )}

                {/* New opportunities */}
                {newOpps.length > 0 && (
                  <div style={{ marginBottom: 10, padding: 12, background: "#f0fdf4", borderRadius: 8 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", marginBottom: 6 }}>New opportunities this month</p>
                    {newOpps.map((o, i) => <p key={i} style={{ fontSize: 13, color: "#15803d", marginBottom: 2 }}>• {typeof o === "string" ? o : JSON.stringify(o)}</p>)}
                  </div>
                )}

                {/* Recommendation */}
                {analysis.recommendation && (
                  <div style={{ padding: 14, background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe", display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", textTransform: "uppercase", marginBottom: 4 }}>Recommended Action</p>
                      <p style={{ fontSize: 13, color: "#1e40af", lineHeight: 1.5 }}>{analysis.recommendation}</p>
                    </div>
                    {analysis.urgency && <UrgencyBadge level={analysis.urgency} />}
                  </div>
                )}

                <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>Detected {ch.detected_at ? new Date(ch.detected_at).toLocaleDateString() : ""}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Add competitor */}
      <div style={{ ...W, padding: 20, marginTop: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Not seeing your real competitors? Add them:</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input value={addName} onChange={e => setAddName(e.target.value)} placeholder="Business Name" style={{ flex: 1, minWidth: 180, padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, outline: "none" }} />
          <input value={addCity} onChange={e => setAddCity(e.target.value)} placeholder="City, State" style={{ flex: 1, minWidth: 140, padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, outline: "none" }} />
          <button onClick={handleAddCompetitor} disabled={adding || !addName.trim()} style={{ background: adding ? "#9ca3af" : "#2563eb", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: adding ? "default" : "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
            {adding ? <><Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> Researching...</> : <><Plus style={{ width: 14, height: 14 }} /> Add Competitor</>}
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [compIntel, setCompIntel] = useState(null);
  const barsRef = useRef(null);

  useEffect(() => { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap"; document.head.appendChild(l); return () => { document.head.removeChild(l); }; }, []);
  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { if (!auditId) return; fetch(`${API_BASE}/api/audits/${auditId}/competitor-intelligence`).then(r => r.ok ? r.json() : null).then(d => { if (d) setCompIntel(d); }).catch(() => {}); }, [auditId]);

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

  if (loading) return (<div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ textAlign: "center" }}><Loader2 style={{ width: 40, height: 40, color: "#2563eb", animation: "spin 1s linear infinite", margin: "0 auto 16px", display: "block" }} /><style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style><p style={{ color: "#64748b", fontSize: 15 }}>Loading your scan report...</p></div></div>);

  if (error || !data) return (<div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}><div style={{ textAlign: "center" }}><AlertCircle style={{ width: 48, height: 48, color: "#ef4444", margin: "0 auto 16px", display: "block" }} /><h2 style={{ ...H, color: "#0f172a", fontSize: 24, marginBottom: 8 }}>Report Not Found</h2><p style={{ color: "#64748b", fontSize: 15, marginBottom: 24 }}>{error || "We couldn't load this report."}</p><button onClick={() => navigate("/")} style={{ background: "#2563eb", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Go Home</button></div></div>);

  const { overallScore, scoreLabel, google, website, allFindings: rawFindings, topPriorities, summary, monthlyGoal, dataQuality, businessName, city, state, scannedAt, competitors: rawCompetitors, revenueImpact, quickWins, whatYoureDoingWell, competitorIntel, snapshots, verifiedPages, presenceSection, reportHeadline, lossSummary, competitorSummary, competitorAnalysis, priorityFix, operationalInsights, marketOpportunities, webResearch, bbbData, socialLinks,
    // Legacy support — old scans stored platforms object
    platforms } = data;
  const sc = scoreColor(overallScore || 0);
  const W = { background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb" };

  // Build score cards from new shape (google/website direct) or legacy (platforms object)
  const g = google || platforms?.google || {};
  const w = website || platforms?.website || {};
  const reputationScore = (() => { let s = 0; if (webResearch?.bbb?.found) s += 5; if (webResearch?.yelp?.found) s += 5; if (webResearch?.facebook?.found) s += 3; if ((webResearch?.redFlags?.length || 0) === 0) s += 3; return Math.min(s, 20); })();
  const scoreCards = [
    { key: 'google', label: 'Google Business Profile', icon: Search, raw: g.rawScore || 0, max: 35, found: g.found !== false },
    { key: 'website', label: 'Website Quality', icon: Globe, raw: w.rawScore || 0, max: 25, found: w.found !== false && (w.rawScore || 0) > 0 },
    { key: 'reputation', label: 'Online Reputation', icon: Shield, raw: reputationScore, max: 20, found: !!webResearch },
    { key: 'competitive', label: 'Competitive Position', icon: StarIcon, raw: (rawCompetitors?.competitors?.length || 0) > 0 ? 10 : 0, max: 10, found: (rawCompetitors?.competitors?.length || 0) > 0 },
  ];

  // Normalize competitors: backend may send {competitors:[...], ranking} or flat [...] or null
  const competitors = (() => {
    if (!rawCompetitors) return { competitors: [], ranking: null, totalInArea: null, estimated: true };
    // Already nested object shape
    if (rawCompetitors.competitors && Array.isArray(rawCompetitors.competitors)) return rawCompetitors;
    // Flat array from old scan results
    if (Array.isArray(rawCompetitors)) return { competitors: rawCompetitors, ranking: null, totalInArea: rawCompetitors.length + 1, estimated: true };
    // Object with no competitors array
    return { competitors: [], ranking: rawCompetitors.ranking || null, totalInArea: rawCompetitors.totalInArea || null, estimated: true };
  })();
  console.log("[REPORT] Competitors normalized:", { count: competitors.competitors.length, ranking: competitors.ranking, estimated: competitors.estimated, rawType: typeof rawCompetitors, rawIsArray: Array.isArray(rawCompetitors) });

  // ── Quality filter: suppress weak/generic/unsupported findings ──
  const SUPPRESS_TITLES = [
    /schema markup/i, /structured data/i, /json-ld/i,            // too technical
    /check unavailable/i, /check failed/i, /apify/i,            // internal errors
    /proxy not configured/i, /token not configured/i,            // config issues
  ];
  const isWeak = (f) => {
    if (!f.title) return true;
    if (f.title.length < 8) return true;
    if (SUPPRESS_TITLES.some(re => re.test(f.title))) return true;
    // Suppress findings with no description AND no impact — not enough info to be useful
    if (f.severity !== "good" && !f.description && !f.impact) return true;
    return false;
  };
  const allFindings = (rawFindings || []).filter(f => !isWeak(f));

  // Separate by severity
  const critical = allFindings.filter(f => f.severity === "critical");
  const warnings = allFindings.filter(f => f.severity === "warning");
  const goods = allFindings.filter(f => f.severity === "good");

  // Group findings by platform for organized display
  const platformOrder = ["Google", "Website", "Facebook", "Yelp", "NAP", "Search", "Reviews", "Competitors"];
  const groupedCritical = {};
  const groupedWarnings = {};
  for (const f of critical) { const p = f.platform || "Other"; if (!groupedCritical[p]) groupedCritical[p] = []; groupedCritical[p].push(f); }
  for (const f of warnings) { const p = f.platform || "Other"; if (!groupedWarnings[p]) groupedWarnings[p] = []; groupedWarnings[p].push(f); }
  const sortedCriticalPlatforms = Object.keys(groupedCritical).sort((a, b) => (platformOrder.indexOf(a) === -1 ? 99 : platformOrder.indexOf(a)) - (platformOrder.indexOf(b) === -1 ? 99 : platformOrder.indexOf(b)));
  const sortedWarningPlatforms = Object.keys(groupedWarnings).sort((a, b) => (platformOrder.indexOf(a) === -1 ? 99 : platformOrder.indexOf(a)) - (platformOrder.indexOf(b) === -1 ? 99 : platformOrder.indexOf(b)));

  const snapshotMap = {
    website: snapshots?.website || null,
    facebook: snapshots?.facebook || null,
    yelp: snapshots?.yelp || null,
  };
  const getSnapshotForFinding = (f) => {
    if (f.snapshotRef && snapshotMap[f.snapshotRef]) return snapshotMap[f.snapshotRef];
    const p = (f.platform || "").toLowerCase();
    if (p === "website" || p === "website quality") return snapshotMap.website;
    if (p === "facebook" || p === "facebook presence") return snapshotMap.facebook;
    if (p === "yelp" || p === "yelp profile") return snapshotMap.yelp;
    return null;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'Inter', sans-serif" }}>

      {/* NAV */}
      <nav style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #e5e7eb", padding: "14px 24px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}><BarChart2 style={{ width: 18, height: 18, color: "#2563eb" }} /><span style={{ ...H, fontWeight: 700, fontSize: 15, color: "#0f172a" }}>PageAudit<span style={{ color: "#2563eb" }}>Pro</span></span></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 6, background: "#f3f4f6", border: "1px solid #e5e7eb", color: "#374151", padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}><Download style={{ width: 14, height: 14 }} /> PDF</button>
            <button onClick={handleCopyShare} style={{ display: "flex", alignItems: "center", gap: 6, background: "#f3f4f6", border: "1px solid #e5e7eb", color: copied ? "#059669" : "#374151", padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{copied ? <CheckCircle style={{ width: 14, height: 14 }} /> : <Share2 style={{ width: 14, height: 14 }} />} {copied ? "Copied!" : "Share"}</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* ═══ 1. HEADER ═══ */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#2563eb", marginBottom: 8 }}>Online Presence Audit</p>
          <h1 style={{ ...H, fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: "#0f172a", marginBottom: 4, letterSpacing: "-0.02em" }}>{reportHeadline || businessName || "Your Business"}</h1>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>{businessName}{city ? ` — ${city}` : ""}{state ? `, ${state}` : ""}{scannedAt ? ` — ${new Date(scannedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}` : ""}</p>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 140, height: 140, borderRadius: "50%", border: `5px solid ${sc}`, background: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ ...H, fontSize: 48, fontWeight: 800, color: sc, lineHeight: 1 }}>{overallScore ?? "--"}</div>
              <div style={{ fontSize: 13, color: "#9ca3af", fontWeight: 600 }}>/100</div>
            </div>
          </div>
          <p style={{ color: sc, fontSize: 16, fontWeight: 700, marginTop: 10 }}>{scoreLabel || "Not Scored"}</p>
          {lossSummary && <p style={{ color: "#64748b", fontSize: 14, marginTop: 12, maxWidth: 600, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>{lossSummary}</p>}
          {dataQuality && <p style={{ color: "#9ca3af", fontSize: 12, marginTop: 12 }}>{dataQuality.dataPoints || "—"} data points · {dataQuality.platformsFound || "—"} platforms · {dataQuality.scanTime || "—"}s</p>}
        </div>

        {/* ═══ 1b. VERIFIED BUSINESS PROFILES ═══ */}
        {(verifiedPages?.website || verifiedPages?.facebook || verifiedPages?.yelp || snapshots?.website || snapshots?.facebook || snapshots?.yelp) && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ ...H, fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Verified Business Profiles</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 18 }}>{presenceSection?.trustCopy || snapshots?.trustCopy || "These are the exact pages your customers see when they find your business online."}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              <SnapshotCard platform="Website" url={verifiedPages?.website?.url} snapshot={snapshots?.website} />
              <SnapshotCard platform="Facebook" url={verifiedPages?.facebook?.url} snapshot={snapshots?.facebook} />
              <SnapshotCard platform="Yelp" url={verifiedPages?.yelp?.url} snapshot={snapshots?.yelp} />
            </div>
          </div>
        )}

        {/* ═══ 1c. PRIORITY FIX ═══ */}
        {priorityFix && (
          <div style={{ ...W, padding: 24, marginBottom: 32, borderLeft: "4px solid #ef4444", background: "#fff" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Fix This First</p>
            <h3 style={{ ...H, fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{priorityFix.title}</h3>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.6, marginBottom: 4 }}>{priorityFix.reason}</p>
            {priorityFix.consequence && <p style={{ color: "#991b1b", fontSize: 13, fontStyle: "italic", marginBottom: 4 }}>{priorityFix.consequence}</p>}
            <p style={{ color: "#2563eb", fontSize: 13, fontWeight: 600 }}>{priorityFix.expectedImpact}</p>
          </div>
        )}

        {/* ═══ 2. SCORE CARDS ═══ */}
        <div ref={barsRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 32 }}>
          {scoreCards.map(({ key, label, icon: Icon, raw, max, found }) => {
            const pct = max > 0 ? Math.round((raw / max) * 100) : 0;
            const barColor = pct >= 70 ? "#10b981" : pct >= 45 ? "#f59e0b" : "#ef4444";
            const borderLeft = found ? `4px solid ${barColor}` : "4px solid #d1d5db";
            return (
              <div key={key} style={{ ...W, padding: 18, borderLeft, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon style={{ width: 16, height: 16, color: found ? barColor : "#9ca3af" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{label}</span>
                </div>
                <div style={{ ...H, fontSize: 28, fontWeight: 800, color: found ? barColor : "#d1d5db" }}>{raw}<span style={{ fontSize: 14, color: "#9ca3af", fontWeight: 500 }}>/{max}</span></div>
                <div style={{ height: 5, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 99, background: barColor, transition: "width 1s ease-out", width: barsVisible ? `${pct}%` : "0%" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══ 3. WHAT WE FOUND ═══ */}
        {/* ═══ 3. COMPANY OVERVIEW (from web research) ═══ */}
        {webResearch?.companyOverview && (
          <div style={{ ...W, padding: 24, marginBottom: 20 }}>
            <h3 style={{ ...H, fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>About {businessName}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              {webResearch.companyOverview.founded && <div><p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: 2 }}>Founded</p><p style={{ fontSize: 14, color: "#0f172a", fontWeight: 600 }}>{webResearch.companyOverview.founded}</p></div>}
              {webResearch.companyOverview.owners && <div><p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: 2 }}>Owners</p><p style={{ fontSize: 14, color: "#0f172a" }}>{webResearch.companyOverview.owners}</p></div>}
              {webResearch.companyOverview.serviceArea && <div><p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: 2 }}>Service Area</p><p style={{ fontSize: 14, color: "#0f172a" }}>{webResearch.companyOverview.serviceArea}</p></div>}
              {webResearch.companyOverview.specialties?.length > 0 && <div><p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: 2 }}>Specialties</p><p style={{ fontSize: 14, color: "#0f172a" }}>{webResearch.companyOverview.specialties.join(", ")}</p></div>}
            </div>
            {webResearch.companyOverview.certifications?.length > 0 && <div style={{ marginTop: 10 }}><p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: 2 }}>Certifications</p><p style={{ fontSize: 13, color: "#374151" }}>{webResearch.companyOverview.certifications.join(" · ")}</p></div>}
            {webResearch.companyOverview.awardsOrRecognition?.length > 0 && <div style={{ marginTop: 8 }}><p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: 2 }}>Awards & Recognition</p><p style={{ fontSize: 13, color: "#374151" }}>{webResearch.companyOverview.awardsOrRecognition.join(" · ")}</p></div>}
          </div>
        )}

        {/* ═══ 3b. WHAT WE FOUND ═══ */}
        {summary && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ ...H, fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>What We Found</h2>
            <div style={{ ...W, padding: 24 }}>
              <p style={{ color: "#374151", fontSize: 15, lineHeight: 1.7, marginBottom: competitorIntel ? 12 : 0 }}>{summary}</p>
              {competitorIntel && <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.6, marginTop: 8 }}>{competitorIntel}</p>}
              {revenueImpact && <div style={{ marginTop: 14, padding: 14, background: "#fef3c7", borderRadius: 10 }}><p style={{ color: "#92400e", fontSize: 13, fontWeight: 600 }}>Revenue Impact: {revenueImpact}</p></div>}
            </div>
            {monthlyGoal && (
              <div style={{ ...W, padding: 18, marginTop: 12, borderLeft: "4px solid #2563eb" }}>
                <p style={{ color: "#2563eb", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Your Focus This Month</p>
                <p style={{ color: "#0f172a", fontSize: 15, fontWeight: 600 }}>{monthlyGoal}</p>
              </div>
            )}
          </div>
        )}

        {/* ═══ 3c. BBB + REPUTATION ═══ */}
        {(bbbData || webResearch?.yelp?.found || webResearch?.facebook?.found) && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ ...H, fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>Reputation Across the Web</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              {bbbData?.found && (
                <div style={{ ...W, padding: 18 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#2563eb", textTransform: "uppercase", marginBottom: 8 }}>BBB</p>
                  <p style={{ ...H, fontSize: 28, fontWeight: 800, color: "#0f172a" }}>{bbbData.rating || "—"}</p>
                  <p style={{ fontSize: 12, color: bbbData.accredited ? "#059669" : "#9ca3af", fontWeight: 600 }}>{bbbData.accredited ? "Accredited" : "Not Accredited"}</p>
                  {bbbData.complaintCount > 0 && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>{bbbData.complaintCount} complaint{bbbData.complaintCount > 1 ? "s" : ""}</p>}
                </div>
              )}
              {webResearch?.yelp?.found && (
                <div style={{ ...W, padding: 18 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", marginBottom: 8 }}>Yelp</p>
                  <p style={{ ...H, fontSize: 28, fontWeight: 800, color: "#0f172a" }}>{webResearch.yelp.rating || "—"}</p>
                  <p style={{ fontSize: 12, color: "#6b7280" }}>{webResearch.yelp.reviewCount || 0} reviews</p>
                </div>
              )}
              {webResearch?.facebook?.found && (
                <div style={{ ...W, padding: 18 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#1877F2", textTransform: "uppercase", marginBottom: 8 }}>Facebook</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{webResearch.facebook.followerCount || "Page found"}</p>
                  <p style={{ fontSize: 12, color: "#6b7280" }}>Posting: {webResearch.facebook.postingFrequency || "unknown"}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ 3d. OPERATIONAL INSIGHTS ═══ */}
        {operationalInsights?.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ ...H, fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Operational Insights from Customer Reviews</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 14 }}>Patterns found in customer feedback that suggest business improvements beyond marketing</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {operationalInsights.map((insight, i) => (
                <div key={i} style={{ ...W, padding: 16, borderLeft: "4px solid #f59e0b", display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <AlertCircle style={{ width: 18, height: 18, color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
                  <p style={{ color: "#374151", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ 3e. MARKET OPPORTUNITIES ═══ */}
        {marketOpportunities?.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ ...H, fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Market Opportunities</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 14 }}>Gaps in your local market that {businessName} could fill</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {marketOpportunities.map((opp, i) => (
                <div key={i} style={{ ...W, padding: 16, borderLeft: "4px solid #10b981", display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Zap style={{ width: 18, height: 18, color: "#10b981", flexShrink: 0, marginTop: 1 }} />
                  <p style={{ color: "#374151", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{opp}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ 4. TOP PRIORITIES ═══ */}
        {topPriorities?.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ ...H, fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Your Top {topPriorities.length} Priorities</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>Fix these first for the biggest impact</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {topPriorities.map((p, i) => (
                <div key={i} style={{ ...W, padding: 20, display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ ...H, fontSize: 18, fontWeight: 800, color: "#fff" }}>{p.priority || i + 1}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: "#0f172a", fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{p.title}</h3>
                    <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.6 }}>{p.description}</p>
                  </div>
                  <button onClick={() => { setQuoteModal(p.title); setQuoteForm(f => ({ ...f, name: businessName || "" })); setQuoteSubmitted(false); }}
                    style={{ background: "#2563eb", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}>Get Help</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ 5. COMPETITOR INTELLIGENCE ═══ */}
        <CompetitorIntelligenceSection
          auditId={auditId}
          profiles={compIntel?.profiles || []}
          changes={compIntel?.changes || []}
          competitorList={compIntel?.competitorList || []}
          businessName={businessName}
          city={city}
          W={W}
          H={H}
        />

        {/* ═══ 5b. QUICK WINS ═══ */}
        {quickWins?.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ ...H, fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Quick Wins</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>Fix today, free, under 15 minutes each</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
              {quickWins.map((w, i) => (
                <div key={i} style={{ ...W, padding: 18, borderTop: "3px solid #10b981" }}>
                  <h3 style={{ color: "#0f172a", fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{w.title || w}</h3>
                  {w.action && <p style={{ color: "#4b5563", fontSize: 13, lineHeight: 1.5, marginBottom: 6 }}>{w.action}</p>}
                  {w.impact && <p style={{ color: "#059669", fontSize: 12, fontWeight: 600 }}>{w.impact}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ 5c. WHAT YOU'RE DOING WELL ═══ */}
        {whatYoureDoingWell?.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ ...H, fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>What You're Doing Well</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {whatYoureDoingWell.map((item, i) => (
                <div key={i} style={{ ...W, padding: 14, borderLeft: "4px solid #10b981", display: "flex", alignItems: "center", gap: 10 }}>
                  <CheckCircle style={{ width: 18, height: 18, color: "#10b981", flexShrink: 0 }} />
                  <p style={{ color: "#0f172a", fontSize: 14 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ 6. COMPLETE FINDINGS (grouped by platform) ═══ */}
        {allFindings.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ ...H, fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>Complete Findings — {critical.length + warnings.length} Issue{critical.length + warnings.length !== 1 ? "s" : ""} Found</h2>

            {/* Critical — grouped by platform */}
            {sortedCriticalPlatforms.map(plat => (
              <div key={plat} style={{ marginBottom: 20 }}>
                <p style={{ color: "#dc2626", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{plat} — {groupedCritical[plat].length} Critical</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {groupedCritical[plat].map((f, i) => <FindingCard key={i} f={f} snapshot={getSnapshotForFinding(f)} />)}
                </div>
              </div>
            ))}

            {/* Warnings — grouped by platform */}
            {sortedWarningPlatforms.map(plat => (
              <div key={plat} style={{ marginBottom: 20 }}>
                <p style={{ color: "#d97706", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{plat} — {groupedWarnings[plat].length} Warning{groupedWarnings[plat].length > 1 ? "s" : ""}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {groupedWarnings[plat].map((f, i) => <FindingCard key={i} f={f} snapshot={getSnapshotForFinding(f)} />)}
                </div>
              </div>
            ))}

            {/* Good — compact list */}
            {goods.length > 0 && (
              <div>
                <p style={{ color: "#059669", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{goods.length} Looking Good</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {goods.map((f, i) => (
                    <div key={i} style={{ ...W, padding: 14, borderLeft: "4px solid #10b981", display: "flex", alignItems: "center", gap: 10 }}>
                      <CheckCircle style={{ width: 18, height: 18, color: "#10b981", flexShrink: 0 }} />
                      <div><span style={{ fontSize: 10, fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>{f.platform} — </span><span style={{ color: "#0f172a", fontSize: 14, fontWeight: 600 }}>{f.title}</span></div>
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
          const gs = g.rawScore; const ws = w.rawScore;
          const rc = g.reviewCount || 0;
          const services = [];
          if (ws != null && ws < 15) services.push({ icon: "🌐", title: "Website Rebuild", desc: `Your website scored ${ws}/25. We'll rebuild it fast, modern, and optimized.`, price: "Starting at $1,500", service: "website_build" });
          if ((gs != null && gs < 20) || rc < 20) services.push({ icon: "📍", title: "Local SEO & Google Maps", desc: `You have ${rc} reviews. We'll get you ranking higher within 90 days.`, price: "Starting at $500/mo", service: "local_seo" });
          if (rc < 20) services.push({ icon: "⭐", title: "Review Growth", desc: `You have ${rc} reviews. Top businesses have 50+. We'll get you there.`, price: "Starting at $299/mo", service: "review_management" });
          if (!webResearch?.bbb?.found) services.push({ icon: "📋", title: "Citation & Directory Cleanup", desc: "Your business info may be inconsistent across directories. We'll fix every listing.", price: "One-time $199", service: "citation_cleanup" });
          services.push({ icon: "🚀", title: "Full Service Package", desc: "Website, SEO, reviews, social — done for you monthly.", price: "Custom pricing", service: "full_service_package" });

          return services.length > 1 ? (
            <div style={{ marginBottom: 40 }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <h2 style={{ ...H, fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Want us to fix this for you?</h2>
                <p style={{ color: "#64748b", fontSize: 14 }}>Our agency team handles everything. You focus on your business.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                {services.map(s => (
                  <div key={s.service} style={{ ...W, padding: 20, borderTop: s.service === "full_service_package" ? "4px solid #2563eb" : "none", display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</span>
                    <h3 style={{ color: "#0f172a", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{s.title}</h3>
                    <p style={{ color: "#4b5563", fontSize: 13, lineHeight: 1.5, marginBottom: 12, flex: 1 }}>{s.desc}</p>
                    <p style={{ color: "#0f172a", fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{s.price}</p>
                    <button onClick={() => { setQuoteModal(s.service); setQuoteForm(f => ({ ...f, name: businessName || "" })); setQuoteSubmitted(false); }}
                      style={{ width: "100%", background: "#2563eb", color: "#fff", fontSize: 13, fontWeight: 700, padding: "10px 0", borderRadius: 8, border: "none", cursor: "pointer" }}>
                      {s.service === "full_service_package" ? "Schedule Consultation" : "Get Free Quote"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null;
        })()}

        {/* ═══ 9. MONITORING UPSELL ═══ */}
        <div style={{ marginBottom: 40, padding: 28, border: "2px solid #e5e7eb", borderRadius: 16, background: "#fff" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h2 style={{ ...H, fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Want us to monitor this every month?</h2>
            <p style={{ color: "#64748b", fontSize: 14 }}>We'll rescan your business monthly and email you an updated report.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {PLANS.map(({ name, price, period, features, featured, badge }) => (
              <div key={name} style={{ ...W, padding: 20, borderTop: featured ? "4px solid #2563eb" : "none", position: "relative", display: "flex", flexDirection: "column" }}>
                {badge && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#2563eb", color: "#fff", fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "3px 10px", borderRadius: 99 }}>{badge}</div>}
                <p style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{name}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 14 }}>
                  <span style={{ ...H, fontSize: 26, fontWeight: 800, color: "#0f172a" }}>{price}</span>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>{period}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16, flex: 1 }}>
                  {features.map(f => (<div key={f} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#4b5563" }}><CheckCircle style={{ width: 14, height: 14, color: "#10b981", flexShrink: 0 }} /> {f}</div>))}
                </div>
                <button onClick={() => navigate("/submit-your-page", { state: { plan: name } })}
                  style={{ width: "100%", fontSize: 13, fontWeight: 700, color: "#fff", background: featured ? "#2563eb" : "#0f172a", border: "none", padding: "10px 0", borderRadius: 8, cursor: "pointer" }}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SHARE */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 10 }}>Know another business owner who needs this?</p>
          <button onClick={handleCopyShare} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f3f4f6", border: "1px solid #e5e7eb", color: copied ? "#059669" : "#374151", padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {copied ? <CheckCircle style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />} {copied ? "Link Copied!" : "Copy Share Link"}
          </button>
        </div>

        {/* QUOTE MODAL */}
        {quoteModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: 28, maxWidth: 400, width: "100%", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <button onClick={() => setQuoteModal(null)} style={{ position: "absolute", top: 12, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 22 }}>x</button>
              {quoteSubmitted ? (
                <div style={{ textAlign: "center", padding: 16 }}><CheckCircle style={{ width: 40, height: 40, color: "#10b981", margin: "0 auto 12px", display: "block" }} /><h3 style={{ ...H, fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Request Received!</h3><p style={{ color: "#6b7280", fontSize: 13 }}>We'll contact you within 24 hours.</p></div>
              ) : (
                <div>
                  <h3 style={{ ...H, fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>Request a Free Quote</h3>
                  {[{ l: "Name", k: "name", p: "Your name" }, { l: "Email", k: "email", p: "you@business.com", t: "email" }, { l: "Phone", k: "phone", p: "(555) 123-4567", t: "tel" }, { l: "Best time", k: "bestTime", p: "e.g. Mornings" }].map(({ l, k, p, t }) => (
                    <div key={k} style={{ marginBottom: 10 }}><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 3 }}>{l}</label><input type={t || "text"} value={quoteForm[k]} onChange={e => setQuoteForm(f => ({ ...f, [k]: e.target.value }))} placeholder={p} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 12px", fontSize: 14, color: "#0f172a", outline: "none", boxSizing: "border-box" }} /></div>
                  ))}
                  <button disabled={quoteSubmitting || !quoteForm.email} onClick={async () => {
                    setQuoteSubmitting(true);
                    try { await fetch(`${API_BASE}/api/service-requests`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: quoteForm.name, email: quoteForm.email, phone: quoteForm.phone, bestTime: quoteForm.bestTime, service: quoteModal, auditId: auditId ? parseInt(auditId) : null, scanScore: overallScore || null }) }); setQuoteSubmitted(true); } catch {} finally { setQuoteSubmitting(false); }
                  }} style={{ width: "100%", background: "#2563eb", color: "#fff", fontSize: 15, fontWeight: 700, padding: "14px 0", borderRadius: 8, border: "none", cursor: "pointer", marginTop: 8, opacity: quoteForm.email ? 1 : 0.4 }}>
                    {quoteSubmitting ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><BarChart2 style={{ width: 14, height: 14, color: "#2563eb" }} /><span style={{ ...H, fontWeight: 700, fontSize: 13, color: "#0f172a" }}>PageAudit<span style={{ color: "#2563eb" }}>Pro</span></span></div>
          <p style={{ color: "#9ca3af", fontSize: 11 }}>&copy; 2026 PageAudit Pro</p>
        </div>
      </div>
    </div>
  );
}
