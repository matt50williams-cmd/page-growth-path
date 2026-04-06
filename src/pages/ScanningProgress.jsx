import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BarChart2, CheckCircle, AlertCircle } from "lucide-react";

const MESSAGES = [
  "Checking Google Business Profile...",
  "Analyzing your star ratings...",
  "Scanning Yelp listings...",
  "Testing website performance...",
  "Checking NAP consistency...",
  "Running competitor analysis...",
  "Generating AI insights...",
  "Building your report...",
];

const PLATFORMS = [
  { emoji: "🔍", label: "Google Business Profile", delay: 500, doneDelay: 2000 },
  { emoji: "⭐", label: "Yelp", delay: 2000, doneDelay: 3500 },
  { emoji: "🌐", label: "Website Performance", delay: 3500, doneDelay: 5000 },
  { emoji: "📍", label: "NAP Consistency", delay: 5000, doneDelay: 6500 },
  { emoji: "🤖", label: "AI Analysis", delay: 6500, doneDelay: 8000 },
];

const API_BASE = "https://pageaudit-engine.onrender.com";

export default function ScanningProgress() {
  const location = useLocation();
  const navigate = useNavigate();
  const { businessName, city, state } = location.state || {};
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

  // Progress bar: 0→95 over 20s (accommodates Render cold start)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 95) { clearInterval(interval); return 95; }
        return p + (95 / 200); // ~200 ticks over 20s at 100ms
      });
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

  // API call
  useEffect(() => {
    if (!businessName) { setError("No business name provided."); return; }
    const controller = new AbortController();
    const timeout = setTimeout(() => { controller.abort(); setError("Scan timed out. The server may be waking up — please try again in 30 seconds."); }, 90000);

    const scanUrl = `${API_BASE}/api/scan/teaser`;
    console.log("[SCAN] Calling:", scanUrl, { businessName, city, state });

    fetch(scanUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessName: businessName || "", city: city || "", state: state || "" }),
      signal: controller.signal,
    })
      .then(async (r) => {
        console.log("[SCAN] Response status:", r.status);
        if (!r.ok) {
          const errText = await r.text().catch(() => "");
          console.error("[SCAN] Error body:", errText);
          throw new Error(`Scan failed (${r.status}): ${errText.slice(0, 200)}`);
        }
        return r.json();
      })
      .then(data => {
        console.log("[SCAN] Success. Keys:", Object.keys(data));
        clearTimeout(timeout);
        scanDataRef.current = data;
        scanDone.current = true;
        try {
          localStorage.setItem("pageaudit_business_data", JSON.stringify({
            businessName: data.businessName || data.google?.name || businessName,
            address: data.address || data.google?.address || "",
            phone: data.phone || data.google?.phone || "",
            website: data.website || data.google?.website || "",
            city: city,
            state: state,
            placeId: data.placeId || data.google?.placeId || "",
            rating: data.rating || data.google?.rating || null,
            reviewCount: data.reviewCount || data.google?.reviewCount || null,
          }));
        } catch {}
      })
      .catch(err => {
        console.error("[SCAN] Catch:", err.message);
        clearTimeout(timeout);
        if (err.name !== "AbortError") setError(err.message || "Scan failed. Please try again.");
      });

    return () => { clearTimeout(timeout); controller.abort(); };
  }, [businessName, city, state]);

  // Navigate when both animation and API are done
  useEffect(() => {
    const check = setInterval(() => {
      if (scanDone.current && progress >= 90) {
        clearInterval(check);
        setProgress(100);
        setTimeout(() => {
          const sd = scanDataRef.current;
          navigate("/teaser-results", { state: { businessName: sd?.google?.name || businessName || "", city, state, scanData: sd, businessData: { address: sd?.google?.address || "", phone: sd?.google?.phone || "", website: sd?.google?.website || "", placeId: sd?.google?.placeId || "" } } });
        }, 500);
      }
    }, 200);
    return () => clearInterval(check);
  }, [progress, navigate, businessName]);

  const heading = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
  const body = { fontFamily: "'Inter', sans-serif" };

  if (error) return (
    <div style={{ ...body, minHeight: "100vh", background: "#0a0f1e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 400, padding: 20 }}>
        <AlertCircle style={{ width: 48, height: 48, color: "#ef4444", margin: "0 auto 16px", display: "block" }} />
        <h2 style={{ ...heading, color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Scan Failed</h2>
        <p style={{ color: "#94a3b8", fontSize: 15, marginBottom: 24 }}>{error}</p>
        <button onClick={() => navigate("/")} style={{ background: "#2563eb", color: "#fff", border: "none", padding: "12px 32px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Try Again</button>
      </div>
    </div>
  );

  return (
    <div style={{ ...body, minHeight: "100vh", background: "#0a0f1e", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes radar { 0% { transform: scale(0.3); opacity: 0.6; } 100% { transform: scale(1.2); opacity: 0; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 8px rgba(37,99,235,0.4); } 50% { box-shadow: 0 0 20px rgba(37,99,235,0.8); } }
        @keyframes msgFade { 0% { opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { opacity: 0; } }
      `}</style>

      {/* NAV */}
      <nav style={{ padding: "16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <BarChart2 style={{ width: 18, height: 18, color: "#3b82f6" }} />
          <span style={{ ...heading, fontWeight: 700, fontSize: 14, color: "#fff" }}>PageAudit Pro</span>
        </div>
      </nav>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>

          {/* RADAR PULSE */}
          <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 32px" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                border: "2px solid rgba(37,99,235,0.3)",
                animation: `radar 2.4s ease-out infinite`,
                animationDelay: `${i * 0.8}s`,
              }} />
            ))}
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              width: 40, height: 40, borderRadius: "50%", background: "rgba(37,99,235,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#2563eb" }} />
            </div>
          </div>

          {/* BUSINESS NAME */}
          <h1 style={{ ...heading, fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 32 }}>
            Scanning {businessName || "your business"}...
          </h1>

          {/* PROGRESS BAR */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #2563eb, #60a5fa)",
                width: `${Math.min(progress, 100)}%`, transition: "width 0.3s ease-out",
                animation: "glow 2s ease-in-out infinite",
              }} />
            </div>
          </div>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 32 }}>{Math.min(Math.round(progress), 100)}%</p>

          {/* STATUS MESSAGE */}
          <div style={{ height: 24, marginBottom: 32 }}>
            <p key={msgIndex} style={{ color: "#94a3b8", fontSize: 15, fontWeight: 500, animation: "msgFade 2s ease-in-out" }}>
              {MESSAGES[msgIndex]}
            </p>
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
                  {done ? (
                    <CheckCircle style={{ width: 18, height: 18, color: "#10b981" }} />
                  ) : (
                    <div style={{ width: 18, height: 18, border: "2px solid rgba(37,99,235,0.3)", borderTop: "2px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* BOTTOM TEXT */}
          <p style={{ color: "#4b5563", fontSize: 12 }}>This usually takes 15–30 seconds</p>
        </div>
      </div>
    </div>
  );
}
