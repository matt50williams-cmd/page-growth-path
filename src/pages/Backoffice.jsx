import { useState, useEffect } from "react";
import { ExternalLink, RefreshCw, X, ChevronRight, TrendingUp, AlertCircle, CheckCircle2, DollarSign, Users, Eye, ShoppingCart, BarChart2, LogOut, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE = "https://pageaudit-engine.onrender.com";

function apiFetch(path, options = {}) {
  const token = localStorage.getItem('pageaudit_token');
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  }).then(r => r.json());
}

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

function MetricCard({ icon: Icon, label, value, subtext, color = "text-blue-600", bg = "bg-blue-50" }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <div className="text-sm text-gray-800 break-words">{value || "—"}</div>
    </div>
  );
}

function AuditDetail({ auditId, onClose }) {
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/audits/${auditId}`)
      .then(data => { setAudit(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [auditId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-base">Audit Details</h2>
            <p className="text-xs text-gray-400 font-mono">ID: {auditId}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-2 border-gray-200 border-t-[#1877F2] rounded-full animate-spin" />
          </div>
        ) : audit ? (
          <div className="px-6 py-5 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Status" value={<StatusBadge status={audit.status} />} />
              <Field label="Name" value={audit.customer_name} />
              <Field label="Email" value={<span className="font-mono text-xs">{audit.email}</span>} />
              <Field label="Paid" value={audit.paid ? <span className="text-green-600 font-semibold">✓ ${audit.amount_paid}</span> : <span className="text-gray-400">No</span>} />
            </div>

            <div className="border-t pt-4 space-y-3">
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Page Info</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Facebook URL" value={
                  audit.facebook_url ? (
                    <a href={audit.facebook_url} target="_blank" rel="noopener noreferrer" className="text-[#1877F2] underline text-xs inline-flex items-center gap-1">
                      View Page <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : "—"
                } />
                <Field label="Goals" value={audit.goals} />
                <Field label="Posting Frequency" value={audit.posting_frequency} />
                <Field label="Content Type" value={audit.content_type} />
              </div>
            </div>

            {(audit.overall_score || audit.visibility_score) && (
              <div className="border-t pt-4 space-y-3">
                <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Scores</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {[
                    { label: "Overall", value: audit.overall_score },
                    { label: "Visibility", value: audit.visibility_score },
                    { label: "Content", value: audit.content_score },
                    { label: "Consistency", value: audit.consistency_score },
                    { label: "Engagement", value: audit.engagement_score },
                    { label: "Growth", value: audit.growth_score },
                  ].map(({ label, value }) => value ? (
                    <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      <p className="text-lg font-bold text-[#1877F2]">{Math.round(value)}</p>
                    </div>
                  ) : null)}
                </div>
              </div>
            )}

            {audit.report_text && (
              <div className="border-t pt-4 space-y-3">
                <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Report Preview</p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm max-h-80 overflow-y-auto text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {audit.report_text.slice(0, 2000)}{audit.report_text.length > 2000 ? '...' : ''}
                </div>
                <a href={`/report/${audit.id}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#1877F2] hover:underline">
                  View Full Report <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <div className="border-t pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <Field label="Created" value={audit.created_at ? new Date(audit.created_at).toLocaleDateString() : "—"} />
              <Field label="Updated" value={audit.updated_at ? new Date(audit.updated_at).toLocaleDateString() : "—"} />
              <Field label="Scraper" value={<span className="capitalize">{audit.scraper_status || "—"}</span>} />
            </div>
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">Audit not found</div>
        )}
      </div>
    </div>
  );
}

function DeleteConfirm({ audit, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Audit?</h2>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to delete the audit for <strong>{audit.customer_name || audit.email}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:border-gray-400 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

const TABS = ["Overview", "Customers", "Revenue", "Funnel", "Drop-offs"];

export default function Backoffice() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");
  const [audits, setAudits] = useState([]);
  const [overview, setOverview] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewingId, setViewingId] = useState(null);
  const [deletingAudit, setDeletingAudit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/dashboard');
  }, [user, navigate]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [auditsData, overviewData, revenueData, funnelData] = await Promise.all([
        apiFetch('/api/admin/audits'),
        apiFetch('/api/admin/overview'),
        apiFetch('/api/admin/revenue'),
        apiFetch('/api/admin/funnel'),
      ]);
      setAudits(Array.isArray(auditsData) ? auditsData : []);
      setOverview(overviewData);
      setRevenue(revenueData);
      setFunnel(funnelData);
    } catch (err) {
      console.error('Failed to load backoffice data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleDelete = async (audit) => {
    try {
      await apiFetch(`/api/admin/audits/${audit.id}`, { method: 'DELETE' });
      setAudits(prev => prev.filter(a => a.id !== audit.id));
      setDeletingAudit(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const filtered = audits.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchSearch = !searchTerm || o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || o.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusBreakdown = [
    { name: 'Completed', value: audits.filter(a => a.status === 'completed').length, fill: '#10b981' },
    { name: 'Analyzing', value: audits.filter(a => a.status === 'analyzing').length, fill: '#1877F2' },
    { name: 'Pending', value: audits.filter(a => a.status === 'pending').length, fill: '#f59e0b' },
    { name: 'Failed', value: audits.filter(a => a.status === 'failed').length, fill: '#ef4444' },
  ].filter(d => d.value > 0);

  const funnelSteps = funnel?.funnel_counts ? [
    { name: 'Landing Views', value: Number(funnel.funnel_counts.find(f => f.event_type === 'landing_viewed')?.count || 0) },
    { name: 'Intake Submitted', value: Number(funnel.funnel_counts.find(f => f.event_type === 'intake_submitted')?.count || 0) },
    { name: 'Preview Viewed', value: Number(funnel.funnel_counts.find(f => f.event_type === 'preview_viewed')?.count || 0) },
    { name: 'Unlock Clicked', value: Number(funnel.funnel_counts.find(f => f.event_type === 'unlock_clicked')?.count || 0) },
    { name: 'Paid', value: Number(funnel.funnel_counts.find(f => f.event_type === 'payment_success')?.count || 0) },
    { name: 'Account Created', value: Number(funnel.funnel_counts.find(f => f.event_type === 'account_created')?.count || 0) },
  ] : [];

  if (loading) {
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
            <span className="text-xs text-gray-500">{user?.email}</span>
            <button onClick={loadAll} className="text-xs text-gray-500 hover:text-black border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-400 inline-flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button onClick={() => logout('/')} className="text-xs text-gray-500 hover:text-black border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-400 inline-flex items-center gap-1.5">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`text-sm font-medium px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors ${activeTab === tab ? 'border-[#1877F2] text-[#1877F2]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">

        {/* OVERVIEW */}
        {activeTab === "Overview" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Command Center</h1>
              <p className="text-gray-500 text-sm">Everything you need to run and grow PageAudit Pro.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard icon={Eye} label="Views Today" value={overview?.today?.views ?? '—'} color="text-blue-600" bg="bg-blue-50" />
              <MetricCard icon={ShoppingCart} label="Sales Today" value={overview?.today?.sales ?? '—'} color="text-green-600" bg="bg-green-50" />
              <MetricCard icon={DollarSign} label="Revenue Today" value={`$${(overview?.today?.revenue ?? 0).toFixed(2)}`} color="text-emerald-600" bg="bg-emerald-50" />
              <MetricCard icon={Users} label="Total Users" value={overview?.all_time?.users ?? '—'} color="text-purple-600" bg="bg-purple-50" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard icon={TrendingUp} label="All-Time Revenue" value={`$${(overview?.all_time?.revenue ?? 0).toFixed(2)}`} color="text-emerald-600" bg="bg-emerald-50" />
              <MetricCard icon={ShoppingCart} label="All-Time Sales" value={overview?.all_time?.sales ?? '—'} color="text-blue-600" bg="bg-blue-50" />
              <MetricCard icon={BarChart2} label="Conversion Rate" value={`${overview?.all_time?.conversion_rate ?? 0}%`} color="text-orange-600" bg="bg-orange-50" />
              <MetricCard icon={CheckCircle2} label="Total Audits" value={audits.length} color="text-indigo-600" bg="bg-indigo-50" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Audit Status Breakdown</h3>
                {statusBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={statusBreakdown} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {statusBreakdown.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-gray-400 text-center py-12">No data yet</p>}
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  {[
                    { label: "Completion Rate", value: audits.length > 0 ? `${Math.round((audits.filter(a=>a.status==='completed').length / audits.length)*100)}%` : '—', color: 'text-green-600' },
                    { label: "Failure Rate", value: audits.length > 0 ? `${Math.round((audits.filter(a=>a.status==='failed').length / audits.length)*100)}%` : '—', color: 'text-red-600' },
                    { label: "Avg Revenue per Sale", value: overview?.all_time?.sales > 0 ? `$${(overview.all_time.revenue / overview.all_time.sales).toFixed(2)}` : '—', color: 'text-emerald-600' },
                    { label: "Paid Audits", value: audits.filter(a => a.paid).length, color: 'text-blue-600' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{label}</span>
                      <span className={`font-bold text-sm ${color}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMERS */}
        {activeTab === "Customers" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">All Customers</h1>
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
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
            <p className="text-xs text-gray-400">{filtered.length} results</p>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Name / Email", "Facebook Page", "Goals", "Status", "Score", "Paid", "Date", ""].map(h => (
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
                          <a href={audit.facebook_url} target="_blank" rel="noopener noreferrer" className="text-[#1877F2] hover:underline inline-flex items-center gap-1">
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[120px] truncate">{audit.goals || "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={audit.status} /></td>
                      <td className="px-4 py-3 font-bold text-[#1877F2] text-center">{audit.overall_score ? Math.round(audit.overall_score) : "—"}</td>
                      <td className="px-4 py-3">{audit.paid ? <span className="text-green-600 font-semibold text-xs">✓ ${audit.amount_paid}</span> : <span className="text-gray-400 text-xs">—</span>}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{audit.created_at ? new Date(audit.created_at).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setViewingId(audit.id)} className="text-xs text-[#1877F2] hover:underline inline-flex items-center gap-1">
                            View <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeletingAudit(audit)} className="text-xs text-red-400 hover:text-red-600 inline-flex items-center gap-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="text-center text-gray-400 text-sm py-12">No customers match your filters.</p>}
            </div>
          </div>
        )}

        {/* REVENUE */}
        {activeTab === "Revenue" && (
          <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Revenue</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard icon={DollarSign} label="All-Time Revenue" value={`$${(revenue?.all_time?.revenue ?? 0).toFixed(2)}`} color="text-emerald-600" bg="bg-emerald-50" />
              <MetricCard icon={ShoppingCart} label="Total Paid Audits" value={revenue?.all_time?.paid_audits ?? '—'} color="text-blue-600" bg="bg-blue-50" />
              <MetricCard icon={DollarSign} label="Revenue Today" value={`$${(revenue?.today?.revenue ?? 0).toFixed(2)}`} color="text-green-600" bg="bg-green-50" />
              <MetricCard icon={Users} label="Total Users" value={revenue?.total_users ?? '—'} color="text-purple-600" bg="bg-purple-50" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6">Daily Revenue (Last 30 Days)</h3>
              {revenue?.daily_revenue?.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={revenue.daily_revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                    <Tooltip formatter={v => [`$${Number(v).toFixed(2)}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#1877F2" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No revenue data yet — make your first sale!</div>
              )}
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6">Daily Orders</h3>
              {revenue?.daily_revenue?.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={revenue.daily_revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#1877F2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-400 text-sm">No orders yet.</div>
              )}
            </div>
          </div>
        )}

        {/* FUNNEL */}
        {activeTab === "Funnel" && (
          <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Conversion Funnel</h1>
            {funnelSteps.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6">Full Funnel</h3>
                <div className="space-y-3">
                  {funnelSteps.map((step, i) => {
                    const top = funnelSteps[0].value || 1;
                    const pct = Math.round((Number(step.value) / top) * 100);
                    const dropoff = i > 0 ? Math.round(((funnelSteps[i-1].value - step.value) / (funnelSteps[i-1].value || 1)) * 100) : 0;
                    return (
                      <div key={step.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{step.name}</span>
                          <div className="flex items-center gap-3">
                            {i > 0 && dropoff > 0 && <span className="text-xs text-red-500">-{dropoff}% drop</span>}
                            <span className="text-sm font-bold text-gray-900">{step.value}</span>
                            <span className="text-xs text-gray-400">{pct}%</span>
                          </div>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#1877F2] rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-400">
                No funnel data yet. Traffic tracking will appear here once visitors start coming.
              </div>
            )}
            {funnel?.campaigns?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Campaign Performance</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["Source", "Campaign", "Views", "Intakes", "Purchases", "Conv %"].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {funnel.campaigns.map((c, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium">{c.utm_source || "—"}</td>
                        <td className="px-3 py-2 text-gray-500">{c.utm_campaign || "—"}</td>
                        <td className="px-3 py-2">{c.views}</td>
                        <td className="px-3 py-2">{c.intakes}</td>
                        <td className="px-3 py-2 font-bold text-green-600">{c.purchases}</td>
                        <td className="px-3 py-2 text-[#1877F2] font-bold">
                          {c.views > 0 ? `${Math.round((c.purchases / c.views) * 100)}%` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* DROP-OFFS */}
        {activeTab === "Drop-offs" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Warm Leads</h1>
              <p className="text-gray-500 text-sm mt-1">People who started but didn't buy — your best re-engagement opportunities.</p>
            </div>
            {funnel?.dropoffs?.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["Email", "Facebook Page", "Source", "Campaign", "Date"].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {funnel.dropoffs.map((d, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-700">{d.email || "—"}</td>
                        <td className="px-4 py-3 text-xs">
                          {d.facebook_url ? (
                            <a href={d.facebook_url} target="_blank" rel="noopener noreferrer" className="text-[#1877F2] hover:underline inline-flex items-center gap-1">
                              View <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{d.utm_source || "organic"}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{d.utm_campaign || "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{d.created_at ? new Date(d.created_at).toLocaleDateString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-400">
                No drop-offs yet. Once people start the form without buying, they'll appear here.
              </div>
            )}
          </div>
        )}
      </div>

      {viewingId && <AuditDetail auditId={viewingId} onClose={() => setViewingId(null)} />}
      {deletingAudit && (
        <DeleteConfirm
          audit={deletingAudit}
          onConfirm={() => handleDelete(deletingAudit)}
          onCancel={() => setDeletingAudit(null)}
        />
      )}
    </div>
  );
}