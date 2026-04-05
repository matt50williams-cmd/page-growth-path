import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart2, ArrowLeft, Copy, CheckCircle, ChevronRight, Link2, QrCode, MessageSquare } from "lucide-react";

const INDUSTRIES = [
  { key: "restaurant", emoji: "🍕", label: "Restaurant" },
  { key: "plumber", emoji: "🔧", label: "Plumber" },
  { key: "electrician", emoji: "⚡", label: "Electrician" },
  { key: "hvac", emoji: "❄️", label: "HVAC" },
  { key: "roofer", emoji: "🏠", label: "Roofer" },
  { key: "dentist", emoji: "🦷", label: "Dentist" },
  { key: "salon", emoji: "✂️", label: "Salon" },
  { key: "auto", emoji: "🚗", label: "Auto Repair" },
  { key: "gym", emoji: "💪", label: "Gym" },
  { key: "lawyer", emoji: "⚖️", label: "Lawyer" },
  { key: "realestate", emoji: "🏡", label: "Real Estate" },
  { key: "landscaper", emoji: "🌿", label: "Landscaper" },
  { key: "cleaning", emoji: "🧹", label: "Cleaning" },
  { key: "vet", emoji: "🐾", label: "Vet" },
  { key: "spa", emoji: "💆", label: "Spa" },
  { key: "other", emoji: "📦", label: "Other" },
];

const PITCHES = {
  restaurant: { opening: "When someone searches for a place to eat tonight they check Google reviews first. What do they find when they search yours?", pains: ["Rating under 4.5 loses customers to competitors", "Wrong hours = customers showing up when you're closed", "No photos = looks sketchy to new customers", "Unanswered reviews = looks like you don't care"], close: "For $99 I'll show you exactly why customers are choosing the restaurant down the street instead of yours.", demo: ["Ask their Google rating", "Run the free scan on your phone", "Show them the score", "Walk through top 3 findings"] },
  plumber: { opening: "When someone's pipe bursts at midnight they grab their phone and call whoever shows up first on Google. Is that you?", pains: ["Emergency searches happen 24/7", "Reviews determine who gets called first", "Most plumbers have weak online presence", "Competitors are stealing your calls right now"], close: "For $99 today I show you every problem and exactly how to fix it. That's less than one lost job.", demo: ["Ask their Google rating", "Run the free scan", "Show them the score", "Walk through top 3 findings"] },
  electrician: { opening: "Homeowners need to trust an electrician before they let them in their house. Your Google profile is their first impression. Want to see what it looks like right now?", pains: ["Trust is everything for home service", "License and credibility signals online matter", "Most electricians are invisible on Google Maps", "Competitors with more reviews win more bids"], close: "For $99 I'll show you every trust signal you're missing and exactly how to fix each one.", demo: ["Ask if they've claimed their Google profile", "Run the free scan", "Show them the trust gaps", "Explain how reviews drive calls"] },
  hvac: { opening: "When someone's AC dies in July they call whoever they find first on Google. Are you showing up?", pains: ["Seasonal searches spike — need peak visibility", "Emergency calls go to top Google results", "Review recency matters for ranking", "Most HVAC companies completely ignore their profile"], close: "For $99 before peak season you'll know exactly what to fix to capture more emergency calls.", demo: ["Ask about their seasonal volume", "Run the free scan", "Show the seasonal opportunity", "Walk through visibility gaps"] },
  roofer: { opening: "After every storm homeowners search for roofers immediately. Are you showing up when they search?", pains: ["Storm season drives huge search volume", "Trust is critical for large ticket purchases", "Competitors with more reviews win more bids", "Most roofers have almost no online presence"], close: "For $99 before storm season you'll know exactly what's costing you jobs and how to fix every issue.", demo: ["Ask about their busiest season", "Run the free scan", "Show them competitor gaps", "Explain how reviews drive large jobs"] },
  dentist: { opening: "New patients research dentists online before they ever call. What do they find when they search yours?", pains: ["Healthcare is the most review-sensitive industry", "New residents search for a dentist immediately", "Insurance changes drive new patient searches", "Profile photos directly affect patient trust"], close: "For $99 I'll show you every reason new patients are choosing another dentist and exactly how to fix it.", demo: ["Ask how they get new patients now", "Run the free scan", "Show review comparison", "Explain trust signals for healthcare"] },
  salon: { opening: "Women research salons extensively before booking. Photos, reviews, everything. What does yours look like online?", pains: ["Instagram not linked to Google loses bookings", "Photo quality directly affects booking decisions", "Response rate shows how you treat clients", "Competitors with more reviews book faster"], close: "For $99 I'll show you every gap in your online presence and the exact steps to fill them.", demo: ["Ask about their booking process", "Run the free scan", "Show photo and review gaps", "Explain how visibility drives bookings"] },
  auto: { opening: "Car trouble is stressful. People call the nearest shop they trust. Do you know what your Google profile looks like when they search?", pains: ["Reviews are #1 trust factor for auto repair", "Wrong hours listed = customers going elsewhere", "Photos of completed work build massive credibility", "Response to reviews shows professionalism"], close: "For $99 I'll show you every reason customers are choosing another shop and exactly how to fix it.", demo: ["Ask their Google rating", "Run the free scan", "Show trust factor gaps", "Walk through review strategy"] },
  gym: { opening: "New year resolutions, summer prep, life changes — people search for gyms online first. Is yours easy to find?", pains: ["Extremely competitive local market", "Trial visits start with a Google search", "Photos of your facility drive decisions", "Class schedule and hours must be accurate"], close: "For $99 I'll show you every reason people are joining the gym down the street instead of yours.", demo: ["Ask about their competition", "Run the free scan", "Show competitive gaps", "Explain how photos drive trials"] },
  lawyer: { opening: "People facing legal issues search frantically online. They call whoever looks most trustworthy. What does your profile say about you?", pains: ["Trust and credibility are absolutely everything", "Reviews from past clients drive calls", "Most law firms have incomplete profiles", "Practice area clarity affects search results"], close: "For $99 I'll show you every credibility gap in your online presence and exactly how to close each one.", demo: ["Ask about their practice areas", "Run the free scan", "Show credibility gaps", "Explain trust signals for legal"] },
  realestate: { opening: "Buyers and sellers Google their agent before they call. What shows up when they search your name?", pains: ["Personal brand is everything in real estate", "Reviews from past clients drive referrals", "Most agents invisible outside Zillow", "Competitors with better profiles win listings"], close: "For $99 I'll show you what clients see when they research you and exactly how to fix every gap.", demo: ["Search their name on Google", "Run the free scan", "Show what shows up vs competitors", "Walk through profile optimization"] },
  landscaper: { opening: "Homeowners search for landscapers every spring. Are you showing up when they search in your area?", pains: ["Seasonal business needs peak season visibility", "Before/after photos drive significantly more calls", "Neighborhood word of mouth starts online", "Most landscapers are invisible on Google Maps"], close: "For $99 before spring season you'll know exactly what to fix to capture more customers.", demo: ["Ask about their seasonal pattern", "Run the free scan", "Show visibility gaps", "Explain how photos drive calls"] },
  cleaning: { opening: "People let cleaning services into their home. Reviews are how they decide who to trust. How do yours look?", pains: ["Trust is the #1 purchase factor", "Review count and recency matter most", "Most cleaning services have weak profiles", "Competitors are getting found and you're not"], close: "For $99 I'll show you every trust signal you're missing and exactly how to build them.", demo: ["Ask how they get new clients", "Run the free scan", "Show trust factor gaps", "Walk through review strategy"] },
  vet: { opening: "Pet owners research vets carefully before their first visit. What do they find when they search yours?", pains: ["Pet owners are extremely protective of their animals", "Reviews about care and compassion drive visits", "Emergency search visibility matters greatly", "Photos of your facility build trust"], close: "For $99 I'll show you every reason pet owners are choosing another vet and exactly how to win them back.", demo: ["Ask about their new patient flow", "Run the free scan", "Show review sentiment", "Explain how care signals drive visits"] },
  spa: { opening: "People search for relaxation and trust. Your online presence needs to feel calm and professional. Does it?", pains: ["Gift searches drive huge spa bookings", "Photos are critical for spa booking decisions", "Review sentiment about atmosphere matters", "Most spas are invisible on Apple Maps"], close: "For $99 I'll show you every gap in your online presence and exactly how to create the premium image you deserve.", demo: ["Ask about their booking sources", "Run the free scan", "Show atmosphere and trust gaps", "Walk through premium positioning"] },
  other: { opening: "Every business has customers who search online before they buy. Do you know what they find when they search yours?", pains: ["Online presence affects every business", "Reviews build trust across all industries", "Competitors may be outranking you", "Most small businesses have incomplete profiles"], close: "For $99 I'll show you exactly what customers see when they search for you and how to fix every issue.", demo: ["Ask about their customer journey", "Run the free scan", "Show the gaps found", "Walk through the action plan"] },
};

const OBJECTIONS = [
  { q: "\"I'm not interested\"", a: "Totally fair. Can I just show you your score real quick? It's free and takes 60 seconds. If everything looks great you never have to think about it again. Most business owners are actually surprised by what we find." },
  { q: "\"I already have someone handling that\"", a: "That's great! Do you know what your current Google score is? Let me show you what we see from the outside — takes 60 seconds and it's free. Even if everything is perfect you'll know for sure." },
  { q: "\"How much does it cost?\"", a: "The full report is $99 today. That's less than one lost customer. And if you want us to keep monitoring it every month it's $49-99 depending on what you need. Most business owners make that back the same week." },
  { q: "\"I need to think about it\"", a: "Absolutely. Let me send you the link so you can look at your free scan results anytime. What's the best number to text you? I'll follow up in a couple days — no pressure at all." },
  { q: "\"Is this a scam?\"", a: "Totally understand the skepticism — there's a lot of that out there. The scan is completely free — no card, no account. Just type your business name and see what comes up. If you don't like what you see you owe us absolutely nothing." },
  { q: "\"I don't have time right now\"", a: "I completely get it — running a business is non-stop. The scan itself takes 60 seconds. Can I just show you your score real quick while I'm here? If it looks good I'll be out of your hair in two minutes." },
  { q: "\"I tried something like this before\"", a: "That's really common — most of these tools just give you a score and leave you hanging. What makes this different is we give you the exact fix for every single issue. Not just what's wrong but step by step how to fix it. Want to see what we find on yours?" },
  { q: "\"I don't have money for this right now\"", a: "I hear you — $99 is real money. Here's the thing though — every day these issues stay unfixed is another customer choosing your competitor. Can I at least show you the free scan so you know what you're dealing with? No obligation at all." },
];

const STATS = [
  "93% of consumers read online reviews before making a purchase",
  "Businesses with 4.5+ ratings get significantly more clicks than 4.0-4.4",
  "A 1-star increase on Yelp can lead to a 5-9% revenue increase",
  "Listings with photos get 42% more requests for directions",
  "53% of mobile users leave a site that takes over 3 seconds to load",
  "Agencies charge $500-2,000 for what we do for $99",
];

export default function RepSalesTools() {
  const navigate = useNavigate();
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [openObj, setOpenObj] = useState(null);
  const [copied, setCopied] = useState(null);

  let repCode = "";
  try { const rd = JSON.parse(localStorage.getItem("pageaudit_rep_agreement") || "{}"); repCode = rd.rep_code || ""; } catch {}
  if (!repCode) { try { const o = JSON.parse(localStorage.getItem("pageAuditOrder") || "{}"); repCode = o.rep_code || ""; } catch {} }

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const copy = (text, key) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000); };
  const heading = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
  const card = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14 };
  const pitch = selectedIndustry ? PITCHES[selectedIndustry] : null;
  const repLink = repCode ? `pageauditpros.com/scan?rep=${repCode}` : "pageauditpros.com/scan";
  const sms = repCode ? `Hey it's [YOUR NAME] from The Agency! Here's your free business scan: ${repLink} 60 seconds, completely free.` : "";

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "'Inter', sans-serif" }}>
      <nav style={{ background: "rgba(10,15,30,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "14px 24px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate("/rep-dashboard")} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}><ArrowLeft style={{ width: 18, height: 18 }} /></button>
          <BarChart2 style={{ width: 18, height: 18, color: "#3b82f6" }} />
          <span style={{ ...heading, fontWeight: 700, fontSize: 14, color: "#fff" }}>Sales Tools</span>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px 80px" }}>
        <h1 style={{ ...heading, fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Sales Tools</h1>
        <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 36 }}>Everything you need to close more deals</p>

        {/* ═══ INDUSTRY PITCHES ═══ */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ ...heading, fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Select an Industry</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8, marginBottom: 20 }}>
            {INDUSTRIES.map(({ key, emoji, label }) => (
              <button key={key} onClick={() => setSelectedIndustry(selectedIndustry === key ? null : key)}
                style={{ ...card, padding: "12px 8px", textAlign: "center", cursor: "pointer", border: selectedIndustry === key ? "1px solid rgba(37,99,235,0.5)" : "1px solid rgba(255,255,255,0.08)", background: selectedIndustry === key ? "rgba(37,99,235,0.1)" : "rgba(255,255,255,0.03)" }}>
                <span style={{ fontSize: 24, display: "block", marginBottom: 4 }}>{emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: selectedIndustry === key ? "#3b82f6" : "#94a3b8" }}>{label}</span>
              </button>
            ))}
          </div>

          {pitch && (
            <div style={{ ...card, padding: 24, borderColor: "rgba(37,99,235,0.2)" }}>
              <p style={{ ...heading, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#3b82f6", marginBottom: 16 }}>{INDUSTRIES.find(i => i.key === selectedIndustry)?.label} Pitch</p>

              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Opening Line</p>
                <div style={{ borderLeft: "3px solid #2563eb", background: "rgba(37,99,235,0.06)", borderRadius: "0 10px 10px 0", padding: 14 }}>
                  <p style={{ color: "#c8d0dc", fontSize: 14, lineHeight: 1.6, fontStyle: "italic" }}>"{pitch.opening}"</p>
                </div>
                <button onClick={() => copy(pitch.opening, "opening")} style={{ marginTop: 8, background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 600, color: copied === "opening" ? "#10b981" : "#64748b", cursor: "pointer" }}>
                  {copied === "opening" ? "Copied!" : "Copy Opening"}
                </button>
              </div>

              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Key Pain Points</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {pitch.pains.map((p, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0, marginTop: 6 }} />
                      <span style={{ color: "#c8d0dc", fontSize: 13 }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Demo Steps</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {pitch.demo.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(37,99,235,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 700, color: "#3b82f6" }}>{i + 1}</span>
                      <span style={{ color: "#c8d0dc", fontSize: 13 }}>{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Close Line</p>
                <div style={{ borderLeft: "3px solid #10b981", background: "rgba(16,185,129,0.06)", borderRadius: "0 10px 10px 0", padding: 14 }}>
                  <p style={{ color: "#c8d0dc", fontSize: 14, lineHeight: 1.6, fontStyle: "italic" }}>"{pitch.close}"</p>
                </div>
                <button onClick={() => copy(pitch.close, "close")} style={{ marginTop: 8, background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 600, color: copied === "close" ? "#10b981" : "#64748b", cursor: "pointer" }}>
                  {copied === "close" ? "Copied!" : "Copy Close"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ═══ OBJECTION HANDLER ═══ */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ ...heading, fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Handling Objections</h2>
          <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 16 }}>Tap any objection for the perfect response</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {OBJECTIONS.map((o, i) => (
              <div key={i} style={{ ...card, overflow: "hidden" }}>
                <button onClick={() => setOpenObj(openObj === i ? null : i)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#3b82f6" }}>{o.q}</span>
                  <ChevronRight style={{ width: 16, height: 16, color: "#64748b", flexShrink: 0, transition: "transform 0.2s", transform: openObj === i ? "rotate(90deg)" : "none" }} />
                </button>
                {openObj === i && (
                  <div style={{ padding: "0 16px 14px" }}>
                    <p style={{ color: "#c8d0dc", fontSize: 13, lineHeight: 1.65 }}>{o.a}</p>
                    <button onClick={() => copy(o.a, `obj-${i}`)} style={{ marginTop: 8, background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 600, color: copied === `obj-${i}` ? "#10b981" : "#64748b", cursor: "pointer" }}>
                      {copied === `obj-${i}` ? "Copied!" : "Copy Response"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ═══ QUICK STATS ═══ */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ ...heading, fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Facts That Close Deals</h2>
          <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 16 }}>Use these in your pitch</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ ...card, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flex: 1 }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>📊</span>
                  <span style={{ color: "#c8d0dc", fontSize: 13, lineHeight: 1.5 }}>{s}</span>
                </div>
                <button onClick={() => copy(s, `stat-${i}`)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 10px", fontSize: 10, fontWeight: 600, color: copied === `stat-${i}` ? "#10b981" : "#64748b", cursor: "pointer", flexShrink: 0 }}>
                  {copied === `stat-${i}` ? "✓" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ QUICK LINKS ═══ */}
        <div>
          <h2 style={{ ...heading, fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Your Sales Links</h2>
          <div style={{ ...card, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Link2 style={{ width: 16, height: 16, color: "#3b82f6" }} />
              <span style={{ color: "#c8d0dc", fontSize: 13, fontWeight: 600 }}>Your Scan Link</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>
              <code style={{ flex: 1, fontSize: 13, color: "#94a3b8", fontFamily: "monospace" }}>{repLink}</code>
              <button onClick={() => copy(repLink, "link")} style={{ background: copied === "link" ? "rgba(16,185,129,0.15)" : "#2563eb", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 600, color: "#fff", cursor: "pointer" }}>
                {copied === "link" ? "Copied!" : "Copy"}
              </button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: "#64748b", cursor: "pointer" }}>
                <QrCode style={{ width: 14, height: 14 }} /> QR Code
              </button>
              {sms && (
                <button onClick={() => copy(sms, "sms")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: copied === "sms" ? "#10b981" : "#64748b", cursor: "pointer" }}>
                  <MessageSquare style={{ width: 14, height: 14 }} /> {copied === "sms" ? "Copied!" : "Copy SMS"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
