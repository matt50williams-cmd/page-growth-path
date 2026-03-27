import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, CheckCircle, Shield, Clock } from "lucide-react";
import { trackEvent, EVENTS } from "@/utils/tracking";

const API_BASE = "https://pageaudit-engine.onrender.com";

const LOADING_MESSAGES = [
  "Running your page through 47 growth checkpoints...",
  "Cross-referencing against 10,000+ Facebook business pages...",
  "Applying the PageAudit Pro Growth Algorithm...",
  "Your dedicated strategist is building your plan...",
  "Analyzing your content patterns and engagement signals...",
  "Identifying your #1 growth blocker...",
];

export default function PreviewReport() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unlocking, setUnlocking] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!unlocking) return;
    const timer = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [unlocking]);

  useEffect(() => {
    const init = async () => {
      const savedOrder = localStorage.getItem("pageAuditOrder");
      if (!savedOrder) {
        setError("No audit order found. Please start a new audit.");
        setLoading(false);
        return;
      }
      const orderData = JSON.parse(savedOrder);
      setOrder(orderData);
      await trackEvent(EVENTS.PREVIEW_VIEWED, {
        email: orderData.email,
        facebookUrl: orderData.pageUrl,
      });
      setLoading(false);
    };
    init();
  }, []);

  const handleUnlock = async () => {
    await trackEvent(EVENTS.UNLOCK_CLICKED, {
      email: order?.email,
      facebookUrl: order?.pageUrl,
    });
    setUnlocking(true);
    try {
      const res = await fetch(`${API_BASE}/api/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audit_id: order.auditId,
          email: order.email,
          customer_name: order.name,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "No checkout URL returned");
      }
    } catch (err) {
      console.error("Stripe error:", err);
      alert("Something went wrong. Please try again.");
      setUnlocking(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <nav className="border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <span className="font-bold text-base text-black tracking-tight">PageAudit Pro</span>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center px-4 py-20 text-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <button onClick={() => navigate("/submit-your-page")}
              className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-6 py-3 text-sm font-bold rounded-xl hover:bg-[#1457C0] transition-colors">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (unlocking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f2a6b] via-[#1877F2] to-[#2563eb] flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto">
            <div className="w-14 h-14 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Preparing Your Report</h1>
          <p className="text-blue-100 text-lg animate-pulse">{LOADING_MESSAGES[msgIndex]}</p>
          <p className="text-blue-200 text-sm">Redirecting to secure checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <span className="font-bold text-sm tracking-tight">PageAudit Pro</span>
          <button onClick={() => navigate(-1)}
            className="text-xs font-semibold text-[#1877F2] hover:underline">
            ← Back
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-6">

        {/* HERO */}
        <div className="py-14 md:py-20 text-center border-b border-gray-100">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1877F2] mb-4">Your Facebook Audit</p>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight max-w-3xl mx-auto">
            Your Growth Report Is Ready — Claim It Now
          </h1>
          <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">
            Agencies charge $500–$2,000 for this. Get the same insights for $39.99.
          </p>

          {/* PRICING CARD */}
          <div className="inline-block bg-white border-2 border-[#1877F2] rounded-2xl px-8 py-8 shadow-xl mb-8 text-left max-w-sm w-full">
            <p className="text-xs font-bold uppercase tracking-widest text-[#1877F2] mb-4 text-center">🔥 Limited Launch Pricing</p>
            
            <div className="text-center mb-6">
              <p className="text-sm text-gray-400 mb-1">What agencies charge: <span className="line-through font-bold">$500–$2,000</span></p>
              <p className="text-sm text-gray-400 mb-1">Our regular price: <span className="line-through font-bold text-gray-500">$197</span></p>
              <p className="text-green-600 font-bold text-sm mb-3">Today only — 80% off</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-6xl font-extrabold text-gray-900">$39</span>
                <span className="text-3xl font-bold text-gray-400">.99</span>
              </div>
              <p className="text-green-600 font-semibold text-sm mt-1">You save $157</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {[
                { icon: Clock, text: "Ready in 60 min" },
                { icon: Shield, text: "One-time payment" },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Icon className="w-3 h-3" />{text}
                </span>
              ))}
            </div>

            <button onClick={handleUnlock} disabled={unlocking}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1877F2] text-white px-8 py-4 font-bold text-base rounded-xl hover:bg-[#1457C0] active:scale-[0.98] transition-all shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed">
              {unlocking ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              {unlocking ? 'Redirecting...' : 'Unlock Full Report →'}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">🔒 Secure payment · No contracts · No hidden fees</p>
          </div>

          {order && (
            <p className="text-gray-500 text-sm mt-2">
              Report prepared for <strong>{order.name}</strong> · {order.pageUrl}
            </p>
          )}
        </div>

        {/* WHAT'S INCLUDED */}
        <div className="py-12 border-b border-gray-100">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1877F2] mb-6 text-center">What's Inside Your Report</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: "🔍", title: "Honest Page Assessment", desc: "The truth about what's holding your page back — no fluff, no generic advice." },
              { icon: "🚧", title: "Your #1 Growth Blocker", desc: "The single biggest thing killing your reach and exactly how to fix it this week." },
              { icon: "📅", title: "7-Day Action Plan", desc: "Day-by-day tasks you can start immediately. Clear, specific, achievable." },
              { icon: "💡", title: "Custom Content Strategy", desc: "3 content pillars, posting times, and 3 post ideas ready to use this week." },
              { icon: "💰", title: "Lead Generation Blueprint", desc: "How to turn your followers into paying customers for your specific business." },
              { icon: "🗺️", title: "30-Day Growth Roadmap", desc: "Week-by-week milestones so you always know exactly what to focus on next." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 bg-gray-50 border border-gray-100 rounded-2xl p-5">
                <span className="text-2xl shrink-0">{icon}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <p className="font-bold text-gray-900 text-sm">{title}</p>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="py-12 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Ready to fix your page?</h2>
            <p className="text-gray-500 text-sm mb-6">Join 500+ business owners who stopped guessing and started growing.</p>
            
            <div className="bg-white border-2 border-[#1877F2] rounded-2xl p-6 shadow-xl mb-4">
              <p className="text-gray-400 text-sm mb-1">Regular price: <span className="line-through font-bold">$197</span></p>
              <div className="flex items-baseline justify-center gap-1 mb-4">
                <span className="text-5xl font-extrabold text-gray-900">$39</span>
                <span className="text-2xl font-bold text-gray-400">.99</span>
                <span className="text-gray-500 text-sm ml-1">today only</span>
              </div>
              <button onClick={handleUnlock} disabled={unlocking}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#1877F2] text-white px-10 py-4 font-bold text-base rounded-xl hover:bg-[#1457C0] active:scale-[0.98] transition-all shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed">
                {unlocking ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                {unlocking ? 'Redirecting...' : 'Yes! Get My Audit for $39.99 →'}
              </button>
              <p className="text-xs text-gray-400 mt-3">🔒 Secure · One-time · Instant access</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}