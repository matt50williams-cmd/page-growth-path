import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_BASE = "https://pageaudit-engine.onrender.com";

const SEO_TIPS = [
  "Google looks at over 200 factors to decide where your website shows up in search results.",
  "75% of people never scroll past the first page of Google. If you're not there, you're invisible.",
  "Websites with a phone number visible on the homepage get 50% more calls from Google searches.",
  "The text that shows up under your link on Google is one of the biggest factors in whether people click.",
  "Adding your city name to your website helps Google show you to nearby customers searching for your services.",
  "Websites that load in under 3 seconds get twice as many visitors as slow ones.",
  "Having a Google Business Profile is free and can instantly put you on Google Maps for local searches.",
  "Businesses that respond to Google reviews rank higher than businesses that ignore them.",
];

export default function SeoLoadingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auditId = searchParams.get("audit_id");
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % SEO_TIPS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!auditId) {
      navigate("/dashboard");
      return;
    }

    // Trigger the SEO report generation
    fetch(`${API_BASE}/api/audits/${auditId}/run-seo`, { method: "POST" }).catch(() => {});

    // Poll for completion
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/audits/${auditId}`);
        if (!res.ok) return;
        const audit = await res.json();
        if (audit.status === "completed") {
          clearInterval(poll);
          navigate(`/report/${auditId}`);
        } else if (audit.status === "failed") {
          clearInterval(poll);
          navigate(`/dashboard?seo_failed=true`);
        }
      } catch (err) {
        console.error("Poll error:", err);
      }
    }, 5000);

    return () => clearInterval(poll);
  }, [auditId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
          We're analyzing your website...
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          This usually takes 30-60 seconds. We'll send you straight to your report when it's ready.
        </p>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-6 min-h-[100px] flex flex-col items-center justify-center">
          <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">Did you know?</p>
          <p className="text-sm text-gray-600 leading-relaxed animate-pulse">
            {SEO_TIPS[tipIndex]}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Analyzing your website right now...
        </div>
      </div>
    </div>
  );
}
