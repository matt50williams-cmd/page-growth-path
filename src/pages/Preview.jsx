import { useEffect, useState } from "react";

const API_BASE = "https://pageaudit-engine.onrender.com";

export default function Preview() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pageAuditOrder");
    if (saved) {
      setOrder(JSON.parse(saved));
    }
  }, []);

  const handleUnlock = async () => {
    if (!order?.auditId) {
      alert("No audit found. Please start again.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/stripe/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audit_id: order.auditId,
          email: order.email,
          customer_name: order.name,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "No checkout URL returned");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Stripe checkout error:", err);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <nav className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <span className="font-bold text-base text-black tracking-tight">PageAudit Pro</span>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-black mb-4">
            Your Audit Preview Is Ready
          </h1>

          <p className="text-gray-600 text-base md:text-lg mb-10 max-w-xl mx-auto">
            We’ve prepared your audit preview. Unlock your full report to access your full
            breakdown, action plan, and recommendations inside your account.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 mb-8 max-w-lg mx-auto">
            <div className="text-sm text-gray-500 mb-2">Preview Locked</div>
            <div className="text-2xl font-bold text-gray-900 mb-3">$39.99</div>
            <div className="text-sm text-gray-600">
              One-time payment for full report access
            </div>
          </div>

          <button
            onClick={handleUnlock}
            disabled={loading}
            className="inline-flex items-center justify-center bg-[#1877F2] text-white px-8 py-4 rounded-2xl text-base font-bold hover:bg-[#1457C0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Redirecting..." : "Unlock Full Report"}
          </button>
        </div>
      </div>
    </div>
  );
}