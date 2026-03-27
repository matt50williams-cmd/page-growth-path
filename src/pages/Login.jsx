import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const API_BASE = "https://pageaudit-engine.onrender.com";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError("Email and password are required"); return; }
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email or password");
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      setForgotSent(true);
    } catch (err) {
      console.error(err);
    }
    setForgotLoading(false);
  };

  if (showForgot) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <span className="font-bold text-base text-black tracking-tight">PageAudit Pro</span>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md">
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm px-7 py-8">
              {forgotSent ? (
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 text-xl">✓</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h1>
                  <p className="text-sm text-gray-500 mb-6">
                    If an account exists for <strong>{forgotEmail}</strong>, the admin will reset your password shortly. Check back in a few minutes.
                  </p>
                  <button onClick={() => { setShowForgot(false); setForgotSent(false); }}
                    className="text-sm text-[#1877F2] hover:underline">
                    Back to Login
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset Password</h1>
                  <p className="text-sm text-gray-400 mb-8">Enter your email and we'll get you back in.</p>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email</label>
                      <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#1877F2]" />
                    </div>
                    <button onClick={handleForgotPassword} disabled={forgotLoading || !forgotEmail}
                      className="w-full bg-[#1877F2] text-white px-10 py-4 font-bold text-base rounded-2xl hover:bg-[#1457C0] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                      {forgotLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Send Reset Request"}
                    </button>
                    <button onClick={() => setShowForgot(false)}
                      className="w-full text-sm text-gray-500 hover:text-gray-700 py-2">
                      Back to Login
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <span className="font-bold text-base text-black tracking-tight">PageAudit Pro</span>
        </div>
      </nav>
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm px-7 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
            <p className="text-sm text-gray-400 mb-8">Log in to access your reports.</p>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#1877F2]" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-900">Password</label>
                  <button onClick={() => setShowForgot(true)}
                    className="text-xs text-[#1877F2] hover:underline">
                    Forgot password?
                  </button>
                </div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#1877F2]" />
              </div>
              <button onClick={handleLogin} disabled={loading}
                className="w-full bg-[#1877F2] text-white px-10 py-4 font-bold text-base rounded-2xl hover:bg-[#1457C0] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Log In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}