import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Eye, EyeOff, CheckCircle, BarChart2 } from "lucide-react";

const API_BASE = "https://pageaudit-engine.onrender.com";

const FACEBOOK_TIPS = [
  {
    emoji: "⏰",
    title: "Best Time to Post",
    tip: "Facebook pages get 3x more reach when posted between 1pm-4pm on weekdays. Wednesday at 3pm is consistently the highest engagement window for business pages."
  },
  {
    emoji: "🎥",
    title: "Video Gets 5x More Reach",
    tip: "Facebook's algorithm heavily favors native video over images or links. Even a 60-second phone video outperforms a professional photo post by 5x on average reach."
  },
  {
    emoji: "💬",
    title: "The First 30 Minutes Are Everything",
    tip: "Facebook decides how widely to distribute your post based on engagement in the first 30 minutes. Reply to every comment immediately after posting to signal that your content is worth showing to more people."
  },
  {
    emoji: "🪝",
    title: "The Hook Is 90% of Your Post",
    tip: "Only the first 2 lines show before See More. If those lines don't stop the scroll, nobody reads the rest. Start every post with a bold statement, a question, or a surprising fact."
  },
  {
    emoji: "📊",
    title: "Consistency Beats Perfection",
    tip: "Pages that post 4-5 times per week grow 3x faster than pages that post sporadically - even if the content is simpler. The algorithm rewards consistency above all else."
  },
  {
    emoji: "🤝",
    title: "Engagement Beats Broadcasting",
    tip: "Pages that respond to 100% of comments grow their reach 40% faster. Facebook tracks your response rate and rewards pages that create real conversations."
  },
  {
    emoji: "📱",
    title: "Stories Are Underused Gold",
    tip: "Less than 20% of business pages use Facebook Stories consistently - yet Stories show at the TOP of every feed. Posting one Story per day puts you ahead of 80% of your competitors instantly."
  },
  {
    emoji: "🎯",
    title: "One CTA Per Post",
    tip: "Posts with a single clear call-to-action outperform posts with multiple asks by 300%. Pick one action and ask for it directly."
  },
  {
    emoji: "🔁",
    title: "Resharing Your Best Content",
    tip: "Your best performing post from 6 months ago is brand new to 90% of your current followers. Resharing top content every 90 days is one of the easiest wins most pages completely ignore."
  },
  {
    emoji: "❓",
    title: "Questions Triple Engagement",
    tip: "Posts that end with a direct question get 3x more comments than posts that don't. Ask simple, easy-to-answer questions that your audience can respond to in one sentence."
  },
  {
    emoji: "🏷️",
    title: "Tag Strategically",
    tip: "Tagging relevant local businesses, partners, or community pages exposes your post to their entire audience for free. One strategic tag can double your post's reach overnight."
  },
  {
    emoji: "📅",
    title: "The 3-2-1 Content Rule",
    tip: "For every 6 posts: 3 should educate or entertain, 2 should build community and engagement, and 1 should directly promote your product or service. Pages that sell too often get ignored."
  },
];

export default function CreateAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup, login } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const steps = [
    "Securing your account...",
    "Analyzing your Facebook page...",
    "Identifying growth blockers...",
    "Building your content strategy...",
    "Writing your 7-day action plan...",
    "Finalizing your report...",
  ];

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => {
    if (!loading) return;

    const tipTimer = setInterval(() => {
      setTipIndex(prev => (prev + 1) % FACEBOOK_TIPS.length);
    }, 8000);

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return 95;
        return prev + (95 / 75);
      });
    }, 1000);

    steps.forEach((_, i) => {
      setTimeout(() => {
        setCompletedSteps(prev => [...prev, i]);
      }, (i + 1) * 10000);
    });

    return () => {
      clearInterval(tipTimer);
      clearInterval(progressTimer);
    };
  }, [loading]);

  useEffect(() => {
    const savedOrder = localStorage.getItem("pageAuditOrder");
    const stripeSessionId = searchParams.get("session_id");
    const stripeAuditId = searchParams.get("audit_id");

    // URL params are the source of truth — always override localStorage audit_id
    if (savedOrder) {
      const orderData = JSON.parse(savedOrder);
      // If URL has audit_id, use it (more reliable than localStorage after Stripe redirect)
      if (stripeAuditId) orderData.auditId = stripeAuditId;
      setOrder(orderData);
      console.log("[CREATE ACCOUNT] Order loaded. auditId:", orderData.auditId, "email:", orderData.email);
      if (stripeSessionId) {
        fetch(`${API_BASE}/api/stripe/verify/${stripeSessionId}`)
          .then(r => r.json())
          .then(result => { if (result.paid) localStorage.setItem("pageAuditPaid", "true"); })
          .catch(() => {});
      }
      return;
    }

    // No localStorage — fetch audit from backend using URL param
    if (stripeAuditId) {
      console.log("[CREATE ACCOUNT] No localStorage, fetching audit", stripeAuditId);
      fetch(`${API_BASE}/api/audits/${stripeAuditId}`)
        .then(r => r.json())
        .then(audit => {
          if (audit && audit.email) {
            const orderData = { email: audit.email, auditId: stripeAuditId, name: audit.customer_name || "", businessName: audit.business_name || "", city: audit.city || "", website: audit.website || "" };
            setOrder(orderData);
            // Restore localStorage for downstream pages
            localStorage.setItem("pageAuditOrder", JSON.stringify(orderData));
            if (stripeSessionId) {
              fetch(`${API_BASE}/api/stripe/verify/${stripeSessionId}`)
                .then(r => r.json())
                .then(result => { if (result.paid) localStorage.setItem("pageAuditPaid", "true"); })
                .catch(() => {});
            }
          } else {
            navigate("/submit-your-page");
          }
        })
        .catch(() => navigate("/submit-your-page"));
      return;
    }

    // No localStorage and no audit_id in URL — can't proceed
    console.log("[CREATE ACCOUNT] No order data found. searchParams:", Object.fromEntries(searchParams.entries()));
    // Don't redirect immediately — give the page a chance to load
    // The user may have navigated here directly
  }, [navigate, searchParams]);

  const validatePasswords = () => {
    if (!password) { setPasswordError("Password is required"); return false; }
    if (password.length < 8) { setPasswordError("Password must be at least 8 characters"); return false; }
    if (password !== confirmPassword) { setPasswordError("Passwords do not match"); return false; }
    setPasswordError("");
    return true;
  };

  const handleCreateAccount = async () => {
    if (!validatePasswords()) return;
    if (!agreedToTerms) { setError("Please agree to the Terms & Conditions to continue."); return; }
    setLoading(true);
    setError(null);
    setProgress(0);
    setCompletedSteps([]);
    setTipIndex(0);

    try {
      await signup(order.email, password, order.name);
      const auditId = order.auditId || searchParams.get("audit_id");
      // Navigate to report processing — the new scan engine runs there
      navigate("/report-processing?id=" + auditId, {
        state: {
          auditId,
          businessName: order.businessName || order.name || "",
          city: order.city || "",
          state: "",
          website: order.website || "",
          facebookUrl: order.pageUrl || "",
        },
      });
    } catch (err) {
      if (err.message?.includes("already exists")) {
        try {
          await login(order.email, password);
          const auditId = order.auditId || searchParams.get("audit_id");
          navigate("/report-processing?id=" + auditId, {
            state: {
              auditId,
              businessName: order.businessName || order.name || "",
              city: order.city || "",
              state: "",
              website: order.website || "",
              facebookUrl: order.pageUrl || "",
            },
          });
        } catch (loginErr) {
          setError("An account with this email already exists. Please log in with your existing password.");
          setLoading(false);
        }
      } else {
        setError(err.message || "Something went wrong. Please try again.");
        setLoading(false);
      }
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#1877F2] rounded-full animate-spin" />
      </div>
    );
  }

  if (loading) {
    const currentTip = FACEBOOK_TIPS[tipIndex];
    const currentStep = Math.min(Math.floor(completedSteps.length), steps.length - 1);

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f2a6b] via-[#1877F2] to-[#2563eb] flex flex-col">
        <nav className="px-6 py-4">
          <span className="font-bold text-white text-sm tracking-tight">PageAudit Pro</span>
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-2xl space-y-6">

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-2">Building Your Report</h1>
              <p className="text-blue-200">Our AI is analyzing your Facebook page right now. This takes about 60 seconds.</p>
            </div>

            <div className="bg-white/10 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>

            <div className="bg-white/10 rounded-2xl p-5 space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    completedSteps.includes(i) ? 'bg-green-400' : i === currentStep ? 'bg-white/30 border-2 border-white animate-pulse' : 'bg-white/10'
                  }`}>
                    {completedSteps.includes(i) && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm ${completedSteps.includes(i) ? 'text-green-300 line-through' : i === currentStep ? 'text-white font-semibold' : 'text-blue-300'}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-start gap-4">
                <span className="text-3xl shrink-0">{currentTip.emoji}</span>
                <div>
                  <p className="text-xs font-bold text-[#1877F2] uppercase tracking-wide mb-1">Facebook Pro Tip</p>
                  <h3 className="font-bold text-gray-900 mb-2">{currentTip.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{currentTip.tip}</p>
                </div>
              </div>
              <div className="flex gap-1 mt-4 justify-center">
                {FACEBOOK_TIPS.slice(0, 8).map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all ${i === tipIndex % 8 ? 'w-6 bg-[#1877F2]' : 'w-1.5 bg-gray-200'}`} />
                ))}
              </div>
            </div>

            <p className="text-center text-blue-200 text-sm">
              Don't close this page - you'll be redirected automatically when your report is ready.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const inp = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "#fff", outline: "none", boxSizing: /** @type {const} */ ("border-box") };
  const inpErr = { ...inp, borderColor: "rgba(239,68,68,0.4)" };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column" }}>
      <nav style={{ padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
          <BarChart2 style={{ width: 18, height: 18, color: "#3b82f6" }} />
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>PageAudit Pro</span>
        </div>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
        <div style={{ width: "100%", maxWidth: 480 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "28px 24px" }}>

            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 24 }}>
              <CheckCircle style={{ width: 20, height: 20, color: "#10b981", flexShrink: 0 }} />
              <div>
                <p style={{ color: "#10b981", fontSize: 14, fontWeight: 600 }}>Payment Confirmed!</p>
                <p style={{ color: "#94a3b8", fontSize: 12 }}>Create your account to access your full report.</p>
              </div>
            </div>

            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Secure Your Access</h1>
            <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 24 }}>Your report will be ready in about 60 seconds.</p>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
                <p style={{ color: "#ef4444", fontSize: 13 }}>{error}</p>
                {error.includes("already exists") && (
                  <button type="button" onClick={() => navigate("/login")} style={{ background: "none", border: "none", color: "#3b82f6", fontSize: 12, fontWeight: 600, cursor: "pointer", marginTop: 4, padding: 0 }}>Click here to log in instead</button>
                )}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c8d0dc", marginBottom: 6 }}>Email Address</label>
                <input type="email" value={order?.email || ""} readOnly style={{ ...inp, color: "#64748b", cursor: "not-allowed" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c8d0dc", marginBottom: 6 }}>Create Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPassword ? "text" : "password"} value={password}
                    onChange={e => { setPassword(e.target.value); if (passwordError) setPasswordError(""); }}
                    placeholder="Min 8 characters"
                    style={passwordError ? inpErr : inp} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                    {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c8d0dc", marginBottom: 6 }}>Confirm Password</label>
                <input type={showPassword ? "text" : "password"} value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); if (passwordError) setPasswordError(""); }}
                  placeholder="Confirm your password"
                  style={(passwordError || (confirmPassword && password !== confirmPassword)) ? inpErr : inp} />
                {confirmPassword && password !== confirmPassword && !passwordError && (
                  <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>Passwords do not match</p>
                )}
                {passwordError && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{passwordError}</p>}
              </div>

              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginTop: 4 }}>
                <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)}
                  style={{ marginTop: 2, width: 16, height: 16, accentColor: "#2563eb" }} />
                <span style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
                  I agree to the <Link to="/terms" target="_blank" style={{ color: "#3b82f6", textDecoration: "none" }}>Terms & Conditions</Link> and <Link to="/privacy" target="_blank" style={{ color: "#3b82f6", textDecoration: "none" }}>Privacy Policy</Link>
                </span>
              </label>

              <button onClick={handleCreateAccount} disabled={loading || !password || !confirmPassword || password !== confirmPassword || !agreedToTerms}
                style={{ width: "100%", background: "#f97316", color: "#fff", fontSize: 16, fontWeight: 700, padding: "16px 0", borderRadius: 10, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: (loading || !password || !confirmPassword || password !== confirmPassword || !agreedToTerms) ? 0.5 : 1, marginTop: 4 }}>
                {loading ? <><Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> Building your report...</> : "Create Account & Get My Report →"}
              </button>
              <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






