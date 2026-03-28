import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Star, BarChart2, Globe } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 47, seconds: 33 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) return { hours, minutes, seconds: seconds - 1 };
        if (minutes > 0) return { hours, minutes: minutes - 1, seconds: 59 };
        if (hours > 0) return { hours: hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* TOP BAR */}
      <div className="bg-[#1877F2] text-white text-center py-2.5 px-4">
        <p className="text-xs font-semibold">
          🎁 Limited Time: Get Your Facebook Audit + <span className="underline font-bold">FREE Website SEO Score</span> — Today Only!
        </p>
      </div>

      {/* NAV */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#1877F2]" />
            <span className="font-bold text-base text-black tracking-tight">PageAudit Pro</span>
          </div>
          <button onClick={() => navigate('/submit-your-page')}
            className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-5 py-2.5 text-sm font-bold rounded-xl hover:bg-[#1457C0] transition-colors shadow-md shadow-blue-100">
            Get My Free Audit <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-gradient-to-br from-[#0f2a6b] via-[#1877F2] to-[#2563eb] text-white py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-xs font-semibold mb-6 backdrop-blur-sm">
            ⚡ Powered by 4 AI Systems Working Together
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Find Out Why Your Facebook Page<br />
            <span className="text-yellow-300">Isn't Growing</span> — In Minutes
          </h1>
          <p className="text-blue-100 text-lg md:text-xl mb-4 max-w-2xl mx-auto leading-relaxed">
            Get a full Facebook growth audit <strong className="text-white">AND a free website SEO score</strong> — both for just $39.99. Agencies charge $500–$2,000 for the same thing.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-semibold backdrop-blur-sm">
              <span>📘</span> Full Facebook Growth Audit
            </div>
            <div className="bg-yellow-400/20 border border-yellow-400/40 rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-semibold text-yellow-200">
              <span>🎁</span> FREE Website SEO Score — Limited Time!
            </div>
          </div>

          {/* FIXED COUNTDOWN TIMER */}
          <div className="inline-block bg-white/10 border border-white/20 rounded-2xl px-6 py-4 mb-8 backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-3">⏰ Limited Time Offer Expires In:</p>
            <div className="flex items-end justify-center gap-1">
              <div className="text-center">
                <div className="text-3xl font-extrabold text-white">{pad(timeLeft.hours)}</div>
                <div className="text-xs text-blue-200 font-semibold">HRS</div>
              </div>
              <div className="text-2xl font-bold text-blue-200 mb-4 mx-1">:</div>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-white">{pad(timeLeft.minutes)}</div>
                <div className="text-xs text-blue-200 font-semibold">MIN</div>
              </div>
              <div className="text-2xl font-bold text-blue-200 mb-4 mx-1">:</div>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-white">{pad(timeLeft.seconds)}</div>
                <div className="text-xs text-blue-200 font-semibold">SEC</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/submit-your-page')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#1877F2] px-8 py-4 text-base font-extrabold rounded-2xl hover:bg-blue-50 transition-all shadow-xl">
              Get My Facebook Audit + Free SEO Score <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <p className="text-blue-200 text-xs mt-4">🔒 One-time payment · No subscription · Instant access</p>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1877F2] text-center mb-3">What's Included</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-4">Two Reports. One Price.</h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">Agencies charge $500–$2,000 for just the Facebook audit. We include both for $39.99.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-[#1877F2] rounded-3xl p-7 shadow-lg">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#1877F2] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">f</span>
                </div>
                <div>
                  <p className="font-extrabold text-gray-900">Facebook Growth Audit</p>
                  <p className="text-xs text-gray-400">Full analysis + action plan</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  "Honest page assessment — no fluff",
                  "Your #1 growth blocker identified",
                  "7-day action plan you can start today",
                  "Custom content strategy + 3 post ideas",
                  "Followers → customers blueprint",
                  "30-day growth roadmap",
                ].map(item => (
                  <div key={item} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    <p className="text-sm text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border-2 border-yellow-400 rounded-3xl p-7 shadow-lg relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-extrabold px-3 py-1 rounded-full">
                FREE BONUS
              </div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-yellow-900" />
                </div>
                <div>
                  <p className="font-extrabold text-gray-900">Website SEO Score</p>
                  <p className="text-xs text-gray-400">See how Google sees your site</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  "Overall SEO score out of 100",
                  "Top 3 issues hurting your ranking",
                  "The single most important fix",
                  "What you're already doing well",
                  "Side-by-side in your dashboard",
                  "Upgrade to full SEO report anytime",
                ].map(item => (
                  <div key={item} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-yellow-900" />
                    </div>
                    <p className="text-sm text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button onClick={() => navigate('/submit-your-page')}
              className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-10 py-4 text-base font-extrabold rounded-2xl hover:bg-[#1457C0] transition-all shadow-lg shadow-blue-200">
              Get Both Reports for $39.99 <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-gray-400 text-xs mt-3">Regular price $197 · You save $157 · Limited time</p>
          </div>
        </div>
      </section>

      {/* PAIN POINTS */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1877F2] text-center mb-3">Sound Familiar?</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-10">Every Business Owner Has Been Here</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { emoji: "😤", text: "\"I post all the time but nobody sees it\"" },
              { emoji: "🤷", text: "\"I have no idea what to post anymore\"" },
              { emoji: "💸", text: "\"I tried ads but wasted my money\"" },
              { emoji: "😩", text: "\"My competitor has way fewer followers but more engagement\"" },
              { emoji: "🔍", text: "\"My website isn't showing up on Google\"" },
              { emoji: "⏰", text: "\"I don't have time to figure all this out\"" },
            ].map(({ emoji, text }) => (
              <div key={text} className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-3">
                <span className="text-2xl shrink-0">{emoji}</span>
                <p className="text-sm font-semibold text-gray-700">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <p className="text-lg font-bold text-gray-900 mb-2">We fix all of this in one report.</p>
            <p className="text-sm text-gray-500">Our AI analyzes your Facebook page AND your website, then gives you a specific action plan to fix every problem — in plain English.</p>
          </div>
        </div>
      </section>

      {/* VS AGENCY */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1877F2] text-center mb-3">The Comparison</p>
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-10">Why Pay an Agency $2,000?</h2>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100">
              <div className="px-4 py-3 text-xs font-bold text-gray-400 uppercase"></div>
              <div className="px-4 py-3 text-xs font-bold text-gray-700 uppercase text-center">Marketing Agency</div>
              <div className="px-4 py-3 text-xs font-bold text-[#1877F2] uppercase text-center">PageAudit Pro</div>
            </div>
            {[
              ["Cost", "$500–$2,000", "$39.99"],
              ["Facebook Audit", "✅", "✅"],
              ["Website SEO Score", "❌ Extra cost", "✅ FREE included"],
              ["Turnaround", "1–2 weeks", "Instant"],
              ["Action Plan", "Generic advice", "Your specific plan"],
              ["Contract", "3–12 months", "One-time, no contract"],
            ].map(([label, agency, ours], i) => (
              <div key={label} className={`grid grid-cols-3 border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <div className="px-4 py-3.5 text-sm font-semibold text-gray-700">{label}</div>
                <div className="px-4 py-3.5 text-sm text-gray-500 text-center">{agency}</div>
                <div className="px-4 py-3.5 text-sm font-bold text-[#1877F2] text-center">{ours}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1877F2] text-center mb-3">How It Works</p>
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-10">3 Simple Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", icon: "📋", title: "Answer 7 Quick Questions", desc: "Tell us about your business and Facebook page. Takes less than 3 minutes on your phone." },
              { step: "2", icon: "🤖", title: "4 AIs Analyze Everything", desc: "Our AI systems analyze your Facebook page and website simultaneously to find every growth opportunity." },
              { step: "3", icon: "📈", title: "Get Your Action Plan", desc: "Receive your Facebook audit AND free SEO score with specific steps to start growing today." },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{icon}</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-[#1877F2] text-white text-xs font-bold flex items-center justify-center mx-auto mb-3">
                  {step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1877F2] text-center mb-3">Real Results</p>
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-10">What Business Owners Are Saying</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Sarah M.", biz: "Boutique Owner", stars: 5, text: "I had no idea my posting times were killing my reach. The 7-day action plan was so specific — I followed it and doubled my engagement in 2 weeks." },
              { name: "Mike T.", biz: "HVAC Company", stars: 5, text: "Got the Facebook audit AND found out my website had 3 major SEO issues. Fixed them in a weekend. Worth every penny." },
              { name: "Jessica R.", biz: "Restaurant Owner", stars: 5, text: "My competitor had half my followers but 10x the engagement. Now I know exactly why and what to do. Game changer." },
            ].map(({ name, biz, stars, text }) => (
              <div key={name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex gap-0.5 mb-3">
                  {Array(stars).fill(0).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">"{text}"</p>
                <div>
                  <p className="text-sm font-bold text-gray-900">{name}</p>
                  <p className="text-xs text-gray-400">{biz}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1877F2] mb-3">Simple Pricing</p>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-10">One Price. Everything Included.</h2>
          <div className="bg-white border-2 border-[#1877F2] rounded-3xl p-8 shadow-xl">
            <p className="text-sm text-gray-400 mb-1">What agencies charge: <span className="line-through font-bold">$500–$2,000</span></p>
            <p className="text-sm text-gray-400 mb-1">Our regular price: <span className="line-through font-bold text-gray-500">$197</span></p>
            <p className="text-green-600 font-bold text-sm mb-3">Today only — 80% off</p>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-6xl font-extrabold text-gray-900">$39</span>
              <span className="text-3xl font-bold text-gray-400">.99</span>
            </div>
            <p className="text-green-600 font-semibold text-sm mb-6">You save $157</p>
            <div className="space-y-2 mb-6 text-left">
              {[
                "✅ Full Facebook Growth Audit",
                "✅ 7-Day Action Plan",
                "✅ 30-Day Roadmap",
                "🎁 FREE Website SEO Score",
                "🎁 FREE SEO Issues Report",
                "⚡ Instant delivery",
                "🔒 One-time payment, no subscription",
              ].map(item => (
                <p key={item} className="text-sm text-gray-700 font-medium">{item}</p>
              ))}
            </div>
            <button onClick={() => navigate('/submit-your-page')}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1877F2] text-white px-8 py-4 font-extrabold text-base rounded-xl hover:bg-[#1457C0] transition-all shadow-lg shadow-blue-200">
              Get My Audit + Free SEO Score <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-xs text-gray-400 mt-3">🔒 Secure payment · No contracts · No hidden fees</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1877F2] text-center mb-3">FAQ</p>
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-10">Common Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Do I need a Facebook page to get the audit?", a: "No! If you don't have a Facebook page yet, we'll include a complete guide on setting one up for maximum impact from day one." },
              { q: "What if I don't have a website?", a: "No problem — the website SEO score is a bonus. You'll still get the full Facebook growth audit even without a website." },
              { q: "How is this different from free tools?", a: "Free tools give generic scores. We give you a specific action plan written for YOUR business type, YOUR goals, and YOUR city. Completely personalized." },
              { q: "How long does it take?", a: "Our AI generates your report in minutes. You'll have your full audit and SEO score ready before you finish your coffee." },
              { q: "What if I'm not happy with the report?", a: "Our reports are packed with specific, actionable insights tailored to your exact business. If you have any questions about your results, our support team at support@pageauditpros.com is here to help you get the most out of it." },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white border border-gray-100 rounded-2xl p-5">
                <p className="font-bold text-gray-900 mb-2 text-sm">Q: {q}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-[#0f2a6b] via-[#1877F2] to-[#2563eb] text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Stop Guessing. Start Growing.</h2>
          <p className="text-blue-100 mb-8 text-lg">Get your Facebook audit AND free website SEO score for just $39.99. The same insights agencies charge thousands for.</p>
          <button onClick={() => navigate('/submit-your-page')}
            className="inline-flex items-center gap-2 bg-white text-[#1877F2] px-10 py-4 text-base font-extrabold rounded-2xl hover:bg-blue-50 transition-all shadow-xl">
            Get My Audit + Free SEO Score <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-blue-200 text-xs mt-4">🔒 One-time · No subscription · Instant access · $39.99</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#1877F2]" />
            <span className="font-bold text-white text-sm">PageAudit Pro</span>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <a href="/terms" className="hover:text-white transition-colors">Terms & Conditions</a>
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="mailto:support@pageauditpros.com" className="hover:text-white transition-colors">support@pageauditpros.com</a>
          </div>
          <p className="text-xs">© 2026 PageAudit Pro. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
