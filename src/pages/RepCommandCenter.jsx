import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { BarChart2, Home, ClipboardList, MapPin, Trophy, Wrench, Phone, MessageSquare, Check, ChevronRight, Search, X, Copy, QrCode, CheckCircle, ArrowRight } from "lucide-react";

// ── STORAGE HELPERS ──
const S = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(`rep_${k}`) || "null") || d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(`rep_${k}`, JSON.stringify(v)); } catch {} },
};
const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

// ── BADGE DEFS ──
const BADGES = [
  { id: "first_close", emoji: "🎯", name: "First Close", desc: "Close your first sale", check: (s) => s.totalCloses >= 1 },
  { id: "10_day", emoji: "💪", name: "10 in a Day", desc: "10 visits in one day", check: (s) => s.todayVisits >= 10 },
  { id: "streak_3", emoji: "🔥", name: "3 Day Streak", desc: "3 days in a row", check: (s) => s.streak >= 3 },
  { id: "streak_5", emoji: "🔥", name: "5 Day Streak", desc: "5 days in a row", check: (s) => s.streak >= 5 },
  { id: "earn_500", emoji: "💰", name: "First $500", desc: "Earn $500 total", check: (s) => s.totalEarnings >= 500 },
  { id: "earn_1000", emoji: "💰", name: "First $1,000", desc: "Earn $1,000 total", check: (s) => s.totalEarnings >= 1000 },
  { id: "close_10", emoji: "🏆", name: "10 Closes", desc: "Close 10 total sales", check: (s) => s.totalCloses >= 10 },
  { id: "close_25", emoji: "🏆", name: "25 Closes", desc: "Close 25 total sales", check: (s) => s.totalCloses >= 25 },
  { id: "close_50", emoji: "🏆", name: "50 Closes", desc: "Close 50 total sales", check: (s) => s.totalCloses >= 50 },
];
const LEVELS = [
  { min: 0, max: 5, name: "Rookie", emoji: "🌱" }, { min: 6, max: 15, name: "Rising Star", emoji: "⭐" },
  { min: 16, max: 30, name: "Pro", emoji: "💪" }, { min: 31, max: 50, name: "Elite", emoji: "🔥" },
  { min: 51, max: 100, name: "Legend", emoji: "🏆" }, { min: 101, max: 99999, name: "Hall of Fame", emoji: "👑" },
];
const getLevel = (c) => LEVELS.find(l => c >= l.min && c <= l.max) || LEVELS[0];

const OUTCOMES = [
  { key: "closed", emoji: "🟢", label: "CLOSED — They bought!", color: "#10b981" },
  { key: "follow_up", emoji: "🔵", label: "FOLLOW UP — Interested", color: "#3b82f6" },
  { key: "demo", emoji: "🟡", label: "DEMO SHOWN — Thinking", color: "#f59e0b" },
  { key: "not_interested", emoji: "🔴", label: "NOT INTERESTED", color: "#ef4444" },
  { key: "not_available", emoji: "⚫", label: "NOT AVAILABLE", color: "#64748b" },
];

const INDUSTRIES = ["Restaurant","Plumber","Electrician","HVAC","Roofer","Dentist","Salon","Auto Repair","Gym","Lawyer","Real Estate","Landscaper","Cleaning","Vet","Spa","Other"];

const API_BASE = "https://pageaudit-engine.onrender.com";

const MOTIVATION = [
  "Every no gets you closer to a yes. Keep going 💪",
  "Top reps hear 7 no's per close. You might be one away.",
  "Move on fast. The next business might be your best close today.",
  "Not interested today doesn't mean not interested forever. Come back in 30 days.",
  "Their loss. Next! 🚀",
  "Rejection is data, not defeat. Learn and move on.",
  "The money is in the follow ups. Today's no is next month's yes.",
];

const TIME_TIPS = {
  early: "Early bird! Catch business owners before they get busy. Great time for coffee shops, bakeries, and breakfast spots.",
  morning: "Prime morning hours. Most businesses open and owners available. Lead with the free scan.",
  lunch: "Avoid restaurants — they're in lunch rush. Hit retail, services, offices, and salons.",
  afternoon: "Best hours of the day. Owners relaxed, not too busy. Your highest close rate window.",
  evening: "Afternoon push. Close rate stays strong. Owners winding down — more time to talk.",
  night: "Great job today! Time to log your follow ups and prep for tomorrow.",
};

const DAILY_QUOTES = [
  "The difference between a good rep and a great rep is 5 more visits a day.",
  "Nobody ever closed a deal from their car. Get out and knock.",
  "Your competition is still in bed. You're already winning.",
  "Every door you skip is money left on the table.",
  "The best time to sell was yesterday. The second best time is right now.",
  "Consistency beats talent. Show up every day.",
  "The business owner who says no today might say yes next month. Log everything.",
  "Your rep link is a 24/7 salesperson. Send it to everyone you meet.",
  "Revenue is a lagging indicator. Activity is the leading one. Move your feet.",
  "The scan does the selling. You just need to get them to look.",
];

function getTimeTip() {
  const h = new Date().getHours();
  if (h < 8) return TIME_TIPS.early;
  if (h < 11) return TIME_TIPS.morning;
  if (h < 13) return TIME_TIPS.lunch;
  if (h < 16) return TIME_TIPS.afternoon;
  if (h < 18) return TIME_TIPS.evening;
  return TIME_TIPS.night;
}

const DEMO_DATA = {
  businessName: "Example Restaurant", city: "Your City", state: "",
  preliminaryScore: 42, scoreLabel: "Critical",
  google: { found: true, score: 42, rating: 3.8, reviewCount: 12, hasHours: false, photoCount: 4, businessStatus: "OPERATIONAL" },
  findings: [
    { platform: "Google", severity: "critical", title: "3.8-star rating is hurting your business", description: "Below the 4.0 threshold. Customers filter by 4+ stars." },
    { platform: "NAP Consistency", severity: "critical", title: "Wrong phone number on 8 directories", description: "Your phone number doesn't match on Bing, Apple Maps, and 6 other platforms." },
    { platform: "Website", severity: "critical", title: "Website loads in 8 seconds on mobile", description: "Google penalizes slow websites. Average loads in under 2 seconds." },
    { platform: "Facebook", severity: "warning", title: "No Facebook posts in 60 days", description: "Inactive pages signal to customers your business may not be active." },
    { platform: "Google", severity: "warning", title: "Only 4 photos on Google listing", description: "Google recommends at least 10 photos for business listings." },
  ],
};

const OBJECTIONS = [
  { q: "\"I'm not interested\"", a: "Totally fair. Can I just show you your score real quick? It's free and takes 60 seconds. Most business owners are surprised by what we find." },
  { q: "\"How much does it cost?\"", a: "The full report is $99 today. That's less than one lost customer. Most business owners make that back the same week." },
  { q: "\"I need to think about it\"", a: "Absolutely. Let me send you the link so you can look anytime. What's the best number to text you?" },
  { q: "\"I don't have time right now\"", a: "The scan takes 60 seconds. Can I show you your score real quick? If it looks good I'll be out of your hair in two minutes." },
  { q: "\"Is this a scam?\"", a: "The scan is free — no card, no account. Just type your business name. If you don't like what you see you owe us nothing." },
  { q: "\"I tried this before\"", a: "Most tools give a score and leave you hanging. We give you the exact fix for every issue, step by step. Want to see?" },
  { q: "\"I don't have money\"", a: "Every day these issues stay unfixed is another customer choosing your competitor. Can I show you the free scan? No obligation." },
];

export default function RepCommandCenter() {
  const navigate = useNavigate();
  const { user, isLoadingAuth } = useAuth();
  const [tab, setTab] = useState("today");
  const [showBriefing, setShowBriefing] = useState(false);
  const [preScanBiz, setPreScanBiz] = useState("");
  const [preScanCity, setPreScanCity] = useState("");
  const [preScanResult, setPreScanResult] = useState(null);
  const [preScanLoading, setPreScanLoading] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [rejectionMsg, setRejectionMsg] = useState(null);
  const [followUpText, setFollowUpText] = useState(null);
  const [earnSlider, setEarnSlider] = useState(10);
  const [subRate, setSubRate] = useState(30);
  const [visits, setVisits] = useState(S.get("visits", []));
  const [contacts, setContacts] = useState(S.get("contacts", []));
  const [territory, setTerritory] = useState(S.get("territory", []));
  const [badges, setBadges] = useState(S.get("badges", []));
  const [streak, setStreak] = useState(S.get("streak", { count: 0, lastDate: "" }));
  const [celebration, setCelebration] = useState(null);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(null);
  const [openObj, setOpenObj] = useState(null);
  const [newArea, setNewArea] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [contactFilter, setContactFilter] = useState("all");
  const [visitForm, setVisitForm] = useState({ businessName: "", ownerName: "", phone: "", address: "", industry: "", outcome: "", notes: "", followUpDate: "", linkSent: false });

  const repName = user?.full_name || "Rep";
  const repCode = S.get("rep_code", "");
  const repLink = repCode ? `pageauditpros.com/scan?rep=${repCode}` : "pageauditpros.com/scan";

  useEffect(() => {
    const link = document.createElement("link"); link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => { if (!isLoadingAuth && !user) navigate("/login"); }, [user, isLoadingAuth]);

  // Offline sync queue processor
  useEffect(() => {
    const processQueue = async () => {
      const queue = S.get("sync_queue", []);
      if (!queue.length) return;
      const token = localStorage.getItem("pageaudit_token");
      if (!token) return;
      const failed = [];
      for (const item of queue) {
        try {
          await fetch(`${API_BASE}/api/reps/businesses`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(item.data) });
        } catch { item.attempts = (item.attempts || 0) + 1; if (item.attempts < 5) failed.push(item); }
      }
      S.set("sync_queue", failed);
    };
    processQueue();
    const interval = setInterval(processQueue, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Morning briefing check
  useEffect(() => {
    const h = new Date().getHours();
    const briefingKey = `briefing_shown_${todayStr}`;
    if (h < 11 && !S.get(briefingKey, false) && visits.length > 0) {
      setShowBriefing(true);
    }
  }, []);

  // Persist
  useEffect(() => { S.set("visits", visits); }, [visits]);
  useEffect(() => { S.set("contacts", contacts); }, [contacts]);
  useEffect(() => { S.set("territory", territory); }, [territory]);
  useEffect(() => { S.set("badges", badges); }, [badges]);
  useEffect(() => { S.set("streak", streak); }, [streak]);

  // Computed
  const todayStr = today();
  const todayVisits = visits.filter(v => v.date === todayStr);
  const todayCloses = todayVisits.filter(v => v.outcome === "closed").length;
  const todayEarnings = todayCloses * 60;
  const totalCloses = visits.filter(v => v.outcome === "closed").length;
  const totalEarnings = totalCloses * 60;
  const totalVisits = visits.length;
  const closeRate = totalVisits > 0 ? Math.round((totalCloses / totalVisits) * 100) : 0;
  const level = getLevel(totalCloses);
  const nextLevel = LEVELS.find(l => l.min > totalCloses) || LEVELS[LEVELS.length - 1];
  const levelProgress = nextLevel.min > level.min ? Math.min(((totalCloses - level.min) / (nextLevel.min - level.min)) * 100, 100) : 100;
  const followUps = visits.filter(v => v.outcome === "follow_up" && v.followUpDate && v.followUpDate <= todayStr && !v.followUpDone);
  const weekVisits = visits.filter(v => { const d = new Date(v.date + "T12:00:00"); const now = new Date(); const diff = (now - d) / 86400000; return diff < 7; });
  const weekCloses = weekVisits.filter(v => v.outcome === "closed").length;

  const checkBadges = useCallback((stats) => {
    const earned = [...badges];
    let newBadge = null;
    BADGES.forEach(b => { if (!earned.includes(b.id) && b.check(stats)) { earned.push(b.id); newBadge = b; } });
    if (newBadge) { setBadges(earned); setToast(`🏆 Badge Earned: ${newBadge.name}!`); setTimeout(() => setToast(null), 3000); }
  }, [badges]);

  const updateStreak = useCallback(() => {
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yd = yesterday.toISOString().split("T")[0];
    if (streak.lastDate === todayStr) return streak.count;
    if (streak.lastDate === yd) { const n = { count: streak.count + 1, lastDate: todayStr }; setStreak(n); return n.count; }
    const n = { count: 1, lastDate: todayStr }; setStreak(n); return 1;
  }, [streak, todayStr]);

  const saveVisit = () => {
    if (!visitForm.businessName || !visitForm.outcome) return;
    const v = { ...visitForm, id: Date.now(), date: todayStr, time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) };
    const updated = [v, ...visits];
    setVisits(updated);
    // Save contact
    if (visitForm.businessName) {
      const existing = contacts.findIndex(c => c.businessName === visitForm.businessName);
      const contact = { businessName: visitForm.businessName, ownerName: visitForm.ownerName, phone: visitForm.phone, address: visitForm.address, industry: visitForm.industry, outcome: visitForm.outcome, lastContact: todayStr, notes: visitForm.notes };
      if (existing >= 0) { const u = [...contacts]; u[existing] = { ...u[existing], ...contact }; setContacts(u); }
      else setContacts([contact, ...contacts]);
    }
    const s = updateStreak();
    const stats = { todayVisits: todayVisits.length + 1, totalCloses: totalCloses + (visitForm.outcome === "closed" ? 1 : 0), totalEarnings: totalEarnings + (visitForm.outcome === "closed" ? 60 : 0), streak: s };
    checkBadges(stats);
    if (visitForm.outcome === "closed") { setCelebration(true); setTimeout(() => setCelebration(false), 2500); }
    else if (visitForm.outcome === "not_interested") { setRejectionMsg(MOTIVATION[Math.floor(Math.random() * MOTIVATION.length)]); setTimeout(() => setRejectionMsg(null), 4000); }
    // Sync to backend
    try {
      const token = localStorage.getItem("pageaudit_token");
      if (token) {
        // Sync visit
        fetch(`${API_BASE}/api/reps/visits`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ business_name: visitForm.businessName, owner_name: visitForm.ownerName, phone: visitForm.phone, address: visitForm.address, industry: visitForm.industry, outcome: visitForm.outcome, notes: visitForm.notes, follow_up_date: visitForm.followUpDate || null, rep_link_sent: visitForm.linkSent }) }).catch(() => {});
        // Sync business record with all contact data
        const statusMap = { closed: "client", follow_up: "following_up", demo: "assessed", not_interested: "not_a_fit", not_available: "prospect" };
        fetch(`${API_BASE}/api/reps/businesses`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({
          business_name: visitForm.businessName, address: visitForm.address, phone: visitForm.phone, industry: visitForm.industry,
          owner_first_name: visitForm.ownerName?.split(" ")[0] || null, owner_last_name: visitForm.ownerName?.split(" ").slice(1).join(" ") || null,
          status: statusMap[visitForm.outcome] || "prospect", interest_level: visitForm.outcome === "closed" ? "hot" : visitForm.outcome === "follow_up" ? "warm" : visitForm.outcome === "demo" ? "warm" : "cold",
          follow_up_date: visitForm.followUpDate || null, notes: visitForm.notes,
          last_scan_score: preScanResult?.preliminaryScore || null, last_scan_data: preScanResult || null, last_scanned_at: preScanResult ? new Date().toISOString() : null,
        }) }).catch(err => {
          // Queue for offline retry
          const queue = S.get("sync_queue", []);
          queue.push({ id: Date.now(), type: "business_record", data: visitForm, attempts: 0 });
          S.set("sync_queue", queue);
        });
      }
    } catch {}
    setVisitForm({ businessName: "", ownerName: "", phone: "", address: "", industry: "", outcome: "", notes: "", followUpDate: "", linkSent: false });
    if (visitForm.outcome !== "closed") setTab("today");
  };

  const copy = (t, k) => { navigator.clipboard.writeText(t); setCopied(k); setTimeout(() => setCopied(null), 2000); };

  const runPreScan = async (name, city) => {
    if (!name) return;
    setPreScanLoading(true); setPreScanResult(null);
    try {
      const token = localStorage.getItem("pageaudit_token");
      const res = await fetch(`${API_BASE}/api/scan/prescan`, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ businessName: name, city: city || "" }) });
      if (!res.ok) throw new Error("Scan failed");
      setPreScanResult(await res.json());
    } catch { setPreScanResult({ error: true }); }
    finally { setPreScanLoading(false); }
  };

  const findNearby = async () => {
    setNearbyLoading(true); setNearbyPlaces([]);
    try {
      const pos = await new Promise((ok, fail) => navigator.geolocation.getCurrentPosition(ok, fail, { timeout: 8000 }));
      const res = await fetch(`${API_BASE}/api/scan/nearby?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`);
      const data = await res.json();
      setNearbyPlaces(data.places || []);
    } catch { setNearbyPlaces([]); }
    finally { setNearbyLoading(false); }
  };

  const generateOpening = (result) => {
    if (!result?.google) return "";
    const s = result.preliminaryScore || result.google.score || 0;
    const issues = (result.findings || []).filter(f => f.severity !== "good").length;
    const biz = result.businessName || result.google.name || "your business";
    if (s < 50) return `Hi, I'm ${repName} with The Agency. I just ran a quick scan on ${biz} and your online presence score is ${s} out of 100 — that means customers searching for you online are having trouble finding you. You have ${issues} critical issues right now. Can I show you? Takes 60 seconds.`;
    if (s < 70) return `Hi, I'm ${repName} with The Agency. I just scanned ${biz} and found ${issues} issues affecting your online presence. Your score is ${s} out of 100 — there's real room to improve and I can show you exactly how. Takes 60 seconds.`;
    return `Hi, I'm ${repName} with The Agency. I just scanned ${biz} — you're actually doing pretty well online with a ${s} out of 100. But I found ${issues} specific things your competitors are beating you on. Want to see?`;
  };
  const H = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
  const card = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16 };
  const btn48 = { minHeight: 48, borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%" };

  if (isLoadingAuth) return <div style={{ minHeight: "100vh", background: "#0a0f1e", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 32, height: 32, border: "3px solid rgba(37,99,235,0.2)", borderTop: "3px solid #2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /><style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "'Inter', sans-serif", paddingBottom: 72 }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} @keyframes confetti{0%{transform:translateY(0) rotate(0)}100%{transform:translateY(100vh) rotate(720deg)}}`}</style>

      {/* CELEBRATION OVERLAY */}
      {celebration && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(16,185,129,0.95)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.3s" }}>
          <span style={{ fontSize: 80, marginBottom: 16 }}>🎉</span>
          <p style={{ ...H, fontSize: 36, fontWeight: 800, color: "#fff", marginBottom: 8 }}>CLOSED!</p>
          <p style={{ fontSize: 20, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>You earned $60!</p>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 150, background: "#f97316", color: "#fff", padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, animation: "fadeIn 0.3s", boxShadow: "0 4px 20px rgba(249,115,22,0.4)" }}>
          {toast}
        </div>
      )}

      {/* HEADER */}
      <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BarChart2 style={{ width: 18, height: 18, color: "#3b82f6" }} />
          <span style={{ ...H, fontWeight: 700, fontSize: 14, color: "#fff" }}>PageAudit Pro</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ ...H, fontSize: 13, fontWeight: 700, color: level.emoji === "👑" ? "#f59e0b" : "#94a3b8" }}>{level.emoji} {level.name}</span>
        </div>
      </div>

      <div style={{ padding: "0 20px", maxWidth: 600, margin: "0 auto" }}>

        {/* ═══ TODAY ═══ */}
        {tab === "today" && (
          <div style={{ paddingTop: 20 }}>
            <h1 style={{ ...H, fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {repName.split(" ")[0]}! 💪</h1>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>

            {/* MISSION CARD */}
            <div style={{ ...card, borderLeft: "4px solid #f97316", marginBottom: 20 }}>
              <p style={{ ...H, fontSize: 13, fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Today's Mission</p>
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8", marginBottom: 4 }}><span>Visits</span><span>{todayVisits.length}/20</span></div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}><div style={{ height: "100%", background: "#3b82f6", borderRadius: 99, width: `${Math.min((todayVisits.length / 20) * 100, 100)}%`, transition: "width 0.3s" }} /></div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8", marginBottom: 4 }}><span>Closes</span><span>{todayCloses}/3</span></div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}><div style={{ height: "100%", background: "#10b981", borderRadius: 99, width: `${Math.min((todayCloses / 3) * 100, 100)}%`, transition: "width 0.3s" }} /></div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#10b981", fontSize: 20, fontWeight: 700 }}>${todayEarnings} today</span>
                {streak.count > 1 && <span style={{ background: "rgba(249,115,22,0.15)", color: "#f97316", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 99 }}>🔥 {streak.count} day streak</span>}
              </div>
            </div>

            {/* TIME TIP */}
            <div style={{ ...card, marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start", background: "rgba(37,99,235,0.06)", borderColor: "rgba(37,99,235,0.15)" }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>⏰</span>
              <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.5 }}>{getTimeTip()}</p>
            </div>

            {/* QUICK ACTIONS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { emoji: "⚡", label: "Pre-Scan", action: () => setTab("prescan"), bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.3)" },
                { emoji: "+", label: "Log a Visit", action: () => setTab("log") },
                { emoji: "🎬", label: "Run Demo", action: () => setShowDemo(true) },
                { emoji: "💬", label: "Objections", action: () => { setTab("tools"); } },
              ].map(({ emoji, label, action, bg, border }) => (
                <button key={label} onClick={action} style={{ ...card, minHeight: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", background: bg || card.background, border: `1px solid ${border || "rgba(255,255,255,0.08)"}` }}>
                  <span style={{ fontSize: emoji === "+" ? 28 : 24 }}>{emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#c8d0dc" }}>{label}</span>
                </button>
              ))}
            </div>

            {/* FOLLOW UPS DUE */}
            {followUps.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ ...H, fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 10 }}>Follow Ups Due <span style={{ background: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, marginLeft: 6 }}>{followUps.length}</span></p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {followUps.map(v => (
                    <div key={v.id} style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <p style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{v.businessName}</p>
                        <p style={{ color: "#64748b", fontSize: 12 }}>{v.ownerName || ""} {v.notes ? `· ${v.notes.slice(0, 40)}` : ""}</p>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {v.phone && <a href={`tel:${v.phone}`} style={{ ...card, padding: "6px 10px", fontSize: 11, color: "#3b82f6", fontWeight: 600, textDecoration: "none" }}>Call</a>}
                        <button onClick={() => { const u = visits.map(x => x.id === v.id ? { ...x, followUpDone: true } : x); setVisits(u); }} style={{ background: "rgba(16,185,129,0.15)", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, color: "#10b981", fontWeight: 600, cursor: "pointer" }}>Done</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TODAY'S ACTIVITY */}
            {todayVisits.length > 0 && (
              <div>
                <p style={{ ...H, fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 10 }}>Today's Activity</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {todayVisits.map(v => {
                    const o = OUTCOMES.find(x => x.key === v.outcome);
                    return (
                      <div key={v.id} style={{ ...card, padding: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <p style={{ color: "#c8d0dc", fontSize: 13, fontWeight: 600 }}>{v.businessName}</p>
                          <p style={{ color: "#4b5563", fontSize: 11 }}>{v.time}</p>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: o?.color || "#64748b", background: `${o?.color || "#64748b"}15`, padding: "3px 10px", borderRadius: 99 }}>{o?.key?.toUpperCase().replace("_", " ") || v.outcome}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ LOG VISIT ═══ */}
        {tab === "log" && (
          <div style={{ paddingTop: 20 }}>
            <h2 style={{ ...H, fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 20 }}>Log This Visit</h2>
            {[
              { l: "Business Name *", k: "businessName", p: "Business name" },
              { l: "Owner / Contact Name", k: "ownerName", p: "Their name" },
              { l: "Phone Number", k: "phone", p: "(555) 123-4567", t: "tel" },
              { l: "Address", k: "address", p: "123 Main St" },
            ].map(({ l, k, p, t }) => (
              <div key={k} style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 4 }}>{l}</label>
                <input type={t || "text"} value={visitForm[k]} onChange={e => setVisitForm(f => ({ ...f, [k]: e.target.value }))} placeholder={p}
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "#fff", outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 4 }}>Industry</label>
              <select value={visitForm.industry} onChange={e => setVisitForm(f => ({ ...f, industry: e.target.value }))}
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", fontSize: 14, color: visitForm.industry ? "#fff" : "#64748b", outline: "none", boxSizing: "border-box", appearance: "none" }}>
                <option value="" style={{ background: "#0f172a" }}>Select...</option>
                {INDUSTRIES.map(i => <option key={i} value={i} style={{ background: "#0f172a" }}>{i}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>Outcome *</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {OUTCOMES.map(o => (
                  <button key={o.key} onClick={() => setVisitForm(f => ({ ...f, outcome: o.key }))}
                    style={{ ...card, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", borderColor: visitForm.outcome === o.key ? o.color : "rgba(255,255,255,0.08)", background: visitForm.outcome === o.key ? `${o.color}10` : "rgba(255,255,255,0.03)" }}>
                    <span>{o.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: visitForm.outcome === o.key ? "#fff" : "#94a3b8" }}>{o.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 4 }}>Notes</label>
              <textarea value={visitForm.notes} onChange={e => setVisitForm(f => ({ ...f, notes: e.target.value }))} placeholder="What did they say? What's the hook?" rows={3}
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "#fff", outline: "none", boxSizing: "border-box", resize: "none" }} />
            </div>

            {visitForm.outcome === "follow_up" && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 4 }}>Follow Up Date</label>
                <input type="date" value={visitForm.followUpDate} onChange={e => setVisitForm(f => ({ ...f, followUpDate: e.target.value }))}
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "#fff", outline: "none", boxSizing: "border-box" }} />
              </div>
            )}

            <button onClick={saveVisit} disabled={!visitForm.businessName || !visitForm.outcome}
              style={{ ...btn48, background: "#f97316", color: "#fff", opacity: visitForm.businessName && visitForm.outcome ? 1 : 0.4, marginTop: 8 }}>
              Save Visit
            </button>
          </div>
        )}

        {/* ═══ TERRITORY ═══ */}
        {tab === "territory" && (
          <div style={{ paddingTop: 20 }}>
            <h2 style={{ ...H, fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>My Territory</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>{todayVisits.length} visits today · {totalVisits} all time</p>

            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <input type="text" value={newArea} onChange={e => setNewArea(e.target.value)} placeholder="Add area or street..."
                style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#fff", outline: "none" }} />
              <button onClick={() => { if (newArea.trim()) { setTerritory([...territory, { name: newArea.trim(), date: todayStr }]); setNewArea(""); } }}
                style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Add</button>
            </div>

            {territory.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>Areas Covered</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {territory.map((t, i) => (
                    <span key={i} style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 99, padding: "4px 12px", fontSize: 12, color: "#3b82f6", fontWeight: 600 }}>{t.name}</span>
                  ))}
                </div>
              </div>
            )}

            <p style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>All Visits</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {visits.slice(0, 50).map(v => {
                const o = OUTCOMES.find(x => x.key === v.outcome);
                return (
                  <div key={v.id} style={{ ...card, padding: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div><p style={{ color: "#c8d0dc", fontSize: 13, fontWeight: 600 }}>{v.businessName}</p><p style={{ color: "#4b5563", fontSize: 11 }}>{fmtDate(v.date)}</p></div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: o?.color || "#64748b", background: `${o?.color}15`, padding: "3px 8px", borderRadius: 99 }}>{o?.key?.replace("_", " ").toUpperCase()}</span>
                  </div>
                );
              })}
              {visits.length === 0 && <p style={{ color: "#4b5563", fontSize: 13 }}>No visits logged yet</p>}
            </div>
          </div>
        )}

        {/* ═══ STATS ═══ */}
        {tab === "stats" && (
          <div style={{ paddingTop: 20 }}>
            <h2 style={{ ...H, fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 20 }}>Your Performance</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
              {[
                { l: "Today Visits", v: todayVisits.length, c: "#3b82f6" },
                { l: "Today Closes", v: todayCloses, c: "#10b981" },
                { l: "This Week", v: weekVisits.length, c: "#3b82f6" },
                { l: "Week Closes", v: weekCloses, c: "#10b981" },
                { l: "All Time", v: totalVisits, c: "#94a3b8" },
                { l: "Total Closes", v: totalCloses, c: "#10b981" },
                { l: "Close Rate", v: `${closeRate}%`, c: closeRate >= 15 ? "#10b981" : "#f59e0b" },
                { l: "Earnings", v: `$${totalEarnings}`, c: "#10b981" },
              ].map(({ l, v, c }) => (
                <div key={l} style={{ ...card }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{l}</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: c }}>{v}</p>
                </div>
              ))}
            </div>

            {/* LEVEL */}
            <div style={{ ...card, marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ ...H, fontSize: 18, fontWeight: 700, color: "#fff" }}>{level.emoji} {level.name}</span>
                <span style={{ fontSize: 12, color: "#64748b" }}>Next: {nextLevel.emoji} {nextLevel.name}</span>
              </div>
              <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg, #f97316, #f59e0b)", borderRadius: 99, width: `${levelProgress}%`, transition: "width 0.5s" }} />
              </div>
              <p style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{totalCloses} closes · {nextLevel.min - totalCloses > 0 ? `${nextLevel.min - totalCloses} to next level` : "Max level!"}</p>
            </div>

            {/* BADGES */}
            <p style={{ ...H, fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Achievements</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
              {BADGES.map(b => {
                const earned = badges.includes(b.id);
                return (
                  <div key={b.id} style={{ ...card, opacity: earned ? 1 : 0.4, textAlign: "center", padding: 14 }}>
                    <span style={{ fontSize: 28, display: "block", marginBottom: 4 }}>{b.emoji}</span>
                    <p style={{ fontSize: 12, fontWeight: 700, color: earned ? "#fff" : "#64748b" }}>{b.name}</p>
                    <p style={{ fontSize: 10, color: "#4b5563" }}>{b.desc}</p>
                    <p style={{ fontSize: 10, fontWeight: 700, color: earned ? "#10b981" : "#4b5563", marginTop: 4 }}>{earned ? "EARNED" : "LOCKED"}</p>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setTab("earn")} style={{ ...btn48, background: "rgba(249,115,22,0.1)", color: "#f97316", border: "1px solid rgba(249,115,22,0.3)", marginTop: 16 }}>💰 Earnings Calculator</button>
          </div>
        )}

        {/* ═══ CONTACTS ═══ */}
        {tab === "contacts" && (
          <div style={{ paddingTop: 20 }}>
            <h2 style={{ ...H, fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 12 }}>My Contacts</h2>
            <input type="text" value={contactSearch} onChange={e => setContactSearch(e.target.value)} placeholder="Search contacts..."
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#fff", outline: "none", boxSizing: "border-box", marginBottom: 12 }} />

            <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto" }}>
              {["all", "follow_up", "closed", "demo", "not_interested"].map(f => (
                <button key={f} onClick={() => setContactFilter(f)}
                  style={{ background: contactFilter === f ? "rgba(37,99,235,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${contactFilter === f ? "rgba(37,99,235,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 99, padding: "5px 12px", fontSize: 11, fontWeight: 600, color: contactFilter === f ? "#3b82f6" : "#64748b", cursor: "pointer", whiteSpace: "nowrap" }}>
                  {f === "all" ? "All" : f.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {contacts.filter(c => {
                if (contactFilter !== "all" && c.outcome !== contactFilter) return false;
                if (contactSearch && !c.businessName?.toLowerCase().includes(contactSearch.toLowerCase()) && !c.ownerName?.toLowerCase().includes(contactSearch.toLowerCase())) return false;
                return true;
              }).map((c, i) => {
                const o = OUTCOMES.find(x => x.key === c.outcome);
                return (
                  <div key={i} style={{ ...card }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div><p style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{c.businessName}</p>{c.ownerName && <p style={{ color: "#64748b", fontSize: 12 }}>{c.ownerName}</p>}</div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: o?.color, background: `${o?.color}15`, padding: "2px 8px", borderRadius: 99, height: "fit-content" }}>{o?.key?.replace("_", " ").toUpperCase()}</span>
                    </div>
                    {c.phone && <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 6 }}>{c.phone}</p>}
                    <div style={{ display: "flex", gap: 6 }}>
                      {c.phone && <a href={`tel:${c.phone}`} style={{ ...card, padding: "6px 12px", fontSize: 11, color: "#3b82f6", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}><Phone style={{ width: 12, height: 12 }} /> Call</a>}
                      {c.phone && <a href={`sms:${c.phone}&body=${encodeURIComponent(`Hey! Here's your free business scan: ${repLink}`)}`} style={{ ...card, padding: "6px 12px", fontSize: 11, color: "#10b981", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}><MessageSquare style={{ width: 12, height: 12 }} /> Text</a>}
                    </div>
                  </div>
                );
              })}
              {contacts.length === 0 && <p style={{ color: "#4b5563", fontSize: 13 }}>No contacts yet. Log visits to build your contact list.</p>}
            </div>
          </div>
        )}

        {/* ═══ TOOLS ═══ */}
        {tab === "tools" && (
          <div style={{ paddingTop: 20 }}>
            <h2 style={{ ...H, fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Sales Tools</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Scripts, objections, and links</p>

            {/* DOOR SCRIPT */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ ...H, fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 10 }}>Your Door Script</p>
              <div style={{ borderLeft: "3px solid #2563eb", background: "rgba(37,99,235,0.06)", borderRadius: "0 10px 10px 0", padding: 14, marginBottom: 8 }}>
                <p style={{ color: "#c8d0dc", fontSize: 14, lineHeight: 1.6, fontStyle: "italic" }}>"Hi, I'm {repName} with The Agency. We do a free 60-second scan of how your business looks online — Google, Yelp, everything. Can I show you what we find?"</p>
              </div>
              <button onClick={() => copy(`Hi, I'm ${repName} with The Agency. We do a free 60-second scan of how your business looks online — Google, Yelp, everything. Can I show you what we find?`, "script")}
                style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 14px", fontSize: 11, fontWeight: 600, color: copied === "script" ? "#10b981" : "#64748b", cursor: "pointer" }}>
                {copied === "script" ? "Copied!" : "Copy Script"}
              </button>
            </div>

            {/* OBJECTIONS */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ ...H, fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 10 }}>Objection Responses</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {OBJECTIONS.map((o, i) => (
                  <div key={i} style={{ ...card, overflow: "hidden", padding: 0 }}>
                    <button onClick={() => setOpenObj(openObj === i ? null : i)}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#3b82f6" }}>{o.q}</span>
                      <ChevronRight style={{ width: 14, height: 14, color: "#4b5563", flexShrink: 0, transition: "transform 0.2s", transform: openObj === i ? "rotate(90deg)" : "none" }} />
                    </button>
                    {openObj === i && <div style={{ padding: "0 14px 12px" }}><p style={{ color: "#c8d0dc", fontSize: 13, lineHeight: 1.5 }}>{o.a}</p></div>}
                  </div>
                ))}
              </div>
            </div>

            {/* LINKS */}
            <div>
              <p style={{ ...H, fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 10 }}>Your Links</p>
              <div style={{ ...card }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>
                  <code style={{ flex: 1, fontSize: 12, color: "#94a3b8" }}>{repLink}</code>
                  <button onClick={() => copy(repLink, "link")} style={{ background: copied === "link" ? "#10b981" : "#2563eb", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, color: "#fff", cursor: "pointer" }}>{copied === "link" ? "✓" : "Copy"}</button>
                </div>
                <button onClick={() => copy(`Hey! Here's your free business scan: ${repLink} Takes 60 seconds, completely free.`, "sms")}
                  style={{ ...btn48, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: copied === "sms" ? "#10b981" : "#94a3b8", fontSize: 12 }}>
                  <MessageSquare style={{ width: 14, height: 14 }} /> {copied === "sms" ? "Copied!" : "Copy SMS Template"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ PRE-SCAN ═══ */}
        {tab === "prescan" && (
          <div style={{ paddingTop: 20 }}>
            <h2 style={{ ...H, fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Pre-Scan Mode ⚡</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Know their score before you walk in</p>

            {!preScanResult ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                  <button onClick={findNearby} disabled={nearbyLoading} style={{ ...card, minHeight: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer" }}>
                    <span style={{ fontSize: 20 }}>{nearbyLoading ? "⏳" : "📍"}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8" }}>{nearbyLoading ? "Finding..." : "Nearby"}</span>
                  </button>
                  <button onClick={() => {}} style={{ ...card, minHeight: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer" }}>
                    <span style={{ fontSize: 20 }}>🔍</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8" }}>Type Name</span>
                  </button>
                </div>

                {nearbyPlaces.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>Nearby businesses:</p>
                    {nearbyPlaces.map((p, i) => (
                      <button key={i} onClick={() => { setPreScanBiz(p.name); setPreScanCity(""); runPreScan(p.name, ""); }}
                        style={{ ...card, width: "100%", padding: 12, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left" }}>
                        <div><p style={{ color: "#c8d0dc", fontSize: 13, fontWeight: 600 }}>{p.name}</p><p style={{ color: "#4b5563", fontSize: 11 }}>{p.address}</p></div>
                        {p.rating && <span style={{ color: "#f59e0b", fontSize: 12, fontWeight: 700 }}>⭐ {p.rating}</span>}
                      </button>
                    ))}
                  </div>
                )}

                <input type="text" value={preScanBiz} onChange={e => setPreScanBiz(e.target.value)} placeholder="Business name..."
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "#fff", outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
                <input type="text" value={preScanCity} onChange={e => setPreScanCity(e.target.value)} placeholder="City (optional)"
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "#fff", outline: "none", boxSizing: "border-box", marginBottom: 12 }} />
                <button onClick={() => runPreScan(preScanBiz, preScanCity)} disabled={!preScanBiz.trim() || preScanLoading}
                  style={{ ...btn48, background: "#f97316", color: "#fff", opacity: preScanBiz.trim() ? 1 : 0.4 }}>
                  {preScanLoading ? "Scanning..." : "Run Pre-Scan →"}
                </button>
              </>
            ) : preScanResult.error ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <p style={{ color: "#ef4444", fontSize: 14, marginBottom: 12 }}>Scan failed. Try again.</p>
                <button onClick={() => setPreScanResult(null)} style={{ ...btn48, background: "#2563eb", color: "#fff" }}>Try Again</button>
              </div>
            ) : (
              <div>
                {/* SCORE */}
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  {(() => { const s = preScanResult.preliminaryScore || 0; const c = s >= 70 ? "#10b981" : s >= 50 ? "#f59e0b" : "#ef4444"; const l = s >= 70 ? "Moderate Opportunity" : s >= 50 ? "Good Opportunity" : "High Opportunity"; return (
                    <div><p style={{ ...H, fontSize: 48, fontWeight: 800, color: c }}>{s}<span style={{ fontSize: 20, color: "#64748b" }}>/100</span></p>
                    <p style={{ color: "#c8d0dc", fontSize: 15, fontWeight: 700 }}>{preScanResult.businessName || preScanBiz}</p>
                    <p style={{ color: c, fontSize: 13, fontWeight: 600, marginTop: 4 }}>{l}</p></div>); })()}
                </div>

                {/* TOP FINDINGS */}
                <div style={{ marginBottom: 16 }}>
                  {(preScanResult.findings || []).filter(f => f.severity !== "good").slice(0, 3).map((f, i) => (
                    <div key={i} style={{ ...card, padding: 12, marginBottom: 6, display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span style={{ fontSize: 12, marginTop: 2 }}>{f.severity === "critical" ? "🔴" : "⚠️"}</span>
                      <p style={{ color: "#c8d0dc", fontSize: 13, lineHeight: 1.4 }}>{f.title}</p>
                    </div>
                  ))}
                </div>

                {/* OPENING LINE */}
                <div style={{ borderLeft: "3px solid #2563eb", background: "rgba(37,99,235,0.06)", borderRadius: "0 10px 10px 0", padding: 14, marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", marginBottom: 6 }}>Your Opening Line</p>
                  <p style={{ color: "#c8d0dc", fontSize: 13, lineHeight: 1.6, fontStyle: "italic" }}>"{generateOpening(preScanResult)}"</p>
                  <button onClick={() => copy(generateOpening(preScanResult), "opening")} style={{ marginTop: 8, background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 600, color: copied === "opening" ? "#10b981" : "#64748b", cursor: "pointer" }}>
                    {copied === "opening" ? "Copied!" : "📋 Copy Opening Line"}
                  </button>
                </div>

                {/* TIER SELECTOR */}
                <div style={{ marginBottom: 16 }}>
                  <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Select Package to Present</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                    {[
                      { key: "basic", price: "$99", label: "Basic", earn: "$49" },
                      { key: "standard", price: "$129", label: "Standard", earn: "$64", rec: true },
                      { key: "premium", price: "$149", label: "Premium", earn: "$74" },
                    ].map(t => (
                      <button key={t.key} onClick={() => localStorage.setItem("rep_selected_tier", t.key)}
                        style={{ ...card, padding: 10, textAlign: "center", cursor: "pointer", border: t.rec ? "1px solid rgba(249,115,22,0.4)" : "1px solid rgba(255,255,255,0.08)", background: t.rec ? "rgba(249,115,22,0.08)" : "rgba(255,255,255,0.03)" }}>
                        <p style={{ color: "#64748b", fontSize: 10, textDecoration: "line-through" }}>$299</p>
                        <p style={{ ...H, fontSize: 20, fontWeight: 800, color: "#fff" }}>{t.price}</p>
                        <p style={{ color: t.rec ? "#f97316" : "#94a3b8", fontSize: 10, fontWeight: 600 }}>{t.label}</p>
                        <p style={{ color: "#10b981", fontSize: 10, fontWeight: 600, marginTop: 2 }}>You earn {t.earn}</p>
                        {t.rec && <p style={{ color: "#f97316", fontSize: 8, fontWeight: 700, marginTop: 2 }}>RECOMMENDED</p>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ACTIONS */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button onClick={() => { setVisitForm(f => ({ ...f, businessName: preScanResult.businessName || preScanBiz, address: preScanResult.google?.address || "" })); setTab("log"); }}
                    style={{ ...btn48, background: "#f97316", color: "#fff" }}>Log This Visit</button>
                  <button onClick={() => navigate("/teaser-results", { state: { businessName: preScanResult.businessName || preScanBiz, scanData: preScanResult } })}
                    style={{ ...btn48, background: "#2563eb", color: "#fff" }}>Show Customer Their Scan</button>
                  <button onClick={() => { setPreScanResult(null); setPreScanBiz(""); setPreScanCity(""); setNearbyPlaces([]); }}
                    style={{ ...btn48, background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" }}>↩ Scan Another Business</button>
                </div>
                <p style={{ color: "#4b5563", fontSize: 10, textAlign: "center", marginTop: 8 }}>DEMO — Pre-scan data only</p>
              </div>
            )}
          </div>
        )}

        {/* ═══ EARNINGS CALC (inside Stats) ═══ */}
        {tab === "earn" && (
          <div style={{ paddingTop: 20 }}>
            <h2 style={{ ...H, fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 20 }}>Earnings Calculator</h2>
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>Closes per month: <strong style={{ color: "#fff" }}>{earnSlider}</strong></p>
              <input type="range" min={0} max={50} value={earnSlider} onChange={e => setEarnSlider(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "#f97316" }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>Subscribe to monthly: <strong style={{ color: "#fff" }}>{subRate}%</strong></p>
              <input type="range" min={0} max={100} value={subRate} onChange={e => setSubRate(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "#f97316" }} />
            </div>
            {(() => {
              const monthSubs = Math.round(earnSlider * (subRate / 100));
              const upfront = earnSlider * 60;
              const month1 = monthSubs * 20;
              const month6 = monthSubs * 6 * 20;
              const month12 = monthSubs * 12 * 20;
              return (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ ...card }}><p style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Upfront</p><p style={{ fontSize: 22, fontWeight: 700, color: "#10b981" }}>{"$"}{upfront}/mo</p></div>
                  <div style={{ ...card }}><p style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Residual Mo 1</p><p style={{ fontSize: 22, fontWeight: 700, color: "#3b82f6" }}>{"$"}{month1}/mo</p></div>
                  <div style={{ ...card }}><p style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Residual Mo 6</p><p style={{ fontSize: 22, fontWeight: 700, color: "#f97316" }}>{"$"}{month6} total</p></div>
                  <div style={{ ...card }}><p style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Residual Mo 12</p><p style={{ fontSize: 22, fontWeight: 700, color: "#f97316" }}>{"$"}{month12} total</p></div>
                </div>
              );
            })()}
            <p style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>After 12 months of {earnSlider} closes/mo you'd have <strong style={{ color: "#10b981" }}>{"$"}{Math.round(earnSlider * (subRate / 100)) * 20}/mo</strong> in passive income. Forever.</p>
            <button onClick={() => setTab("stats")} style={{ ...btn48, background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)", marginTop: 16 }}>Back to Stats</button>
          </div>
        )}
      </div>

      {/* Overlays rendered via portal-style positioning */}

      {/* ═══ BOTTOM NAV ═══ */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#111827", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", zIndex: 100 }}>
        {[
          { k: "today", emoji: "🏠", label: "Today" },
          { k: "prescan", emoji: "⚡", label: "Scan" },
          { k: "log", emoji: "📋", label: "Log" },
          { k: "stats", emoji: "📊", label: "Stats" },
          { k: "contacts", emoji: "👤", label: "Contacts" },
          { k: "tools", emoji: "🛠️", label: "Tools" },
        ].map(({ k, emoji, label }) => (
          <button key={k} onClick={() => { setTab(k); window.scrollTo(0, 0); }}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "10px 0", background: "none", border: "none", cursor: "pointer" }}>
            <span style={{ fontSize: 18 }}>{emoji}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: tab === k ? "#f97316" : "#4b5563" }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
