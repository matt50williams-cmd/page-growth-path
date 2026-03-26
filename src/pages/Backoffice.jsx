import { useState, useEffect } from "react";
import { ExternalLink, RefreshCw, X, ChevronRight, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

function StatusBadge({ status }) {
  const statusMap = {
    pending: { color: "bg-orange-100 text-orange-600", label: "Awaiting Analysis" },
    analyzing: { color: "bg-blue-100 text-blue-700", label: "Analyzing Page" },
    completed: { color: "bg-green-100 text-green-700", label: "Completed" },
    failed: { color: "bg-red-100 text-red-600", label: "Failed" },
  };
  const config = statusMap[status] || { color: "bg-gray-100 text-gray-500", label: status || "Unknown" };
  return (
    <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
}

function MetricCard({ icon: Icon, label, value, subtext, color = "text-blue-600" }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  );
}

function ReportText({ text }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const isHeading = /^#{1,3} /.test(line) || /^[A-Z][A-Z\s]{4,}:?$/.test(line.trim());
        const clean = line.replace(/^#{1,3} /, "");
        if (!clean.trim()) return <div key={i} className="h-2" />;
        return (
          <p key={i} className={isHeading ? "font-semibold text-black mt-4 mb-1" : "text-gray-700 leading-relaxed"}>
            {clean}
          </p>
        );
      })}
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

function OrderDetail({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Audit.filter({ id: orderId })
      .then((data) => {
        if (data?.length) setOrder(data[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-black text-base mb-1">Audit Details</h2>
            <p className="text-xs text-gray-500 font-mono">{orderId}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-2 border-gray-200 border-t-[#1877F2] rounded-full animate-spin" />
          </div>
        ) : order ? (
          <div className="px-6 py-5 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Status" value={<StatusBadge status={order.status} />} />
              <Field label="Data Confidence" value={<span className="text-xs capitalize">{order.data_confidence || "—"}</span>} />
              <Field label="Email" value={<span className="text-sm font-mono">{order.email}</span>} />
              <Field label="Name" value={order.customer_name || "—"} />
            </div>

            <div className="border-t pt-4 space-y-3">
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Audit Info</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Account Type" value={order.account_type || "—"} />
                <Field label="Facebook URL" value={
                  order.facebook_url ? (
                    <a href={order.facebook_url} target="_blank" rel="noopener noreferrer"
                      className="text-[#1877F2] underline break-all inline-flex items-center gap-1 text-xs">
                      View Page <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : "—"
                } />
                <Field label="Goals" value={order.goals || "—"} />
                <Field label="Posting Frequency" value={order.posting_frequency || "—"} />
                <Field label="Content Type" value={order.content_type || "—"} />
                <Field label="Struggles" value={order.struggles || "—"} />
              </div>
            </div>

            {(order.overall_score || order.visibility_score) && (
              <div className="border-t pt-4 space-y-3">
                <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Performance Scores</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Overall", value: order.overall_score },
                    { label: "Visibility", value: order.visibility_score },
                    { label: "Content", value: order.content_score },
                    { label: "Consistency", value: order.consistency_score },
                    { label: "Engagement", value: order.engagement_score },
                    { label: "Growth", value: order.growth_score },
                  ].map(({ label, value }) =>
                    value ? (
                      <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                        <p className="text-lg font-bold text-[#1877F2]">{value}</p>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {order.report_text && (
              <div className="border-t pt-4 space-y-3">
                <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Full Report</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm max-h-[32rem] overflow-y-auto">
                  <ReportText text={order.report_text} />
                </div>
              </div>
            )}

            <div className="border-t pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <Field label="Created" value={new Date(order.created_date).toLocaleDateString()} />
              <Field label="Updated" value={new Date(order.updated_date).toLocaleDateString()} />
              {order.scraper_status && <Field label="Scraper Status" value={<span className="capitalize">{order.scraper_status}</span>} />}
            </div>
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">Audit not found</div>
        )}
      </div>
    </div>
  );
}

export default function Backoffice() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await base44.entities.Audit.list();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      throw new Error(err.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders().catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  // Calculate metrics
  const today = new Date();
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const filteredOrders = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter || (statusFilter === 'pending_completed' && ['pending', 'completed'].includes(o.status));
    const matchSearch = !searchTerm || o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || o.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const todayCount = orders.filter(o => new Date(o.created_date).toDateString() === today.toDateString()).length;
  const weekCount = orders.filter(o => new Date(o.created_date) >= thisWeekStart).length;
  const monthCount = orders.filter(o => new Date(o.created_date) >= thisMonthStart).length;
  const failedCount = orders.filter(o => o.status === 'failed').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;

  const statusBreakdown = [
    { name: 'Completed', value: completedCount, fill: '#10b981' },
    { name: 'Analyzing', value: orders.filter(o => o.status === 'analyzing').length, fill: '#3b82f6' },
    { name: 'Pending', value: orders.filter(o => o.status === 'pending').length, fill: '#f59e0b' },
    { name: 'Failed', value: failedCount, fill: '#ef4444' },
  ].filter(d => d.value > 0);

  const truncate = (str, n = 30) => str && str.length > n ? str.slice(0, n) + "…" : str;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-black text-base">PageAudit Pro</span>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Back Office</span>
          </div>
          <button
            onClick={() => fetchOrders().catch((e) => setError(e.message))}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black border border-gray-200 px-3 py-1.5 rounded hover:border-gray-400 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-lg font-semibold text-black">Command Center</h1>
          {!loading && <span className="text-xs text-gray-400">{orders.length} total audits</span>}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">{error}</div>
        )}

        {!loading && (
          <>
            {/* METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <MetricCard icon={TrendingUp} label="Today" value={todayCount} color="text-blue-600" />
              <MetricCard icon={TrendingUp} label="This Week" value={weekCount} color="text-green-600" />
              <MetricCard icon={TrendingUp} label="This Month" value={monthCount} color="text-purple-600" />
              <MetricCard icon={CheckCircle2} label="Completed" value={completedCount} color="text-green-600" />
              <MetricCard icon={AlertCircle} label="Failed" value={failedCount} color="text-red-600" />
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Status Breakdown</h3>
                {statusBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={statusBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-12">No data available</p>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Audits</span>
                    <span className="font-bold text-gray-900">{orders.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-bold text-green-600">{orders.length > 0 ? Math.round((completedCount / orders.length) * 100) : 0}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Failure Rate</span>
                    <span className="font-bold text-red-600">{orders.length > 0 ? Math.round((failedCount / orders.length) * 100) : 0}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t pt-3">
                    <span className="text-gray-600">Avg. per Day (This Month)</span>
                    <span className="font-bold text-blue-600">{Math.ceil(monthCount / Math.max(1, today.getDate()))}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FILTERS */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending_completed">Pending & Completed</option>
                  <option value="pending">Pending</option>
                  <option value="analyzing">Analyzing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-black">Audit List</h2>
              {!loading && <span className="text-xs text-gray-400">{filteredOrders.length} results</span>}
            </div>
          </>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-[#1877F2] rounded-full animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-24">No audits match your filters.</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["Order ID", "Name", "Facebook URL", "Account Type", "Goals", "Status", "Score", "Confidence", ""].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono whitespace-nowrap">{String(order.id).slice(0, 8)}…</td>
                      <td className="px-4 py-3 text-gray-700 text-sm">{order.customer_name || order.email}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[140px] truncate">
                        {order.facebook_url
                          ? <a href={order.facebook_url} target="_blank" rel="noopener noreferrer" className="text-[#1877F2] hover:underline inline-flex items-center gap-1">{truncate(order.facebook_url, 20)}<ExternalLink className="w-3 h-3 shrink-0" /></a>
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{order.account_type || "—"}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[120px]">{truncate(order.goals, 30) || "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={order.status} /></td>
                      {order.overall_score && <td className="px-4 py-3 text-center"><span className="font-bold text-[#1877F2]">{order.overall_score}</span></td>}
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{order.data_confidence || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setViewingId(order.id)} className="inline-flex items-center gap-1 text-xs text-[#1877F2] hover:underline whitespace-nowrap">
                          View <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden space-y-3">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-mono mb-0.5">{String(order.id).slice(0, 12)}…</p>
                      <p className="text-sm font-medium text-black truncate">{order.customer_name || order.email}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="text-xs text-gray-500 mb-3 space-y-0.5">
                    <p>{order.account_type || "—"}</p>
                    {order.goals && <p className="truncate">{truncate(order.goals)}</p>}
                  </div>
                  <button onClick={() => setViewingId(order.id)} className="text-xs text-[#1877F2] hover:underline">
                    View details →
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {viewingId && <OrderDetail orderId={viewingId} onClose={() => setViewingId(null)} />}
    </div>
  );
}