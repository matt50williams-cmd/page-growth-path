import { X } from "lucide-react";

export default function FacebookUrlHelper({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">How to Find Your Facebook URL</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Option 1 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Option 1: Mobile App</h3>
            <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
              <li>Open your Facebook app</li>
              <li>Go to your profile or business page</li>
              <li>Tap the 3 dots (•••)</li>
              <li>Tap "Copy Link"</li>
            </ol>
          </div>

          {/* Option 2 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Option 2: Desktop Browser</h3>
            <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
              <li>Go to your Facebook profile or page</li>
              <li>Look at the address bar at the top of your browser</li>
              <li>Copy the full URL (example: https://www.facebook.com/yourname)</li>
            </ol>
          </div>

          {/* Tip Box */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">Tip</p>
            <p className="text-sm text-orange-700 leading-relaxed">
              If your page is private or restricted, we may not be able to analyze it.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full bg-[#1877F2] text-white font-semibold py-3 rounded-xl hover:bg-[#1457C0] transition-colors text-sm"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}