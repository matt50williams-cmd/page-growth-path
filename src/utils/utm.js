/**
 * Parse UTM parameters from URL
 */
export function getUtmParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || null,
    utm_campaign: params.get('utm_campaign') || null,
    utm_adset: params.get('utm_adset') || null,
    utm_ad: params.get('utm_ad') || null,
    utm_medium: params.get('utm_medium') || null,
    utm_content: params.get('utm_content') || null,
  };
}

/**
 * Store UTM params in sessionStorage
 */
export function storeUtmParams() {
  const utm = getUtmParams();
  if (utm.utm_source || utm.utm_campaign || utm.utm_adset || utm.utm_ad) {
    sessionStorage.setItem('pageAuditUTM', JSON.stringify(utm));
  }
}

/**
 * Retrieve stored UTM params
 */
export function getStoredUtmParams() {
  const stored = sessionStorage.getItem('pageAuditUTM');
  if (!stored) return null;
  const data = JSON.parse(stored);
  // Ensure all UTM fields are present (for backwards compatibility)
  return {
    utm_source: data.utm_source || null,
    utm_campaign: data.utm_campaign || null,
    utm_adset: data.utm_adset || null,
    utm_ad: data.utm_ad || null,
    utm_medium: data.utm_medium || null,
    utm_content: data.utm_content || null,
  };
}