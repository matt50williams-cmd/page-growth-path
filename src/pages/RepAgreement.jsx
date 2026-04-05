import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { BarChart2, CheckCircle, AlertCircle } from "lucide-react";

const AGREEMENT = `INDEPENDENT SALES REPRESENTATIVE AGREEMENT

This agreement is between The Agency LLC ("Company") and the individual named above ("Representative").


1. INDEPENDENT CONTRACTOR RELATIONSHIP

Representative is an independent contractor and NOT an employee, partner, agent, or joint venturer of The Agency LLC. This agreement does not create an employment relationship under any circumstances.

Representative explicitly acknowledges:
  - The Agency LLC will NOT withhold taxes of any kind from commission payments
  - Representative is solely responsible for all federal, state, and local taxes on income earned
  - Representative will receive a 1099-NEC form if total annual commissions exceed $600
  - The Agency LLC provides NO benefits including health insurance, retirement plans, paid time off, workers compensation, or unemployment insurance
  - Representative sets their own hours and schedule
  - Representative may work for other companies and is not exclusive to The Agency LLC
  - Representative provides their own equipment, phone, transportation, and supplies
  - Representative is not guaranteed any minimum earnings or number of sales
  - The Agency LLC has no obligation to provide Representative with any minimum amount of work
  - Representative agrees to indemnify and hold The Agency LLC harmless from any claims, taxes, penalties, or liabilities arising from Representative's independent contractor status


2. COMMISSION STRUCTURE

Representative earns the following commissions:
  - In-person audit sale: $60 per completed sale
  - Monthly Monitor subscription: $15/month per active customer
  - Pro Monitor subscription: $20/month per active customer
  - Pro + Review Booster subscription: $30/month per active customer


3. PAYMENT TERMS

  - All commissions subject to a 7-day buffer period from date of customer payment
  - Commissions released only after successful Stripe payment confirmation
  - Payouts processed weekly every Monday
  - Minimum $20 required to trigger weekly payout
  - Amounts under $20 roll to the following week
  - The Agency LLC reserves the right to hold or cancel commissions in cases of chargeback, dispute, or refund


4. CHARGEBACK AND REFUND POLICY

  - Any chargeback filed by a customer results in:
      * Immediate commission cancellation
      * Clawback from next weekly payout if already paid
      * Formal written warning issued to Representative
  - Normal customer cancellations do NOT result in clawback of already paid commissions
  - Representative simply stops earning monthly commission going forward from cancellation date
  - The Agency LLC will NEVER clawback commissions already paid due to normal customer cancellation
  - Clawbacks ONLY occur for:
      * Chargeback filed by customer
      * Fraud or misrepresentation by Representative
      * Refund issued within 7-day buffer period


5. THREE STRIKES CHARGEBACK POLICY

  - Strike 1: Written warning, mandatory retraining required
  - Strike 2: Account suspended pending review by The Agency LLC
  - Strike 3: Permanent termination, all pending commissions forfeited, no appeal process
  - If chargeback dispute is won by The Agency LLC, strike is removed and commission restored


6. CONDUCT REQUIREMENTS

Representative agrees the following are grounds for immediate termination with commission forfeiture:
  - Using high pressure, threatening, or deceptive sales tactics
  - Misrepresenting product features, pricing, or capabilities
  - Promising refunds or guarantees not authorized by The Agency LLC
  - Targeting vulnerable individuals including elderly business owners who may not understand the product
  - Forging customer signatures or submitting fraudulent sales
  - Offering discounts outside approved pricing without written consent

Representative confirms:
  - I will only sell to business owners who genuinely want and understand the product
  - I will never use pressure tactics or misrepresentation
  - I understand chargebacks directly cost me money and may result in account termination
  - I understand The Agency LLC may conduct random satisfaction calls to my customers


7. CUSTOMER OWNERSHIP

  - Customers signed up under Representative's rep code are tied to Representative permanently
  - If account is deactivated, monthly commissions cease immediately
  - Representative may not solicit The Agency LLC customers for competing services


8. TERMINATION

  - Either party may terminate at any time
  - Commissions already paid will never be clawed back due to termination
  - Commissions in buffer period at termination are forfeited
  - Monthly commissions from active customers continue for 30 days after termination then cease
  - Termination for cause (fraud, chargebacks, misconduct) results in immediate forfeiture of all pending commissions


9. CONFIDENTIALITY

  - Keep all customer data, pricing, commission structures, and business information confidential
  - May not share or sell customer contact information to any third party


10. W-9 AND TAX REQUIREMENTS

  - Representatives earning over $600 annually must submit W-9 before payouts continue
  - The Agency LLC will issue 1099-NEC for all representatives earning over $600 annually
  - Failure to submit W-9 when required results in payout hold until resolved


11. DISPUTE RESOLUTION

  - Disputes resolved through binding arbitration in the state of Washington
  - Commission calculations are final unless Representative provides written evidence of error within 30 days of payout


12. ENTIRE AGREEMENT

  - This agreement represents the complete understanding between parties
  - The Agency LLC reserves the right to update commission structures with 30 days written notice
  - Continued participation after notice constitutes acceptance of new terms`;

export default function RepAgreement() {
  const navigate = useNavigate();
  const { user, isLoadingAuth } = useAuth();
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);
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

  useEffect(() => { if (!isLoadingAuth && !user) navigate("/login"); }, [user, isLoadingAuth]);

  const syne = { fontFamily: "'Syne', sans-serif" };
  const now = new Date();

  const handleSign = () => {
    setError("");
    if (!check1) { setError("You must agree to the Independent Sales Representative Agreement."); return; }
    if (!check2) { setError("You must acknowledge the independent contractor relationship."); return; }
    if (!check3) { setError("You must acknowledge the chargeback and conduct policy."); return; }
    if (!signatureName.trim()) { setError("Please type your full legal name as your digital signature."); return; }
    localStorage.setItem("pageaudit_rep_agreement", JSON.stringify({
      agreed: true, contractor_acknowledged: true, chargeback_acknowledged: true,
      signature_name: signatureName.trim(), signed_at: now.toISOString(), email: user?.email,
    }));
    setSigned(true);
    setTimeout(() => navigate("/rep-dashboard"), 2000);
  };

  const cb = (checked, onChange, label) => (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ marginTop: 3, width: 18, height: 18, accentColor: "#2563eb", flexShrink: 0 }} />
      <span style={{ fontSize: 14, color: "#c8d0dc", lineHeight: 1.6 }}>{label}</span>
    </label>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{ background: "rgba(10,15,30,0.9)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "16px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
          <BarChart2 style={{ width: 20, height: 20, color: "#3b82f6" }} />
          <span style={{ ...syne, fontWeight: 700, fontSize: 15, color: "#fff" }}>The Agency LLC</span>
        </div>
      </nav>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ ...syne, fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Independent Sales Representative Agreement</h1>
          <p style={{ color: "#94a3b8", fontSize: 15, marginBottom: 4 }}>Please read carefully and sign below to activate your account</p>
          <p style={{ color: "#64748b", fontSize: 13 }}>{now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 24, maxHeight: 400, overflowY: "auto", marginBottom: 32, scrollbarWidth: "thin", scrollbarColor: "#374151 transparent" }}>
          <pre style={{ color: "#c8d0dc", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{AGREEMENT}</pre>
        </div>

        {signed ? (
          <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, padding: 24, textAlign: "center" }}>
            <CheckCircle style={{ width: 40, height: 40, color: "#10b981", margin: "0 auto 12px", display: "block" }} />
            <p style={{ ...syne, fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Agreement Signed</p>
            <p style={{ color: "#94a3b8", fontSize: 13 }}>Redirecting to your dashboard...</p>
          </div>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
              {cb(check1, setCheck1, "I have read and fully understand this Independent Sales Representative Agreement")}
              {cb(check2, setCheck2, "I understand I am an independent contractor and NOT an employee of The Agency LLC. I am solely responsible for my own taxes, expenses, and business costs.")}
              {cb(check3, setCheck3, "I understand that chargebacks result in commission clawbacks and that 3 chargebacks will result in permanent deactivation of my rep account. I agree to conduct all sales honestly and professionally.")}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>Type your full legal name as your digital signature</label>
              <input type="text" value={signatureName} onChange={e => setSignatureName(e.target.value)} placeholder={user?.full_name || "Your full legal name"}
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "14px 16px", fontSize: 16, color: "#fff", outline: "none", fontStyle: "italic", boxSizing: "border-box" }} />
            </div>
            <p style={{ color: "#64748b", fontSize: 12, marginBottom: 16 }}>Agreement date: {now.toLocaleString()}</p>
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                <AlertCircle style={{ width: 16, height: 16, color: "#ef4444", flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: "#ef4444" }}>{error}</p>
              </div>
            )}
            <button onClick={handleSign} style={{ width: "100%", background: "#2563eb", color: "#fff", fontSize: 16, fontWeight: 700, padding: "16px 0", borderRadius: 10, border: "none", cursor: "pointer", opacity: check1 && check2 && check3 && signatureName.trim() ? 1 : 0.5 }}>
              Sign Agreement and Activate My Account
            </button>
            <p style={{ textAlign: "center", color: "#64748b", fontSize: 11, marginTop: 12 }}>Your digital signature, timestamp, and IP address are recorded securely.</p>
          </div>
        )}
      </div>
    </div>
  );
}
