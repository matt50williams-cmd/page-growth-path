import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { trackEvent, EVENTS } from "@/utils/tracking";

const API_BASE = "https://pageaudit-engine.onrender.com";

export default function PreviewReport() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unlocking, setUnlocking] = useState(false);

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

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3">
          <span className="font-bold text-sm tracking-tight">PageAudit Pro</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="py-14 md:py-20 text-center border-b border-gray-100">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1877F2] mb-4">Your Facebook Audit</p>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 leading-tight max-w-3xl mx-auto">
            Your Full Data-Backed Audit Is Ready
          </h1>

          <div className="inline-block bg-white border-2 border-[#1877F2] rounded-2xl px-8 py-6 shadow-lg mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#1877F2] mb-3">Limited-Time Launch Pricing</p>
            <p className="text-sm text-gray-400 mb-1 line-through">$79.99</p>
            <div className="flex items-baseline justify-center gap-2 mb-5">
              <span className="text-4xl font-extrabold text-gray-900">$39.99</span>
              <span className="text-gray-500 text-sm">today</span>
            </div>
            <p className="text-xs text-gray-500 font-medium mb-5">One-time payment • Instant access</p>
            <button onClick={handleUnlock} disabled={unlocking}
              className="inline-flex items-center justify-center gap-2 bg-[#1877F2] text-white px-8 py-3 font-bold text-sm rounded-xl hover:bg-[#1457C0] active:scale-[0.98] transition-all shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed">
              {unlocking ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {unlocking ? 'Redirecting to checkout...' : 'Unlock Full Report'}
            </button>
          </div>

          {order && (
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
              Professional analysis of your Facebook Business Page with strategic recommendations.
            </p>
          )}
        </div>

        {order && (
          <div className="bg-white border border-gray-200 rounded-2xl p-7 md:p-8 mb-12 mt-12">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-2 rounded-full bg-[#1877F2]"></div>
              <h3 className="text-base font-bold text-gray-900">Your Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Business Name</p>
                <p className="text-sm font-bold text-gray-900 truncate">{order.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Facebook URL</p>
                <p className="text-sm font-bold text-gray-900 truncate">{order.pageUrl || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Main Goal</p>
                <p className="text-sm font-bold text-gray-900">{Array.isArray(order.mainGoal) ? order.mainGoal.join(", ") : order.mainGoal || "—"}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1877F2] mb-4">What's Included</p>
          <div className="bg-white border border-gray-200 rounded-2xl p-7 md:p-8">
            <ul className="space-y-3">
              {[
                "Executive summary of your page's performance",
                "What's holding your growth back (and how to fix it)",
                "Weekly content strategy tailored to your goals",
                "7-day action plan you can start immediately",
                "High-performing post ideas for your niche",
                "Growth tactics to increase engagement and reach",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-12">
          <div className="max-w-2xl mx-auto bg-white border-2 border-[#1877F2] rounded-2xl p-8 md:p-10 shadow-xl mb-8">
            <div className="text-center mb-8">
              <p className="text-sm text-gray-400 mb-2">Normally</p>
              <p className="text-lg line-through text-gray-300 mb-3">$79.99</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-extrabold text-gray-900">$39.99</span>
                <span className="text-gray-500 text-lg">today</span>
              </div>
              <p className="text-xs text-gray-400 mt-4 font-medium">One-time payment • Instant access • Downloadable report</p>
            </div>
            <button onClick={handleUnlock} disabled={unlocking}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1877F2] text-white px-10 py-4 font-bold text-base rounded-xl hover:bg-[#1457C0] active:scale-[0.98] transition-all shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed">
              {unlocking ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              {unlocking ? 'Redirecting...' : 'Unlock Full Report'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}