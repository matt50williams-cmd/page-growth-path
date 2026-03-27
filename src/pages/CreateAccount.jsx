import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";

const API_BASE = "https://pageaudit-engine.onrender.com";

const FACEBOOK_TIPS = [
  {
    emoji: "⏰",
    title: "Best Time to Post",
    tip: "Facebook pages get 3x more reach when posted between 1pm–4pm on weekdays. Wednesday at 3pm is consistently the highest engagement window for business pages."
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
    tip: "Only the first 2 lines show before 'See More.' If those lines don't stop the scroll, nobody reads the rest. Start every post with a bold statement, a question, or a surprising fact."
  },
  {
    emoji: "📊",
    title: "Consistency Beats Perfection",
    tip: "Pages that post 4-5 times per week grow 3x faster than pages that post sporadically — even if the content is simpler. The algorithm rewards consistency above all else."
  },
  {
    emoji: "🤝",
    title: "Engagement Beats Broadcasting",
    tip: "Pages that respond to 100% of comments grow their reach 40% faster. Facebook tracks your response rate and rewards pages that create real conversations."
  },
  {
    emoji: "📱",
    title: "Stories Are Underused Gold",
    tip: "Less than 20% of business pages use Facebook Stories consistently — yet Stories show at the TOP of every feed. Posting one Story per day puts you ahead of 80% of your competitors instantly."
  },
  {
    emoji: "🎯",
    title: "One CTA Per Post",
    tip: "Posts with a single clear call-to-action (comment, share, click, DM) outperform posts with multiple asks by 300%. Pick one action and ask for it directly."
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
  const { signup } = useAuth();
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
    if (!loading) return;

    // Rotate tips every 8 seconds
    const tipTimer = setInterval(() => {
      setTipIndex(prev => (prev + 1) % FACEBOOK_TIPS.length);
    }, 8000);

    // Progress bar over 75 seconds
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return 95;
        return prev + (95 / 75);
      });
    }, 1000);

    // Complete steps one by one
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
    if (!savedOrder) { navigate("/submit-your-page"); return; }
    const orderData = JSON.parse(savedOrder);
    setOrder(orderData);

    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      fetch(`${API_BASE}/api/stripe/verify/${sessionId}`)
        .then(r => r.json())
        .then(result => {
          if (result.paid) localStorage.setItem("pageAuditPaid", "true");
        })
        .catch(err => console.error("Payment verification failed:", err));
    }
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
      if (auditId) {
        try {
          await fetch(`${API_BASE}/api/audits/${auditId}/run`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          console.error("Audit run failed:", err);
        }
      }
      localStorage.removeItem("pageAuditOrder");
      navigate("/dashboard");
    } catch (err) {
      if (err.message?.includes("already exists")) {
        navigate("/login");
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

            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-2">Building Your Report</h1>
              <p className="text-blue-200">Our AI is analyzing your Facebook page right now. This takes about 60 seconds.</p>
            </div>

            {/* Progress Bar */}
            <div className="bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Steps */}
            <div className="bg-white/10 rounded-2xl p-5 space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    completedSteps.includes(i)
                      ? 'bg-green-400'
                      : i === currentStep
                      ? 'bg-white/30 border-2 border-white animate-pulse'
                      : 'bg-white/10'
                  }`}>
                    {completedSteps.includes(i) && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm ${completedSteps.includes(i) ? 'text-green-300 line-through' : i === currentStep ? 'text-white font-semibold' : 'text-blue-300'}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            {/* Rotating Tip */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-start gap-4">
                <span className="text-3xl shrink-0">{currentTip.emoji}</span>
                <div>
                  <p className="text-xs font-bold text-[#1877F2] uppercase tracking-wide mb-1">
                    💡 Facebook Pro Tip
                  </p>
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
              Don't close this page — you'll be redirected automatically when your report is ready.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <span className="font-bold text-base text-black tracking-tight">PageAudit Pro</span>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm px-7 py-8">

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-800">Payment Confirmed!</p>
                <p className="text-xs text-green-600">Create your account to access your full report.</p>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Secure Your Access</h1>
            <p className="text-sm text-gray-400 mb-8">Your report will be ready in about 60 seconds after you create your account.</p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email Address</label>
                <input type="email" value={order?.email || ""} readOnly
                  className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm text-gray-600 bg-gray-50 cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Create Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password}
                    onChange={e => { setPassword(e.target.value); if (passwordError) setPasswordError(""); }}
                    placeholder="Min 8 characters"
                    className={`w-full border-2 rounded-2xl px-4 py-3.5 text-sm focus:outline-none transition-all pr-10 ${passwordError ? "border-red-300" : "border-gray-100 focus:border-[#1877F2]"}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Confirm Password</label>
                <input type={showPassword ? "text" : "password"} value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); if (passwordError) setPasswordError(""); }}
                  placeholder="Confirm your password"
                  className={`w-full border-2 rounded-2xl px-4 py-3.5 text-sm focus:outline-none transition-all ${passwordError ? "border-red-300" : "border-gray-100 focus:border-[#1877F2]"}`} />
              </div>

              {passwordError && <p className="text-xs text-red-500 -mt-3">{passwordError}</p>}

              <div className="flex items-start gap-3 pt-2">
                <input type="checkbox" id="terms" checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#1877F2] focus:ring-[#1877F2] cursor-pointer" />
                <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                  I agree to the{" "}
                  <Link to="/terms" target="_blank" className="text-[#1877F2] hover:underline font-medium">Terms & Conditions</Link>
                  {" "}and{" "}
                  <Link to="/privacy" target="_blank" className="text-[#1877F2] hover:underline font-medium">Privacy Policy</Link>
                </label>
              </div>

              <button onClick={handleCreateAccount} disabled={loading || !password || !confirmPassword || !agreedToTerms}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#1877F2] text-white px-10 py-4 font-bold text-base rounded-2xl hover:bg-[#1457C0] transition-all shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Building your report...</> : "Create Account & Get My Report →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
