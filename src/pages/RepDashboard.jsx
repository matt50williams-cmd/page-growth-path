import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { rep as repApi } from "@/api/apiClient";
import { BarChart2, Copy, CheckCircle, AlertTriangle, AlertCircle, DollarSign, Users, Clock, X, Link2, QrCode, MessageSquare, Mail, Loader2, LogOut, BookOpen, FileText } from "lucide-react";

const SB = { pending: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Pending" }, approved: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", label: "Approved" }, paid: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", label: "Paid" }, held: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Held" }, cancelled: { bg: "bg-gray-100", text: "text-gray-400", border: "border-gray-200", label: "Cancelled" }, buffering: { bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-200", label: "Buffering" }, pending_approval: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", label: "Pending Approval" }, processing: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Processing" } };
function Badge({ status }) { const s = SB[status] || SB.pending; return <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${s.bg} ${s.text} ${s.border}`}>{s.label}</span>; }

export default function RepDashboard() {
  const navigate = useNavigate();
  const { user, isLoadingAuth, logout } = useAuth();
  const [data, setData] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);
  const [tab, setTab] = useState("overview");

  useEffect(() => { if (isLoadingAuth) return; if (!user) { navigate("/login"); return; } load(); }, [user, isLoadingAuth]);

  const load = async () => {
    setLoading(true);
    try {
      const [d, p] = await Promise.all([repApi.dashboard(), repApi.payouts().catch(() => [])]);
      setData(d); setPayouts(p || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const copy = (text, key) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000); };
  const dismiss = async (id) => { await repApi.dismissAlert(id).catch(() => null); setData(p => ({ ...p, alerts: p.alerts.filter(a => a.id !== id) })); };

  if (loading || isLoadingAuth) return <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" /></div>;
  if (!data?.rep) return <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center"><div className="text-center"><p className="text-gray-500 mb-4">Not registered as a rep.</p><button onClick={() => navigate("/")} className="text-[#2563eb] font-semibold text-sm hover:underline">Go Home</button></div></div>;

  const { rep: r, commissions, alerts, stats } = data;
  const repLink = `pageauditpros.com/scan?rep=${r.rep_code}`;
  const sms = `Hey it's ${r.full_name} from The Agency! Here's your free business scan: ${repLink} 60 seconds, completely free, no account needed.`;
  const emailTpl = `Hi there,\n\nGreat connecting with you! I wanted to share a free tool that scans your entire online presence — Google, Yelp, Facebook, and 20+ platforms.\n\nFree scan link: ${repLink}\n\nTakes 60 seconds, no account needed.\n\nBest,\n${r.full_name}`;
  const failedAlerts = alerts?.filter(a => a.alert_type === 'payment_failed' || a.alert_type === 'commission_held') || [];
  const cbAlerts = alerts?.filter(a => a.alert_type === 'chargeback_warning' || a.alert_type === 'account_suspended') || [];
  const otherAlerts = alerts?.filter(a => !['payment_failed','commission_held','chargeback_warning','account_suspended'].includes(a.alert_type)) || [];
  const lastPaid = payouts.find(p => p.status === 'paid');
  const approvedPayout = payouts.find(p => p.status === 'approved' || p.status === 'processing');
  const nextMonday = new Date(); nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7));
  const TABS = [{ k: "overview", l: "Overview" }, { k: "links", l: "Sales Links" }, { k: "payouts", l: "Payouts" }, { k: "customers", l: "Customers" }];
  const SC = ({ label, value, sub, color = "#111827" }) => (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6b7280] mb-2">{label}</p>
      <p className="text-[26px] font-bold leading-tight" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-[#6b7280] mt-1">{sub}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans">
      <nav className="bg-white border-b border-[#e5e7eb] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart2 className="w-5 h-5 text-[#2563eb]" />
            <span className="font-bold text-[15px] text-[#111827]">PageAudit Pro</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#2563eb] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">Rep</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/rep-training")} className="text-xs text-[#6b7280] hover:text-[#111827] flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Training</button>
            <button onClick={() => navigate("/rep-commissions")} className="text-xs text-[#6b7280] hover:text-[#111827] flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Commissions</button>
            <span className="text-xs text-[#6b7280]">{r.full_name}</span>
            <button onClick={() => logout("/")} className="text-xs text-[#6b7280] hover:text-[#111827] flex items-center gap-1"><LogOut className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        {/* CHARGEBACK ALERTS */}
        {cbAlerts.map(a => (
          <div key={a.id} className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div className="flex-1"><p className="text-sm font-semibold text-orange-800">{a.message}</p><button onClick={() => navigate("/rep-training")} className="text-xs text-orange-600 hover:underline mt-1">Review conduct guidelines</button></div>
            <button onClick={() => dismiss(a.id)} className="text-gray-400 hover:text-gray-600 shrink-0"><X className="w-4 h-4" /></button>
          </div>
        ))}

        {/* PAYMENT FAILED ALERTS */}
        {failedAlerts.map(a => (
          <div key={a.id} className="bg-red-50 border border-red-200 rounded-xl p-4 mb-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">{a.message}</p>
              <button onClick={() => copy(`Hi, this is ${r.full_name} from The Agency. Your PageAudit Pro payment didn't go through. Let me know if you need help updating your card!`, `sms-${a.id}`)}
                className={`text-xs mt-2 px-3 py-1 rounded-md font-semibold ${copied === `sms-${a.id}` ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700 hover:bg-red-200"}`}>
                {copied === `sms-${a.id}` ? "Copied!" : "Copy Reminder SMS"}
              </button>
            </div>
            <button onClick={() => dismiss(a.id)} className="text-gray-400 hover:text-gray-600 shrink-0"><X className="w-4 h-4" /></button>
          </div>
        ))}

        {/* OTHER ALERTS */}
        {otherAlerts.map(a => (
          <div key={a.id} className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-blue-800 flex-1">{a.message}</p>
            <button onClick={() => dismiss(a.id)} className="text-gray-400 hover:text-gray-600 shrink-0"><X className="w-4 h-4" /></button>
          </div>
        ))}

        {approvedPayout && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-sm font-semibold text-green-800">Your payout of ${parseFloat(approvedPayout.total_amount).toFixed(2)} has been approved! Payment is on its way.</p>
          </div>
        )}

        {/* TABS */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} className={`px-4 py-2.5 text-[13px] font-semibold rounded-lg transition-colors whitespace-nowrap ${tab === t.k ? "bg-[#2563eb] text-white" : "text-[#6b7280] hover:bg-gray-100"}`}>{t.l}</button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <SC label="This Week" value={`$${stats.pending.amount.toFixed(2)}`} sub={`${stats.pending.count} commissions`} color="#2563eb" />
              <SC label="Active Customers" value={stats.total_sales} sub="all time" />
              <SC label="Monthly Residual" value={`$${(stats.approved.amount + stats.pending.amount).toFixed(2)}`} sub="recurring" color="#10b981" />
              <SC label="Next Payout" value={nextMonday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} sub="Monday" />
            </div>

            {/* Earnings This Week */}
            <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
              <h3 className="text-[16px] font-semibold text-[#111827] mb-4">Earnings This Week</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div><p className="text-xs text-[#6b7280] uppercase font-semibold">Audits</p><p className="text-xl font-bold text-[#111827]">${commissions?.filter(c => c.product_type?.includes('audit') && c.status === 'pending').reduce((s, c) => s + parseFloat(c.commission_amount || 0), 0).toFixed(2)}</p></div>
                <div><p className="text-xs text-[#6b7280] uppercase font-semibold">Subscriptions</p><p className="text-xl font-bold text-[#111827]">${commissions?.filter(c => !c.product_type?.includes('audit') && c.status === 'pending').reduce((s, c) => s + parseFloat(c.commission_amount || 0), 0).toFixed(2)}</p></div>
                <div><p className="text-xs text-[#6b7280] uppercase font-semibold">Total</p><p className="text-xl font-bold text-[#2563eb]">${stats.pending.amount.toFixed(2)}</p></div>
              </div>
              <p className="text-xs text-[#9ca3af]">7-day buffer on all commissions. Released commissions pay out every Monday. Minimum $20 per payout.</p>
            </div>

            {/* Recent commissions */}
            <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
              <h3 className="text-[16px] font-semibold text-[#111827] mb-4">Recent Commissions</h3>
              {commissions?.length > 0 ? (
                <div className="space-y-3">{commissions.slice(0, 8).map(c => (
                  <div key={c.id} className="flex items-center justify-between text-sm py-1">
                    <div><p className="font-medium text-[#111827]">{c.business_name || c.customer_email}</p><p className="text-xs text-[#9ca3af]">{c.product_type?.replace(/_/g, " ")} &middot; {c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}</p></div>
                    <div className="flex items-center gap-3"><Badge status={c.buffer_status || c.status} /><span className="font-bold text-[#111827]">${parseFloat(c.commission_amount).toFixed(2)}</span></div>
                  </div>
                ))}</div>
              ) : <p className="text-sm text-[#9ca3af]">No commissions yet. Share your link to start earning!</p>}
            </div>
          </div>
        )}

        {tab === "links" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
              <div className="flex items-center gap-2 mb-4"><Link2 className="w-5 h-5 text-[#2563eb]" /><h3 className="text-[16px] font-semibold text-[#111827]">Your Sales Link</h3></div>
              <div className="flex items-center gap-3 bg-[#f8f9fc] border border-[#e5e7eb] rounded-lg p-3 mb-4">
                <code className="flex-1 text-sm text-[#374151] font-mono truncate">{repLink}</code>
                <button onClick={() => copy(repLink, "link")} className={`text-xs font-semibold px-3 py-1.5 rounded-md ${copied === "link" ? "bg-green-100 text-green-700" : "bg-[#2563eb] text-white"}`}>{copied === "link" ? "Copied!" : "Copy Link"}</button>
              </div>
              <button className="text-sm font-medium text-[#6b7280] border border-[#e5e7eb] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50"><QrCode className="w-4 h-4" /> Generate QR Code</button>
            </div>
            <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
              <div className="flex items-center gap-2 mb-4"><MessageSquare className="w-5 h-5 text-green-600" /><h3 className="text-[16px] font-semibold text-[#111827]">SMS Template</h3></div>
              <div className="bg-[#f8f9fc] border border-[#e5e7eb] rounded-lg p-4 mb-4"><p className="text-sm text-[#374151]">{sms}</p></div>
              <button onClick={() => copy(sms, "sms")} className={`text-xs font-semibold px-4 py-2 rounded-md ${copied === "sms" ? "bg-green-100 text-green-700" : "bg-green-600 text-white"}`}>{copied === "sms" ? "Copied!" : "Copy SMS"}</button>
            </div>
            <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
              <div className="flex items-center gap-2 mb-4"><Mail className="w-5 h-5 text-[#2563eb]" /><h3 className="text-[16px] font-semibold text-[#111827]">Email Template</h3></div>
              <div className="bg-[#f8f9fc] border border-[#e5e7eb] rounded-lg p-4 mb-4"><p className="text-sm text-[#374151] whitespace-pre-wrap">{emailTpl}</p></div>
              <button onClick={() => copy(emailTpl, "email")} className={`text-xs font-semibold px-4 py-2 rounded-md ${copied === "email" ? "bg-green-100 text-green-700" : "bg-[#2563eb] text-white"}`}>{copied === "email" ? "Copied!" : "Copy Email"}</button>
            </div>
          </div>
        )}

        {tab === "payouts" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <SC label="Last Payout" value={lastPaid ? `$${parseFloat(lastPaid.total_amount).toFixed(2)}` : "--"} sub={lastPaid?.paid_at ? new Date(lastPaid.paid_at).toLocaleDateString() : "No payouts yet"} />
              <SC label="Current Week" value={`$${stats.pending.amount.toFixed(2)}`} sub="building up" color="#2563eb" />
              <SC label="Total Paid" value={`$${stats.paid.amount.toFixed(2)}`} sub="all time" color="#10b981" />
            </div>
            <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#e5e7eb]"><h3 className="text-[16px] font-semibold text-[#111827]">Payout History</h3></div>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                  <th className="text-left text-[12px] font-semibold uppercase text-[#6b7280] px-4 py-3">Week</th>
                  <th className="text-left text-[12px] font-semibold uppercase text-[#6b7280] px-4 py-3">Amount</th>
                  <th className="text-left text-[12px] font-semibold uppercase text-[#6b7280] px-4 py-3">Status</th>
                  <th className="text-left text-[12px] font-semibold uppercase text-[#6b7280] px-4 py-3">Paid</th>
                </tr></thead>
                <tbody className="divide-y divide-[#f3f4f6]">
                  {payouts.length > 0 ? payouts.map(p => (
                    <tr key={p.id} className="hover:bg-[#f9fafb]">
                      <td className="px-4 py-3 text-[#374151]">{p.week_start_date ? new Date(p.week_start_date).toLocaleDateString() : "--"}</td>
                      <td className="px-4 py-3 font-bold text-[#111827]">${parseFloat(p.total_amount).toFixed(2)}</td>
                      <td className="px-4 py-3"><Badge status={p.status} /></td>
                      <td className="px-4 py-3 text-xs text-[#9ca3af]">{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "--"}</td>
                    </tr>
                  )) : <tr><td colSpan={4} className="px-4 py-8 text-center text-[#9ca3af]">No payouts yet</td></tr>}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[#9ca3af] text-center">Payouts processed every Monday. Minimum $20 to trigger payout. Amounts under $20 roll to next week.</p>
          </div>
        )}

        {tab === "customers" && (
          <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e5e7eb]"><h3 className="text-[16px] font-semibold text-[#111827]">Active Customers</h3></div>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                <th className="text-left text-[12px] font-semibold uppercase text-[#6b7280] px-4 py-3">Business</th>
                <th className="text-left text-[12px] font-semibold uppercase text-[#6b7280] px-4 py-3">Plan</th>
                <th className="text-left text-[12px] font-semibold uppercase text-[#6b7280] px-4 py-3">Commission</th>
                <th className="text-left text-[12px] font-semibold uppercase text-[#6b7280] px-4 py-3">Payment</th>
                <th className="text-left text-[12px] font-semibold uppercase text-[#6b7280] px-4 py-3">Since</th>
              </tr></thead>
              <tbody className="divide-y divide-[#f3f4f6]">
                {commissions?.length > 0 ? commissions.map(c => (
                  <tr key={c.id} className="hover:bg-[#f9fafb]">
                    <td className="px-4 py-3"><p className="font-medium text-[#111827]">{c.business_name || c.customer_name || "--"}</p><p className="text-xs text-[#9ca3af]">{c.customer_email}</p></td>
                    <td className="px-4 py-3 text-[#6b7280] capitalize">{c.product_type?.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 font-bold text-[#111827]">${parseFloat(c.commission_amount).toFixed(2)}</td>
                    <td className="px-4 py-3"><Badge status={c.payment_status === 'customer_paid' ? 'paid' : c.payment_status === 'payment_failed' ? 'held' : c.payment_status} /></td>
                    <td className="px-4 py-3 text-xs text-[#9ca3af]">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "--"}</td>
                  </tr>
                )) : <tr><td colSpan={5} className="px-4 py-8 text-center text-[#9ca3af]">No customers yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
