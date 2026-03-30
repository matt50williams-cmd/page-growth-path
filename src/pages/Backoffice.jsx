$code = @'
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { LayoutDashboard, Users, DollarSign, BarChart2, Globe, Star, TrendingUp, RefreshCw, Trash2, Mail, Loader2 } from "lucide-react";
const API_BASE = "https://pageaudit-engine.onrender.com";
function StatCard({ label, value, sub, color = "blue", icon: Icon }) {
  const colors = { blue: "bg-blue-50 text-blue-700 border-blue-100", green: "bg-green-50 text-green-700 border-green-100", purple: "bg-purple-50 text-purple-700 border-purple-100", orange: "bg-orange-50 text-orange-700 border-orange-100" };
  return (<div className={`rounded-2xl border p-5 ${colors[color]}`}><div className="flex items-center justify-between mb-3"><p className="text-xs font-bold uppercase tracking-wide opacity-70">{label}</p>{Icon && <Icon className="w-5 h-5 opacity-50" />}</div><p className="text-3xl font-extrabold mb-1">{value}</p>{sub && <p className="text-xs opacity-70">{sub}</p>}</div>);
}
function StatusBadge({ status }) {
  const map = { completed: "bg-green-100 text-green-700", pending: "bg-yellow-100 text-yellow-700", analyzing: "bg-blue-100 text-blue-700", failed: "bg-red-100 text-red-700" };
  return (<span className={`text-xs font-bold px-2 py-0.5 rounded-full ${map[status] || "bg-gray-100 text-gray-600"}`}>{status || "unknown"}</span>);
}
function Tab({ label, active, onClick, icon: Icon }) {
  return (<button onClick={onClick} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap ${active ? "bg-[#1877F2] text-white" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}>{Icon && <Icon className="w-4 h-4" />}{label}</button>);
}
export default function Backoffice() {
  const navigate = useNavigate();
  const { user, isLoadingAuth } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [audits, setAudits] = useState([]);
  const [funnel, setFunnel] = useState(null);
  const [days, setDays] = useState(30);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
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
      const [auditsRes, funnelRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/audits`, { headers }),
        fetch(`${API_BASE}/api/admin/funnel?days=${days}`, { headers })
      ]);
      if (auditsRes.ok) setAudits(await auditsRes.json());
      if (funnelRes.ok) setFunnel(await funnelRes.json());
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
  if (loading) return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#1877F2]" /></div>);
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">PageAudit Pro</span>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">ADMIN</span>
          </div>
          <div className="flex items-center gap-3">
            <select value={days} onChange={e => setDays(parseInt(e.target.value))} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5">
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button onClick={() => { setRefreshing(true); loadAll(); }} className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button onClick={() => navigate("/dashboard")} className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg">Exit</button>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          <Tab label="Overview" icon={LayoutDashboard} active={activeTab==="overview"} onClick={() => setActiveTab("overview")} />
          <Tab label="Customers" icon={Users} active={activeTab==="customers"} onClick={() => setActiveTab("customers")} />
          <Tab label="Revenue" icon={DollarSign} active={activeTab==="revenue"} onClick={() => setActiveTab("revenue")} />
          <Tab label="Funnel" icon={BarChart2} active={activeTab==="funnel"} onClick={() => setActiveTab("funnel")} />
          <Tab label="SEO Audits" icon={Globe} active={activeTab==="seo"} onClick={() => setActiveTab("seo")} />
          <Tab label="Analytics" icon={TrendingUp} active={activeTab==="analytics"} onClick={() => setActiveTab("analytics")} />
          <Tab label="Reviews" icon={Star} active={activeTab==="reviews"} onClick={() => setActiveTab("reviews")} />
        </div>
        {activeTab==="overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} sub={`${audits.filter(a=>a.paid).length} paid`} color="green" icon={DollarSign} />
              <StatCard label="Total Customers" value={audits.length} sub={`${completedAudits} completed`} color="blue" icon={Users} />
              <StatCard label="Avg Score" value={avgScore||"--"} sub="across all audits" color="purple" icon={Star} />
              <StatCard label="Pending" value={audits.filter(a=>a.status==="pending"||a.status==="analyzing").length} sub="in progress" color="orange" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Recent Audits</h3>
                <div className="space-y-3">{audits.slice(0,8).map(a=>(<div key={a.id} className="flex items-center justify-between text-sm"><div><p className="font-medium">{a.business_name||a.customer_name||"--"}</p><p className="text-xs text-gray-400">{a.email}</p></div><div className="flex items-center gap-2"><StatusBadge status={a.status} />{a.overall_score&&<span className="text-xs font-bold text-[#1877F2]">{Math.round(a.overall_score)}</span>}</div></div>))}</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Top Cities</h3>
                <div className="space-y-3">{topCities.length>0?topCities.map(([city,count])=>(<div key={city} className="flex items-center justify-between"><span className="text-sm">{city}</span><span className="text-xs font-bold text-gray-500">{count}</span></div>)):<p className="text-sm text-gray-400">No city data yet</p>}</div>
                <h3 className="font-bold text-gray-900 mb-3 mt-6">Audit Types</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>Facebook Audits</span><span className="font-bold text-[#1877F2]">{facebookAudits.length}</span></div>
                  <div className="flex justify-between text-sm"><span>SEO Audits</span><span className="font-bold text-green-600">{seoAudits.length}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab==="customers" && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <input type="text" placeholder="Search by name, email, business..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1877F2]" />
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm">
                <option value="all">All Status</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="failed">Failed</option>
              </select>
              <span className="text-sm text-gray-500 self-center">{filteredAudits.length} results</span>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-100 bg-gray-50"><th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Customer</th><th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Business</th><th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">City</th><th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">FB Score</th><th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">SEO</th><th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Status</th><th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Paid</th><th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Date</th><th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Actions</th></tr></thead>
                  <tbody className="divide-y divide-gray-50">{filteredAudits.map(a=>(<tr key={a.id} className="hover:bg-gray-50"><td className="px-4 py-3"><p className="font-medium">{a.customer_name||"--"}</p><p className="text-xs text-gray-400">{a.email}</p></td><td className="px-4 py-3"><p>{a.business_name||"--"}</p><p className="text-xs text-gray-400 truncate max-w-xs">{a.facebook_url||a.website||"--"}</p></td><td className="px-4 py-3 text-gray-600">{a.city||"--"}</td><td className="px-4 py-3"><span className={`font-bold ${a.overall_score>=80?"text-green-600":a.overall_score>=60?"text-yellow-500":"text-red-500"}`}>{a.overall_score?Math.round(a.overall_score):"--"}</span></td><td className="px-4 py-3"><span className={`font-bold ${a.seo_score>=80?"text-green-600":a.seo_score>=60?"text-yellow-500":a.seo_score?"text-red-500":"text-gray-300"}`}>{a.seo_score?Math.round(a.seo_score):"--"}</span></td><td className="px-4 py-3"><StatusBadge status={a.status} /></td><td className="px-4 py-3">{a.paid?<span className="text-green-600 font-bold">${parseFloat(a.amount_paid||0).toFixed(2)}</span>:<span className="text-gray-300">--</span>}</td><td className="px-4 py-3 text-xs text-gray-400">{a.created_at?new Date(a.created_at).toLocaleDateString():"--"}</td><td className="px-4 py-3"><div className="flex items-center gap-2"><button onClick={()=>navigate(`/report/${a.id}`)} className="text-[#1877F2] hover:underline text-xs font-medium">View</button><a href={`mailto:${a.email}`} className="text-gray-400 hover:text-gray-600"><Mail className="w-3.5 h-3.5" /></a><button onClick={()=>setDeleteConfirm(a.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></div></td></tr>))}</tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {activeTab==="revenue" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} color="green" icon={DollarSign} />
              <StatCard label="Facebook Sales" value={facebookAudits.filter(a=>a.paid).length} sub={`$${facebookAudits.filter(a=>a.paid).reduce((s,a)=>s+parseFloat(a.amount_paid||0),0).toFixed(2)}`} color="blue" />
              <StatCard label="SEO Sales" value={seoAudits.filter(a=>a.paid).length} sub={`$${seoAudits.filter(a=>a.paid).reduce((s,a)=>s+parseFloat(a.amount_paid||0),0).toFixed(2)}`} color="purple" />
              <StatCard label="Avg Order" value={`$${audits.filter(a=>a.paid).length?(totalRevenue/audits.filter(a=>a.paid).length).toFixed(2):"0.00"}`} color="orange" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">All Paid Orders</h3>
              <table className="w-full text-sm"><thead><tr className="border-b border-gray-100"><th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Customer</th><th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Type</th><th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Amount</th><th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Source</th><th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Date</th></tr></thead>
              <tbody className="divide-y divide-gray-50">{audits.filter(a=>a.paid).map(a=>(<tr key={a.id} className="hover:bg-gray-50"><td className="px-4 py-3"><p className="font-medium">{a.business_name||a.customer_name||"--"}</p><p className="text-xs text-gray-400">{a.email}</p></td><td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.account_type==="SEO Audit"?"bg-green-100 text-green-700":"bg-blue-100 text-blue-700"}`}>{a.account_type==="SEO Audit"?"SEO":"Facebook"}</span></td><td className="px-4 py-3 font-bold text-green-600">${parseFloat(a.amount_paid||0).toFixed(2)}</td><td className="px-4 py-3 text-xs text-gray-500">{a.utm_source||"direct"}</td><td className="px-4 py-3 text-xs text-gray-400">{a.created_at?new Date(a.created_at).toLocaleDateString():"--"}</td></tr>))}{audits.filter(a=>a.paid).length===0&&(<tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No paid orders yet</td></tr>)}</tbody></table>
            </div>
          </div>
        )}
        {activeTab==="funnel" && (
          <div className="space-y-6">
            {funnel ? (
              <>
                <div className="bg-white border border-gray-100 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-6">Conversion Funnel</h3>
                  <div className="space-y-4">{funnel.counts?.map(({event_type,count})=>{const first=funnel.counts[0]?.count||1;const pct=Math.round((count/first)*100);return(<div key={event_type}><div className="flex justify-between text-sm mb-1"><span className="capitalize font-medium">{event_type.replace(/_/g," ")}</span><span className="font-bold">{count} ({pct}%)</span></div><div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#1877F2] rounded-full" style={{width:`${pct}%`}} /></div></div>);})}</div>
                </div>
                {funnel.dropoffs?.length>0&&(<div className="bg-white border border-gray-100 rounded-2xl p-6"><h3 className="font-bold text-gray-900 mb-4">Drop-offs</h3><table className="w-full text-sm"><thead><tr className="border-b border-gray-100"><th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Email</th><th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Source</th><th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Date</th></tr></thead><tbody className="divide-y divide-gray-50">{funnel.dropoffs.slice(0,20).map((d,i)=>(<tr key={i}><td className="px-4 py-3">{d.email||"--"}</td><td className="px-4 py-3 text-xs text-gray-500">{d.utm_source||"direct"}</td><td className="px-4 py-3 text-xs text-gray-400">{d.created_at?new Date(d.created_at).toLocaleDateString():"--"}</td></tr>))}</tbody></table></div>)}
              </>
            ) : (<div className="bg-white border border-gray-100 rounded-2xl p-8 text-center"><p className="text-gray-400">No funnel data yet</p></div>)}
          </div>
        )}
        {activeTab==="seo" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard label="SEO Audits Sold" value={seoAudits.length} color="green" icon={Globe} />
              <StatCard label="SEO Revenue" value={`$${seoAudits.filter(a=>a.paid).reduce((s,a)=>s+parseFloat(a.amount_paid||0),0).toFixed(2)}`} color="blue" />
              <StatCard label="Completed" value={seoAudits.filter(a=>a.status==="completed").length} color="purple" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <table className="w-full text-sm"><thead><tr className="border-b border-gray-100 bg-gray-50"><th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Customer</th><th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Website</th><th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">SEO Score</th><th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Status</th><th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Paid</th><th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Date</th><th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-50">{seoAudits.length===0?(<tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No SEO audits yet</td></tr>):seoAudits.map(a=>(<tr key={a.id} className="hover:bg-gray-50"><td className="px-4 py-3"><p className="font-medium">{a.customer_name||"--"}</p><p className="text-xs text-gray-400">{a.email}</p></td><td className="px-4 py-3 text-xs text-blue-600"><a href={a.website} target="_blank" rel="noopener noreferrer" className="hover:underline">{a.website||"--"}</a></td><td className="px-4 py-3"><span className={`font-bold ${a.seo_score>=80?"text-green-600":a.seo_score>=60?"text-yellow-500":a.seo_score?"text-red-500":"text-gray-300"}`}>{a.seo_score?`${Math.round(a.seo_score)}/100`:"--"}</span></td><td className="px-4 py-3"><StatusBadge status={a.status} /></td><td className="px-4 py-3 font-bold text-green-600">{a.paid?`$${parseFloat(a.amount_paid||0).toFixed(2)}`:"--"}</td><td className="px-4 py-3 text-xs text-gray-400">{a.created_at?new Date(a.created_at).toLocaleDateString():"--"}</td><td className="px-4 py-3"><button onClick={()=>navigate(`/report/${a.id}`)} className="text-[#1877F2] hover:underline text-xs font-medium">View</button></td></tr>))}</tbody></table>
            </div>
          </div>
        )}
        {activeTab==="analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Top Traffic Sources</h3>
                {topSources.length>0?(<div className="space-y-3">{topSources.map(([source,count])=>(<div key={source} className="flex items-center justify-between"><span className="text-sm capitalize">{source}</span><span className="text-xs font-bold text-gray-500">{count}</span></div>))}</div>):(<p className="text-sm text-gray-400">No UTM data yet</p>)}
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Score Distribution</h3>
                <div className="space-y-3">{[{label:"Excellent 80-100",color:"bg-green-500",count:audits.filter(a=>a.overall_score>=80).length},{label:"Good 60-79",color:"bg-yellow-400",count:audits.filter(a=>a.overall_score>=60&&a.overall_score<80).length},{label:"Needs Work under 60",color:"bg-red-400",count:audits.filter(a=>a.overall_score&&a.overall_score<60).length},{label:"No Score",color:"bg-gray-200",count:audits.filter(a=>!a.overall_score).length}].map(({label,color,count})=>(<div key={label} className="flex items-center gap-3"><div className={`w-3 h-3 rounded-full ${color}`} /><span className="text-xs text-gray-600 flex-1">{label}</span><span className="text-xs font-bold">{count}</span></div>))}</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Goal Distribution</h3>
                <div className="space-y-2">{["Grow followers","Increase engagement","Generate leads","Build authority","Promote a cause"].map(goal=>(<div key={goal} className="flex items-center justify-between text-sm"><span className="text-gray-600">{goal}</span><span className="font-bold text-[#1877F2]">{audits.filter(a=>a.goals?.includes(goal)).length}</span></div>))}</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Form Step Time on Page</h3>
                <p className="text-xs text-gray-500 mb-3">Tracks where customers spend the most time</p>
                <div className="space-y-2">{["Step 1 Name and Email","Step 2 Business Info","Step 3 Main Goal","Step 4 Post Frequency","Step 5 Content Type","Step 6 Facebook Finder"].map((step)=>(<div key={step} className="flex items-center justify-between text-sm"><span className="text-gray-600">{step}</span><span className="text-xs font-bold text-gray-400">tracking soon</span></div>))}</div>
                <div className="mt-3 bg-blue-50 rounded-xl p-3"><p className="text-xs text-blue-700">Will populate after next customer goes through the form</p></div>
              </div>
            </div>
          </div>
        )}
        {activeTab==="reviews" && (
          <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
            <Star className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reviews Coming Soon</h3>
            <p className="text-sm text-gray-500">Customer reviews will appear here once the feedback system is built.</p>
          </div>
        )}
      </div>
      {deleteConfirm&&(<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl max-w-sm w-full p-6"><h2 className="text-lg font-bold text-gray-900 mb-2">Delete Audit?</h2><p className="text-sm text-gray-500 mb-6">This cannot be undone.</p><div className="flex gap-3"><button onClick={()=>setDeleteConfirm(null)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl">Cancel</button><button onClick={()=>handleDelete(deleteConfirm)} className="flex-1 bg-red-500 text-white font-semibold py-2.5 rounded-xl">Delete</button></div></div></div>)}
    </div>
  );
}
'@
Set-Content "C:\Users\matt5\Downloads\page-growth-path\src\pages\Backoffice.jsx" $code
