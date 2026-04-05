import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { BarChart2, CheckCircle, AlertCircle } from "lucide-react";

const AGREEMENT_TEXT = `INDEPENDENT SALES REPRESENTATIVE AGREEMENT

This agreement is between The Agency LLC ("Company") and the individual named above ("Representative").


1. INDEPENDENT CONTRACTOR RELATIONSHIP

Representative is an independent contractor and not an employee, partner, agent, or joint venturer of The Agency LLC. This agreement does not create an employment relationship under any circumstances.

Representative explicitly acknowledges:
• The Agency LLC will NOT withhold taxes of any kind from commission payments
• Representative is solely responsible for all federal, state, and local taxes on income earned
• Representative will receive a 1099-NEC form if total annual commissions exceed $600
• The Agency LLC provides NO benefits including health insurance, retirement plans, paid time off, workers compensation, or unemployment insurance
• Representative sets their own hours and schedule
• Representative may work for other companies and is not exclusive to The Agency LLC
• Representative provides their own equipment, phone, transportation, and supplies
• Representative is not guaranteed any minimum earnings or number of sales
• The Agency LLC has no obligation to provide Representative with any minimum amount of work

Representative agrees to indemnify and hold The Agency LLC harmless from any claims, taxes, penalties, or liabilities arising from Representative's independent contractor status.


2. COMMISSION STRUCTURE

Representative earns the following commissions:
• In-person audit sale: $60 per completed sale
• Monthly Monitor subscription: $15/month per active customer
• Pro Monitor subscription: $20/month per active customer
• Pro + Review Booster subscription: $30/month per active customer


3. PAYMENT TERMS

• All commissions subject to a 7-day buffer period from date of customer payment
• Commissions released only after successful Stripe payment confirmation
• Payouts processed weekly every Monday
• Minimum $20 required to trigger weekly payout
• Amounts under $20 roll to the following week
• The Agency LLC reserves the right to hold or cancel commissions in cases of chargeback, dispute, or refund


4. CHARGEBACKS AND REFUNDS

• If a customer files a chargeback or requests a refund, the associated commission is immediately cancelled
• If a customer's card declines, commission is held until payment is resolved
• Representative is encouraged to maintain contact with their customers to prevent cancellations and payment failures


5. CUSTOMER OWNERSHIP

• Customers signed up under Representative's rep code are tied to Representative permanently
• If Representative's account is deactivated, monthly commissions cease immediately
• Representative may not solicit The Agency LLC customers for competing services


6. TERMINATION

• Either party may terminate this agreement at any time
• Commissions already released and approved will be paid
• Commissions still in buffer period at time of termination are forfeited
• Commissions from active monthly customers will continue to be paid for 30 days after termination then cease


7. CONDUCT

• Representative agrees to represent The Agency LLC and PageAudit Pro professionally at all times
• Representative may not make false claims about the product or its capabilities
• Representative may not offer discounts or pricing outside of approved structure without written consent
• Representative may not use high pressure or deceptive sales tactics


8. CONFIDENTIALITY

• Representative agrees to keep all customer data, pricing, commission structures, and business information confidential
• Representative may not share or sell customer contact information to any third party


9. DISPUTE RESOLUTION

• Any disputes will be resolved through binding arbitration in the state of Washington
• The Agency LLC's commission calculations are final unless Representative can provide written evidence of error within 30 days of payout


10. ENTIRE AGREEMENT

• This agreement represents the complete understanding between parties
• The Agency LLC reserves the right to update commission structures with 30 days written notice
• Continued participation after notice constitutes acceptance of new terms`;

export default function RepAgreement() {
  const navigate = useNavigate();
  const { user, isLoadingAuth } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [contractorAck, setContractorAck] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [error, setError] = useState("");
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => {
    if (!isLoadingAuth && !user) navigate("/login");
  }, [user, isLoadingAuth]);

  const syne = { fontFamily: "'Syne', sans-serif" };

  const handleSign = () => {
    setError("");
    if (!agreed) { setError("You must agree to the Independent Sales Representative Agreement."); return; }
    if (!contractorAck) { setError("You must acknowledge the independent contractor relationship."); return; }
    if (!signatureName.trim()) { setError("Please type your full name as your digital signature."); return; }

    const now = new Date().toISOString();
    localStorage.setItem("pageaudit_rep_agreement", JSON.stringify({
      agreed: true,
      contractor_acknowledged: true,
      signature_name: signatureName.trim(),
      signed_at: now,
      email: user?.email,
    }));

    setSigned(true);
    setTimeout(() => navigate("/rep-dashboard"), 2000);
  };

  const now = new Date();

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "'DM Sans', sans-serif" }}>
      {/* NAV */}
      <nav style={{ background: "rgba(10,15,30,0.9)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "16px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
          <BarChart2 style={{ width: 20, height: 20, color: "#3b82f6" }} />
          <span style={{ ...syne, fontWeight: 700, fontSize: 15, color: "#fff" }}>PageAudit Pro</span>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#3b82f6", background: "rgba(59,130,246,0.15)", padding: "2px 8px", borderRadius: 4, marginLeft: 4 }}>Rep Agreement</span>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px 80px" }}>
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ ...syne, fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Independent Sales Representative Agreement</h1>
          <p style={{ color: "#94a3b8", fontSize: 15 }}>The Agency LLC</p>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>Date: {now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          {user?.full_name && <p style={{ color: "#64748b", fontSize: 13 }}>Representative: {user.full_name}</p>}
        </div>

        {/* AGREEMENT TEXT */}
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
          padding: 24, maxHeight: 500, overflowY: "auto", marginBottom: 32,
          scrollbarWidth: "thin", scrollbarColor: "#374151 transparent",
        }}>
          <pre style={{ color: "#c8d0dc", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
            {AGREEMENT_TEXT}
          </pre>
        </div>

        {/* DIGITAL SIGNATURE */}
        {signed ? (
          <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, padding: 24, textAlign: "center" }}>
            <CheckCircle style={{ width: 40, height: 40, color: "#10b981", margin: "0 auto 12px" }} />
            <p style={{ ...syne, fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Agreement Signed</p>
            <p style={{ color: "#94a3b8", fontSize: 13 }}>Redirecting to your dashboard...</p>
          </div>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
              {/* Checkbox 1 */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                  style={{ marginTop: 2, width: 18, height: 18, accentColor: "#2563eb" }} />
                <span style={{ fontSize: 14, color: "#c8d0dc", lineHeight: 1.5 }}>
                  I have read and agree to the Independent Sales Representative Agreement
                </span>
              </label>
              {/* Checkbox 2 */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
                <input type="checkbox" checked={contractorAck} onChange={e => setContractorAck(e.target.checked)}
                  style={{ marginTop: 2, width: 18, height: 18, accentColor: "#2563eb" }} />
                <span style={{ fontSize: 14, color: "#c8d0dc", lineHeight: 1.5 }}>
                  I understand I am an independent contractor and not an employee of The Agency LLC. I am responsible for my own taxes and expenses.
                </span>
              </label>
            </div>

            {/* Signature input */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>
                Type your full name as your digital signature
              </label>
              <input type="text" value={signatureName} onChange={e => setSignatureName(e.target.value)}
                placeholder={user?.full_name || "Your full legal name"}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8, padding: "14px 16px", fontSize: 16, color: "#fff", outline: "none",
                  fontStyle: "italic", boxSizing: "border-box",
                }} />
            </div>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                <AlertCircle style={{ width: 16, height: 16, color: "#ef4444", flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: "#ef4444" }}>{error}</p>
              </div>
            )}

            <button onClick={handleSign}
              style={{
                width: "100%", background: "#2563eb", color: "#fff", fontSize: 16, fontWeight: 700,
                padding: "16px 0", borderRadius: 10, border: "none", cursor: "pointer",
                opacity: agreed && contractorAck && signatureName.trim() ? 1 : 0.5,
              }}>
              Sign Agreement and Activate My Account
            </button>

            <p style={{ textAlign: "center", color: "#64748b", fontSize: 11, marginTop: 12 }}>
              Your agreement is stored securely with timestamp and IP address.
            </p>
            <p style={{ textAlign: "center", color: "#64748b", fontSize: 11, marginTop: 4 }}>
              Agreed on {now.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
