import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-bold text-sm text-gray-900">PageAudit Pro</span>
        <div className="flex items-center gap-6 text-xs text-gray-500">
          <Link to="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-black transition-colors">Terms & Conditions</Link>
          <a href="mailto:support@pageauditpros.com" className="hover:text-black transition-colors">Help</a>
          <span>© 2026 PageAudit Pro. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}