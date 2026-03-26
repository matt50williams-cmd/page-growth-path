import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { to, name, report_url } = await req.json();

    if (!to || !report_url) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const appUrl = Deno.env.get("APP_BASE_URL") || "https://pageauditpro.base44.app";
    const fullReportUrl = report_url.startsWith("http") ? report_url : `${appUrl}${report_url}`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to,
      from_name: "PageAudit Pro",
      subject: "Your PageAudit Pro Report is Ready",
      body: `Hi ${name || "there"},

Your Facebook page review is complete. Your custom report is ready to view.

Click the link below to access your report:

${fullReportUrl}

If you have any questions, reply to this email and we'll be happy to help.

— The PageAudit Pro Team`,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});