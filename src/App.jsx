import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { trackPageView } from '@/utils/pixel';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import PageNotFound from './lib/PageNotFound';
import Report from './pages/Report';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import SubmitPage from './pages/SubmitPage';
import PreviewReport from './pages/PreviewReport';
import CreateAccount from './pages/CreateAccount';
import Loading from './pages/Loading';
import Analyzing from './pages/Analyzing';
import ReportProcessing from './pages/ReportProcessing';
import Backoffice from './pages/Backoffice';
import MyAudits from './pages/MyAudits';
import Login from './pages/Login';
import SeoAuditPage from './pages/SeoAuditPage';
import SeoLoadingPage from './pages/SeoLoadingPage';
import TeaserResults from './pages/TeaserResults';
import RepDashboard from './pages/RepDashboard';
import RepAgreement from './pages/RepAgreement';
import RepSignup from './pages/RepSignup';
import RepCommissions from './pages/RepCommissions';
import RepTraining from './pages/RepTraining';
import ScanRedirect from './pages/ScanRedirect';
import RepSalesTools from './pages/RepSalesTools';
import ScanReport from './pages/ScanReport';
import ScanningProgress from './pages/ScanningProgress';
import PostPaymentIntake from './pages/PostPaymentIntake';

function StripeRedirectHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('paid') === 'true') {
      const sessionId = params.get('session_id');
      const auditId = params.get('audit_id');
      if (sessionId && auditId) {
        navigate(`/post-payment-details?session_id=${sessionId}&audit_id=${auditId}`, { replace: true });
      }
    }
  }, [navigate]);
  return null;
}

function AuthenticatedApp() {
  const { isLoadingAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    trackPageView();
  }, [location]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#1877F2] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <StripeRedirectHandler />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/report" element={<Report />} />
        <Route path="/report/:id" element={<Report />} />
        <Route path="/submit-your-page" element={<SubmitPage />} />
        <Route path="/audit-preview" element={<PreviewReport />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/analyzing" element={<Analyzing />} />
        <Route path="/report-processing" element={<ReportProcessing />} />
        <Route path="/backoffice" element={<Backoffice />} />
        <Route path="/my-audits" element={<MyAudits />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/seo-audit" element={<SeoAuditPage />} />
        <Route path="/seo-loading" element={<SeoLoadingPage />} />
        <Route path="/teaser-results" element={<TeaserResults />} />
        <Route path="/rep-dashboard" element={<RepDashboard />} />
        <Route path="/rep-agreement" element={<RepAgreement />} />
        <Route path="/rep-commissions" element={<RepCommissions />} />
        <Route path="/rep-training" element={<RepTraining />} />
        <Route path="/join" element={<RepSignup />} />
        <Route path="/rep-sales-tools" element={<RepSalesTools />} />
        <Route path="/scan" element={<ScanRedirect />} />
        <Route path="/scanning" element={<ScanningProgress />} />
        <Route path="/post-payment-details" element={<PostPaymentIntake />} />
        <Route path="/report/scan/:auditId" element={<ScanReport />} />
        <Route path="/report/scan" element={<ScanReport />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;




