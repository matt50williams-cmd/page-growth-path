import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ExternalLink, Loader2, RefreshCw, Eye, X, TrendingUp, Users, Zap, CheckCircle } from 'lucide-react';
import AuditDetailModal from '@/components/AuditDetailModal';

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
  const colors = {
    pending: 'bg-orange-100 text-orange-600',
    analyzing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-600',
  };
  return (
    <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${colors[status] || 'bg-gray-100 text-gray-500'}`}>
      {status || 'unknown'}
    </span>
  );
}

function FunnelStageBadge({ stage }) {
  const colors = {
    submitted: 'bg-purple-100 text-purple-700',
    previewed: 'bg-indigo-100 text-indigo-700',
    unlocked: 'bg-orange-100 text-orange-700',
    account_created: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${colors[stage] || 'bg-gray-100 text-gray-500'}`}>
      {stage}
    </span>
  );
}

export default function Admin() {
  const [authorized, setAuthorized] = useState(null);
  const [audits, setAudits] = useState([]);
  const [funnel, setFunnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [filters, setFilters] = useState({
    status: null,
    campaign: null,
    dateFrom: null,
    dateTo: null,
    previewAbandoned: false,
  });

  const [stats, setStats] = useState({
    totalAudits: 0,
    previewViews: 0,
    unlockClicks: 0,
    accountCreations: 0,
    completedReports: 0,
    conversionRate: 0,
    estimatedRevenue: 0,
  });

  const [campaigns, setCampaigns] = useState([]);

  const loadData = async () => {
    setLoading(true);
    const [auditsData, funnelData] = await Promise.all([
      base44.entities.Audit.list('-created_date', 500),
      base44.entities.Funnel.list('-created_date', 2000),
    ]);

    setAudits(auditsData);
    setFunnel(funnelData);

    // Extract unique campaigns
    const uniqueCampaigns = [...new Set(funnelData.map(e => e.utm_campaign).filter(Boolean))];
    setCampaigns(uniqueCampaigns);

    // Calculate stats
    const previewViewed = funnelData.filter(e => e.event_type === 'preview_viewed').length;
    const unlockClicked = funnelData.filter(e => e.event_type === 'unlock_clicked').length;
    const accountCreated = funnelData.filter(e => e.event_type === 'account_created').length;
    const completed = auditsData.filter(a => a.status === 'completed').length;
    const conversionRate = previewViewed > 0 ? ((accountCreated / previewViewed) * 100).toFixed(1) : 0;
    const revenue = completed * 39.99;

    setStats({
      totalAudits: auditsData.length,
      previewViews: previewViewed,
      unlockClicks: unlockClicked,
      accountCreations: accountCreated,
      completedReports: completed,
      conversionRate,
      estimatedRevenue: revenue.toFixed(2),
    });

    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me().catch(() => null);
      if (!user || user.role !== 'admin') {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      setAuthorized(true);
      await loadData();
    };
    init();
  }, []);

  const getFunnelStage = (email) => {
    const events = funnel.filter(e => e.email === email);
    if (events.some(e => e.event_type === 'account_created')) return 'account_created';
    if (events.some(e => e.event_type === 'payment_success')) return 'unlocked';
    if (events.some(e => e.event_type === 'unlock_clicked')) return 'unlocked';
    if (events.some(e => e.event_type === 'preview_viewed')) return 'previewed';
    if (events.some(e => e.event_type === 'intake_submitted')) return 'submitted';
    return 'submitted';
  };

  const getUtmCampaign = (email) => {
    const event = funnel.find(e => e.email === email && e.utm_campaign);
    return event?.utm_campaign || '—';
  };

  const filteredAudits = audits.filter(audit => {
    if (filters.status && audit.status !== filters.status) return false;
    if (filters.campaign && getUtmCampaign(audit.email) !== filters.campaign) return false;
    if (filters.previewAbandoned) {
      const hasPreview = funnel.some(e => e.email === audit.email && e.event_type === 'preview_viewed');
      const hasUnlock = funnel.some(e => e.email === audit.email && e.event_type === 'unlock_clicked');
      if (!hasPreview || hasUnlock) return false;
    }
    if (filters.dateFrom) {
      const auditDate = new Date(audit.created_date);
      if (auditDate < new Date(filters.dateFrom)) return false;
    }
    if (filters.dateTo) {
      const auditDate = new Date(audit.created_date);
      if (auditDate > new Date(filters.dateTo)) return false;
    }
    return true;
  });

  const toggleFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  };

  const clearFilters = () => {
    setFilters({ status: null, campaign: null, dateFrom: null, dateTo: null, previewAbandoned: false });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== null && v !== false);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500 text-sm">Access restricted.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-black text-base">PageAudit Pro</span>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Admin</span>
          </div>
          <button onClick={() => loadData()} className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black border border-gray-200 px-3 py-1.5 rounded hover:border-gray-400 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Total Audits</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalAudits}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Preview Views</p>
            <p className="text-2xl font-bold text-indigo-600">{stats.previewViews}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Unlock Clicks</p>
            <p className="text-2xl font-bold text-orange-600">{stats.unlockClicks}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Accounts Created</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.accountCreations}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Completed Reports</p>
            <p className="text-2xl font-bold text-green-600">{stats.completedReports}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Conversion Rate</p>
            <p className="text-2xl font-bold text-[#1877F2]">{stats.conversionRate}%</p>
          </div>
        </div>

        {/* Revenue Estimate */}
        <div className="bg-gradient-to-r from-[#1877F2] to-[#0f5cbf] rounded-xl p-6 mb-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-100 uppercase tracking-wide mb-1">Estimated Revenue</p>
              <p className="text-4xl font-bold">${stats.estimatedRevenue}</p>
              <p className="text-xs text-blue-200 mt-2">{stats.completedReports} completed × $39.99</p>
            </div>
            <TrendingUp className="w-12 h-12 opacity-20" />
          </div>
        </div>

        {/* Filters */}
        {audits.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-black transition-colors"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Status */}
              <div className="flex gap-1">
                {['pending', 'analyzing', 'completed', 'failed'].map(status => (
                  <button
                    key={status}
                    onClick={() => toggleFilter('status', status)}
                    className={`text-xs font-medium px-3 py-2 rounded-lg border transition-all ${
                      filters.status === status
                        ? 'border-blue-300 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Campaign */}
              {campaigns.length > 0 && (
                <select
                  value={filters.campaign || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, campaign: e.target.value || null }))}
                  className="text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-gray-300 transition-all cursor-pointer"
                >
                  <option value="">All Campaigns</option>
                  {campaigns.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}

              {/* Preview Abandoned */}
              <button
                onClick={() => toggleFilter('previewAbandoned', true)}
                className={`text-xs font-medium px-3 py-2 rounded-lg border transition-all ${
                  filters.previewAbandoned
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                Preview Abandoned
              </button>
            </div>
          </div>
        )}

        {/* Audit Table */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold text-black">Audits</h1>
          <span className="text-xs text-gray-400">{filteredAudits.length} of {audits.length}</span>
        </div>

        {audits.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-24">No audits yet.</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Stage</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Campaign</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Score</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAudits.map((audit) => (
                  <tr key={audit.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{audit.customer_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{audit.email || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <FunnelStageBadge stage={getFunnelStage(audit.email)} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{getUtmCampaign(audit.email)}</td>
                    <td className="px-4 py-3 font-bold text-[#1877F2]">{audit.overall_score ?? '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={audit.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {audit.created_date ? new Date(audit.created_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedAudit(audit);
                          setShowDetailModal(true);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-[#1877F2] hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AuditDetailModal
        audit={selectedAudit}
        funnel={funnel}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
}