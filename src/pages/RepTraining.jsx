import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart2, ArrowLeft, AlertTriangle } from "lucide-react";

const OBJECTIONS = [
  { q: '"I\'m not interested"', a: 'Totally fair. Can I just show you your score real quick? It\'s free and takes 60 seconds. If everything looks great you never have to think about it again.' },
  { q: '"I already have someone handling that"', a: 'That\'s great! Do you know what your current Google score is? Let me show you what we see from the outside — takes 60 seconds and it\'s free.' },
  { q: '"How much does it cost?"', a: 'The full report is $99 today. That\'s less than one lost customer. And if you want us to keep monitoring it every month it\'s $49-99 depending on what you need.' },
  { q: '"I need to think about it"', a: 'Absolutely. Let me send you the link so you can look at your free scan results anytime. What\'s the best number to text you? [Then send them your rep link via text]' },
  { q: '"Is this a scam?"', a: 'Totally understand the skepticism. The scan is completely free — no card, no account. Just type your business name and see what comes up. If you don\'t like what you see you owe us nothing.' },
];

const COMMISSION = [
  { product: "In-Person Audit", price: "$99", commission: "$60" },
  { product: "Monthly Monitor", price: "$49/mo", commission: "$15/mo" },
  { product: "Pro Monitor", price: "$79/mo", commission: "$20/mo" },
  { product: "Pro + Review Booster", price: "$99/mo", commission: "$30/mo" },
];

export default function RepTraining() {
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const syne = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
  const card = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 24 };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "'Inter', sans-serif" }}>
      <nav style={{ background: "rgba(10,15,30,0.9)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "16px 24px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate("/rep-dashboard")} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}><ArrowLeft style={{ width: 18, height: 18 }} /></button>
          <BarChart2 style={{ width: 20, height: 20, color: "#3b82f6" }} />
          <span style={{ ...syne, fontWeight: 700, fontSize: 15, color: "#fff" }}>Sales Rep Training Center</span>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ ...syne, fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Sales Rep Training Center</h1>
          <p style={{ color: "#94a3b8", fontSize: 16 }}>Everything you need to close your first sale today</p>
        </div>

        {/* SECTION 1 — DOOR SCRIPT */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ ...syne, fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Your 60-Second Door Script</h2>
          <div style={{ borderLeft: "4px solid #2563eb", background: "rgba(37,99,235,0.08)", borderRadius: "0 12px 12px 0", padding: 24, marginBottom: 16 }}>
            <p style={{ color: "#c8d0dc", fontSize: 15, lineHeight: 1.7, fontStyle: "italic" }}>
              "Hi, I'm [YOUR NAME] with The Agency. We do a free 60-second scan of how your business looks online — Google, Yelp, Facebook, everything. Can I show you what we find? Takes one minute and it's completely free."
            </p>
          </div>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 12 }}>After the scan completes, say:</p>
          <div style={{ borderLeft: "4px solid #10b981", background: "rgba(16,185,129,0.08)", borderRadius: "0 12px 12px 0", padding: 24 }}>
            <p style={{ color: "#c8d0dc", fontSize: 15, lineHeight: 1.7, fontStyle: "italic" }}>
              "You scored [SCORE] out of 100. Here are the [X] biggest things hurting your business right now. We can fix all of this for $99 today and keep monitoring it every month for $49-99 a month. Want to get started?"
            </p>
          </div>
        </div>

        {/* SECTION 2 — LIVE DEMO */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ ...syne, fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 16 }}>How to Run a Live Demo</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              "Pull up pageauditpros.com on your phone or iPad",
              "Type their business name and city",
              "Hit Scan Free and let it run — 60 seconds",
              "Show them the preliminary score on your screen",
              "Walk through each finding out loud",
              "Let the score do the selling — don't oversell",
              'Ask: "Want to see the full report?"',
              "Take payment on the spot",
            ].map((step, i) => (
              <div key={i} style={{ ...card, display: "flex", alignItems: "center", gap: 16, padding: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(37,99,235,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ ...syne, fontSize: 14, fontWeight: 700, color: "#3b82f6" }}>{i + 1}</span>
                </div>
                <p style={{ color: "#c8d0dc", fontSize: 14 }}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3 — OBJECTIONS */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ ...syne, fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Handling Objections</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {OBJECTIONS.map(({ q, a }) => (
              <div key={q} style={card}>
                <p style={{ color: "#3b82f6", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{q}</p>
                <p style={{ color: "#c8d0dc", fontSize: 14, lineHeight: 1.6 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4 — COMMISSION */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ ...syne, fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Commission Structure</h2>
          <div style={{ ...card, overflow: "hidden", padding: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Product</th>
                <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Price</th>
                <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Your Commission</th>
              </tr></thead>
              <tbody>
                {COMMISSION.map(({ product, price, commission }) => (
                  <tr key={product} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "12px 16px", color: "#c8d0dc", fontSize: 14 }}>{product}</td>
                    <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: 14 }}>{price}</td>
                    <td style={{ padding: "12px 16px", color: "#10b981", fontSize: 14, fontWeight: 700 }}>{commission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 16 }}>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>Earning examples with Pro + Review Booster:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { cust: 10, amt: "$300/mo" },
                { cust: 30, amt: "$900/mo" },
                { cust: 50, amt: "$1,500/mo" },
              ].map(({ cust, amt }) => (
                <p key={cust} style={{ color: "#94a3b8", fontSize: 14 }}><span style={{ color: "#fff", fontWeight: 600 }}>{cust} active customers</span> = <span style={{ color: "#10b981", fontWeight: 700 }}>{amt}</span> passive income</p>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 5 — RULES */}
        <div>
          <h2 style={{ ...syne, fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Pricing Strategy — ALWAYS START AT $149</h2>
          <div style={{ ...card, marginBottom: 20, borderColor: "rgba(249,115,22,0.2)", background: "rgba(249,115,22,0.04)" }}>
            <p style={{ color: "#f97316", fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Your script:</p>
            <div style={{ borderLeft: "3px solid #f97316", background: "rgba(249,115,22,0.06)", borderRadius: "0 10px 10px 0", padding: 12, marginBottom: 14 }}>
              <p style={{ color: "#c8d0dc", fontSize: 14, lineHeight: 1.6, fontStyle: "italic" }}>"Our complete premium audit is $149 — normally $299. We created this specifically to help small businesses like yours."</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 14 }}>💎</span><span style={{ color: "#c8d0dc", fontSize: 13 }}><strong style={{ color: "#f97316" }}>Start at $149</strong> — Premium. Full report + competitor analysis.</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 14 }}>📊</span><span style={{ color: "#c8d0dc", fontSize: 13 }}>If they hesitate → <strong style={{ color: "#3b82f6" }}>$129 Standard</strong>. Full report + action plan.</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 14 }}>📋</span><span style={{ color: "#c8d0dc", fontSize: 13 }}>Last resort only → <strong style={{ color: "#94a3b8" }}>$99 Basic</strong>. Core findings.</span></div>
            </div>
            <p style={{ color: "#10b981", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Your commission by tier:</p>
            <p style={{ color: "#c8d0dc", fontSize: 13 }}>$99 → you earn $49 | $129 → you earn $64 | $149 → you earn $74</p>
            <p style={{ color: "#f97316", fontSize: 12, fontWeight: 700, marginTop: 10 }}>Never apologize for the price. The audit is worth every penny.</p>
          </div>

          <h2 style={{ ...syne, fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Rules to Live By</h2>
          <div style={{ background: "rgba(239,68,68,0.06)", border: "2px solid rgba(239,68,68,0.2)", borderRadius: 14, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <AlertTriangle style={{ width: 20, height: 20, color: "#ef4444" }} />
              <p style={{ color: "#ef4444", fontWeight: 700, fontSize: 15 }}>Breaking any of these can terminate your account</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Never pressure anyone",
                "Never make promises the product doesn't keep",
                "Never offer discounts without approval",
                "Always let the scan do the selling",
                "3 chargebacks = account terminated",
                "When in doubt, walk away from the sale",
              ].map(rule => (
                <div key={rule} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
                  <p style={{ color: "#c8d0dc", fontSize: 14, fontWeight: 500 }}>{rule}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
