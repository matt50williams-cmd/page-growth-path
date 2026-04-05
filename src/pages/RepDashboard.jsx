import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { rep as repApi } from "@/api/apiClient";
import { BarChart2, Copy, CheckCircle, AlertTriangle, DollarSign, Users, Clock, X, Link2, QrCode, MessageSquare, Mail, Loader2, LogOut } from "lucide-react";

const STATUS_COLORS = {
  pending: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Pending" },
  approved: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", label: "Approved" },
  paid: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", label: "Paid" },
  held: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Held" },
  cancelled: { bg: "bg-gray-100", text: "text-gray-400", border: "border-gray-200", label: "Cancelled" },
  pending_approval: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", label: "Pending Approval" },
  processing: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Processing" },
};

function Badge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${s.bg} ${s.text} ${s.border}`}>{s.label}</span>;
}

export default function RepDashboard() {
  const navigate = useNavigate();
  const { user, isLoadingAuth, logout } = useAuth();
  const [data, setData] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!user) { navigate("/login"); return; }
    loadData();
  }, [user, isLoadingAuth]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashData, payoutData] = await Promise.all([
        repApi.dashboard(),
        repApi.payouts().catch(() => []),
      ]);
      setData(dashData);
      setPayouts(payoutData || []);
    } catch (err) {
      console.error("Rep dashboard load failed:", err);
    } finally { setLoading(false); }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const dismissAlert = async (id) => {
    await repApi.dismissAlert(id).catch(() => null);
    setData(prev => ({ ...prev, alerts: prev.alerts.filter(a => a.id !== id) }));
  };

  if (loading || isLoadingAuth) return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
    </div>
  );

  if (!data?.rep) return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-4">You are not registered as a rep.</p>
        <button onClick={() => navigate("/")} className="text-[#2563eb] font-semibold text-sm hover:underline">Go Home</button>
      </div>
    </div>
  );

  const { rep: repInfo, commissions, alerts, stats } = data;
  const repLink = `pageauditpros.com/scan?rep=${repInfo.rep_code}`;
  const smsTemplate = `Hey it's ${repInfo.full_name} from The Agency — great meeting you! Here's your free business scan link: ${repLink} Takes 60 seconds, no account needed.`;
  const emailTemplate = `Hi there,\n\nIt was great connecting with you! I wanted to share a free tool that scans your entire online presence — Google, Yelp, Facebook, and 20+ other platforms — and shows you exactly where you stand.\n\nHere's your free scan link:\n${repLink}\n\nIt takes about 60 seconds, no account needed. You'll get a score and see your top issues right away.\n\nLet me know if you have any questions!\n\nBest,\n${repInfo.full_name}`;

  const lastPayout = payouts.find(p => p.status === 'paid');
  const approvedPayout = payouts.find(p => p.status === 'approved' || p.status === 'processing');

  const TABS = [
    { key: "overview", label: "Overview" },
    { key: "commissions", label: "Commissions" },
    { key: "payouts", label: "Payouts" },
    { key: "links", label: "Sales Links" },
  ];

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
            <span className="text-xs text-[#6b7280]">{repInfo.full_name}</span>
            <button onClick={() => logout("/")} className="text-xs text-[#6b7280] hover:text-[#111827] flex items-center gap-1"><LogOut className="w-3.5 h-3.5" /> Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        {/* Alerts */}
        {alerts?.length > 0 && (
          <div className="space-y-3 mb-6">
            {alerts.map(alert => (
              <div key={alert.id} className={`rounded-xl p-4 flex items-start gap-3 ${alert.alert_type === 'payment_failed' || alert.alert_type === 'commission_held' ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
                <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${alert.alert_type === 'payment_failed' || alert.alert_type === 'commission_held' ? 'text-red-500' : 'text-blue-500'}`} />
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${alert.alert_type === 'payment_failed' || alert.alert_type === 'commission_held' ? 'text-red-800' : 'text-blue-800'}`}>{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.created_at ? new Date(alert.created_at).toLocaleDateString() : ""}</p>
                </div>
                <button onClick={() => dismissAlert(alert.id)} className="text-gray-400 hover:text-gray-600 shrink-0"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}

        {/* Approved payout banner */}
        {approvedPayout && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-sm font-semibold text-green-800">Your payout of ${parseFloat(approvedPayout.total_amount).toFixed(2)} has been approved! Payment is on its way.</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2.5 text-[13px] font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === t.key ? "bg-[#2563eb] text-white" : "text-[#6b7280] hover:bg-gray-100"}`}>{t.label}</button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6b7280] mb-3">Total Earned</p>
                <p className="text-[28px] font-bold text-[#111827]">${stats.total_earned.toFixed(2)}</p>
                <p className="text-xs text-[#6b7280] mt-1">{stats.total_sales} sales</p>
              </div>
              <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6b7280] mb-3">Pending</p>
                <p className="text-[28px] font-bold text-blue-600">${stats.pending.amount.toFixed(2)}</p>
                <p className="text-xs text-[#6b7280] mt-1">{stats.pending.count} commissions</p>
              </div>
              <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6b7280] mb-3">Ready to Pay</p>
                <p className="text-[28px] font-bold text-green-600">${stats.approved.amount.toFixed(2)}</p>
                <p className="text-xs text-[#6b7280] mt-1">{stats.approved.count} approved</p>
              </div>
              <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6b7280] mb-3">Held</p>
                <p className="text-[28px] font-bold text-red-500">${stats.held.amount.toFixed(2)}</p>
                <p className="text-xs text-[#6b7280] mt-1">{stats.held.count} held</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
              <h3 className="text-[16px] font-semibold text-[#111827] mb-4">Recent Commissions</h3>
              {commissions?.length > 0 ? (
                <div className="space-y-3">
                  {commissions.slice(0, 10).map(c => (
                    <div key={c.id} className="flex items-center justify-between text-sm py-1">
                      <div>
                        <p className="font-medium text-[#111827]">{c.business_name || c.customer_name || c.customer_email}</p>
                        <p className="text-xs text-[#9ca3af]">{c.product_type?.replace(/_/g, " ")} &middot; {c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge status={c.status} />
                        <span className="font-bold text-[#111827]">${parseFloat(c.commission_amount).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-[#9ca3af]">No commissions yet. Share your link to start earning!</p>}
            </div>
          </div>
        )}

        {activeTab === "commissions" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                  <th className="text-left text-[12px] font-semibold uppercase tracking-[0.04em] text-[#6b7280] px-4 py-3">Customer</th>
                  <th className="text-left text-[12px] font-semibold uppercase tracking-[0.04em] text-[#6b7280] px-4 py-3">Product</th>
                  <th className="text-left text-[12px] font-semibold uppercase tracking-[0.04em] text-[#6b7280] px-4 py-3">Sale</th>
                  <th className="text-left text-[12px] font-semibold uppercase tracking-[0.04em] text-[#6b7280] px-4 py-3">Commission</th>
                  <th className="text-left text-[12px] font-semibold uppercase tracking-[0.04em] text-[#6b7280] px-4 py-3">Status</th>
                  <th className="text-left text-[12px] font-semibold uppercase tracking-[0.04em] text-[#6b7280] px-4 py-3">Date</th>
                </tr></thead>
                <tbody className="divide-y divide-[#f3f4f6]">
                  {commissions?.map(c => (
                    <tr key={c.id} className={`hover:bg-[#f9fafb] ${c.status === 'cancelled' ? 'opacity-50 line-through' : ''}`}>
                      <td className="px-4 py-3"><p className="font-medium text-[#111827]">{c.business_name || c.customer_name || "--"}</p><p className="text-xs text-[#9ca3af]">{c.customer_email}</p></td>
                      <td className="px-4 py-3 text-[#6b7280] capitalize">{c.product_type?.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3 text-[#374151]">${parseFloat(c.sale_amount).toFixed(2)}</td>
                      <td className="px-4 py-3 font-bold text-[#111827]">${parseFloat(c.commission_amount).toFixed(2)}</td>
                      <td className="px-4 py-3"><Badge status={c.status} /></td>
                      <td className="px-4 py-3 text-xs text-[#9ca3af]">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "--"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5 flex flex-wrap gap-6">
              <div><p className="text-[11px] font-semibold uppercase text-[#6b7280]">Pending</p><p className="text-lg font-bold text-blue-600">${stats.pending.amount.toFixed(2)}</p></div>
              <div><p className="text-[11px] font-semibold uppercase text-[#6b7280]">Ready to Pay</p><p className="text-lg font-bold text-green-600">${stats.approved.amount.toFixed(2)}</p></div>
              <div><p className="text-[11px] font-semibold uppercase text-[#6b7280]">Held</p><p className="text-lg font-bold text-red-500">${stats.held.amount.toFixed(2)}</p></div>
              <div><p className="text-[11px] font-semibold uppercase text-[#6b7280]">Paid All Time</p><p className="text-lg font-bold text-[#6b7280]">${stats.paid.amount.toFixed(2)}</p></div>
            </div>
          </div>
        )}

        {activeTab === "payouts" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6b7280] mb-2">Last Payout</p>
                <p className="text-[24px] font-bold text-[#111827]">{lastPayout ? `$${parseFloat(lastPayout.total_amount).toFixed(2)}` : "--"}</p>
                <p className="text-xs text-[#9ca3af] mt-1">{lastPayout?.paid_at ? new Date(lastPayout.paid_at).toLocaleDateString() : "No payouts yet"}</p>
              </div>
              <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6b7280] mb-2">Current Week</p>
                <p className="text-[24px] font-bold text-blue-600">${stats.pending.amount.toFixed(2)}</p>
                <p className="text-xs text-[#9ca3af] mt-1">building up</p>
              </div>
              <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6b7280] mb-2">Total Paid</p>
                <p className="text-[24px] font-bold text-green-600">${stats.paid.amount.toFixed(2)}</p>
                <p className="text-xs text-[#9ca3af] mt-1">all time</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#e5e7eb]"><h3 className="text-[16px] font-semibold text-[#111827]">Payout History</h3></div>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                  <th className="text-left text-[12px] font-semibold uppercase text-[#6b7280] px-4 py-3">Week</th>
                  <th className="text-left text-[12px] font-semibold uppercase text-[#6b7280] px-4 py-3">Amount</th>
                  <th className="text-left text-[12px] font-semibold uppercase text-[#6b7280] px-4 py-3">Status</th>
                  <th className="text-left text-[12px] font-semibold uppercase text-[#6b7280] px-4 py-3">Date Paid</th>
                </tr></thead>
                <tbody className="divide-y divide-[#f3f4f6]">
                  {payouts.length > 0 ? payouts.map(p => (
                    <tr key={p.id} className="hover:bg-[#f9fafb]">
                      <td className="px-4 py-3 text-[#374151]">{p.week_start_date ? new Date(p.week_start_date).toLocaleDateString() : "--"} — {p.week_end_date ? new Date(p.week_end_date).toLocaleDateString() : "--"}</td>
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

        {activeTab === "links" && (
          <div className="space-y-6">
            {/* Your Sales Link */}
            <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Link2 className="w-5 h-5 text-[#2563eb]" />
                <h3 className="text-[16px] font-semibold text-[#111827]">Your Sales Link</h3>
              </div>
              <div className="flex items-center gap-3 bg-[#f8f9fc] border border-[#e5e7eb] rounded-lg p-3 mb-4">
                <code className="flex-1 text-sm text-[#374151] font-mono truncate">{repLink}</code>
                <button onClick={() => handleCopy(repLink, "link")}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${copied === "link" ? "bg-green-100 text-green-700" : "bg-[#2563eb] text-white hover:bg-[#1d4ed8]"}`}>
                  {copied === "link" ? <><CheckCircle className="w-3 h-3 inline mr-1" />Copied</> : <><Copy className="w-3 h-3 inline mr-1" />Copy Link</>}
                </button>
              </div>
              <button className="text-sm font-medium text-[#6b7280] border border-[#e5e7eb] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50">
                <QrCode className="w-4 h-4" /> Generate QR Code
              </button>
            </div>

            {/* SMS Template */}
            <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <h3 className="text-[16px] font-semibold text-[#111827]">SMS Template</h3>
              </div>
              <div className="bg-[#f8f9fc] border border-[#e5e7eb] rounded-lg p-4 mb-4">
                <p className="text-sm text-[#374151] whitespace-pre-wrap">{smsTemplate}</p>
              </div>
              <button onClick={() => handleCopy(smsTemplate, "sms")}
                className={`text-xs font-semibold px-4 py-2 rounded-md transition-colors ${copied === "sms" ? "bg-green-100 text-green-700" : "bg-green-600 text-white hover:bg-green-700"}`}>
                {copied === "sms" ? "Copied!" : "Copy SMS"}
              </button>
            </div>

            {/* Email Template */}
            <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-[#2563eb]" />
                <h3 className="text-[16px] font-semibold text-[#111827]">Email Template</h3>
              </div>
              <div className="bg-[#f8f9fc] border border-[#e5e7eb] rounded-lg p-4 mb-4">
                <p className="text-sm text-[#374151] whitespace-pre-wrap">{emailTemplate}</p>
              </div>
              <button onClick={() => handleCopy(emailTemplate, "email")}
                className={`text-xs font-semibold px-4 py-2 rounded-md transition-colors ${copied === "email" ? "bg-green-100 text-green-700" : "bg-[#2563eb] text-white hover:bg-[#1d4ed8]"}`}>
                {copied === "email" ? "Copied!" : "Copy Email"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
