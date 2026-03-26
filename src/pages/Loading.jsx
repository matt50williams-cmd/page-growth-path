import { useEffect, useState } from "react";
import { trackEvent, EVENTS } from "@/utils/tracking";

const LOADING_STEPS = [
  "Reviewing your page details…",
  "Preparing your audit preview…",
  "Getting everything ready…",
];

export default function Loading() {
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const savedOrder = localStorage.getItem("pageAuditOrder");
        if (!savedOrder) {
          setError("No audit order found.");
          return;
        }

        trackEvent(EVENTS.INTAKE_STARTED);

        const stepInterval = setInterval(() => {
          setCurrentStep((prev) => {
            if (prev < LOADING_STEPS.length - 1) return prev + 1;
            clearInterval(stepInterval);
            return prev;
          });
        }, 1500);

        await new Promise((resolve) => setTimeout(resolve, 4500));

        clearInterval(stepInterval);

        window.location.href = "/preview";
      } catch (err) {
        console.error("Loading error:", err);
        setError(err.message || "Something went wrong");
      }
    };

    init();
  }, []);

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
            <button
              onClick={() => (window.location.href = "/submit-your-page")}
              className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-6 py-3 text-sm font-bold rounded-xl hover:bg-[#1457C0] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
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

      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-lg flex flex-col items-center text-center">
          <div className="w-14 h-14 border-4 border-gray-100 border-t-[#1877F2] rounded-full mb-8 animate-spin" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-black mb-2">
            Preparing Your Audit Preview…
          </h1>
          <p className="text-gray-600 text-base mb-8">
            We’re getting everything ready so you can unlock your full report.
          </p>

          <div className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-5 text-left space-y-3">
            {LOADING_STEPS.map((step, i) => (
              <div
                key={step}
                className={`flex items-center gap-3 text-sm transition-opacity duration-300 ${
                  i <= currentStep ? "text-gray-700 opacity-100" : "text-gray-400 opacity-50"
                }`}
              >
                <span className="w-5 h-5 shrink-0 flex items-center justify-center">
                  {i < currentStep ? (
                    <span className="text-xs text-green-500">✓</span>
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1877F2]" />
                  )}
                </span>
                {step}
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-8">This will only take a moment…</p>
        </div>
      </div>
    </div>
  );
}