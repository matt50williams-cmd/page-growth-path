import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';

export default function Terms() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased flex flex-col">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <span className="font-bold text-sm tracking-tight text-gray-900">PageAudit Pro</span>
          <button onClick={() => navigate(-1)}
            className="text-xs font-semibold text-[#1877F2] hover:underline">
            ← Back
          </button>
        </div>
      </nav>

      <div className="flex-1 px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="border-b border-gray-100 pb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">Terms & Conditions</h1>
            <p className="text-gray-500 text-sm">Effective Date: March 2026</p>
          </div>

          <div>
            <p className="text-gray-700 leading-relaxed">By using this service, you agree to the following terms.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Service Description</h2>
            <p className="text-gray-700 leading-relaxed text-sm">We provide a digital Facebook audit report based on the information you submit. This report includes analysis, recommendations, and strategy suggestions.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">No Guarantees</h2>
            <p className="text-gray-700 leading-relaxed text-sm">We do not guarantee specific results, growth, or outcomes from using our recommendations.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Terms</h2>
            <p className="text-gray-700 leading-relaxed text-sm">All payments are one-time payments unless otherwise stated.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">No Refund Policy</h2>
            <p className="text-gray-700 leading-relaxed text-sm mb-3">Due to the nature of digital products, all sales are final.</p>
            <p className="text-gray-700 leading-relaxed text-sm">Once a report has been generated and delivered, no refunds will be issued under any circumstances.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Data Collection</h2>
            <p className="text-gray-700 leading-relaxed text-sm">We collect your name, email address, and Facebook page URL for the purpose of generating your audit report. We do not sell or share your personal information with third parties.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">User Responsibility</h2>
            <p className="text-gray-700 leading-relaxed text-sm">You are responsible for how you use the information provided in the report.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed text-sm">We are not liable for any business outcomes, losses, or damages resulting from the use of this service.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Changes</h2>
            <p className="text-gray-700 leading-relaxed text-sm">We may update these terms at any time.</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Contact</h2>
            <p className="text-gray-600 text-sm mb-2">For questions about these terms, please contact us at:</p>
            <a href="mailto:support@pageauditpros.com" className="text-[#1877F2] font-semibold text-sm hover:underline">
              support@pageauditpros.com
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}