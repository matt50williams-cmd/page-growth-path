/**
 * Meta Pixel event tracking utility
 * Centralized location for all pixel events
 */

export function firePixelEvent(eventName, data = {}) {
  if (!window.fbq) return;
  fbq('track', eventName, data);
}

export function trackPageView() {
  firePixelEvent('PageView');
}

export function trackViewContent(contentName = 'Facebook Page Audit Preview', value = 39.99) {
  firePixelEvent('ViewContent', {
    content_name: contentName,
    content_type: 'service',
    value,
    currency: 'USD'
  });
}

export function trackInitiateCheckout(contentName = 'Facebook Page Audit', value = 39.99) {
  firePixelEvent('InitiateCheckout', {
    content_name: contentName,
    content_type: 'service',
    value,
    currency: 'USD'
  });
}

export function trackCompleteRegistration() {
  firePixelEvent('CompleteRegistration', {
    content_name: 'Facebook Page Audit',
    content_type: 'service'
  });
}

export function trackPurchase(value = 39.99, currency = 'USD') {
  firePixelEvent('Purchase', {
    content_name: 'Facebook Page Audit',
    content_type: 'service',
    value,
    currency
  });
}