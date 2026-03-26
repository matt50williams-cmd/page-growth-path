export const paymentConfig = {
  price: 39.99,
  currency: 'USD',
  productName: 'Facebook Page Audit — Full Report',
};

export function isPaymentRequired(user) {
  if (!user) return true;
  if (user.role === 'admin') return false;
  return true;
}