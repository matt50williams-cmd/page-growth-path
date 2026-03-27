import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://pageaudit-engine.onrender.com";

export default function ReportProcessing() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const auditId = params.get("id") || params.get("audit_id");
  const [audit, setAudit] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!auditId) return;

    const check = async () => {
      try {
        const token = localStorage.getItem('pageaudit_token');
        const res = await fetch(`${API_BASE}/api/audits/${auditId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (data && !data.error) {
          setAudit(data);
          if (data.status === "completed") {
            navigate(`/report/${auditId}`);
          }
        }
      } catch (err) {
        console.error("Error checking audit:", err);
      }
      setChecking(false);
    };

    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, [auditId, navigate]);

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col">
      <nav className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <span className="font-semibold text-base tracking-tight">PageAudit Pro</span>
        </div>
      </nav>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="w-14 h-14 rounded-full border-4 border-gray-100 border-t-[#1877F2] animate-spin mb-8" />
        <h1 className="text-2xl md:text-3xl font-semibold text-black mb-3">
          Your Report is Being Prepared
        </h1>
        <p className="text-gray-600 text-base mb-2 max-w-md leading-relaxed">
          We are analyzing your page and building your custom strategy report.
        </p>
        <p className="text-gray-400 text-sm">
          This usually takes about 60 seconds. You'll be redirected automatically.
        </p>
        {audit && (
          <div className="mt-10 border border-gray-100 rounded-xl px-6 py-4 max-w-sm w-full text-left">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Your Audit</p>
            <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Name:</span> {audit.customer_name}</p>
            <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Email:</span> {audit.email}</p>
            <p className="text-sm text-gray-700"><span className="font-medium">Status:</span> <span className="capitalize">{audit.status}</span></p>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-10">
          You can also check your dashboard anytime to view completed reports.
        </p>
        <button onClick={() => navigate("/dashboard")}
          className="mt-4 text-xs text-[#1877F2] hover:underline">
          Go to Dashboard →
        </button>
      </div>
    </div>
  );
}