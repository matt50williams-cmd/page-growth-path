import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { LayoutDashboard, Users, DollarSign, BarChart2, Globe, Star, TrendingUp, RefreshCw, Trash2, Mail, Loader2, LogOut, ChevronDown, UserCheck, AlertTriangle, Shield, Plus, X, TrendingDown, Minus } from "lucide-react";

const API_BASE = "https://pageaudit-engine.onrender.com";

const ICON_COLORS = { blue: "text-blue-500", green: "text-green-500", purple: "text-purple-500", orange: "text-orange-500" };

function StatCard({ label, value, sub, color = "blue", icon: Icon }) {
  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6b7280]">{label}</p>
        {Icon && <Icon className={`w-5 h-5 ${ICON_COLORS[color] || "text-blue-500"}`} />}
      </div>
      <p className="text-[28px] font-bold text-[#111827] leading-tight">{value}</p>
      {sub && <p className="text-xs text-[#6b7280] mt-1">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { completed: "bg-green-50 text-green-700 border-green-200", pending: "bg-yellow-50 text-yellow-700 border-yellow-200", analyzing: "bg-blue-50 text-blue-700 border-blue-200", failed: "bg-red-50 text-red-700 border-red-200" };
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${map[status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>{status || "unknown"}</span>;
}

const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "customers", label: "Customers", icon: Users },
  { key: "revenue", label: "Revenue", icon: DollarSign },
  { key: "funnel", label: "Funnel", icon: BarChart2 },
  { key: "seo", label: "SEO Audits", icon: Globe },
  { key: "analytics", label: "Analytics", icon: TrendingUp },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "reps", label: "Reps", icon: UserCheck },
  { key: "services", label: "Services", icon: Star },
  { key: "competitors", label: "Competitors", icon: Shield },
];

const TAB_TITLES = { overview: "Overview", customers: "Customers", revenue: "Revenue", funnel: "Funnel", seo: "SEO Audits", analytics: "Analytics", reviews: "Reviews", reps: "Rep Management", services: "Service Requests", competitors: "Competitor Intelligence" };

const TH = "text-left text-[12px] font-semibold uppercase tracking-[0.04em] text-[#6b7280] px-4 py-3";
const CARD = "bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)]";
const SECTION_TITLE = "text-[16px] font-semibold text-[#111827]";

export default function Backoffice() {
  const navigate = useNavigate();
  const { user, isLoadingAuth } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [audits, setAudits] = useState([]);
  const [funnel, setFunnel] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [repData, setRepData] = useState({ reps: [], commissions: [], payouts: { payouts: [], stats: {} } });
  const [serviceRequests, setServiceRequests] = useState({ requests: [], stats: {} });
  const [repSubTab, setRepSubTab] = useState("reps");
  const [days, setDays] = useState(30);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [compAuditId, setCompAuditId] = useState(null);
  const [compIntel, setCompIntel] = useState(null);
  const [compLoading, setCompLoading] = useState(false);
  const [compRescanning, setCompRescanning] = useState(false);
  const [compAddName, setCompAddName] = useState("");
  const [compAddCity, setCompAddCity] = useState("");
  const [compAdding, setCompAdding] = useState(false);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!user) { navigate("/login"); return; }
    if (user.role !== "admin") { navigate("/dashboard"); return; }
    loadAll();
  }, [user, isLoadingAuth, days]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const token = document.cookie.match(/pageaudit_token=([^;]+)/)?.[1] || localStorage.getItem("pageaudit_token");
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
      const [auditsRes, funnelRes, reviewsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/audits`, { headers }),
        fetch(`${API_BASE}/api/admin/funnel?days=${days}`, { headers }),
        fetch(`${API_BASE}/api/admin/reviews`, { headers }).catch(() => null)
      ]);
      if (auditsRes.ok) setAudits(await auditsRes.json());
      if (funnelRes.ok) setFunnel(await funnelRes.json());
      if (reviewsRes?.ok) setReviewData(await reviewsRes.json());
      // Load service requests
      try { const srRes = await fetch(`${API_BASE}/api/admin/service-requests`, { headers }); if (srRes?.ok) setServiceRequests(await srRes.json()); } catch {}
      // Load rep data
      try {
        const [repsRes, commissionsRes, payoutsRes] = await Promise.all([
          fetch(`${API_BASE}/api/admin/reps`, { headers }).catch(() => null),
          fetch(`${API_BASE}/api/admin/commissions`, { headers }).catch(() => null),
          fetch(`${API_BASE}/api/admin/payouts`, { headers }).catch(() => null),
        ]);
        setRepData({
          reps: repsRes?.ok ? await repsRes.json() : [],
          commissions: commissionsRes?.ok ? await commissionsRes.json() : [],
          payouts: payoutsRes?.ok ? await payoutsRes.json() : { payouts: [], stats: {} },
        });
      } catch { /* rep data optional */ }
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const handleDelete = async (id) => {
    const token = document.cookie.match(/pageaudit_token=([^;]+)/)?.[1] || localStorage.getItem("pageaudit_token");
    try {
      await fetch(`${API_BASE}/api/admin/audits/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setAudits(prev => prev.filter(a => a.id !== id));
      setDeleteConfirm(null);
    } catch { alert("Delete failed"); }
  };

  const filteredAudits = audits.filter(a => {
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    const matchSearch = !searchQuery || a.email?.toLowerCase().includes(searchQuery.toLowerCase()) || a.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) || a.business_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalRevenue = audits.filter(a => a.paid).reduce((sum, a) => sum + (parseFloat(a.amount_paid) || 0), 0);
  const completedAudits = audits.filter(a => a.status === "completed").length;
  const avgScore = audits.filter(a => a.overall_score).length > 0 ? Math.round(audits.filter(a => a.overall_score).reduce((s, a) => s + parseFloat(a.overall_score), 0) / audits.filter(a => a.overall_score).length) : 0;
  const seoAudits = audits.filter(a => a.account_type === "SEO Audit");
  const facebookAudits = audits.filter(a => a.account_type !== "SEO Audit");
  const cityMap = {};
  audits.forEach(a => { if (a.city) cityMap[a.city] = (cityMap[a.city] || 0) + 1; });
  const topCities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const utmMap = {};
  audits.forEach(a => { if (a.utm_source) utmMap[a.utm_source] = (utmMap[a.utm_source] || 0) + 1; });
  const topSources = Object.entries(utmMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  if (loading) return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans flex">
      {/* SIDEBAR */}
      <aside className="fixed top-0 left-0 bottom-0 w-[220px] bg-white border-r border-[#e5e7eb] z-50 flex flex-col">
        <div className="px-5 py-5 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#2563eb]" />
            <span className="font-bold text-[15px] text-[#111827] tracking-tight">PageAudit Pro</span>
          </div>
          <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                activeTab === key
                  ? "bg-[#2563eb] text-white"
                  : "text-[#6b7280] hover:bg-[#eff3ff] hover:text-[#2563eb]"
              }`}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-[#e5e7eb]">
          <p className="text-[11px] text-[#9ca3af] truncate mb-2 px-3">{user?.email}</p>
          <button onClick={() => navigate("/dashboard")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-[#6b7280] hover:bg-gray-100 transition-colors">
            <LogOut className="w-4 h-4" /> Exit Admin
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="ml-[220px] flex-1 min-h-screen flex flex-col">
        {/* TOP HEADER */}
        <header className="h-[60px] bg-white border-b border-[#e5e7eb] sticky top-0 z-40 flex items-center justify-between px-8">
          <h1 className="text-[16px] font-semibold text-[#111827]">{TAB_TITLES[activeTab] || "Dashboard"}</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select value={days} onChange={e => setDays(parseInt(e.target.value))}
                className="text-[13px] border border-[#e5e7eb] rounded-lg pl-3 pr-8 py-1.5 bg-white text-[#374151] appearance-none cursor-pointer hover:border-[#2563eb] transition-colors focus:outline-none focus:border-[#2563eb]">
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" />
            </div>
            <button onClick={() => { setRefreshing(true); loadAll(); }}
              className="flex items-center gap-1.5 text-[13px] text-[#374151] border border-[#e5e7eb] px-3 py-1.5 rounded-lg hover:border-[#2563eb] hover:text-[#2563eb] transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 px-8 py-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} sub={`${audits.filter(a => a.paid).length} paid`} color="green" icon={DollarSign} />
                <StatCard label="Total Customers" value={audits.length} sub={`${completedAudits} completed`} color="blue" icon={Users} />
                <StatCard label="Avg Score" value={avgScore || "--"} sub="across all audits" color="purple" icon={Star} />
                <StatCard label="Pending" value={audits.filter(a => a.status === "pending" || a.status === "analyzing").length} sub="in progress" color="orange" icon={Loader2} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className={`${CARD} p-6`}>
                  <h3 className={`${SECTION_TITLE} mb-4`}>Recent Audits</h3>
                  <div className="space-y-3">
                    {audits.slice(0, 8).map(a => (
                      <div key={a.id} className="flex items-center justify-between text-sm py-1">
                        <div>
                          <p className="font-medium text-[#111827]">{a.business_name || a.customer_name || "--"}</p>
                          <p className="text-xs text-[#9ca3af]">{a.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={a.status} />
                          {a.overall_score && <span className="text-xs font-bold text-[#2563eb]">{Math.round(a.overall_score)}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`${CARD} p-6`}>
                  <h3 className={`${SECTION_TITLE} mb-4`}>Top Cities</h3>
                  <div className="space-y-3">
                    {topCities.length > 0 ? topCities.map(([city, count]) => (
                      <div key={city} className="flex items-center justify-between">
                        <span className="text-sm text-[#374151]">{city}</span>
                        <span className="text-xs font-bold text-[#6b7280]">{count}</span>
                      </div>
                    )) : <p className="text-sm text-[#9ca3af]">No city data yet</p>}
                  </div>
                  <h3 className={`${SECTION_TITLE} mb-3 mt-6`}>Audit Types</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-[#374151]">Facebook Audits</span><span className="font-bold text-[#2563eb]">{facebookAudits.length}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-[#374151]">SEO Audits</span><span className="font-bold text-green-600">{seoAudits.length}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "customers" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <input type="text" placeholder="Search by name, email, business..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 border border-[#e5e7eb] rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#2563eb] transition-colors" />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="border border-[#e5e7eb] rounded-lg px-4 py-2.5 text-sm bg-white">
                  <option value="all">All Status</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="failed">Failed</option>
                </select>
                <span className="text-sm text-[#6b7280] self-center">{filteredAudits.length} results</span>
              </div>
              <div className={`${CARD} overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-[#e5e7eb] bg-[#f9fafb]"><th className={TH}>Customer</th><th className={TH}>Business</th><th className={TH}>City</th><th className={TH}>FB Score</th><th className={TH}>SEO</th><th className={TH}>Status</th><th className={TH}>Paid</th><th className={TH}>Date</th><th className={TH}>Actions</th></tr></thead>
                    <tbody className="divide-y divide-[#f3f4f6]">
                      {filteredAudits.map(a => (
                        <tr key={a.id} className="hover:bg-[#f9fafb] transition-colors">
                          <td className="px-4 py-3"><p className="font-medium text-[#111827]">{a.customer_name || "--"}</p><p className="text-xs text-[#9ca3af]">{a.email}</p></td>
                          <td className="px-4 py-3"><p className="text-[#374151]">{a.business_name || "--"}</p><p className="text-xs text-[#9ca3af] truncate max-w-[200px]">{a.facebook_url || a.website || "--"}</p></td>
                          <td className="px-4 py-3 text-[#6b7280]">{a.city || "--"}</td>
                          <td className="px-4 py-3"><span className={`font-bold ${a.overall_score >= 80 ? "text-green-600" : a.overall_score >= 60 ? "text-yellow-500" : "text-red-500"}`}>{a.overall_score ? Math.round(a.overall_score) : "--"}</span></td>
                          <td className="px-4 py-3"><span className={`font-bold ${a.seo_score >= 80 ? "text-green-600" : a.seo_score >= 60 ? "text-yellow-500" : a.seo_score ? "text-red-500" : "text-[#d1d5db]"}`}>{a.seo_score ? Math.round(a.seo_score) : "--"}</span></td>
                          <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                          <td className="px-4 py-3">{a.paid ? <span className="text-green-600 font-bold">${parseFloat(a.amount_paid || 0).toFixed(2)}</span> : <span className="text-[#d1d5db]">--</span>}</td>
                          <td className="px-4 py-3 text-xs text-[#9ca3af]">{a.created_at ? new Date(a.created_at).toLocaleDateString() : "--"}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => navigate(`/report/${a.id}`)} className="text-[#2563eb] hover:underline text-xs font-medium">View</button>
                              <a href={`mailto:${a.email}`} className="text-[#9ca3af] hover:text-[#374151]"><Mail className="w-3.5 h-3.5" /></a>
                              <button onClick={() => setDeleteConfirm(a.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "revenue" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} sub={`${audits.filter(a => a.paid).length} orders`} color="green" icon={DollarSign} />
                <StatCard label="Facebook Sales" value={facebookAudits.filter(a => a.paid).length} sub={`$${facebookAudits.filter(a => a.paid).reduce((s, a) => s + parseFloat(a.amount_paid || 0), 0).toFixed(2)}`} color="blue" icon={BarChart2} />
                <StatCard label="SEO Sales" value={seoAudits.filter(a => a.paid).length} sub={`$${seoAudits.filter(a => a.paid).reduce((s, a) => s + parseFloat(a.amount_paid || 0), 0).toFixed(2)}`} color="purple" icon={Globe} />
                <StatCard label="Avg Order" value={`$${audits.filter(a => a.paid).length ? (totalRevenue / audits.filter(a => a.paid).length).toFixed(2) : "0.00"}`} sub="per customer" color="orange" icon={DollarSign} />
              </div>
              <div className={`${CARD} p-6`}>
                <h3 className={`${SECTION_TITLE} mb-4`}>All Paid Orders</h3>
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-[#e5e7eb]"><th className={TH}>Customer</th><th className={TH}>Type</th><th className={TH}>Amount</th><th className={TH}>Source</th><th className={TH}>Date</th></tr></thead>
                  <tbody className="divide-y divide-[#f3f4f6]">
                    {audits.filter(a => a.paid).map(a => (
                      <tr key={a.id} className="hover:bg-[#f9fafb]">
                        <td className="px-4 py-3"><p className="font-medium text-[#111827]">{a.business_name || a.customer_name || "--"}</p><p className="text-xs text-[#9ca3af]">{a.email}</p></td>
                        <td className="px-4 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${a.account_type === "SEO Audit" ? "bg-green-50 text-green-700 border-green-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>{a.account_type === "SEO Audit" ? "SEO" : "Facebook"}</span></td>
                        <td className="px-4 py-3 font-bold text-green-600">${parseFloat(a.amount_paid || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-xs text-[#6b7280]">{a.utm_source || "direct"}</td>
                        <td className="px-4 py-3 text-xs text-[#9ca3af]">{a.created_at ? new Date(a.created_at).toLocaleDateString() : "--"}</td>
                      </tr>
                    ))}
                    {audits.filter(a => a.paid).length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-[#9ca3af]">No paid orders yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "funnel" && (
            <div className="space-y-6">
              {funnel ? (
                <>
                  {funnel.steps?.length > 0 && (
                    <div className={`${CARD} p-6`}>
                      <h3 className={`${SECTION_TITLE} mb-1`}>Step-by-Step Funnel</h3>
                      <p className="text-xs text-[#9ca3af] mb-6">Unique users who completed each step (last {funnel.lookback_days || 30} days)</p>
                      <div className="space-y-1">
                        {funnel.steps.map((s, i) => {
                          const first = funnel.steps[0]?.count || 1;
                          const pct = first > 0 ? Math.round((s.count / first) * 100) : 0;
                          const prev = i > 0 ? funnel.steps[i - 1] : null;
                          const dropPct = prev && prev.count > 0 ? Math.round(((prev.count - s.count) / prev.count) * 100) : 0;
                          const barColors = ["bg-blue-500", "bg-blue-500", "bg-blue-400", "bg-blue-400", "bg-blue-300", "bg-blue-300", "bg-blue-300", "bg-green-500", "bg-green-600"];
                          return (
                            <div key={s.event_type}>
                              {i > 0 && dropPct > 0 && (
                                <div className="flex items-center gap-2 py-1 pl-4">
                                  <div className="w-px h-4 bg-red-200" />
                                  <span className="text-xs font-semibold text-red-400">-{dropPct}% drop-off ({prev.count - s.count} lost)</span>
                                </div>
                              )}
                              <div className="flex items-center gap-4">
                                <div className="w-48 shrink-0"><p className="text-sm font-medium text-[#374151] truncate">{s.label}</p></div>
                                <div className="flex-1 h-8 bg-[#f3f4f6] rounded-lg overflow-hidden relative">
                                  <div className={`h-full ${barColors[i] || "bg-blue-400"} rounded-lg transition-all duration-500`} style={{ width: `${Math.max(pct, 2)}%` }} />
                                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: pct > 40 ? "white" : "#374151" }}>{s.count}</span>
                                </div>
                                <div className="w-14 text-right shrink-0">
                                  <span className={`text-sm font-bold ${pct >= 70 ? "text-green-600" : pct >= 40 ? "text-yellow-500" : "text-red-500"}`}>{pct}%</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {funnel.steps.length >= 2 && (() => {
                        const first = funnel.steps[0]?.count || 0;
                        const last = funnel.steps[funnel.steps.length - 1]?.count || 0;
                        const overallPct = first > 0 ? ((last / first) * 100).toFixed(1) : 0;
                        return (
                          <div className="mt-6 pt-4 border-t border-[#e5e7eb] flex items-center justify-between">
                            <span className="text-sm font-semibold text-[#6b7280]">Overall Conversion</span>
                            <span className="text-lg font-bold text-[#2563eb]">{overallPct}%</span>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  <div className={`${CARD} p-6`}>
                    <h3 className={`${SECTION_TITLE} mb-6`}>All Event Counts</h3>
                    <div className="space-y-4">
                      {funnel.funnel_counts?.map(({ event_type, count }) => {
                        const first = funnel.funnel_counts[0]?.count || 1;
                        const pct = Math.round((count / first) * 100);
                        return (
                          <div key={event_type}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="capitalize font-medium text-[#374151]">{event_type.replace(/_/g, " ")}</span>
                              <span className="font-bold text-[#111827]">{count} <span className="text-[#9ca3af] font-normal">({pct}%)</span></span>
                            </div>
                            <div className="h-2.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                              <div className="h-full bg-[#2563eb] rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {funnel.dropoffs?.length > 0 && (
                    <div className={`${CARD} p-6`}>
                      <h3 className={`${SECTION_TITLE} mb-4`}>Drop-offs (Started but didn't pay)</h3>
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-[#e5e7eb]"><th className={TH}>Email</th><th className={TH}>Source</th><th className={TH}>Date</th></tr></thead>
                        <tbody className="divide-y divide-[#f3f4f6]">
                          {funnel.dropoffs.slice(0, 20).map((d, i) => (
                            <tr key={i} className="hover:bg-[#f9fafb]">
                              <td className="px-4 py-3 text-[#374151]">{d.email || "--"}</td>
                              <td className="px-4 py-3 text-xs text-[#6b7280]">{d.utm_source || "direct"}</td>
                              <td className="px-4 py-3 text-xs text-[#9ca3af]">{d.created_at ? new Date(d.created_at).toLocaleDateString() : "--"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <div className={`${CARD} p-8 text-center`}><p className="text-[#9ca3af]">No funnel data yet</p></div>
              )}
            </div>
          )}

          {activeTab === "seo" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard label="SEO Audits Sold" value={seoAudits.length} sub={`${seoAudits.filter(a => a.status === "completed").length} completed`} color="green" icon={Globe} />
                <StatCard label="SEO Revenue" value={`$${seoAudits.filter(a => a.paid).reduce((s, a) => s + parseFloat(a.amount_paid || 0), 0).toFixed(2)}`} sub={`${seoAudits.filter(a => a.paid).length} paid`} color="blue" icon={DollarSign} />
                <StatCard label="Avg SEO Score" value={seoAudits.filter(a => a.seo_score).length > 0 ? Math.round(seoAudits.filter(a => a.seo_score).reduce((s, a) => s + parseFloat(a.seo_score), 0) / seoAudits.filter(a => a.seo_score).length) : "--"} sub="across SEO audits" color="purple" icon={TrendingUp} />
              </div>
              <div className={`${CARD} overflow-hidden`}>
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-[#e5e7eb] bg-[#f9fafb]"><th className={TH}>Customer</th><th className={TH}>Website</th><th className={TH}>SEO Score</th><th className={TH}>Status</th><th className={TH}>Paid</th><th className={TH}>Date</th><th className={TH}>Actions</th></tr></thead>
                  <tbody className="divide-y divide-[#f3f4f6]">
                    {seoAudits.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-[#9ca3af]">No SEO audits yet</td></tr>
                    ) : seoAudits.map(a => (
                      <tr key={a.id} className="hover:bg-[#f9fafb]">
                        <td className="px-4 py-3"><p className="font-medium text-[#111827]">{a.customer_name || "--"}</p><p className="text-xs text-[#9ca3af]">{a.email}</p></td>
                        <td className="px-4 py-3 text-xs text-[#2563eb]"><a href={a.website} target="_blank" rel="noopener noreferrer" className="hover:underline">{a.website || "--"}</a></td>
                        <td className="px-4 py-3"><span className={`font-bold ${a.seo_score >= 80 ? "text-green-600" : a.seo_score >= 60 ? "text-yellow-500" : a.seo_score ? "text-red-500" : "text-[#d1d5db]"}`}>{a.seo_score ? `${Math.round(a.seo_score)}/100` : "--"}</span></td>
                        <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                        <td className="px-4 py-3 font-bold text-green-600">{a.paid ? `$${parseFloat(a.amount_paid || 0).toFixed(2)}` : "--"}</td>
                        <td className="px-4 py-3 text-xs text-[#9ca3af]">{a.created_at ? new Date(a.created_at).toLocaleDateString() : "--"}</td>
                        <td className="px-4 py-3"><button onClick={() => navigate(`/report/${a.id}`)} className="text-[#2563eb] hover:underline text-xs font-medium">View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className={`${CARD} p-6`}>
                  <h3 className={`${SECTION_TITLE} mb-4`}>Top Traffic Sources</h3>
                  {topSources.length > 0 ? (
                    <div className="space-y-3">{topSources.map(([source, count]) => (
                      <div key={source} className="flex items-center justify-between">
                        <span className="text-sm capitalize text-[#374151]">{source}</span>
                        <span className="text-xs font-bold text-[#6b7280]">{count}</span>
                      </div>
                    ))}</div>
                  ) : <p className="text-sm text-[#9ca3af]">No UTM data yet</p>}
                </div>
                <div className={`${CARD} p-6`}>
                  <h3 className={`${SECTION_TITLE} mb-4`}>Score Distribution</h3>
                  <div className="space-y-3">
                    {[{ label: "Excellent 80-100", color: "bg-green-500", count: audits.filter(a => a.overall_score >= 80).length },
                      { label: "Good 60-79", color: "bg-yellow-400", count: audits.filter(a => a.overall_score >= 60 && a.overall_score < 80).length },
                      { label: "Needs Work under 60", color: "bg-red-400", count: audits.filter(a => a.overall_score && a.overall_score < 60).length },
                      { label: "No Score", color: "bg-gray-300", count: audits.filter(a => !a.overall_score).length },
                    ].map(({ label, color, count }) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${color}`} />
                        <span className="text-xs text-[#6b7280] flex-1">{label}</span>
                        <span className="text-xs font-bold text-[#111827]">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`${CARD} p-6`}>
                  <h3 className={`${SECTION_TITLE} mb-4`}>Goal Distribution</h3>
                  <div className="space-y-2">
                    {["Grow followers", "Increase engagement", "Generate leads", "Build authority", "Promote a cause"].map(goal => (
                      <div key={goal} className="flex items-center justify-between text-sm">
                        <span className="text-[#6b7280]">{goal}</span>
                        <span className="font-bold text-[#2563eb]">{audits.filter(a => a.goals?.includes(goal)).length}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`${CARD} p-6`}>
                  <h3 className={`${SECTION_TITLE} mb-4`}>Form Step Time on Page</h3>
                  <p className="text-xs text-[#9ca3af] mb-3">Tracks where customers spend the most time</p>
                  <div className="space-y-2">
                    {["Step 1 Name and Email", "Step 2 Business Info", "Step 3 Main Goal", "Step 4 Post Frequency", "Step 5 Content Type", "Step 6 Facebook Finder"].map(step => (
                      <div key={step} className="flex items-center justify-between text-sm">
                        <span className="text-[#6b7280]">{step}</span>
                        <span className="text-xs font-bold text-[#9ca3af]">tracking soon</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <p className="text-xs text-blue-700">Will populate after next customer goes through the form</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              {reviewData?.stats ? (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Reviews" value={reviewData.stats.total_reviews} sub={`${reviewData.stats.with_feedback} with feedback`} color="blue" icon={Star} />
                    <StatCard label="Avg Rating" value={reviewData.stats.avg_rating ? `${reviewData.stats.avg_rating}/5` : "--"} sub="across all reviews" color="green" icon={Star} />
                    <StatCard label="5-Star Reviews" value={reviewData.stats.distribution?.[5] || 0} sub={`${reviewData.stats.total_reviews ? Math.round(((reviewData.stats.distribution?.[5] || 0) / reviewData.stats.total_reviews) * 100) : 0}% of total`} color="purple" icon={Star} />
                    <StatCard label="Low Ratings" value={(reviewData.stats.distribution?.[1] || 0) + (reviewData.stats.distribution?.[2] || 0)} sub="1-2 stars" color="orange" icon={Star} />
                  </div>
                  <div className={`${CARD} p-6`}>
                    <h3 className={`${SECTION_TITLE} mb-4`}>Rating Distribution</h3>
                    <div className="space-y-2.5">
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = reviewData.stats.distribution?.[star] || 0;
                        const total = reviewData.stats.total_reviews || 1;
                        const pct = Math.round((count / total) * 100);
                        return (
                          <div key={star} className="flex items-center gap-3">
                            <span className="text-sm font-medium text-[#6b7280] w-12 shrink-0">{star} star</span>
                            <div className="flex-1 h-3 bg-[#f3f4f6] rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-sm font-bold text-[#374151] w-16 text-right">{count} ({pct}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {reviewData.reviews?.length > 0 && (
                    <div className={`${CARD} p-6`}>
                      <h3 className={`${SECTION_TITLE} mb-4`}>All Reviews ({reviewData.reviews.length})</h3>
                      <div className="space-y-3">
                        {reviewData.reviews.map(r => (
                          <div key={r.id} className="border border-[#e5e7eb] rounded-lg p-4 hover:bg-[#f9fafb] transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-sm font-semibold text-[#111827]">{r.business_name || r.customer_name || r.email}</p>
                                <p className="text-xs text-[#9ca3af]">{r.email}</p>
                              </div>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map(s => (
                                  <Star key={s} className={`w-4 h-4 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-[#e5e7eb]"}`} />
                                ))}
                              </div>
                            </div>
                            {r.feedback && <p className="text-sm text-[#6b7280] italic">"{r.feedback}"</p>}
                            <div className="flex items-center gap-3 mt-2 text-xs text-[#9ca3af]">
                              <span>{r.created_at ? new Date(r.created_at).toLocaleDateString() : "--"}</span>
                              {r.overall_score && <span>Score: {Math.round(r.overall_score)}/100</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className={`${CARD} p-8 text-center`}>
                  <Star className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#111827] mb-2">No Reviews Yet</h3>
                  <p className="text-sm text-[#9ca3af]">Customer reviews will appear here after customers rate their audits.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "reps" && (
            <div className="space-y-6">
              {/* Sub-tabs */}
              <div className="flex gap-2 flex-wrap">
                {[{ k: "reps", l: "Reps" }, { k: "payouts", l: "Payouts" }, { k: "commissions", l: "Commissions" }, { k: "alerts", l: "Alerts" }].map(t => (
                  <button key={t.k} onClick={() => setRepSubTab(t.k)}
                    className={`px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors ${repSubTab === t.k ? "bg-[#2563eb] text-white" : "text-[#6b7280] bg-white border border-[#e5e7eb] hover:bg-[#f9fafb]"}`}>{t.l}</button>
                ))}
              </div>

              {/* SUB-TAB: REPS */}
              {repSubTab === "reps" && (
                <div className={`${CARD} overflow-hidden`}>
                  <div className="px-6 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
                    <h3 className={SECTION_TITLE}>All Sales Reps ({repData.reps.length})</h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                      <th className={TH}>Name</th><th className={TH}>Code</th><th className={TH}>Status</th><th className={TH}>Customers</th><th className={TH}>Lifetime</th><th className={TH}>Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-[#f3f4f6]">
                      {repData.reps.length > 0 ? repData.reps.map(rep => (
                        <tr key={rep.id} className="hover:bg-[#f9fafb]">
                          <td className="px-4 py-3"><p className="font-medium text-[#111827]">{rep.full_name}</p><p className="text-xs text-[#9ca3af]">{rep.email}</p></td>
                          <td className="px-4 py-3"><code className="text-xs bg-[#f3f4f6] px-2 py-0.5 rounded font-mono">{rep.rep_code}</code></td>
                          <td className="px-4 py-3">
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${rep.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : rep.status === 'suspended' ? 'bg-orange-50 text-orange-700 border-orange-200' : rep.status === 'terminated' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>{rep.status}</span>
                          </td>
                          <td className="px-4 py-3 text-[#374151]">{repData.commissions.filter(c => c.rep_id === rep.id).length}</td>
                          <td className="px-4 py-3 font-bold text-[#111827]">${parseFloat(rep.total_earned || 0).toFixed(2)}</td>
                          <td className="px-4 py-3 text-xs text-[#2563eb] font-medium">View</td>
                        </tr>
                      )) : <tr><td colSpan={6} className="px-4 py-8 text-center text-[#9ca3af]">No reps yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SUB-TAB: PAYOUTS */}
              {repSubTab === "payouts" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Pending Approval" value={`$${(repData.payouts?.stats?.pending_total || 0).toFixed(2)}`} sub="this week" color="orange" icon={DollarSign} />
                    <StatCard label="Approved" value={`$${(repData.payouts?.stats?.approved_total || 0).toFixed(2)}`} sub="awaiting payment" color="blue" icon={DollarSign} />
                    <StatCard label="Paid This Month" value={`$${(repData.payouts?.stats?.paid_this_month || 0).toFixed(2)}`} sub="" color="green" icon={DollarSign} />
                    <StatCard label="Paid All Time" value={`$${(repData.payouts?.stats?.paid_all_time || 0).toFixed(2)}`} sub="" color="purple" icon={DollarSign} />
                  </div>
                  <div className={`${CARD} overflow-hidden`}>
                    <div className="px-6 py-4 border-b border-[#e5e7eb]"><h3 className={SECTION_TITLE}>Payout Batches</h3></div>
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                        <th className={TH}>Rep</th><th className={TH}>Week</th><th className={TH}>Amount</th><th className={TH}>Status</th><th className={TH}>Actions</th>
                      </tr></thead>
                      <tbody className="divide-y divide-[#f3f4f6]">
                        {(repData.payouts?.payouts || []).length > 0 ? repData.payouts.payouts.map(p => (
                          <tr key={p.id} className="hover:bg-[#f9fafb]">
                            <td className="px-4 py-3"><p className="font-medium text-[#111827]">{p.rep_name}</p><p className="text-xs text-[#9ca3af]">{p.rep_code}</p></td>
                            <td className="px-4 py-3 text-xs text-[#6b7280]">{p.week_start_date ? new Date(p.week_start_date).toLocaleDateString() : "--"}</td>
                            <td className="px-4 py-3 font-bold text-[#111827]">${parseFloat(p.total_amount).toFixed(2)}</td>
                            <td className="px-4 py-3"><StatusBadge status={p.status === 'pending_approval' ? 'pending' : p.status === 'paid' ? 'completed' : p.status} /></td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                {p.status === 'pending_approval' && <button className="text-xs font-semibold text-green-600 hover:underline">Approve</button>}
                                {p.status === 'pending_approval' && <button className="text-xs font-semibold text-yellow-600 hover:underline">Hold</button>}
                                {p.status === 'approved' && <button className="text-xs font-semibold text-[#2563eb] hover:underline">Mark Paid</button>}
                              </div>
                            </td>
                          </tr>
                        )) : <tr><td colSpan={5} className="px-4 py-8 text-center text-[#9ca3af]">No payouts yet</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB-TAB: COMMISSIONS */}
              {repSubTab === "commissions" && (
                <div className={`${CARD} overflow-hidden`}>
                  <div className="px-6 py-4 border-b border-[#e5e7eb]"><h3 className={SECTION_TITLE}>All Commissions</h3></div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                        <th className={TH}>Date</th><th className={TH}>Rep</th><th className={TH}>Business</th><th className={TH}>Type</th><th className={TH}>Charged</th><th className={TH}>Commission</th><th className={TH}>Buffer</th><th className={TH}>Status</th>
                      </tr></thead>
                      <tbody className="divide-y divide-[#f3f4f6]">
                        {repData.commissions.length > 0 ? repData.commissions.map(c => (
                          <tr key={c.id} className="hover:bg-[#f9fafb]">
                            <td className="px-4 py-3 text-xs text-[#9ca3af]">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "--"}</td>
                            <td className="px-4 py-3"><p className="font-medium text-[#111827]">{c.rep_name}</p><p className="text-xs text-[#9ca3af]">{c.rep_code}</p></td>
                            <td className="px-4 py-3 text-[#374151]">{c.business_name || c.customer_email || "--"}</td>
                            <td className="px-4 py-3 text-[#6b7280] capitalize text-xs">{c.product_type?.replace(/_/g, " ")}</td>
                            <td className="px-4 py-3 text-[#374151]">${parseFloat(c.sale_amount).toFixed(2)}</td>
                            <td className="px-4 py-3 font-bold text-[#111827]">${parseFloat(c.commission_amount).toFixed(2)}</td>
                            <td className="px-4 py-3"><StatusBadge status={c.buffer_status === 'buffering' ? 'analyzing' : c.buffer_status === 'released' ? 'completed' : c.buffer_status || 'pending'} /></td>
                            <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                          </tr>
                        )) : <tr><td colSpan={8} className="px-4 py-8 text-center text-[#9ca3af]">No commissions yet</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB-TAB: ALERTS */}
              {repSubTab === "alerts" && (
                <div className={`${CARD} p-6`}>
                  <h3 className={`${SECTION_TITLE} mb-4`}>Rep Alerts</h3>
                  {repData.commissions.filter(c => c.status === 'held' || c.payment_status === 'payment_failed').length > 0 ? (
                    <div className="space-y-3">
                      {repData.commissions.filter(c => c.status === 'held' || c.payment_status === 'payment_failed').map(c => (
                        <div key={c.id} className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-red-800">Payment issue — {c.business_name || c.customer_email}</p>
                            <p className="text-xs text-red-600">Rep: {c.rep_name} ({c.rep_code}) &middot; Commission: ${parseFloat(c.commission_amount).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-[#9ca3af]">No unresolved alerts</p>}
                  {/* W9 alerts */}
                  {repData.reps.filter(r => parseFloat(r.total_earned || 0) >= 500 && !r.w9_submitted).length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-[#111827] mb-3">W-9 Required</h4>
                      <div className="space-y-2">
                        {repData.reps.filter(r => parseFloat(r.total_earned || 0) >= 500 && !r.w9_submitted).map(r => (
                          <div key={r.id} className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div><p className="text-sm font-medium text-yellow-800">{r.full_name}</p><p className="text-xs text-yellow-600">Earnings: ${parseFloat(r.total_earned).toFixed(2)} — W-9 not on file</p></div>
                            <button className="text-xs font-semibold text-yellow-700 border border-yellow-300 px-3 py-1 rounded-md hover:bg-yellow-100">Request W-9</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "services" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard label="Total Requests" value={serviceRequests.stats?.total || 0} color="blue" icon={Star} />
                <StatCard label="New" value={serviceRequests.stats?.new || 0} sub="needs contact" color="orange" icon={Star} />
                <StatCard label="Contacted" value={serviceRequests.stats?.contacted || 0} color="blue" icon={Star} />
                <StatCard label="Quoted" value={serviceRequests.stats?.quoted || 0} color="purple" icon={Star} />
                <StatCard label="Closed" value={serviceRequests.stats?.closed || 0} sub="won" color="green" icon={Star} />
              </div>
              <div className={`${CARD} overflow-hidden`}>
                <div className="px-6 py-4 border-b border-[#e5e7eb]"><h3 className={SECTION_TITLE}>Service Requests</h3></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                      <th className={TH}>Customer</th><th className={TH}>Service</th><th className={TH}>Phone</th><th className={TH}>Score</th><th className={TH}>Rep</th><th className={TH}>Status</th><th className={TH}>Date</th>
                    </tr></thead>
                    <tbody className="divide-y divide-[#f3f4f6]">
                      {(serviceRequests.requests || []).length > 0 ? serviceRequests.requests.map(sr => (
                        <tr key={sr.id} className="hover:bg-[#f9fafb]">
                          <td className="px-4 py-3"><p className="font-medium text-[#111827]">{sr.customer_name || "--"}</p><p className="text-xs text-[#9ca3af]">{sr.email}</p></td>
                          <td className="px-4 py-3 text-[#374151] capitalize text-xs">{sr.service_requested?.replace(/_/g, " ")}</td>
                          <td className="px-4 py-3 text-[#6b7280] text-xs">{sr.phone || "--"}</td>
                          <td className="px-4 py-3"><span className={`font-bold ${(sr.scan_score || 0) >= 70 ? "text-green-600" : (sr.scan_score || 0) >= 50 ? "text-yellow-500" : sr.scan_score ? "text-red-500" : "text-[#d1d5db]"}`}>{sr.scan_score || "--"}</span></td>
                          <td className="px-4 py-3 text-xs text-[#6b7280]">{sr.rep_name || sr.rep_code || "direct"}</td>
                          <td className="px-4 py-3"><StatusBadge status={sr.status === "new" ? "pending" : sr.status === "closed" ? "completed" : sr.status} /></td>
                          <td className="px-4 py-3 text-xs text-[#9ca3af]">{sr.created_at ? new Date(sr.created_at).toLocaleDateString() : "--"}</td>
                        </tr>
                      )) : <tr><td colSpan={7} className="px-4 py-8 text-center text-[#9ca3af]">No service requests yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "competitors" && (() => {
            const auditOptions = audits.filter(a => a.status === "completed");

            const loadCompIntel = async (auditId) => {
              setCompAuditId(auditId);
              setCompLoading(true);
              setCompIntel(null);
              try {
                const token = document.cookie.match(/pageaudit_token=([^;]+)/)?.[1] || localStorage.getItem("pageaudit_token");
                const res = await fetch(`${API_BASE}/api/audits/${auditId}/competitor-intelligence`, { headers: { Authorization: `Bearer ${token}` } });
                if (res.ok) setCompIntel(await res.json());
              } catch (e) { console.error("Load intel failed:", e); }
              setCompLoading(false);
            };

            const handleRescan = async () => {
              if (!compAuditId) return;
              setCompRescanning(true);
              try {
                const token = document.cookie.match(/pageaudit_token=([^;]+)/)?.[1] || localStorage.getItem("pageaudit_token");
                await fetch(`${API_BASE}/api/audits/${compAuditId}/rescan-competitors`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
                await loadCompIntel(compAuditId);
              } catch (e) { console.error("Rescan failed:", e); }
              setCompRescanning(false);
            };

            const handleAddComp = async () => {
              if (!compAuditId || !compAddName.trim()) return;
              setCompAdding(true);
              try {
                const token = document.cookie.match(/pageaudit_token=([^;]+)/)?.[1] || localStorage.getItem("pageaudit_token");
                await fetch(`${API_BASE}/api/audits/${compAuditId}/update-competitors`, {
                  method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ competitors: [{ name: compAddName.trim(), city: compAddCity.trim() }] })
                });
                setCompAddName(""); setCompAddCity("");
                await loadCompIntel(compAuditId);
              } catch (e) { console.error("Add failed:", e); }
              setCompAdding(false);
            };

            const handleRemoveComp = async (name) => {
              if (!compAuditId || !compIntel) return;
              const updated = (compIntel.competitorList || []).filter(c => c.name !== name);
              try {
                const token = document.cookie.match(/pageaudit_token=([^;]+)/)?.[1] || localStorage.getItem("pageaudit_token");
                await fetch(`${API_BASE}/api/audits/${compAuditId}/update-competitors`, {
                  method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ competitors: updated })
                });
                await loadCompIntel(compAuditId);
              } catch (e) { console.error("Remove failed:", e); }
            };

            return (
              <div className="space-y-6">
                {/* Audit selector */}
                <div className={`${CARD} p-6`}>
                  <h3 className={`${SECTION_TITLE} mb-4`}>Select Audit</h3>
                  <select
                    value={compAuditId || ""}
                    onChange={e => { const id = parseInt(e.target.value); if (id) loadCompIntel(id); }}
                    className="w-full max-w-md border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose an audit...</option>
                    {auditOptions.map(a => (
                      <option key={a.id} value={a.id}>{a.business_name || a.customer_name || a.email} — {a.city || "Unknown"}</option>
                    ))}
                  </select>
                </div>

                {compLoading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin mr-3" />
                    <span className="text-sm text-[#6b7280]">Loading competitor intelligence...</span>
                  </div>
                )}

                {compIntel && !compLoading && (
                  <>
                    {/* Current competitor list */}
                    <div className={`${CARD} p-6`}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className={SECTION_TITLE}>Competitor List</h3>
                          {compIntel.lastUpdated && <p className="text-xs text-[#9ca3af] mt-1">Last researched: {new Date(compIntel.lastUpdated).toLocaleDateString()}</p>}
                        </div>
                        <button onClick={handleRescan} disabled={compRescanning}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold ${compRescanning ? "bg-gray-100 text-gray-400" : "bg-blue-500 text-white hover:bg-blue-600"} transition-colors`}>
                          {compRescanning ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Rescanning...</> : <><RefreshCw className="w-3.5 h-3.5" /> Rescan All Competitors</>}
                        </button>
                      </div>

                      {(compIntel.competitorList || []).length === 0 ? (
                        <p className="text-sm text-[#9ca3af] text-center py-4">No competitors configured. Add one below.</p>
                      ) : (
                        <div className="space-y-2">
                          {compIntel.competitorList.map((c, i) => {
                            const profile = (compIntel.profiles || []).find(p => p.competitor_name === c.name);
                            return (
                              <div key={i} className="flex items-center justify-between px-4 py-3 bg-[#f9fafb] rounded-lg">
                                <div className="flex items-center gap-3">
                                  <span className="font-semibold text-sm text-[#111827]">{c.name}</span>
                                  <span className="text-xs text-[#9ca3af]">{c.city || ""}</span>
                                  {profile && <>
                                    {profile.google_rating && <span className="text-xs text-yellow-500 font-semibold">★ {profile.google_rating}</span>}
                                    {profile.google_review_count != null && <span className="text-xs text-[#6b7280]">{profile.google_review_count} reviews</span>}
                                    {profile.overall_threat_level && (
                                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                        profile.overall_threat_level.toLowerCase() === "high" ? "bg-red-50 text-red-600 border border-red-200" :
                                        profile.overall_threat_level.toLowerCase() === "medium" ? "bg-yellow-50 text-yellow-600 border border-yellow-200" :
                                        "bg-green-50 text-green-600 border border-green-200"
                                      }`}>{profile.overall_threat_level}</span>
                                    )}
                                  </>}
                                </div>
                                <button onClick={() => handleRemoveComp(c.name)} className="text-[#9ca3af] hover:text-red-500 transition-colors" title="Remove">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add competitor */}
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#e5e7eb]">
                        <input value={compAddName} onChange={e => setCompAddName(e.target.value)} placeholder="Business Name"
                          className="flex-1 border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input value={compAddCity} onChange={e => setCompAddCity(e.target.value)} placeholder="City, State"
                          className="flex-1 border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button onClick={handleAddComp} disabled={compAdding || !compAddName.trim()}
                          className={`flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold ${compAdding ? "bg-gray-100 text-gray-400" : "bg-green-500 text-white hover:bg-green-600"} transition-colors whitespace-nowrap`}>
                          {compAdding ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding...</> : <><Plus className="w-3.5 h-3.5" /> Add Competitor</>}
                        </button>
                      </div>
                    </div>

                    {/* Changes timeline */}
                    <div className={`${CARD} p-6`}>
                      <h3 className={`${SECTION_TITLE} mb-4`}>Competitor Activity Timeline</h3>
                      <p className="text-xs text-[#9ca3af] mb-4">Last 3 months of competitor activity</p>

                      {(compIntel.changes || []).length === 0 ? (
                        <p className="text-sm text-[#9ca3af] text-center py-6">No changes detected yet. Changes will appear after the first rescan.</p>
                      ) : (
                        <div className="space-y-3">
                          {compIntel.changes.map((ch, i) => {
                            const ratingDelta = parseFloat(ch.rating_change) || 0;
                            const reviewDelta = ch.review_count_change || 0;
                            const urgency = ch.threat_level_change;
                            return (
                              <div key={i} className="flex items-start gap-4 px-4 py-4 bg-[#f9fafb] rounded-lg">
                                <div className="flex-shrink-0 mt-1">
                                  {ratingDelta > 0 ? <TrendingUp className="w-4 h-4 text-red-500" /> :
                                   ratingDelta < 0 ? <TrendingDown className="w-4 h-4 text-green-500" /> :
                                   <Minus className="w-4 h-4 text-gray-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className="font-semibold text-sm text-[#111827]">{ch.competitor_name}</span>
                                    {urgency && (
                                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                        urgency === "improving" ? "bg-red-50 text-red-600" :
                                        urgency === "declining" ? "bg-green-50 text-green-600" :
                                        "bg-gray-50 text-gray-500"
                                      }`}>{urgency}</span>
                                    )}
                                    <span className="text-xs text-[#9ca3af]">{ch.detected_at ? new Date(ch.detected_at).toLocaleDateString() : ""}</span>
                                  </div>
                                  <p className="text-sm text-[#374151] mb-2">{ch.summary || "Changes detected"}</p>
                                  <div className="flex items-center gap-4 text-xs">
                                    <span className={`font-semibold ${ratingDelta > 0 ? "text-red-500" : ratingDelta < 0 ? "text-green-500" : "text-gray-400"}`}>
                                      Rating: {ratingDelta > 0 ? "+" : ""}{ratingDelta.toFixed(1)}
                                    </span>
                                    <span className={`font-semibold ${reviewDelta > 0 ? "text-red-500" : reviewDelta < 0 ? "text-green-500" : "text-gray-400"}`}>
                                      Reviews: {reviewDelta > 0 ? "+" : ""}{reviewDelta}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })()}
        </main>
      </div>

      {/* DELETE MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-[#111827] mb-2">Delete Audit?</h2>
            <p className="text-sm text-[#6b7280] mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-[#e5e7eb] text-[#374151] font-semibold py-2.5 rounded-lg hover:bg-[#f9fafb] transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-500 text-white font-semibold py-2.5 rounded-lg hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
