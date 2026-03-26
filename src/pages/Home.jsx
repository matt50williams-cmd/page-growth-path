import { ArrowRight, CheckCircle, TrendingUp, Target, Zap, BarChart2, AlertTriangle, Shield, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { trackEvent, EVENTS } from "@/utils/tracking";
import Footer from "@/components/Footer";
import { base44 } from "@/api/base44Client";
import { getStoredUtmParams } from "@/utils/utm";

function SectionLabel({ text, color = "text-[#1877F2]" }) {
  return (
    <p className={`text-xs font-bold uppercase tracking-[0.25em] ${color} mb-5`}>{text}</p>
  );
}

function PrimaryButton({ onClick, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 bg-gradient-to-b from-[#2563EB] to-[#1d4ed8] text-white font-bold rounded-xl hover:from-[#1d4ed8] hover:to-[#1e40af] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 ${className}`}
    >
      {children}
    </button>
  );
}

export default function Home() {
  useEffect(() => {
    const trackLandingView = async () => {
      const utm = getStoredUtmParams() || {};
      console.log("landing_viewed event fired");
      try {
        await base44.functions.invoke('trackFunnel', {
          event_type: 'landing_viewed',
          utm_source: utm.utm_source || null,
          utm_campaign: utm.utm_campaign || null,
          utm_adset: utm.utm_adset || null,
          utm_ad: utm.utm_ad || null,
        });
      } catch (err) {
        console.error("Failed to track landing_viewed:", err);
      }
    };
    trackLandingView();
  }, []);
  const navigate = useNavigate();

  useEffect(() => {
    trackEvent(EVENTS.LANDING_VIEWED);
  }, []);
  const goToAudit = () => {
    console.log("[FUNNEL] HOME → SUBMIT");
    navigate("/submit-your-page");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased flex flex-col">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1877F2] flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-gray-900">PageAudit Pro</span>
          </div>
          <a href="mailto:support@yourdomain.com" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
            Help
          </a>
          <button
            onClick={() => base44.auth.redirectToLogin("/dashboard")}
            className="inline-flex items-center gap-2.5 bg-gradient-to-b from-[#2563EB] to-[#1d4ed8] text-white font-bold rounded-xl hover:from-[#1d4ed8] hover:to-[#1e40af] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 text-sm px-5 py-2.5"
          >
            Login <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="px-4 pt-24 pb-28 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-[#1877F2] text-xs font-semibold px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2] animate-pulse" />
            Facebook Business Page Audits
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.08] tracking-tight mb-7">
            Turn Your Facebook Page{" "}
            <span className="text-[#1877F2]">Into a Growth Engine</span>
          </h1>
          <p className="text-xl text-gray-500 leading-[1.75] max-w-2xl mx-auto mb-11">
            We show you exactly what's holding your page back — and give you a clear, step-by-step plan to grow your audience and build real momentum.
          </p>
          <div className="flex flex-col items-center gap-4">
            <PrimaryButton onClick={goToAudit} className="text-base px-10 py-5">
              Get My Page Audit <ArrowRight className="w-5 h-5" />
            </PrimaryButton>
            <a href="mailto:support@yourdomain.com" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Need help? Contact support
            </a>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
              {["No fluff. Just a clear plan.", "Built for real business growth", "Instant access"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-sm text-gray-400">
                  <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="px-4 py-24 bg-[#fafafa] border-y border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel text="The Problem" />
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
              Stop Guessing.{" "}
              <span className="text-[#1877F2]">Start Growing.</span>
            </h2>
            <p className="text-gray-500 mt-5 text-lg leading-[1.75] max-w-xl mx-auto">Most business pages look active but fail to generate real results. Here's what's holding them back.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Posting consistently but seeing little engagement or reach",
              "Page isn't optimized to be discovered by new audiences",
              "Unclear which content actually drives meaningful results",
              "Losing visibility to competitors with stronger page presence",
            ].map((item) => (
              <div key={item} className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200">
                <div className="w-2 h-2 rounded-full bg-[#2563EB] mt-2 shrink-0 opacity-60" />
                <p className="text-sm text-[#475569] leading-[1.7]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section className="px-4 py-24 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel text="The Solution" />
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
              Fix What's <span className="text-[#1877F2]">Costing You Customers</span>
            </h2>
            <p className="text-gray-500 mt-5 text-lg leading-[1.75] max-w-xl mx-auto">A complete audit of every factor holding your page back from generating leads.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: Target, label: "Page Setup & Visibility", desc: "Is your page configured to be found by new customers?" },
              { icon: BarChart2, label: "Content & Posting Patterns", desc: "What's working, what's hurting reach, and what to post instead" },
              { icon: TrendingUp, label: "Engagement Signals", desc: "How your audience is — or isn't — responding to your content" },
              { icon: AlertTriangle, label: "Growth Blockers", desc: "The hidden issues silently killing your organic reach" },
              { icon: Zap, label: "7-Day Action Plan", desc: "A step-by-step playbook you can start executing today" },
              { icon: CheckCircle, label: "Lead Generation Potential", desc: "How to convert followers into paying customers" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-[#fafafa] border border-gray-100 rounded-2xl p-6 hover:border-blue-100 hover:bg-blue-50/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-[#1877F2] transition-colors">
                  <Icon className="w-5 h-5 text-[#1877F2] group-hover:text-white transition-colors" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
                <p className="text-sm text-gray-500 leading-[1.65]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUE ── */}
      <section className="px-4 py-24 bg-gradient-to-br from-[#1565D3] via-[#1877F2] to-[#1e90ff]">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <SectionLabel text="Personalized, Not Generic" color="text-blue-200" />
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
            Know Exactly What to Do Next
          </h2>
          <p className="text-blue-100 text-xl leading-[1.75]">
            You'll get a personalized growth plan for your Facebook Business Page — with specific actions to turn your page into a growth engine that generates customers, visibility, and momentum consistently.
          </p>
          <div className="flex flex-col items-center gap-3 pt-2">
            <button
              onClick={goToAudit}
              className="inline-flex items-center gap-2.5 bg-white text-[#1877F2] px-10 py-4 text-base font-bold rounded-xl hover:bg-blue-50 active:scale-[0.98] transition-all shadow-xl"
            >
              Get My Page Audit <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-blue-200 text-sm">One-time payment · Instant access</p>
          </div>
        </div>
      </section>

      {/* ── RESULTS ── */}
      <section className="px-4 py-24 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel text="What You Get" />
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
              Your Page. <span className="text-[#1877F2]">Fully Optimized.</span>
            </h2>
            <p className="text-gray-500 mt-5 text-lg leading-[1.75] max-w-lg mx-auto">Everything you need to turn a dormant page into a real growth engine for your business.</p>
          </div>
          <div className="space-y-3 max-w-xl mx-auto">
            {[
              "A clear breakdown of exactly what's hurting your growth",
              "A 7-day action plan you can implement immediately",
              "Content ideas tailored to your business and audience",
              "A roadmap for consistent, long-term customer growth",
            ].map((item, i) => (
              <div key={item} className="flex items-center gap-4 bg-[#fafafa] border border-gray-100 rounded-xl px-6 py-5 hover:border-green-200 transition-colors">
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-green-600">{i + 1}</span>
                </div>
                <p className="text-sm font-medium text-gray-800 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center gap-3 mt-12">
            <PrimaryButton onClick={goToAudit} className="text-base px-10 py-5">
              Start My Audit — $39.99 <ArrowRight className="w-5 h-5" />
            </PrimaryButton>
            <p className="text-sm text-gray-400">One-time payment · No contracts · Instant access</p>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="px-4 py-24 bg-[#fafafa] border-y border-gray-100">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-14">
            <SectionLabel text="Pricing" />
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">One Audit. Real Results.</h2>
            <p className="text-gray-500 mt-4 text-lg leading-[1.75]">No contracts. No fluff. Just a clear plan to get more customers.</p>
          </div>

          <div className="relative bg-white border-2 border-[#1877F2] rounded-3xl px-8 pt-10 pb-8 shadow-2xl shadow-blue-100 text-center overflow-hidden">
            {/* Top badge */}
            <div className="absolute top-0 inset-x-0 flex justify-center">
              <span className="bg-[#1877F2] text-white text-xs font-bold px-5 py-1.5 rounded-b-xl tracking-wide">
                LIMITED TIME OFFER
              </span>
            </div>

            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Business Page Audit</p>

            <p className="text-sm text-gray-400 mb-1">
              <span className="line-through text-gray-300 mr-2">Normally $79</span>
              <span className="text-green-600 font-bold">50% off — Today only</span>
            </p>
            <div className="flex items-end justify-center gap-1 mb-4">
              <span className="text-7xl font-extrabold text-gray-900 leading-none">$39</span>
              <span className="text-3xl font-bold text-gray-400 mb-2">.99</span>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {[
                { icon: Clock, label: "Delivered within 1 hour" },
                { icon: Shield, label: "One-time payment" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Icon className="w-3 h-3" />{label}
                </span>
              ))}
            </div>

            <ul className="space-y-3 text-left mb-8 border-t border-gray-100 pt-6">
              {[
                "Full page audit & scoring across 5 key areas",
                "7-day personalized action plan",
                "Content strategy ideas for your niche",
                "Growth blocker breakdown",
                "Lead generation recommendations",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-700 leading-relaxed">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <PrimaryButton onClick={goToAudit} className="w-full justify-center text-base py-4">
              Start My Audit Now <ArrowRight className="w-5 h-5" />
            </PrimaryButton>
            <p className="text-xs text-gray-400 mt-4">Instant access. No contracts. No hidden fees.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}