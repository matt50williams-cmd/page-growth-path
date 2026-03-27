import { ArrowRight, CheckCircle, TrendingUp, Target, Zap, BarChart2, AlertTriangle, Shield, Clock, Star, Users, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { trackEvent, EVENTS } from "@/utils/tracking";
import Footer from "@/components/Footer";

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

function CountdownTimer() {
  const [time, setTime] = useState({ hours: 23, minutes: 47, seconds: 12 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex items-center gap-2 justify-center">
      {[{ label: 'HRS', value: time.hours }, { label: 'MIN', value: time.minutes }, { label: 'SEC', value: time.seconds }].map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <div className="bg-gray-900 text-white font-bold text-lg w-12 h-12 rounded-lg flex items-center justify-center">
            {String(value).padStart(2, '0')}
          </div>
          <span className="text-xs text-gray-500 mt-1">{label}</span>
        </div>
      ))}
    </div>
  );
}

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    business: "Boutique Owner",
    text: "I was posting every day and getting nowhere. This audit showed me exactly why — and gave me a plan to fix it. My engagement doubled in 2 weeks.",
    stars: 5,
  },
  {
    name: "James T.",
    business: "Real Estate Agent",
    text: "I almost paid $800 to a marketing agency. This gave me the same insights for $39.99. My page went from dead to generating actual leads.",
    stars: 5,
  },
  {
    name: "Maria L.",
    business: "Restaurant Owner",
    text: "Worth every penny. I finally understand what my audience wants to see. Bookings are up 40% since I implemented the strategy.",
    stars: 5,
  },
];

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    trackEvent(EVENTS.LANDING_VIEWED);
  }, []);

  const goToAudit = () => navigate("/submit-your-page");

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased flex flex-col">

      {/* TOP BAR */}
      <div className="bg-[#1877F2] text-white text-xs font-semibold py-2 px-4 text-center">
        🔥 Launch Special — Price goes up to $197 soon. Lock in $39.99 today.
      </div>

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1877F2] flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-gray-900">PageAudit <span className="text-[#1877F2]">Pro</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 bg-gradient-to-b from-[#2563EB] to-[#1d4ed8] text-white font-bold rounded-xl text-sm px-5 py-2.5 hover:from-[#1d4ed8] hover:to-[#1e40af] transition-all shadow-lg shadow-blue-500/25"
          >
            Login <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="px-4 pt-16 pb-20 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Social proof bar */}
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-4 py-2 rounded-full mb-8">
            <span className="flex">{'★★★★★'}</span>
            <span>Trusted by 500+ Facebook business page owners</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.08] tracking-tight mb-6">
            Your Facebook Page Is{" "}
            <span className="text-red-500">Losing You Customers</span>{" "}
            Every Single Day
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-500 leading-[1.75] max-w-3xl mx-auto mb-4">
            We analyze your page using the same tools agencies charge <span className="line-through text-gray-400">$500–$2,000</span> for — and give you a complete growth plan in under 60 minutes.
          </p>

          <p className="text-lg font-bold text-[#1877F2] mb-10">For just $39.99. One time. No contracts.</p>

          <div className="flex flex-col items-center gap-4">
            <PrimaryButton onClick={goToAudit} className="text-lg px-12 py-5">
              Get My Facebook Audit Now <ArrowRight className="w-5 h-5" />
            </PrimaryButton>
            <p className="text-sm text-gray-400">⚡ Report delivered in under 60 minutes · No subscription required</p>
            
            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {[
                { icon: Shield, text: "Secure Payment" },
                { icon: Clock, text: "60-Min Delivery" },
                { icon: Award, text: "Data-Backed Analysis" },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                  <Icon className="w-3.5 h-3.5 text-green-500" />{text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PAIN POINTS */}
      <section className="px-4 py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
              Does Any of This Sound Familiar?
            </h2>
            <p className="text-gray-400 text-lg">If you're nodding your head, your page has fixable problems — and we'll show you exactly what they are.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "You post consistently but your reach keeps dropping",
              "You're getting likes but no actual customers or leads",
              "You don't know what content actually works for your audience",
              "Competitors with worse products have bigger pages than you",
              "You've tried boosting posts but wasted money with nothing to show",
              "You know your page could be doing more but don't know where to start",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 bg-gray-800 rounded-xl p-5">
                <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                <p className="text-gray-300 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-white font-bold text-lg mb-4">These aren't random problems. They have specific causes — and specific fixes.</p>
            <PrimaryButton onClick={goToAudit} className="text-base px-10 py-4">
              Show Me What's Wrong With My Page <ArrowRight className="w-5 h-5" />
            </PrimaryButton>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-4 py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel text="Simple 3-Step Process" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
              Your Growth Plan in Under 60 Minutes
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: Target, title: "Submit Your Page", desc: "Tell us about your Facebook page, your goals, and what you're struggling with. Takes less than 2 minutes." },
              { step: "02", icon: BarChart2, title: "We Analyze Everything", desc: "Our AI engine analyzes your page across 5 key growth areas using the same data agencies pay thousands for." },
              { step: "03", icon: TrendingUp, title: "Get Your Growth Plan", desc: "Receive a personalized, actionable report with a 7-day plan you can start implementing immediately." },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-[#1877F2]" />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
                  <span className="text-xs font-bold text-[#1877F2] bg-blue-50 px-2 py-0.5 rounded-full">{step}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="px-4 py-20 bg-[#fafafa] border-y border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel text="What's Inside Your Report" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
              Everything You Need to Turn Your Page Into a <span className="text-[#1877F2]">Lead Machine</span>
            </h2>
            <p className="text-gray-500 text-lg">Agencies charge $500–$2,000 for this. You're getting it for $39.99.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              { icon: "📊", title: "Full Page Score", desc: "Scored across 5 key areas: Visibility, Content, Consistency, Engagement, and Growth Potential" },
              { icon: "🎯", title: "Your #1 Growth Blocker", desc: "The single biggest thing killing your reach — and the exact fix to implement this week" },
              { icon: "📅", title: "7-Day Action Plan", desc: "Day-by-day tasks you can start immediately. No guesswork, just clear steps." },
              { icon: "📝", title: "Weekly Content Strategy", desc: "Exactly what to post, when to post it, and what CTAs to use for your specific audience" },
              { icon: "💡", title: "5 High-Converting Post Ideas", desc: "Ready-to-use content ideas tailored to your business and goals" },
              { icon: "🚀", title: "30-Day Growth Roadmap", desc: "A clear path from where you are now to where you want to be — with milestones" },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <span className="text-2xl shrink-0">{icon}</span>
                <div>
                  <p className="font-bold text-gray-900 mb-1">{title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <PrimaryButton onClick={goToAudit} className="text-base px-10 py-4">
              Get My Full Report — $39.99 <ArrowRight className="w-5 h-5" />
            </PrimaryButton>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-4 py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel text="Real Results" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
              Business Owners Who Stopped Guessing
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, business, text, stars }) => (
              <div key={name} className="bg-[#fafafa] border border-gray-100 rounded-2xl p-6">
                <div className="flex text-yellow-400 mb-3">
                  {'★★★★★'}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{text}"</p>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{name}</p>
                  <p className="text-xs text-gray-500">{business}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AGENCY COMPARISON */}
      <section className="px-4 py-20 bg-gradient-to-br from-[#1565D3] via-[#1877F2] to-[#2563eb]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-6">
            Why Pay an Agency $500–$2,000<br />When You Can Get More for $39.99?
          </h2>
          <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto mb-10">
            <div className="bg-white/10 rounded-2xl p-5 text-left">
              <p className="text-blue-200 text-xs font-bold uppercase tracking-wide mb-3">Marketing Agency</p>
              {["$500–$2,000 cost", "1–2 week wait", "Generic recommendations", "One-time report", "No follow-up plan"].map(item => (
                <div key={item} className="flex items-center gap-2 mb-2">
                  <span className="text-red-400 text-sm">✗</span>
                  <span className="text-white text-sm">{item}</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-5 text-left">
              <p className="text-[#1877F2] text-xs font-bold uppercase tracking-wide mb-3">PageAudit Pro</p>
              {["Just $39.99", "Under 60 minutes", "100% personalized", "Actionable plan included", "7-day + 30-day roadmap"].map(item => (
                <div key={item} className="flex items-center gap-2 mb-2">
                  <span className="text-green-500 text-sm">✓</span>
                  <span className="text-gray-900 text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <PrimaryButton onClick={goToAudit} className="bg-white text-[#1877F2] hover:bg-blue-50 text-base px-10 py-4">
            Get My Audit for $39.99 <ArrowRight className="w-5 h-5" />
          </PrimaryButton>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="px-4 py-20 bg-[#fafafa]">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <SectionLabel text="Simple Pricing" />
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">One Payment. Real Results.</h2>
            <p className="text-gray-500 mt-3">No subscriptions. No hidden fees. Just a clear plan.</p>
          </div>

          <div className="relative bg-white border-2 border-[#1877F2] rounded-3xl px-8 pt-12 pb-8 shadow-2xl shadow-blue-100 text-center overflow-hidden">
            <div className="absolute top-0 inset-x-0 flex justify-center">
              <span className="bg-[#1877F2] text-white text-xs font-bold px-6 py-1.5 rounded-b-xl tracking-wide">
                🔥 LIMITED LAUNCH PRICING
              </span>
            </div>

            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-1">What agencies charge: <span className="line-through font-bold">$500–$2,000</span></p>
              <p className="text-gray-400 text-sm mb-3">Our regular price: <span className="line-through font-bold">$197</span></p>
              <div className="flex items-end justify-center gap-1">
                <span className="text-7xl font-extrabold text-gray-900 leading-none">$39</span>
                <span className="text-3xl font-bold text-gray-400 mb-2">.99</span>
              </div>
              <p className="text-green-600 font-bold text-sm mt-2">You save $157 today</p>
            </div>

            <div className="mb-6">
              <p className="text-xs text-gray-500 font-semibold mb-3">Price goes up when the timer hits zero:</p>
              <CountdownTimer />
            </div>

            <ul className="space-y-3 text-left mb-8 border-t border-gray-100 pt-6">
              {[
                "Full page audit & scoring across 5 areas",
                "Personalized 7-day action plan",
                "Weekly content strategy for your niche",
                "5 high-converting post ideas",
                "30-day growth roadmap",
                "Instant access — report in under 60 min",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <PrimaryButton onClick={goToAudit} className="w-full justify-center text-base py-4">
              Yes! Get My Audit for $39.99 <ArrowRight className="w-5 h-5" />
            </PrimaryButton>
            <p className="text-xs text-gray-400 mt-4">🔒 Secure payment · One-time charge · No contracts</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 py-20 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel text="Common Questions" />
            <h2 className="text-3xl font-extrabold text-gray-900">Everything You Need to Know</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "How long does it take to get my report?", a: "Most reports are delivered in under 60 minutes. We analyze your page immediately after you submit." },
              { q: "Do I need to give you access to my Facebook page?", a: "No. You just tell us your Facebook page URL and answer a few quick questions about your goals. That's it." },
              { q: "What if my page is brand new?", a: "The audit works for pages at any stage. For newer pages, we focus more on setup optimization and content strategy to help you grow faster from the start." },
              { q: "How is this different from what a marketing agency does?", a: "Agencies charge $500–$2,000 and take weeks. We deliver the same data-backed analysis in under 60 minutes for $39.99 — personalized to your specific page and goals." },
              { q: "What if I'm not happy with my report?", a: "We stand behind our work. If your report doesn't give you clear, actionable insights, contact us at support@pageauditpros.com and we'll make it right." },
              { q: "Can I get audited again in the future?", a: "Yes! Many customers come back every 30–60 days to track their progress. We also offer a monthly Growth Plan for ongoing rescans and strategy updates." },
            ].map(({ q, a }) => (
              <div key={q} className="bg-[#fafafa] border border-gray-100 rounded-2xl p-6">
                <p className="font-bold text-gray-900 mb-2">{q}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 py-20 bg-gray-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
            Your Competitors Are Getting Smarter.<br />Are You?
          </h2>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            Every day you wait is another day your page is losing potential customers. Get your audit today and start growing tomorrow.
          </p>
          <PrimaryButton onClick={goToAudit} className="text-lg px-12 py-5">
            Get My Facebook Audit — $39.99 <ArrowRight className="w-5 h-5" />
          </PrimaryButton>
          <p className="text-gray-500 text-sm mt-4">⚡ Report in under 60 minutes · One-time payment · No contracts</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}