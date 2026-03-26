import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_type, report_id, facebook_url, utm_source, utm_campaign, utm_adset, utm_ad } = await req.json();

    if (!event_type) {
      return Response.json({ error: 'Missing event_type' }, { status: 400 });
    }

    await base44.asServiceRole.entities.Funnel.create({
      event_type,
      email: user.email || null,
      report_id: report_id || null,
      facebook_url: facebook_url || null,
      utm_source: utm_source || null,
      utm_campaign: utm_campaign || null,
      utm_adset: utm_adset || null,
      utm_ad: utm_ad || null,
      timestamp: new Date().toISOString()
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});