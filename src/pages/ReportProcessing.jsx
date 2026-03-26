import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function ReportProcessing() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const [submission, setSubmission] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!id) return;

    const check = async () => {
      const s = await base44.entities.Submission.filter({ id });
      if (s && s.length > 0) {
        setSubmission(s[0]);
        if (s[0].status === "completed" && s[0].report_url) {
          window.location.href = s[0].report_url;
        }
      }
      setChecking(false);
    };

    check();
    const interval = setInterval(check, 30000); // re-check every 30s
    return () => clearInterval(interval);
  }, [id]);

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col">
      {/* NAV */}
      <nav className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <span className="font-semibold text-base tracking-tight">PageAudit Pro</span>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        {/* Spinner */}
        <div className="w-14 h-14 rounded-full border-4 border-gray-100 border-t-[#1877F2] animate-spin mb-8" />

        <h1 className="text-2xl md:text-3xl font-semibold text-black mb-3">
          Your Report is Being Prepared
        </h1>
        <p className="text-gray-600 text-base mb-2 max-w-md leading-relaxed">
          We are reviewing your page and building your custom report.
        </p>
        <p className="text-gray-400 text-sm">
          Your report will be ready within 1 hour.
        </p>

        {submission && (
          <div className="mt-10 border border-gray-100 rounded-xl px-6 py-4 max-w-sm w-full text-left">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Your submission</p>
            <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Name:</span> {submission.name}</p>
            <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Email:</span> {submission.email}</p>
            <p className="text-sm text-gray-700"><span className="font-medium">Type:</span> {submission.review_type} Review</p>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-10">
          We'll send your report to your email when it's ready. You can close this page.
        </p>
      </div>
    </div>
  );
}