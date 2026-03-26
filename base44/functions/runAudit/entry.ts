import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { pageUrl, name, email, mainGoal, postingFrequency, contentType, auditId } = payload;

    const userPrompt = `Generate a comprehensive audit report for the following Facebook Business Page:

**Facebook Page URL:** ${pageUrl}
**Client Name:** ${name}
**Client Email:** ${email}
**Main Goals:** ${mainGoal}
**Posting Frequency:** ${postingFrequency}
**Primary Content Type:** ${contentType}

The report_text should include these sections with markdown formatting:
- Executive Summary
- What's Holding You Back
- What You Should Do Instead
- Weekly Content Plan
- 7-Day Action Plan
- High-Performing Post Ideas
- Growth Tactics
- Final Strategy & Roadmap

Make it professional, actionable, and encouraging.`;

    // Call the LLM to generate report
    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: userPrompt,
      add_context_from_internet: true,
      model: 'gemini_3_pro',
      response_json_schema: {
        type: 'object',
        properties: {
          report_text: { type: 'string' },
          analysis: {
            type: 'object',
            properties: {
              core_problems: { type: 'array', items: { type: 'string' } },
              strengths: { type: 'array', items: { type: 'string' } },
              opportunities: { type: 'array', items: { type: 'string' } },
              verified_metrics: {
                type: 'object',
                properties: {
                  followers: { type: 'number' },
                  engagement_rate: { type: 'number' },
                  reach: { type: 'number' },
                  impressions: { type: 'number' }
                }
              }
            }
          },
          scores: {
            type: 'object',
            properties: {
              overall: { type: 'number' },
              visibility: { type: 'number' },
              content: { type: 'number' },
              consistency: { type: 'number' },
              engagement: { type: 'number' },
              growth: { type: 'number' }
            }
          }
        },
        required: ['report_text', 'analysis', 'scores']
      }
    });

    // Update the existing audit record
    const scores = llmResponse.scores || {};
    if (!auditId) {
      return Response.json({ error: 'auditId is required' }, { status: 400 });
    }
    
    console.log("[AUDIT] updating auditId:", auditId);
    const audit = await base44.asServiceRole.entities.Audit.update(auditId, {
      report_text: llmResponse.report_text,
      analysis: llmResponse.analysis,
      overall_score: scores.overall || 0,
      visibility_score: scores.visibility || 0,
      content_score: scores.content || 0,
      consistency_score: scores.consistency || 0,
      engagement_score: scores.engagement || 0,
      growth_score: scores.growth || 0,
      status: 'completed',
      data_confidence: 'combined',
      scraper_status: 'success',
    }, { data_env: 'dev' });
    console.log("[AUDIT] updated audit to completed:", auditId);

    return Response.json({
      success: true,
      audit_id: audit.id,
      report_text: llmResponse.report_text,
      analysis: llmResponse.analysis,
      scores: scores,
      scraper_status: 'success',
    });
  } catch (error) {
    console.error('runAudit error:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});