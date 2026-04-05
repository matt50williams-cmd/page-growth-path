import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { rep as repApi } from "@/api/apiClient";
import { BarChart2, Loader2, AlertTriangle, LogOut, ArrowLeft } from "lucide-react";

const SB = { pending: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Pending" }, approved: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", label: "Approved" }, paid: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", label: "Paid" }, held: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Held" }, cancelled: { bg: "bg-gray-100 line-through", text: "text-gray-400", border: "border-gray-200", label: "Cancelled" }, buffering: { bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-200", label: "Buffering" }, released: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", label: "Released" }, clawback: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300", label: "Clawback" } };
function Badge({ status }) { const s = SB[status] || SB.pending; return <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${s.bg} ${s.text} ${s.border}`}>{s.label}</span>; }

export default function RepCommissions() {
  const navigate = useNavigate();
  const { user, isLoadingAuth } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (isLoadingAuth) return; if (!user) { navigate("/login"); return; } load(); }, [user, isLoadingAuth]);
  const load = async () => { setLoading(true); try { setData(await repApi.dashboard()); } catch (e) { console.error(e); } finally { setLoading(false); } };

  if (loading || isLoadingAuth) return <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" /></div>;
  if (!data?.rep) return <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center"><p className="text-gray-500">Not registered as a rep.</p></div>;

  const { commissions, stats } = data;
  const clawbacks = commissions?.filter(c => c.status === 'clawback' || c.clawback_amount) || [];
  const mockYtdEarnings = stats.total_earned;

  const SC = ({ label, value, color, sub }) => (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#6b7280] mb-1">{label}</p>
      <p className="text-[22px] font-bold leading-tight" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] text-[#9ca3af] mt-1">{sub}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans">
      <nav className="bg-white border-b border-[#e5e7eb] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/rep-dashboard")} className="text-[#6b7280] hover:text-[#111827]"><ArrowLeft className="w-4 h-4" /></button>
            <BarChart2 className="w-5 h-5 text-[#2563eb]" />
            <span className="font-bold text-[15px] text-[#111827]">Commission History</span>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        {/* W9 WARNING */}
        {mockYtdEarnings >= 500 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-800">Your earnings are approaching $600. Please submit your W-9 to avoid payout holds.</p>
              <button className="mt-2 text-xs font-semibold bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-md hover:bg-yellow-200">Submit W-9</button>
            </div>
          </div>
        )}

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
          <SC label="Buffering" value={`$${commissions?.filter(c => c.buffer_status === 'buffering').reduce((s, c) => s + parseFloat(c.commission_amount || 0), 0).toFixed(2)}`} color="#6b7280" sub="7-day hold" />
          <SC label="Pending Approval" value={`$${stats.pending.amount.toFixed(2)}`} color="#f59e0b" sub={`${stats.pending.count} items`} />
          <SC label="Approved" value={`$${stats.approved.amount.toFixed(2)}`} color="#2563eb" sub="ready to pay" />
          <SC label="Paid This Month" value={`$${stats.paid.amount.toFixed(2)}`} color="#10b981" />
          <SC label="Held" value={`$${stats.held.amount.toFixed(2)}`} color="#ef4444" sub="action needed" />
          <SC label="Lifetime" value={`$${stats.total_earned.toFixed(2)}`} color="#111827" sub="all time" />
        </div>

        {/* COMMISSION TABLE */}
        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-[#e5e7eb]"><h3 className="text-[16px] font-semibold text-[#111827]">All Commissions</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                <th className="text-left text-[12px] font-semibold uppercase text-[#6b7280] px-4 py-3">Date</th>
                <th className="text-left text-[12px] font-semibold uppercase text-[#6b7280] px-4 py-3">Business</th>
                <th className="text-left text-[12px] font-semibold uppercase text-[#6b7280] px-4 py-3">Type</th>
                <th className="text-left text-[12px] font-semibold uppercase text-[#6b7280] px-4 py-3">Charged</th>
                <th className="text-left text-[12px] font-semibold uppercase text-[#6b7280] px-4 py-3">My Commission</th>
                <th className="text-left text-[12px] font-semibold uppercase text-[#6b7280] px-4 py-3">Buffer</th>
                <th className="text-left text-[12px] font-semibold uppercase text-[#6b7280] px-4 py-3">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-[#f3f4f6]">
                {commissions?.map(c => (
                  <tr key={c.id} className={`hover:bg-[#f9fafb] ${c.status === 'cancelled' ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 text-xs text-[#9ca3af]">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "--"}</td>
                    <td className="px-4 py-3"><p className="font-medium text-[#111827]">{c.business_name || c.customer_name || "--"}</p><p className="text-xs text-[#9ca3af]">{c.customer_email}</p></td>
                    <td className="px-4 py-3 text-[#6b7280] capitalize">{c.product_type?.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 text-[#374151]">${parseFloat(c.sale_amount).toFixed(2)}</td>
                    <td className="px-4 py-3 font-bold text-[#111827]">${parseFloat(c.commission_amount).toFixed(2)}</td>
                    <td className="px-4 py-3"><Badge status={c.buffer_status || "buffering"} /></td>
                    <td className="px-4 py-3"><Badge status={c.status} /></td>
                  </tr>
                ))}
                {(!commissions || commissions.length === 0) && <tr><td colSpan={7} className="px-4 py-8 text-center text-[#9ca3af]">No commissions yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* CLAWBACKS */}
        {clawbacks.length > 0 && (
          <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden border border-red-200 mb-6">
            <div className="px-6 py-4 border-b border-red-200 bg-red-50"><h3 className="text-[16px] font-semibold text-red-700">Commission Reversals</h3></div>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-red-100">
                <th className="text-left text-[12px] font-semibold uppercase text-[#6b7280] px-4 py-3">Date</th>
                <th className="text-left text-[12px] font-semibold uppercase text-[#6b7280] px-4 py-3">Business</th>
                <th className="text-left text-[12px] font-semibold uppercase text-[#6b7280] px-4 py-3">Reason</th>
                <th className="text-left text-[12px] font-semibold uppercase text-[#6b7280] px-4 py-3">Amount Reversed</th>
              </tr></thead>
              <tbody className="divide-y divide-red-50">
                {clawbacks.map(c => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 text-xs text-[#9ca3af]">{c.clawback_at ? new Date(c.clawback_at).toLocaleDateString() : c.created_at ? new Date(c.created_at).toLocaleDateString() : "--"}</td>
                    <td className="px-4 py-3 text-[#111827] font-medium">{c.business_name || c.customer_email || "--"}</td>
                    <td className="px-4 py-3 text-red-600">{c.clawback_reason || c.held_reason || "Chargeback"}</td>
                    <td className="px-4 py-3 font-bold text-red-600">-${parseFloat(c.clawback_amount || c.commission_amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-[#9ca3af] text-center leading-relaxed">Commissions paid weekly every Monday. 7-day buffer on all payments. $20 minimum payout. You are an independent contractor — taxes are your responsibility. 1099-NEC issued over $600/year.</p>
      </div>
    </div>
  );
}
