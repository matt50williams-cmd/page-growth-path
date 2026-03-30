import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { CheckCircle, Globe, Zap, Search, BarChart2, ArrowRight, Loader2 } from "lucide-react";

const API_BASE = "https://pageaudit-engine.onrender.com";

const FEATURES = [
  { icon: Search, title: "Keyword Gap Analysis", desc: "See exactly which keywords your competitors rank for that you don't — and how to close the gap fast." },
  { icon: Globe, title: "Technical SEO Audit", desc: "We check 40+ technical factors: page speed, mobile-friendliness, crawl errors, broken links, and more." },
  { icon: BarChart2, title: "On-Page SEO Review", desc: "Title tags, meta descriptions, H1s, image alt tags, internal linking — every page element scored and graded." },
  { icon: Zap, title: "30-Day Action Plan", desc: "A prioritized step-by-step plan showing exactly what to fix first to get the fastest ranking improvements." },
  { icon: CheckCircle, title: "Competitor Comparison", desc: "See how your site stacks up against your top 3 local competitors — and what they're doing that you're not." },
  { icon: CheckCircle, title: "Google Business Profile Tips", desc: "Bonus tips to optimize your Google Business Profile for more local search visibility." },
];

export default function SeoAuditPage() {
  const navigate = useNavigate();
  const { user, isLoadingAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [website, setWebsite] = useState("");

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!user) { navigate("/login"); return; }
  }, [user, isLoadingAuth, navigate]);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/stripe/seo-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          customer_name: user.full_name || user.email,
          website_url: website,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("SEO checkout error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-sm tracking-tight">PageAudit Pro</span>
          <button onClick={() => navigate("/dashboard")} className="text-sm text-[#1877F2] font-semibold hover:underline">
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12">
        <div className="text-center mb-12">
          <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-4">ONE-TIME REPORT — NO SUBSCRIPTION</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Full Website SEO Audit<br />
            <span className="text-[#1877F2]">Fix What's Hiding You on Google</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-6">
            Most small business websites have 10–20 fixable SEO issues costing them customers every day. Our AI finds every one of them and tells you exactly how to fix them.
          </p>
          <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-3 text-sm font-medium text-yellow-800">
            ⏱ Report delivered in under 60 seconds
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-[#1877F2]" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm mb-1">{title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border-2 border-[#1877F2] rounded-3xl p-8 shadow-lg text-center max-w-lg mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1877F2] mb-2">Get Your Full SEO Audit</p>
          <div className="mb-2">
            <span className="text-5xl font-extrabold text-gray-900">$29</span>
            <span className="text-2xl font-bold text-gray-900">.99</span>
          </div>
          <p className="text-sm text-gray-500 mb-6">One-time payment — full report delivered instantly</p>

          <div className="mb-4 text-left">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Website URL</label>
            <input
              type="url"
              placeholder="https://yourbusiness.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#1877F2] transition-all mb-1"
            />
            <p className="text-xs text-gray-400">We'll audit this website and deliver your full report</p>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading || !website.trim()}
            className="w-full bg-[#1877F2] text-white text-base font-bold py-4 rounded-2xl hover:bg-[#1457C0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <>Get My SEO Audit <ArrowRight className="w-5 h-5" /></>}
          </button>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
            <span>🔒 Secure payment</span>
            <span>•</span>
            <span>💳 All cards accepted</span>
            <span>•</span>
            <span>✅ Instant delivery</span>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            💯 <strong>100% Satisfaction Guarantee</strong> — If you're not happy with your report, email us and we'll make it right.
          </p>
        </div>
      </div>
    </div>
  );
}