import { useState } from "react";
import { X, ExternalLink } from "lucide-react";

const API_BASE = "https://pageaudit-engine.onrender.com";

export default function AuditDetailModal({ audit, onClose }) {
  if (!audit) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-base">Audit Details</h2>
            <p className="text-xs text-gray-400 font-mono">ID: {audit.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Name</p>
              <p className="text-sm text-gray-800">{audit.customer_name || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Email</p>
              <p className="text-sm font-mono text-gray-800">{audit.email || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <p className="text-sm text-gray-800 capitalize">{audit.status || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Paid</p>
              <p className="text-sm text-gray-800">{audit.paid ? `✓ $${audit.amount_paid}` : "No"}</p>
            </div>
          </div>

          {audit.facebook_url && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Facebook Page</p>
              <a href={audit.facebook_url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-[#1877F2] hover:underline inline-flex items-center gap-1">
                {audit.facebook_url} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {(audit.overall_score || audit.visibility_score) && (
            <div className="border-t pt-4">
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3">Scores</p>
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
            <div className="border-t pt-4">
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3">Report Preview</p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm max-h-60 overflow-y-auto text-gray-700 leading-relaxed">
                {audit.report_text.slice(0, 1000)}{audit.report_text.length > 1000 ? '...' : ''}
              </div>
              <a href={`/report/${audit.id}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#1877F2] hover:underline mt-2">
                View Full Report <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}