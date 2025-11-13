import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { surveyId, matches } = await req.json();
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const resend = new Resend(RESEND_API_KEY);
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    console.log(`Sending surveys to ${matches.length} contacts`);

    // Fetch survey details
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', surveyId)
      .single();

    if (surveyError) throw surveyError;

    const results = [];
    const errors = [];

    for (const match of matches) {
      try {
        const contact = match.contact;
        
        // Get the request origin to construct response URLs
        const origin = req.headers.get('origin') || req.headers.get('referer') || 'https://b539ff29-d694-46a0-8de8-b2a5a9129fa4.lovable.app';
        const baseUrl = origin.replace(/\/$/, '');

        // Parse questions from survey
        const questions = typeof survey.questions === 'string' 
          ? JSON.parse(survey.questions) 
          : survey.questions;

        // Generate question HTML
        const questionsHtml = questions.map((q: any, idx: number) => {
          if (q.type === 'multiple_choice') {
            const optionsHtml = q.options.map((option: string) => 
              `<a href="${baseUrl}/survey/respond?survey=${surveyId}&contact=${contact.id}&question=${idx}&answer=${encodeURIComponent(option)}" 
                 style="display: inline-block; margin: 5px 10px 5px 0; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">
                 ${option}
              </a>`
            ).join('');
            return `
              <div style="margin: 20px 0; padding: 15px; background: white; border-radius: 5px;">
                <p style="font-weight: bold; margin-bottom: 10px;">${idx + 1}. ${q.text}${q.required ? ' *' : ''}</p>
                ${optionsHtml}
              </div>`;
          } else if (q.type === 'rating') {
            const ratingHtml = [1, 2, 3, 4, 5].map(rating => 
              `<a href="${baseUrl}/survey/respond?survey=${surveyId}&contact=${contact.id}&question=${idx}&answer=${rating}" 
                 style="display: inline-block; margin: 5px; padding: 10px 15px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">
                 ${rating}
              </a>`
            ).join('');
            return `
              <div style="margin: 20px 0; padding: 15px; background: white; border-radius: 5px;">
                <p style="font-weight: bold; margin-bottom: 10px;">${idx + 1}. ${q.text}${q.required ? ' *' : ''}</p>
                <p style="font-size: 12px; color: #666; margin-bottom: 10px;">Rate from 1 (lowest) to 5 (highest):</p>
                ${ratingHtml}
              </div>`;
          } else {
            return `
              <div style="margin: 20px 0; padding: 15px; background: white; border-radius: 5px;">
                <p style="font-weight: bold; margin-bottom: 10px;">${idx + 1}. ${q.text}${q.required ? ' *' : ''}</p>
                <a href="${baseUrl}/survey/respond?survey=${surveyId}&contact=${contact.id}&question=${idx}" 
                   style="display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">
                   Click to answer
                </a>
              </div>`;
          }
        }).join('');

        // Create email HTML
        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .match-info { background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${survey.title}</h1>
                </div>
                <div class="content">
                  <p>Hi ${contact.first_name},</p>
                  
                  <p>${survey.description || 'We would love to hear your feedback!'}</p>
                  
                  <div class="match-info">
                    <strong>Why you were selected:</strong>
                    <ul>
                      ${match.reasons.map((reason: string) => `<li>${reason}</li>`).join('')}
                    </ul>
                    <p><em>Match score: ${match.match_score}%</em></p>
                  </div>
                  
                  <p>Your insights are valuable and will help shape future decisions. Please answer the questions below by clicking on your preferred response:</p>
                  
                  ${questionsHtml}
                  
                  <p style="margin-top: 20px;">Thank you for your time!</p>
                </div>
                <div class="footer">
                  <p>This email was sent because you match the profile for our research study.</p>
                  <p>If you believe this was sent in error, please disregard this message.</p>
                </div>
              </div>
            </body>
          </html>
        `;

        // Send email
        const emailResponse = await resend.emails.send({
          from: 'Research Survey <onboarding@resend.dev>',
          to: [contact.email],
          subject: survey.title,
          html: emailHtml,
        });

        console.log(`Email sent to ${contact.email}:`, emailResponse);

        // Record the send in database
        const { error: insertError } = await supabase
          .from('survey_sends')
          .insert({
            survey_id: surveyId,
            contact_id: contact.id,
            persona_id: match.persona_id || null,
            match_score: match.match_score,
            match_reasons: match.reasons,
          });

        if (insertError) {
          console.error('Error recording survey send:', insertError);
        }

        results.push({
          contact_id: contact.id,
          email: contact.email,
          status: 'sent',
          email_response: emailResponse,
        });

      } catch (error) {
        console.error(`Error sending to ${match.contact.email}:`, error);
        errors.push({
          contact_id: match.contact.id,
          email: match.contact.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Update survey status
    await supabase
      .from('surveys')
      .update({ status: 'active' })
      .eq('id', surveyId);

    console.log(`Successfully sent ${results.length} emails, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: results.length,
        failed: errors.length,
        results,
        errors,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-survey-emails:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
