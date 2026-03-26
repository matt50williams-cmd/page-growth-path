import Footer from '@/components/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased flex flex-col">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <a href="/" className="font-bold text-sm tracking-tight text-gray-900 hover:text-[#1877F2] transition-colors">
            PageAudit Pro
          </a>
          <a href="/" className="text-xs text-gray-500 hover:text-black transition-colors">
            Back to Home
          </a>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="flex-1 px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-10">
          {/* Header */}
          <div className="border-b border-gray-100 pb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">Terms & Conditions</h1>
            <p className="text-gray-500 text-sm">Effective Date: March 2026</p>
          </div>

          {/* Intro */}
          <div>
            <p className="text-gray-700 leading-relaxed">
              By using this service, you agree to the following terms.
            </p>
          </div>

          {/* Service Description */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Service Description</h2>
            <p className="text-gray-700 leading-relaxed text-sm">
              We provide a digital Facebook audit report based on the information you submit. This report includes analysis, recommendations, and strategy suggestions.
            </p>
          </div>

          {/* No Guarantees */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">No Guarantees</h2>
            <p className="text-gray-700 leading-relaxed text-sm">
              We do not guarantee specific results, growth, or outcomes from using our recommendations.
            </p>
          </div>

          {/* Payment Terms */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Terms</h2>
            <p className="text-gray-700 leading-relaxed text-sm">
              All payments are one-time payments unless otherwise stated.
            </p>
          </div>

          {/* No Refund Policy */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">No Refund Policy</h2>
            <p className="text-gray-700 leading-relaxed text-sm mb-3">
              Due to the nature of digital products, all sales are final.
            </p>
            <p className="text-gray-700 leading-relaxed text-sm">
              Once a report has been generated and delivered, no refunds will be issued under any circumstances.
            </p>
          </div>

          {/* User Responsibility */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">User Responsibility</h2>
            <p className="text-gray-700 leading-relaxed text-sm">
              You are responsible for how you use the information provided in the report.
            </p>
          </div>

          {/* Limitation of Liability */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed text-sm">
              We are not liable for any business outcomes, losses, or damages resulting from the use of this service.
            </p>
          </div>

          {/* Changes */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Changes</h2>
            <p className="text-gray-700 leading-relaxed text-sm">
              We may update these terms at any time.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Contact</h2>
            <p className="text-gray-600 text-sm mb-2">For questions about these terms, please contact us at:</p>
            <p className="text-[#1877F2] font-semibold text-sm">support@pageauditpro.net</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}