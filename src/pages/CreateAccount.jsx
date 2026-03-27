import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Eye, EyeOff } from "lucide-react";

const API_BASE = "https://pageaudit-engine.onrender.com";

export default function CreateAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    "Creating your account...",
    "Securing your access...",
    "Preparing your dashboard...",
  ];

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const savedOrder = localStorage.getItem("pageAuditOrder");
    if (!savedOrder) {
      navigate("/submit-your-page");
      return;
    }
    const orderData = JSON.parse(savedOrder);
    setOrder(orderData);

    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      fetch(`${API_BASE}/api/stripe/verify/${sessionId}`)
        .then((r) => r.json())
        .then((result) => {
          if (result.paid) {
            localStorage.setItem("pageAuditPaid", "true");
          }
        })
        .catch((err) => console.error("Payment verification failed:", err));
    }
  }, [navigate, searchParams]);

  const validatePasswords = () => {
    if (!password) { setPasswordError("Password is required"); return false; }
    if (password.length < 8) { setPasswordError("Password must be at least 8 characters"); return false; }
    if (password !== confirmPassword) { setPasswordError("Passwords do not match"); return false; }
    setPasswordError("");
    return true;
  };

  const handleCreateAccount = async () => {
    if (!validatePasswords()) return;
    if (!agreedToTerms) {
      setError("Please agree to the Terms & Conditions to continue.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await signup(order.email, password, order.name);

      const auditId = order.auditId || searchParams.get("audit_id");

      if (auditId) {
        try {
          await fetch(`${API_BASE}/api/audits/${auditId}/run`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          console.error("Audit run failed:", err);
        }
      }

      localStorage.removeItem("pageAuditOrder");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error:", err);
      if (err.message?.includes("already exists")) {
        navigate("/login");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
        setLoading(false);
      }
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#1877F2] rounded-full animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1565D3] to-[#1877F2] flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Creating your account...</h1>
            <p className="text-blue-100 text-lg">We're setting up your access now. You'll have your full report inside your account in just a moment.</p>
          </div>
          <p className="text-blue-200 text-sm animate-pulse">{messages[messageIndex]}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <span className="font-bold text-base text-black tracking-tight">PageAudit Pro</span>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm px-7 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Secure Your Access</h1>
            <p className="text-sm text-gray-400 mb-8">
              Payment confirmed! Create your account to access your full report.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email Address</label>
                <input type="email" value={order?.email || ""} readOnly
                  className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm text-gray-600 bg-gray-50 cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password}
                    onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(""); }}
                    placeholder="Min 8 characters"
                    className={`w-full border-2 rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all pr-10 ${
                      passwordError ? "border-red-300" : "border-gray-100 focus:border-[#1877F2]"
                    }`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Confirm Password</label>
                <input type={showPassword ? "text" : "password"} value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); if (passwordError) setPasswordError(""); }}
                  placeholder="Confirm your password"
                  className={`w-full border-2 rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                    passwordError ? "border-red-300" : "border-gray-100 focus:border-[#1877F2]"
                  }`} />
              </div>

              {passwordError && <p className="text-xs text-red-500 -mt-3">{passwordError}</p>}

              <div className="flex items-start gap-3 pt-2">
                <input type="checkbox" id="terms" checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#1877F2] focus:ring-[#1877F2] cursor-pointer" />
                <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                  I agree to the{" "}
                  <Link to="/terms" target="_blank" className="text-[#1877F2] hover:underline font-medium">
                    Terms & Conditions
                  </Link>
                  {" "}and{" "}
                  <Link to="/privacy" target="_blank" className="text-[#1877F2] hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <button onClick={handleCreateAccount} disabled={loading || !password || !confirmPassword || !agreedToTerms}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#1877F2] text-white px-10 py-4 font-bold text-base rounded-2xl hover:bg-[#1457C0] transition-all shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /> Setting up your account...</>) : "Create Account & View Report"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}