import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Eye, Download, Share2, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";

const API_BASE = "https://pageaudit-engine.onrender.com";

function StatusBadge({ status }) {
  const statusMap = {
    pending: { color: "bg-orange-100 text-orange-600", label: "Pending" },
    analyzing: { color: "bg-blue-100 text-blue-700", label: "Analyzing" },
    completed: { color: "bg-green-100 text-green-700", label: "Completed" },
    failed: { color: "bg-red-100 text-red-600", label: "Failed" },
  };
  const config = statusMap[status] || { color: "bg-gray-100 text-gray-500", label: status || "Unknown" };
  return <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${config.color}`}>{config.label}</span>;
}

export default function MyAudits() {
  const navigate = useNavigate();
  const { user, logout, isLoadingAuth } = useAuth();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!user) { navigate("/login"); return; }

    const token = localStorage.getItem('pageaudit_token');
    fetch(`${API_BASE}/api/audits`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.json())
      .then(data => { setAudits(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, isLoadingAuth, navigate]);

  const handleShare = (auditId) => {
    navigator.clipboard.writeText(`${window.location.origin}/report/${auditId}`);
    setCopied(auditId);
    setTimeout(() => setCopied(null), 2500);
  };

  if (loading || isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#1877F2] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-sm tracking-tight">PageAudit Pro</span>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="text-xs text-gray-500 hover:text-black">Dashboard</button>
            <button onClick={() => logout("/")} className="text-xs text-gray-500 hover:text-black border border-gray-200 px-3 py-1.5 rounded-lg">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Audits</h1>

        {audits.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <p className="text-gray-500 text-sm mb-4">No audits yet.</p>
            <button onClick={() => navigate("/submit-your-page")}
              className="bg-[#1877F2] text-white px-6 py-2 text-sm font-semibold rounded-lg hover:bg-[#1457C0] transition-colors">
              Start Your First Audit
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Page", "Score", "Status", "Date", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {audits.map(audit => (
                  <tr key={audit.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{audit.customer_name || "—"}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[200px]">{audit.facebook_url || "—"}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#1877F2]">{audit.overall_score ? Math.round(audit.overall_score) : "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={audit.status} /></td>
                    <td className="px-4 py-3 text-xs text-gray-500">{audit.created_at ? new Date(audit.created_at).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/report/${audit.id}`)}
                          className="text-xs text-[#1877F2] hover:underline inline-flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button onClick={() => handleShare(audit.id)}
                          className="text-xs text-gray-500 hover:text-gray-700 inline-flex items-center gap-1">
                          {copied === audit.id ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Share2 className="w-3.5 h-3.5" />}
                          {copied === audit.id ? "Copied!" : "Share"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}