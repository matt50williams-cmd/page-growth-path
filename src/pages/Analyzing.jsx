import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const statusMessages = [
  "Analyzing your Facebook page...",
  "Reviewing your content strategy...",
  "Identifying growth opportunities...",
  "Building your custom growth plan...",
  "Finalizing your audit...",
];

export default function Analyzing() {
  const navigate = useNavigate();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if order exists
    const order = localStorage.getItem("pageAuditOrder");
    if (!order) {
      navigate("/submit-your-page");
      return;
    }

    // Rotate messages every 1 second
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % statusMessages.length);
    }, 1000);

    // Update progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 2, 95));
    }, 100);

    // After 10 seconds, transition to preview
    const transitionTimer = setTimeout(() => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        navigate("/audit-preview");
      }, 300);
    }, 10000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
      clearTimeout(transitionTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center px-4">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 opacity-10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-md">
        {/* Logo/Title */}
        <div className="mb-12">
          <span className="inline-block font-bold text-sm tracking-tight text-white bg-white/10 border border-white/20 rounded-full px-4 py-2 backdrop-blur-md">
            PageAudit Pro
          </span>
        </div>

        {/* Spinner */}
        <div className="mb-10 flex justify-center">
          <div className="relative w-20 h-20">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            {/* Spinning ring */}
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white border-r-white/50 animate-spin" />
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="mb-8 h-12 flex items-center justify-center">
          <p className="text-lg font-semibold text-white/90 animate-fadeInOut">
            {statusMessages[currentMessageIndex]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/20">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-white/50 mt-2">{Math.round(progress)}%</p>
        </div>

        {/* Footer text */}
        <p className="text-xs text-white/40">
          Generating your personalized growth strategy...
        </p>
      </div>

      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(8px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-8px); }
        }
        .animate-fadeInOut {
          animation: fadeInOut 1s ease-in-out;
        }
      `}</style>
    </div>
  );
}