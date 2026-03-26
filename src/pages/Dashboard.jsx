import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { audits as auditsApi } from "@/api/apiClient";
import { Eye, Download, Share2, CheckCircle, Clock, AlertCircle, Loader2, HelpCircle, X } from "lucide-react";

function StatusBadge({ status }) {
  const colors = {
    pending: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-600", icon: Clock },
    analyzing: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600", icon: Loader2 },
    completed: { bg: "bg-green-50", border: "border-green-200", text: "text-green-600", icon: CheckCircle },
    failed: { bg: "bg-red-50", border: "border-red-200", text: "text-red-600", icon: AlertCircle },
  };
  const style = colors[status] || colors.pending;
  const Icon = style.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${style.bg} border ${style.border} ${style.text}`}>
      <Icon className="w-3 h-3" /> {status || "unknown"}
    </span>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, isLoadingAuth } = useAuth();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!user) { navigate("/login"); return; }

    const loadData = async () => {
      try {
        const data = await auditsApi.list();
        setAudits(data || []);
      } catch (err) {
        console.error("Failed to load audits:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, isLoadingAuth, navigate]);

  const handleViewReport = (auditId) => navigate(`/report/${auditId}`);
  const handleDownloadPDF = (auditId) => window.open(`/report/${auditId}?print=true`, "_blank");
  const handleShareLink = (auditId) => {
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

  const latestAudit = audits[0];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm tracking-tight">PageAudit Pro</span>
            <span className="text-xs bg-blue-50 text-[#1877F2] px-2.5 py-1 rounded-full font-semibold">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setHelpOpen(true)}
              className="text-xs text-gray-500 hover:text-black border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-400 inline-flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" /> Help
            </button>
            <span className="text-xs text-gray-500">{user?.email}</span>
            <button onClick={() => logout("/")}
              className="text-xs text-gray-500 hover:text-black border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-400">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-6 py-10 md:py-14">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Welcome back, {user?.full_name || user?.email}</h1>
          <p className="text-gray-500">Manage your Facebook page audits and strategy reports below.</p>
        </div>

        {latestAudit && (
          <div className="bg-white border-2 border-[#1877F2] rounded-2xl p-8 mb-12 shadow-lg">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#1877F2] mb-2">Latest Audit</p>
                <h2 className="text-2xl font-bold text-gray-900">{latestAudit.customer_name || "Your Audit"}</h2>
                <p className="text-sm text-gray-500 mt-1">{latestAudit.facebook_url}</p>
              </div>
              <StatusBadge status={latestAudit.status} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                { label: "Overall Score", value: latestAudit.overall_score },
                { label: "Visibility", value: latestAudit.visibility_score },
                { label: "Content", value: latestAudit.content_score },
                { label: "Engagement", value: latestAudit.engagement_score },
                { label: "Growth", value: latestAudit.growth_score },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{label}</p>
                  <p className="text-xl font-bold text-[#1877F2]">{value != null ? Math.round(value) : "—"}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => handleViewReport(latestAudit.id)}
                className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-6 py-3 text-sm font-semibold rounded-lg hover:bg-[#1457C0] transition-colors">
                <Eye className="w-4 h-4" /> View Full Report
              </button>
              <button onClick={() => handleDownloadPDF(latestAudit.id)}
                className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 text-sm font-semibold rounded-lg hover:border-gray-400 transition-colors">
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button onClick={() => handleShareLink(latestAudit.id)}
                className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg transition-colors ${
                  copied === latestAudit.id ? "bg-green-50 border border-green-300 text-green-700" : "bg-white border border-gray-200 text-gray-700 hover:border-gray-400"
                }`}>
                {copied === latestAudit.id ? <CheckCircle className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                {copied === latestAudit.id ? "Copied!" : "Share"}
              </button>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">All Audits</h3>
          {audits.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <p className="text-gray-500 text-sm mb-4">No audits yet.</p>
              <button onClick={() => navigate("/submit-your-page")}
                className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-6 py-2 text-sm font-semibold rounded-lg hover:bg-[#1457C0] transition-colors">
                Create Your First Audit
              </button>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Page</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Score</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {audits.map((audit) => (
                    <tr key={audit.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{audit.customer_name || "—"}</p>
                        <p className="text-xs text-gray-500">{audit.facebook_url || "—"}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#1877F2]">{audit.overall_score != null ? Math.round(audit.overall_score) : "—"}</td>
                      <td className="px-6 py-4"><StatusBadge status={audit.status} /></td>
                      <td className="px-6 py-4 text-xs text-gray-500">{audit.created_at ? new Date(audit.created_at).toLocaleDateString() : "—"}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleViewReport(audit.id)} className="text-xs text-[#1877F2] hover:underline font-medium">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {helpOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Need Help?</h2>
              <button onClick={() => setHelpOpen(false)} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-6">Need help with your audit or account? Contact support.</p>
            <a href="mailto:support@pageauditpro.com"
              className="inline-flex items-center justify-center w-full bg-[#1877F2] text-white px-6 py-3 font-semibold rounded-lg hover:bg-[#1457C0] transition-colors">
              Email Support
            </a>
          </div>
        </div>
      )}
    </div>
  );
}