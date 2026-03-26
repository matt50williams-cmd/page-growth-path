import { X, ExternalLink, Download, Calendar, Mail, User, Zap, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { base44 } from '@/api/base44Client';
import { useState } from 'react';

export default function AuditDetailModal({ audit, funnel, isOpen, onClose }) {
  const [notes, setNotes] = useState(audit?.support_notes || '');
  const [resolved, setResolved] = useState(audit?.support_resolved || false);
  const [saving, setSaving] = useState(false);

  const handleSaveNotes = async () => {
    setSaving(true);
    await base44.entities.Audit.update(audit.id, {
      support_notes: notes,
      support_resolved: resolved,
    }).catch(err => console.error('Failed to save notes:', err));
    setSaving(false);
  };
  if (!isOpen || !audit) return null;

  const events = (funnel || [])
    .filter(e => e.email === audit.email)
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

  const eventLabels = {
    landing_viewed: { label: 'Landing Viewed', color: 'bg-gray-100 text-gray-700' },
    intake_started: { label: 'Intake Started', color: 'bg-blue-100 text-blue-700' },
    intake_submitted: { label: 'Intake Submitted', color: 'bg-purple-100 text-purple-700' },
    preview_viewed: { label: 'Preview Viewed', color: 'bg-indigo-100 text-indigo-700' },
    unlock_clicked: { label: 'Unlock Clicked', color: 'bg-orange-100 text-orange-700' },
    payment_success: { label: 'Payment Success', color: 'bg-green-100 text-green-700' },
    account_created: { label: 'Account Created', color: 'bg-emerald-100 text-emerald-700' },
    report_viewed: { label: 'Report Viewed', color: 'bg-teal-100 text-teal-700' },
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{audit.customer_name || 'Unknown'}</h2>
            <p className="text-sm text-gray-500">{audit.email}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* User Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Type</p>
              <p className="text-sm font-bold text-gray-900">{audit.account_type || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Score</p>
              <p className="text-sm font-bold text-[#1877F2]">{audit.overall_score ?? '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Status</p>
              <p className="text-sm font-bold text-gray-900">{audit.status}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">URL</p>
              <a href={audit.facebook_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#1877F2] hover:underline flex items-center gap-1">
                Visit <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4">Event Timeline</h3>
            <div className="space-y-2">
              {events.length > 0 ? (
                events.map((evt, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${eventLabels[evt.event_type]?.color || 'bg-gray-100 text-gray-700'}`}>
                    <span className="text-xs font-bold uppercase">{eventLabels[evt.event_type]?.label || evt.event_type}</span>
                    <span className="text-xs text-gray-500 ml-auto">{new Date(evt.created_date).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No events recorded</p>
              )}
            </div>
          </div>

          {/* Support Notes */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4">Support Notes</h3>
            <div className="space-y-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add support notes here..."
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2] resize-none h-24"
              />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resolved}
                    onChange={(e) => setResolved(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#1877F2] focus:ring-[#1877F2]"
                  />
                  <span className="text-sm text-gray-700 font-medium">Mark as resolved</span>
                </label>
                <button
                  onClick={handleSaveNotes}
                  disabled={saving}
                  className="ml-auto px-4 py-2 bg-[#1877F2] text-white text-xs font-semibold rounded-lg hover:bg-[#1457C0] disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
              {resolved && (
                <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">
                  <CheckCircle2 className="w-4 h-4" />
                  Issue resolved
                </div>
              )}
            </div>
          </div>

          {/* Report */}
          {audit.report_text && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4">Report</h3>
              <div className="bg-gray-50 rounded-lg p-4 prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{audit.report_text}</ReactMarkdown>
              </div>
            </div>
           )}
        </div>
      </div>
    </div>
  );
}