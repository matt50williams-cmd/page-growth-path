import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Download, Share2, Eye, Loader2, LogOut } from "lucide-react";

export default function MyAudits() {
  const navigate = useNavigate();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Fetch audits created by this user
        const auditData = await base44.entities.Audit.filter({ created_by: userData.email });
        setAudits(auditData || []);
      } catch (err) {
        console.error("Error loading audits:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleDownload = async (auditId, name) => {
    try {
      const response = await base44.functions.invoke('downloadAuditPDF', { auditId });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-${name.replace(/\s/g, '-')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download PDF");
    }
  };

  const handleShare = (auditId) => {
    const url = `${window.location.origin}/report/${auditId}`;
    navigator.clipboard.writeText(url);
    alert("Report link copied to clipboard!");
  };

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1877F2]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAV */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-base text-black tracking-tight">PageAudit Pro</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.full_name || user?.email}</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black px-3 py-2 border border-gray-200 rounded-lg"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Audits</h1>
          <p className="text-gray-600">View and manage your Facebook page audits</p>
        </div>

        {audits.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-600 mb-4">You haven't created any audits yet.</p>
            <button
              onClick={() => navigate("/submit-your-page")}
              className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-6 py-2 rounded-lg hover:bg-[#1457C0]"
            >
              Create Your First Audit
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {audits.map((audit) => (
              <div key={audit.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{audit.customer_name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{audit.email}</p>
                    <p className="text-xs text-gray-500 mb-4">
                      Created: {new Date(audit.created_date).toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-block bg-blue-50 text-[#1877F2] text-xs px-3 py-1 rounded-full">
                        {audit.account_type}
                      </span>
                      <span className="inline-block bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full">
                        Completed
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/report/${audit.id}`)}
                      className="inline-flex items-center gap-1.5 text-[#1877F2] hover:text-[#1457C0] text-sm font-medium px-3 py-2 border border-[#1877F2] rounded-lg"
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                    <button
                      onClick={() => handleShare(audit.id)}
                      className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm font-medium px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                    <button
                      onClick={() => handleDownload(audit.id, audit.customer_name)}
                      className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm font-medium px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <Download className="w-4 h-4" /> PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}