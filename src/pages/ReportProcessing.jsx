import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BarChart2, CheckCircle, AlertCircle, Star, MapPin, ArrowRight, X } from "lucide-react";

const API_BASE = "https://pageaudit-engine.onrender.com";

const SCAN_MESSAGES = [
  "Running your complete audit...",
  "Checking Google Business Profile...",
  "Analyzing star ratings and reviews...",
  "Scanning Yelp listings...",
  "Testing website speed on mobile...",
  "Checking NAP consistency...",
  "Running competitor analysis...",
  "Generating AI insights...",
  "Building your personalized report...",
];

const SCAN_PLATFORMS = [
  { emoji: "🔍", label: "Google Business Profile", delay: 1000, doneDelay: 4000 },
  { emoji: "⭐", label: "Yelp", delay: 3000, doneDelay: 6000 },
  { emoji: "🌐", label: "Website Performance", delay: 5000, doneDelay: 8000 },
  { emoji: "📍", label: "NAP Consistency", delay: 7000, doneDelay: 10000 },
  { emoji: "🤖", label: "AI Analysis", delay: 9000, doneDelay: 12000 },
];

// Phase: "verifying" → "picking" → "scanning" → "done"
export default function ReportProcessing() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(window.location.search);
  const stateData = location.state || {};
  const auditId = stateData.auditId || params.get("id") || params.get("audit_id");

  let orderData = {};
  try { orderData = JSON.parse(localStorage.getItem("pageAuditOrder") || "{}"); } catch {}
  let bizData = {};
  try { bizData = JSON.parse(localStorage.getItem("pageaudit_business_data") || "{}"); } catch {}

  const businessName = stateData.businessName || orderData.businessName || bizData.businessName || "";
  const city = stateData.city || orderData.city || bizData.city || "";
  const state = stateData.state || orderData.state || bizData.state || "";
  const website = stateData.website || orderData.website || bizData.website || "";
  const facebookUrl = stateData.facebookUrl || orderData.pageUrl || "";
  const industry = orderData.industry || "";
  const challenge = orderData.challenge || "";

  const [phase, setPhase] = useState("verifying"); // verifying | picking | scanning
  const [error, setError] = useState(null);

  // Competitor picker state
  const [compOptions, setCompOptions] = useState([]);
  const [compLoading, setCompLoading] = useState(false);
  const [selectedComps, setSelectedComps] = useState(new Set());

  // Scan animation state
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [visibleRows, setVisibleRows] = useState(new Set());
  const [doneRows, setDoneRows] = useState(new Set());
  const scanDone = useRef(false);
  const scanDataRef = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  // Phase 1: Verify payment
  useEffect(() => {
    if (!auditId) { setError("No audit ID found."); return; }

    const verify = async () => {
      const sessionId = params.get("session_id");
      if (sessionId) {
        try {
          await fetch(API_BASE + "/api/stripe/verify/" + sessionId);
        } catch {}
      }

      let paid = false;
      for (let i = 0; i < 15; i++) {
        try {
          const res = await fetch(API_BASE + "/api/audits/" + auditId + "/status");
          const data = await res.json();
          if (data.paid) { paid = true; break; }
        } catch {}
        await new Promise(r => setTimeout(r, 2000));
      }

      if (!paid) {
        setError("Payment confirmation is taking longer than expected. Check your dashboard or email support@pageauditpros.com");
        return;
      }

      // Payment confirmed — load competitor options
      setCompLoading(true);
      try {
        const res = await fetch(API_BASE + "/api/scan/competitor-options", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessName, city, state }),
        });
        if (res.ok) {
          const data = await res.json();
          setCompOptions(data.options || []);
        }
      } catch (e) {
        console.log("[COMP-PICKER] Failed to load options:", e.message);
      }
      setCompLoading(false);
      setPhase("picking");
    };

    verify();
  }, [auditId]);

  // Phase 2: User picks competitors (or skips)
  const toggleComp = (placeId) => {
    setSelectedComps(prev => {
      const next = new Set(prev);
      if (next.has(placeId)) next.delete(placeId);
      else if (next.size < 3) next.add(placeId);
      return next;
    });
  };

  const submitCompetitors = async () => {
    const selected = compOptions.filter(c => selectedComps.has(c.placeId));
    if (selected.length > 0) {
      try {
        await fetch(API_BASE + "/api/audits/" + auditId + "/select-competitors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selectedCompetitors: selected }),
        });
      } catch {}
    }
    startScan();
  };

  const skipCompetitors = () => {
    startScan();
  };

  // Phase 3: Run the actual scan
  const startScan = () => {
    setPhase("scanning");
  };

  useEffect(() => {
    if (phase !== "scanning") return;

    // Progress animation
    const progInterval = setInterval(() => {
      setProgress(p => { if (p >= 95) { clearInterval(progInterval); return 95; } return p + (95 / 150); });
    }, 100);
    const msgInterval = setInterval(() => setMsgIndex(i => (i + 1) % SCAN_MESSAGES.length), 2000);
    SCAN_PLATFORMS.forEach((p, i) => {
      setTimeout(() => setVisibleRows(s => new Set([...s, i])), p.delay);
      setTimeout(() => setDoneRows(s => new Set([...s, i])), p.doneDelay);
    });

    // Run the scan
    const run = async () => {
      try {
        const res = await fetch(API_BASE + "/api/scan/full", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ auditId: parseInt(auditId), businessName, city, state, website, facebookUrl, industry, biggestChallenge: challenge }),
        });
        if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Scan failed"); }
        const data = await res.json();
        scanDataRef.current = data;
        scanDone.current = true;
      } catch (err) {
        console.error("[SCAN] Error:", err.message);
        setError(err.message || "Scan failed. Please try again.");
      }
    };
    run();

    return () => { clearInterval(progInterval); clearInterval(msgInterval); };
  }, [phase]);

  // Navigate when scan complete
  useEffect(() => {
    if (phase !== "scanning") return;
    const check = setInterval(() => {
      if (scanDone.current && progress >= 80) {
        clearInterval(check);
        setProgress(100);
        setTimeout(() => {
          navigate("/report/scan/" + auditId, { replace: true, state: { scanData: scanDataRef.current, auditId } });
        }, 800);
      }
    }, 300);
    return () => clearInterval(check);
  }, [phase, progress, navigate, auditId]);

  const H = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
  const B = { fontFamily: "'Inter', sans-serif" };

  // ── ERROR STATE ──
  if (error) return (
    <div style={{ ...B, minHeight: "100vh", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 440, padding: 20 }}>
        <AlertCircle style={{ width: 48, height: 48, color: "#ef4444", margin: "0 auto 16px", display: "block" }} />
        <h2 style={{ ...H, color: "#0f172a", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Something Went Wrong</h2>
        <p style={{ color: "#64748b", fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>{error}</p>
        <button onClick={() => navigate("/dashboard")} style={{ background: "#2563eb", color: "#fff", border: "none", padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Go to Dashboard</button>
      </div>
    </div>
  );

  // ── VERIFYING PAYMENT ──
  if (phase === "verifying") return (
    <div style={{ ...B, minHeight: "100vh", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTop: "3px solid #2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        <p style={{ ...H, color: "#0f172a", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Confirming your payment...</p>
        <p style={{ color: "#64748b", fontSize: 14 }}>This usually takes a few seconds.</p>
      </div>
    </div>
  );

  // ── COMPETITOR PICKER ──
  if (phase === "picking") return (
    <div style={{ ...B, minHeight: "100vh", background: "#f9fafb" }}>
      <nav style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #e5e7eb", padding: "14px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BarChart2 style={{ width: 20, height: 20, color: "#2563eb" }} />
          <span style={{ ...H, fontWeight: 800, fontSize: 16, color: "#0f172a" }}>PageAudit<span style={{ color: "#2563eb" }}>Pro</span></span>
        </div>
      </nav>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#ecfdf5", borderRadius: 100, padding: "6px 14px", marginBottom: 16 }}>
            <CheckCircle style={{ width: 14, height: 14, color: "#059669" }} />
            <span style={{ color: "#059669", fontSize: 13, fontWeight: 600 }}>Payment confirmed</span>
          </div>
          <h1 style={{ ...H, fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 800, color: "#0f172a", marginBottom: 8, letterSpacing: "-0.02em" }}>
            Who are {businessName}'s real competitors?
          </h1>
          <p style={{ color: "#64748b", fontSize: 15, maxWidth: 500, margin: "0 auto" }}>
            Select up to 3 businesses you actually compete with. We'll compare you directly against them in your report.
          </p>
        </div>

        {compLoading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ width: 32, height: 32, border: "3px solid #e5e7eb", borderTop: "3px solid #2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            <p style={{ color: "#64748b", fontSize: 14 }}>Finding businesses near {city}...</p>
          </div>
        ) : compOptions.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {compOptions.map(c => {
              const isSelected = selectedComps.has(c.placeId);
              return (
                <button key={c.placeId} onClick={() => toggleComp(c.placeId)} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                  background: isSelected ? "#eff6ff" : "#fff",
                  border: isSelected ? "2px solid #2563eb" : "1px solid #e5e7eb",
                  borderRadius: 12, cursor: "pointer", textAlign: "left", width: "100%",
                  transition: "border-color 0.15s",
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                    border: isSelected ? "none" : "2px solid #d1d5db",
                    background: isSelected ? "#2563eb" : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {isSelected && <CheckCircle style={{ width: 16, height: 16, color: "#fff" }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", marginBottom: 2 }}>{c.name}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      {c.address && <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: "#64748b" }}><MapPin style={{ width: 11, height: 11 }} /> {c.address}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {c.rating && (
                      <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end", marginBottom: 2 }}>
                        <Star style={{ width: 13, height: 13, fill: "#f59e0b", color: "#f59e0b" }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{c.rating}</span>
                      </div>
                    )}
                    {c.reviewCount > 0 && <p style={{ fontSize: 12, color: "#64748b" }}>{c.reviewCount} reviews</p>}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24, textAlign: "center", marginBottom: 24 }}>
            <p style={{ color: "#64748b", fontSize: 14 }}>No competitor suggestions found for this area. We'll auto-detect competitors during the scan.</p>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {selectedComps.size > 0 && (
            <button onClick={submitCompetitors} style={{
              background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 15,
              padding: "14px 32px", borderRadius: 10, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
            }}>
              Compare against {selectedComps.size} competitor{selectedComps.size > 1 ? "s" : ""} <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          )}
          <button onClick={skipCompetitors} style={{
            background: selectedComps.size > 0 ? "transparent" : "#0f172a",
            color: selectedComps.size > 0 ? "#64748b" : "#fff",
            fontWeight: 600, fontSize: 14,
            padding: "14px 24px", borderRadius: 10, cursor: "pointer",
            border: selectedComps.size > 0 ? "none" : "none",
          }}>
            {compOptions.length > 0 ? "None of these are competitors" : "Continue to scan"}
          </button>
        </div>

        {selectedComps.size > 0 && (
          <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 12, marginTop: 12 }}>
            Selected: {compOptions.filter(c => selectedComps.has(c.placeId)).map(c => c.name).join(", ")}
          </p>
        )}
      </div>
    </div>
  );

  // ── SCANNING ──
  return (
    <div style={{ ...B, minHeight: "100vh", background: "#f9fafb", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes radar{0%{transform:scale(0.3);opacity:0.6}100%{transform:scale(1.2);opacity:0}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 8px rgba(37,99,235,0.3)}50%{box-shadow:0 0 16px rgba(37,99,235,0.6)}}
        @keyframes msgFade{0%{opacity:0}10%{opacity:1}90%{opacity:1}100%{opacity:0}}
      `}</style>

      <nav style={{ padding: "16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BarChart2 style={{ width: 20, height: 20, color: "#2563eb" }} />
          <span style={{ ...H, fontWeight: 800, fontSize: 16, color: "#0f172a" }}>PageAudit<span style={{ color: "#2563eb" }}>Pro</span></span>
        </div>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 32px" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid rgba(37,99,235,0.2)", animation: "radar 2.4s ease-out infinite", animationDelay: `${i * 0.8}s` }} />
            ))}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 40, height: 40, borderRadius: "50%", background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#2563eb" }} />
            </div>
          </div>

          <h1 style={{ ...H, fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
            {businessName ? `Scanning ${businessName}...` : "Running your full audit..."}
          </h1>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 28 }}>Complete business audit in progress</p>

          <div style={{ marginBottom: 8 }}>
            <div style={{ height: 6, background: "#e5e7eb", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#2563eb,#60a5fa)", width: `${Math.min(progress, 100)}%`, transition: "width 0.3s ease-out" }} />
            </div>
          </div>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 28 }}>{Math.min(Math.round(progress), 100)}%</p>

          <div style={{ height: 24, marginBottom: 28 }}>
            <p key={msgIndex} style={{ color: "#6b7280", fontSize: 15, fontWeight: 500, animation: "msgFade 2s ease-in-out" }}>{SCAN_MESSAGES[msgIndex]}</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left", maxWidth: 340, margin: "0 auto 40px" }}>
            {SCAN_PLATFORMS.map((p, i) => {
              if (!visibleRows.has(i)) return <div key={i} style={{ height: 36 }} />;
              const done = doneRows.has(i);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, animation: "fadeIn 0.4s ease-out" }}>
                  <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>{p.emoji}</span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: done ? "#0f172a" : "#9ca3af" }}>{p.label}</span>
                  {done ? <CheckCircle style={{ width: 18, height: 18, color: "#10b981" }} /> : <div style={{ width: 18, height: 18, border: "2px solid #e5e7eb", borderTop: "2px solid #2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
                </div>
              );
            })}
          </div>

          <p style={{ color: "#9ca3af", fontSize: 12 }}>This usually takes 30–60 seconds. You'll be redirected automatically.</p>
        </div>
      </div>
    </div>
  );
}
