/**
 * Global Payment Mode Configuration
 * 
 * Set paymentMode to control payment behavior across the app:
 * - "test": No Stripe required, unlock continues directly (development)
 * - "live": Stripe required before full report unlock
 * - "admin": No Stripe required for admin users, normal flow for others
 */

export const paymentMode = "test";

/**
 * Check if Stripe payment is required for the current user/mode
 */
export function isPaymentRequired(user = null) {
  if (paymentMode === "test") {
    return false;
  }

  if (paymentMode === "admin") {
    return user?.role !== "admin";
  }

  // "live" mode
  return true;
}

/**
 * Get display label for current payment mode
 */
export function getPaymentModeLabel(user = null) {
  if (paymentMode === "test") {
    return "Test Mode - No Payment Required";
  }

  if (paymentMode === "admin" && user?.role === "admin") {
    return "Admin Bypass - No Payment Required";
  }

  return "$39.99 one-time · Instant access";
}