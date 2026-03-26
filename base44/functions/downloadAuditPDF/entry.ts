import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import jsPDF from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { auditId } = payload;

    if (!auditId) {
      return Response.json({ error: 'Audit ID required' }, { status: 400 });
    }

    // Fetch audit from database
    const audits = await base44.entities.Audit.filter({ id: auditId });
    if (!audits || !audits.length) {
      return Response.json({ error: 'Audit not found' }, { status: 404 });
    }

    const audit = audits[0];

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 20;

    // Title
    doc.setFontSize(20);
    doc.text('Facebook Page Audit Report', pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Customer Info
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(`${audit.customer_name}`, 20, y);
    y += 8;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text(`Email: ${audit.email}`, 20, y);
    y += 6;
    doc.text(`Page URL: ${audit.facebook_url}`, 20, y);
    y += 12;

    // Report text
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(audit.report_text || 'No report available', pageWidth - 40);
    
    lines.forEach((line) => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 5;
    });

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="audit-${audit.customer_name.replace(/\s/g, '-')}.pdf"`
      }
    });
  } catch (error) {
    console.error('downloadAuditPDF error:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});