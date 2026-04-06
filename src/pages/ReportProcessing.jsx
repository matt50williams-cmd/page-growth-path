import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BarChart2, CheckCircle, AlertCircle } from "lucide-react";

const API_BASE = "https://pageaudit-engine.onrender.com";

const MESSAGES = [
  "Running your complete 47-point audit...",
  "Checking Google Business Profile...",
  "Analyzing your star ratings and reviews...",
  "Scanning Yelp listings...",
  "Testing website speed on mobile...",
  "Checking NAP consistency across directories...",
  "Running competitor analysis...",
  "Generating AI insights...",
  "Building your personalized report...",
];

const PLATFORMS = [
  { emoji: "🔍", label: "Google Business Profile", delay: 1000, doneDelay: 4000 },
  { emoji: "⭐", label: "Yelp", delay: 3000, doneDelay: 6000 },
  { emoji: "🌐", label: "Website Performance", delay: 5000, doneDelay: 8000 },
  { emoji: "📍", label: "NAP Consistency", delay: 7000, doneDelay: 10000 },
  { emoji: "🤖", label: "AI Analysis", delay: 9000, doneDelay: 12000 },
];

export default function ReportProcessing() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(window.location.search);

  // Get data from location.state or URL params or localStorage
  const stateData = location.state || {};
  const auditId = stateData.auditId || params.get("id") || params.get("audit_id");

  // Try localStorage pageAuditOrder as fallback
  let orderData = {};
  try { orderData = JSON.parse(localStorage.getItem("pageAuditOrder") || "{}"); } catch {}

  // Also pull Google Places data
  let bizData = {};
  try { bizData = JSON.parse(localStorage.getItem("pageaudit_business_data") || "{}"); } catch {}

  const businessName = stateData.businessName || orderData.businessName || bizData.businessName || "";
  const city = stateData.city || orderData.city || bizData.city || "";
  const state = stateData.state || orderData.state || bizData.state || "";
  const website = stateData.website || orderData.website || bizData.website || "";
  const facebookUrl = stateData.facebookUrl || orderData.pageUrl || "";
  const address = orderData.address || bizData.address || "";
  const phone = orderData.phone || bizData.phone || "";
  const industry = orderData.industry || "";
  const challenge = orderData.challenge || "";

  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [visibleRows, setVisibleRows] = useState(new Set());
  const [doneRows, setDoneRows] = useState(new Set());
  const [error, setError] = useState(null);
  const scanDone = useRef(false);
  const scanDataRef = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  // Progress bar: 0→95 over 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => { if (p >= 95) { clearInterval(interval); return 95; } return p + (95 / 150); });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Rotating messages every 2s
  useEffect(() => {
    const interval = setInterval(() => setMsgIndex(i => (i + 1) % MESSAGES.length), 2000);
    return () => clearInterval(interval);
  }, []);

  // Platform row animations
  useEffect(() => {
    PLATFORMS.forEach((p, i) => {
      setTimeout(() => setVisibleRows(s => new Set([...s, i])), p.delay);
      setTimeout(() => setDoneRows(s => new Set([...s, i])), p.doneDelay);
    });
  }, []);

  // Wait for payment, then run scan
  useEffect(() => {
    if (!auditId) { setError("No audit ID found."); return; }

    const runScan = async () => {
      // Poll for payment confirmation — up to 15 times, every 2 seconds
      let paid = false;
      for (let i = 0; i < 15; i++) {
        try {
          const res = await fetch(API_BASE + "/api/audits/" + auditId + "/status");
          const data = await res.json();
          console.log("[PAYMENT CHECK] attempt", i + 1, "paid:", data.paid);
          if (data.paid) { paid = true; break; }
        } catch (e) {
          console.log("[PAYMENT CHECK] error:", e.message);
        }
        await new Promise(r => setTimeout(r, 2000));
      }

      if (!paid) {
        setError("Payment confirmation is taking longer than expected. Please check your dashboard or contact support@pageauditpros.com");
        return;
      }

      // Payment confirmed — run the scan
      console.log("[SCAN] Payment confirmed, starting full scan");
      try {
        const res = await fetch(API_BASE + "/api/scan/full", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ auditId: parseInt(auditId), businessName, city, state, website, facebookUrl, address, phone, industry, biggestChallenge: challenge }),
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

    runScan();
  }, [auditId, businessName, city, state, website, facebookUrl]);

  // Navigate when scan complete + animation far enough
  useEffect(() => {
    const check = setInterval(() => {
      if (scanDone.current && progress >= 80) {
        clearInterval(check);
        setProgress(100);
        setTimeout(() => {
          navigate("/report/scan/" + auditId, { state: { scanData: scanDataRef.current } });
        }, 800);
      }
    }, 300);
    return () => clearInterval(check);
  }, [progress, navigate, auditId]);

  const heading = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
  const body = { fontFamily: "'Inter', sans-serif" };

  if (error) return (
    <div style={{ ...body, minHeight: "100vh", background: "#0a0f1e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 440, padding: 20 }}>
        <AlertCircle style={{ width: 48, height: 48, color: "#ef4444", margin: "0 auto 16px", display: "block" }} />
        <h2 style={{ ...heading, color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Something Went Wrong</h2>
        <p style={{ color: "#94a3b8", fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>{error}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/dashboard")} style={{ background: "#2563eb", color: "#fff", border: "none", padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Go to Dashboard</button>
          <a href="mailto:support@pageauditpros.com" style={{ color: "#94a3b8", fontSize: 13, alignSelf: "center", textDecoration: "none" }}>Contact Support</a>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ ...body, minHeight: "100vh", background: "#0a0f1e", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes radar{0%{transform:scale(0.3);opacity:0.6}100%{transform:scale(1.2);opacity:0}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 8px rgba(37,99,235,0.4)}50%{box-shadow:0 0 20px rgba(37,99,235,0.8)}}
        @keyframes msgFade{0%{opacity:0}10%{opacity:1}90%{opacity:1}100%{opacity:0}}
      `}</style>

      <nav style={{ padding: "16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <BarChart2 style={{ width: 18, height: 18, color: "#3b82f6" }} />
          <span style={{ ...heading, fontWeight: 700, fontSize: 14, color: "#fff" }}>PageAudit Pro</span>
        </div>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          {/* RADAR */}
          <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 32px" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid rgba(37,99,235,0.3)", animation: "radar 2.4s ease-out infinite", animationDelay: `${i * 0.8}s` }} />
            ))}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 40, height: 40, borderRadius: "50%", background: "rgba(37,99,235,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#2563eb" }} />
            </div>
          </div>

          <h1 style={{ ...heading, fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
            {businessName ? `Scanning ${businessName}...` : "Running your full audit..."}
          </h1>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 28 }}>Complete 47-point business audit in progress</p>

          {/* PROGRESS */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#2563eb,#60a5fa)", width: `${Math.min(progress, 100)}%`, transition: "width 0.3s ease-out", animation: "glow 2s ease-in-out infinite" }} />
            </div>
          </div>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 28 }}>{Math.min(Math.round(progress), 100)}%</p>

          {/* STATUS MESSAGE */}
          <div style={{ height: 24, marginBottom: 28 }}>
            <p key={msgIndex} style={{ color: "#94a3b8", fontSize: 15, fontWeight: 500, animation: "msgFade 2s ease-in-out" }}>{MESSAGES[msgIndex]}</p>
          </div>

          {/* PLATFORM CHECKS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left", maxWidth: 340, margin: "0 auto 40px" }}>
            {PLATFORMS.map((p, i) => {
              if (!visibleRows.has(i)) return <div key={i} style={{ height: 36 }} />;
              const done = doneRows.has(i);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, animation: "fadeIn 0.4s ease-out" }}>
                  <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>{p.emoji}</span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: done ? "#c8d0dc" : "#94a3b8" }}>{p.label}</span>
                  {done ? <CheckCircle style={{ width: 18, height: 18, color: "#10b981" }} /> : <div style={{ width: 18, height: 18, border: "2px solid rgba(37,99,235,0.3)", borderTop: "2px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
                </div>
              );
            })}
          </div>

          <p style={{ color: "#4b5563", fontSize: 12 }}>This usually takes 30–60 seconds. You'll be redirected automatically.</p>
        </div>
      </div>
    </div>
  );
}
