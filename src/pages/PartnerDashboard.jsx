import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { BarChart2, Users, DollarSign, Loader2, LogOut, Copy, CheckCircle, Link2 } from "lucide-react";

const API_BASE = "https://pageaudit-engine.onrender.com";

const SB = { pending: "bg-yellow-50 text-yellow-700 border-yellow-200", paid: "bg-green-50 text-green-700 border-green-200", approved: "bg-blue-50 text-blue-700 border-blue-200", buffering: "bg-gray-100 text-gray-500 border-gray-200", active: "bg-green-50 text-green-700 border-green-200", suspended: "bg-orange-50 text-orange-700 border-orange-200" };
function Badge({ status }) { return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${SB[status] || "bg-gray-50 text-gray-500 border-gray-200"}`}>{status || "unknown"}</span>; }

export default function PartnerDashboard() {
  const navigate = useNavigate();
  const { user, isLoadingAuth, logout } = useAuth();
  const [data, setData] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [copied, setCopied] = useState(null);

  useEffect(() => { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap"; document.head.appendChild(l); return () => { document.head.removeChild(l); }; }, []);
  useEffect(() => { if (isLoadingAuth) return; if (!user) { navigate("/login"); return; } load(); }, [user, isLoadingAuth]);

  const load = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("pageaudit_token");
      const h = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
      const [dRes, pRes] = await Promise.all([fetch(`${API_BASE}/api/partners/dashboard`, { headers: h }), fetch(`${API_BASE}/api/partners/payouts`, { headers: h }).catch(() => null)]);
      if (dRes.ok) setData(await dRes.json());
      if (pRes?.ok) setPayouts(await pRes.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const copy = (t, k) => { navigator.clipboard.writeText(t); setCopied(k); setTimeout(() => setCopied(null), 2000); };
  const H = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
  const card = "bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5";
  const th = "text-left text-[12px] font-semibold uppercase tracking-[0.04em] text-[#6b7280] px-4 py-3";

  if (loading || isLoadingAuth) return <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" /></div>;
  if (!data?.partner) return <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center"><div className="text-center"><p className="text-gray-500 mb-4">Partner account not found.</p><button onClick={() => navigate("/")} className="text-[#2563eb] font-semibold text-sm">Go Home</button></div></div>;

  const { partner: p, consultants, commissions, stats, alerts } = data;
  const inviteLink = `${window.location.origin}/join?partner=${p.partner_code}`;
  const TABS = [{ k: "overview", l: "Overview" }, { k: "consultants", l: "Consultants" }, { k: "clients", l: "Clients" }, { k: "commissions", l: "Commissions" }, { k: "payouts", l: "Payouts" }, { k: "tools", l: "Tools" }];

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans">
      <nav className="bg-white border-b border-[#e5e7eb] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart2 className="w-5 h-5 text-[#2563eb]" />
            <span style={H} className="font-bold text-[15px] text-[#111827]">The Agency</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#f97316] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">Regional Director</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6b7280]">{p.full_name} · {p.partner_code}</span>
            <button onClick={() => logout("/")} className="text-xs text-[#6b7280] hover:text-[#111827] flex items-center gap-1"><LogOut className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {TABS.map(t => <button key={t.k} onClick={() => setTab(t.k)} className={`px-4 py-2.5 text-[13px] font-semibold rounded-lg transition-colors whitespace-nowrap ${tab === t.k ? "bg-[#2563eb] text-white" : "text-[#6b7280] hover:bg-gray-100"}`}>{t.l}</button>)}
        </div>

        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className={card}><p className="text-[11px] font-semibold uppercase text-[#6b7280] mb-2">Consultants</p><p className="text-[28px] font-bold text-[#111827]">{stats.total_consultants}</p></div>
              <div className={card}><p className="text-[11px] font-semibold uppercase text-[#6b7280] mb-2">Pending</p><p className="text-[28px] font-bold text-blue-600">{"$"}{stats.pending?.toFixed(2)}</p></div>
              <div className={card}><p className="text-[11px] font-semibold uppercase text-[#6b7280] mb-2">Buffering</p><p className="text-[28px] font-bold text-[#6b7280]">{"$"}{stats.buffering?.toFixed(2)}</p></div>
              <div className={card}><p className="text-[11px] font-semibold uppercase text-[#6b7280] mb-2">Total Paid</p><p className="text-[28px] font-bold text-green-600">{"$"}{stats.total_paid?.toFixed(2)}</p></div>
              <div className={card}><p className="text-[11px] font-semibold uppercase text-[#6b7280] mb-2">Lifetime</p><p className="text-[28px] font-bold text-[#111827]">{"$"}{stats.total_earned?.toFixed(2)}</p></div>
            </div>
            <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
              <h3 className="text-[16px] font-semibold text-[#111827] mb-4">Recent Overrides</h3>
              {commissions?.length > 0 ? <div className="space-y-3">{commissions.slice(0, 8).map(c => (
                <div key={c.id} className="flex items-center justify-between text-sm py-1">
                  <div><p className="font-medium text-[#111827]">{c.customer_email || "Client"}</p><p className="text-xs text-[#9ca3af]">{c.transaction_type?.replace(/_/g, " ")} · {c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}</p></div>
                  <div className="flex items-center gap-3"><Badge status={c.buffer_status || c.status} /><span className="font-bold text-[#111827]">{"$"}{parseFloat(c.override_amount).toFixed(2)}</span></div>
                </div>
              ))}</div> : <p className="text-sm text-[#9ca3af]">No commissions yet</p>}
            </div>
          </div>
        )}

        {tab === "consultants" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[16px] font-semibold text-[#111827]">My Consultants ({consultants?.length || 0})</h3>
              <button onClick={() => copy(inviteLink, "invite")} className={`text-xs font-semibold px-3 py-1.5 rounded-md ${copied === "invite" ? "bg-green-100 text-green-700" : "bg-[#2563eb] text-white"}`}>{copied === "invite" ? "Copied!" : "Copy Invite Link"}</button>
            </div>
            <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
              <table className="w-full text-sm"><thead><tr className="border-b border-[#e5e7eb] bg-[#f9fafb]"><th className={th}>Name</th><th className={th}>Code</th><th className={th}>Status</th><th className={th}>Joined</th></tr></thead>
                <tbody className="divide-y divide-[#f3f4f6]">{consultants?.length > 0 ? consultants.map(c => (
                  <tr key={c.id} className="hover:bg-[#f9fafb]">
                    <td className="px-4 py-3"><p className="font-medium text-[#111827]">{c.full_name}</p><p className="text-xs text-[#9ca3af]">{c.email}</p></td>
                    <td className="px-4 py-3"><code className="text-xs bg-[#f3f4f6] px-2 py-0.5 rounded font-mono">{c.rep_code}</code></td>
                    <td className="px-4 py-3"><Badge status={c.status} /></td>
                    <td className="px-4 py-3 text-xs text-[#9ca3af]">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "--"}</td>
                  </tr>
                )) : <tr><td colSpan={4} className="px-4 py-8 text-center text-[#9ca3af]">No consultants yet. Share your invite link to recruit.</td></tr>}</tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "commissions" && (
          <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e5e7eb]"><h3 className="text-[16px] font-semibold text-[#111827]">Override Commissions</h3></div>
            <table className="w-full text-sm"><thead><tr className="border-b border-[#e5e7eb] bg-[#f9fafb]"><th className={th}>Date</th><th className={th}>Client</th><th className={th}>Type</th><th className={th}>Charged</th><th className={th}>Override</th><th className={th}>Buffer</th><th className={th}>Status</th></tr></thead>
              <tbody className="divide-y divide-[#f3f4f6]">{commissions?.length > 0 ? commissions.map(c => (
                <tr key={c.id} className="hover:bg-[#f9fafb]">
                  <td className="px-4 py-3 text-xs text-[#9ca3af]">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "--"}</td>
                  <td className="px-4 py-3 text-[#374151]">{c.customer_email || "--"}</td>
                  <td className="px-4 py-3 text-[#6b7280] capitalize text-xs">{c.transaction_type?.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-[#374151]">{"$"}{parseFloat(c.amount_charged || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 font-bold text-[#111827]">{"$"}{parseFloat(c.override_amount).toFixed(2)}</td>
                  <td className="px-4 py-3"><Badge status={c.buffer_status || "buffering"} /></td>
                  <td className="px-4 py-3"><Badge status={c.status} /></td>
                </tr>
              )) : <tr><td colSpan={7} className="px-4 py-8 text-center text-[#9ca3af]">No commissions yet</td></tr>}</tbody>
            </table>
          </div>
        )}

        {tab === "payouts" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#e5e7eb]"><h3 className="text-[16px] font-semibold text-[#111827]">Payout History</h3></div>
              <table className="w-full text-sm"><thead><tr className="border-b border-[#e5e7eb] bg-[#f9fafb]"><th className={th}>Week</th><th className={th}>Gross</th><th className={th}>License Fee</th><th className={th}>Net Payout</th><th className={th}>Status</th><th className={th}>Paid</th></tr></thead>
                <tbody className="divide-y divide-[#f3f4f6]">{payouts?.length > 0 ? payouts.map(p => (
                  <tr key={p.id} className="hover:bg-[#f9fafb]">
                    <td className="px-4 py-3 text-xs text-[#6b7280]">{p.week_start_date ? new Date(p.week_start_date).toLocaleDateString() : "--"}</td>
                    <td className="px-4 py-3 text-[#374151]">{"$"}{parseFloat(p.gross_amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-red-500">{p.license_fee_deduction > 0 ? `-$${parseFloat(p.license_fee_deduction).toFixed(2)}` : "$0"}</td>
                    <td className="px-4 py-3 font-bold text-[#111827]">{"$"}{parseFloat(p.final_payout_amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-3"><Badge status={p.status === "pending_approval" ? "pending" : p.status === "paid" ? "paid" : p.status} /></td>
                    <td className="px-4 py-3 text-xs text-[#9ca3af]">{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "--"}</td>
                  </tr>
                )) : <tr><td colSpan={6} className="px-4 py-8 text-center text-[#9ca3af]">No payouts yet</td></tr>}</tbody>
              </table>
            </div>
            {p.promotional_period_ends && new Date(p.promotional_period_ends) > new Date() && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-green-700">Platform license fee waived until {new Date(p.promotional_period_ends).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        )}

        {tab === "clients" && (
          <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6 text-center">
            <Users className="w-12 h-12 text-[#9ca3af] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#111827] mb-2">Client Portfolio</h3>
            <p className="text-sm text-[#9ca3af]">Clients from your consultants will appear here as they close sales.</p>
          </div>
        )}

        {tab === "tools" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
              <div className="flex items-center gap-2 mb-4"><Link2 className="w-5 h-5 text-[#2563eb]" /><h3 className="text-[16px] font-semibold text-[#111827]">Consultant Invite Link</h3></div>
              <p className="text-sm text-[#6b7280] mb-3">Share this link with potential consultants. They'll be automatically linked to your partner account.</p>
              <div className="flex items-center gap-3 bg-[#f8f9fc] border border-[#e5e7eb] rounded-lg p-3 mb-3">
                <code className="flex-1 text-sm text-[#374151] font-mono truncate">{inviteLink}</code>
                <button onClick={() => copy(inviteLink, "link")} className={`text-xs font-semibold px-3 py-1.5 rounded-md ${copied === "link" ? "bg-green-100 text-green-700" : "bg-[#2563eb] text-white"}`}>{copied === "link" ? "Copied!" : "Copy"}</button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
              <h3 className="text-[16px] font-semibold text-[#111827] mb-3">Override Commission Structure</h3>
              <table className="w-full text-sm"><thead><tr className="border-b border-[#e5e7eb]"><th className="text-left py-2 text-xs text-[#6b7280]">Product</th><th className="text-left py-2 text-xs text-[#6b7280]">Client Pays</th><th className="text-left py-2 text-xs text-[#6b7280]">Your Override</th></tr></thead>
                <tbody className="divide-y divide-[#f3f4f6]">
                  {[["Audit", "$99", "$10"], ["Monthly Monitor", "$49/mo", "$5/mo"], ["Pro Monitor", "$79/mo", "$8/mo"], ["Pro + Review Booster", "$99/mo", "$12/mo"], ["Website Build", "$1,500+", "$150"], ["SEO Monthly", "$500/mo", "$50/mo"]].map(([p, c, o]) => (
                    <tr key={p}><td className="py-2 text-[#374151]">{p}</td><td className="py-2 text-[#6b7280]">{c}</td><td className="py-2 font-bold text-green-600">{o}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
