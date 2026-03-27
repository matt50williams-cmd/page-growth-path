import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { ExternalLink, RefreshCw, Eye, X, TrendingUp, Users, Zap, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';

const API_BASE = "https://pageaudit-engine.onrender.com";

function apiFetch(path) {
  const token = localStorage.getItem('pageaudit_token');
  return fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then(r => r.json());
}

function stripFbUrl(url) {
  if (!url) return '';
  return url
    .replace('https://www.facebook.com/', '')
    .replace('http://www.facebook.com/', '')
    .replace('https://facebook.com/', '')
    .replace('http://facebook.com/', '')
    .slice(0, 24);
}

function StatusBadge({ status }) {
  const map = {
    pending: { color: "bg-orange-100 text-orange-600", label: "Pending", icon: Clock },
    analyzing: { color: "bg-blue-100 text-blue-700", label: "Analyzing", icon: Loader2 },
    completed: { color: "bg-green-100 text-green-700", label: "Completed", icon: CheckCircle },
    failed: { color: "bg-red-100 text-red-600", label: "Failed", icon: AlertCircle },
  };
  const config = map[status] || { color: "bg-gray-100 text-gray-500", label: status || "Unknown", icon: Clock };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${config.color}`}>
      <Icon className="w-3 h-3" /> {config.label}
    </span>
  );
}

export default function Admin() {
  const { user, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadAudits();
  }, [user, isLoadingAuth]);

  const loadAudits = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api/admin/audits');
      setAudits(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load audits');
    } finally {
      setLoading(false);
    }
  };

  const filtered = audits.filter(a => {
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchSearch = !searchTerm || a.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || a.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const completedCount = audits.filter(a => a.status === 'completed').length;
  const failedCount = audits.filter(a => a.status === 'failed').length;

  if (isLoadingAuth || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#1877F2] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-900">PageAudit Pro</span>
            <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-semibold">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/backoffice')}
              className="text-xs text-[#1877F2] hover:underline">
              Full Backoffice
            </button>
            <button onClick={loadAudits}
              className="text-xs text-gray-500 hover:text-black border border-gray-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Management</h1>
          <p className="text-gray-500 text-sm mt-1">View and manage all customer audits.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Audits", value: audits.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Completed", value: completedCount, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
            { label: "Failed", value: failedCount, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
            { label: "Completion Rate", value: audits.length > 0 ? `${Math.round((completedCount / audits.length) * 100)}%` : '—', icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">{label}</p>
                  <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder="Search by name or email..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2]/30" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2]/30">
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="analyzing">Analyzing</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Name / Email", "Facebook Page", "Status", "Score", "Date", ""].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(audit => (
                <tr key={audit.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{audit.customer_name || "—"}</p>
                    <p className="text-xs text-gray-400 font-mono">{audit.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {audit.facebook_url ? (
                      <a href={audit.facebook_url} target="_blank" rel="noopener noreferrer"
                        className="text-[#1877F2] hover:underline inline-flex items-center gap-1">
                        {stripFbUrl(audit.facebook_url)} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={audit.status} /></td>
                  <td className="px-4 py-3 font-bold text-[#1877F2]">{audit.overall_score ? Math.round(audit.overall_score) : "—"}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{audit.created_at ? new Date(audit.created_at).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setViewingId(audit.id)}
                      className="text-xs text-[#1877F2] hover:underline inline-flex items-center gap-1">
                      View <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-12">No audits match your filters.</p>
          )}
        </div>
      </div>

      {viewingId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Audit Details</h2>
              <button onClick={() => setViewingId(null)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5">
              <a href={`/report/${viewingId}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#1877F2] hover:underline">
                View Full Report <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}