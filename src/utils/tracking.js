import { funnel } from '@/api/apiClient';

function getStoredUtmParams() {
  try {
    const utm = localStorage.getItem('pageaudit_utm');
    return utm ? JSON.parse(utm) : {};
  } catch { return {}; }
}

export async function trackEvent(eventType, options = {}) {
  try {
    const utm = getStoredUtmParams() || {};
    await funnel.track(eventType, {
      email: options.email || null,
      report_id: options.reportId || null,
      facebook_url: options.facebookUrl || null,
      utm_source: utm.utm_source || null,
      utm_campaign: utm.utm_campaign || null,
      utm_adset: utm.utm_adset || null,
      utm_ad: utm.utm_ad || null,
    });
  } catch (error) {
    console.error(`Failed to track event ${eventType}:`, error);
  }
}

export const EVENTS = {
  LANDING_VIEWED: 'landing_viewed',
  INTAKE_STARTED: 'intake_started',
  STEP_1_COMPLETED: 'step_1_completed',
  STEP_2_COMPLETED: 'step_2_completed',
  STEP_3_COMPLETED: 'step_3_completed',
  STEP_4_COMPLETED: 'step_4_completed',
  STEP_5_COMPLETED: 'step_5_completed',
  STEP_6_COMPLETED: 'step_6_completed',
  INTAKE_SUBMITTED: 'intake_submitted',
  PREVIEW_VIEWED: 'preview_viewed',
  UNLOCK_CLICKED: 'unlock_clicked',
  PAYMENT_SUCCESS: 'payment_success',
  ACCOUNT_CREATED: 'account_created',
  REPORT_VIEWED: 'report_viewed',
  SUBSCRIPTION_STARTED: 'subscription_started',
  RESCAN_REQUESTED: 'rescan_requested',
};