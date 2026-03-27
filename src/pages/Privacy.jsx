import Footer from '@/components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased flex flex-col">
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

      <div className="flex-1 px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="border-b border-gray-100 pb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">Privacy Policy</h1>
            <p className="text-gray-500 text-sm">Effective Date: March 2026</p>
          </div>

          <div>
            <p className="text-gray-700 leading-relaxed">
              We respect your privacy and are committed to protecting your information.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            <p className="text-gray-600 text-sm mb-4">We may collect the following information when you use our service:</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-3"><span className="text-[#1877F2] font-bold mt-0.5">•</span><span>Name</span></li>
              <li className="flex items-start gap-3"><span className="text-[#1877F2] font-bold mt-0.5">•</span><span>Email address</span></li>
              <li className="flex items-start gap-3"><span className="text-[#1877F2] font-bold mt-0.5">•</span><span>Facebook page URL</span></li>
              <li className="flex items-start gap-3"><span className="text-[#1877F2] font-bold mt-0.5">•</span><span>Usage and interaction data</span></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-600 text-sm mb-4">We use your information to:</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-3"><span className="text-[#1877F2] font-bold mt-0.5">•</span><span>Generate your Facebook audit report</span></li>
              <li className="flex items-start gap-3"><span className="text-[#1877F2] font-bold mt-0.5">•</span><span>Deliver your report and account access</span></li>
              <li className="flex items-start gap-3"><span className="text-[#1877F2] font-bold mt-0.5">•</span><span>Improve our services and user experience</span></li>
              <li className="flex items-start gap-3"><span className="text-[#1877F2] font-bold mt-0.5">•</span><span>Communicate with you regarding your report</span></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tracking & Analytics</h2>
            <p className="text-gray-600 text-sm mb-4">We use tracking technologies, including the Meta (Facebook) Pixel, to:</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-3"><span className="text-[#1877F2] font-bold mt-0.5">•</span><span>Measure ad performance</span></li>
              <li className="flex items-start gap-3"><span className="text-[#1877F2] font-bold mt-0.5">•</span><span>Understand user behavior</span></li>
              <li className="flex items-start gap-3"><span className="text-[#1877F2] font-bold mt-0.5">•</span><span>Improve our marketing and services</span></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Data Sharing</h2>
            <p className="text-gray-700 leading-relaxed text-sm">
              We do not sell your personal information. We may use trusted third-party services (such as hosting, analytics, and payment providers) to operate our platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-700 leading-relaxed text-sm">
              We take reasonable measures to protect your information.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Consent</h2>
            <p className="text-gray-700 leading-relaxed text-sm">
              By using this website, you consent to this policy.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Contact</h2>
            <p className="text-gray-600 text-sm mb-2">If you have questions about this privacy policy, please contact us at:</p>
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