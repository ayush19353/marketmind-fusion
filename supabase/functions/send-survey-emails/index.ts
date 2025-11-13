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
        
        // Get the request origin to construct survey URL
        const origin = req.headers.get('origin') || req.headers.get('referer') || 'https://b539ff29-d694-46a0-8de8-b2a5a9129fa4.lovable.app';
        const baseUrl = origin.replace(/\/$/, '');
        const surveyUrl = `${baseUrl}/survey/respond?survey=${surveyId}&contact=${contact.id}`;

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 20px auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px;">
              <h1 style="color: white; text-align: center; margin-bottom: 20px;">
                ${survey.title}
              </h1>
              ${survey.description ? `<p style="color: white; text-align: center; margin-bottom: 30px;">${survey.description}</p>` : ''}
              <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; text-align: center;">
                <p style="margin-bottom: 20px; color: #333; font-size: 16px;">
                  Hi ${contact.first_name},
                </p>
                <p style="margin-bottom: 30px; color: #333; font-size: 16px;">
                  We'd love to hear your feedback! Click the button below to take our survey.
                </p>
                <a href="${surveyUrl}" 
                   style="display: inline-block; padding: 15px 40px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold;">
                  Take Survey
                </a>
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                  Thank you for your time!
                </p>
              </div>
            </div>
          </body>
          </html>
        `;

        const { data, error } = await resend.emails.send({
          from: 'Survey <onboarding@resend.dev>',
          to: [contact.email],
          subject: survey.title,
          html: emailHtml,
        });

        if (error) {
          console.error('Email send error for', contact.email, error);
          errors.push({ contact: contact.email, error: error.message });
        } else {
          console.log('Survey sent to', contact.email);
          results.push({ contact: contact.email, success: true });

          // Record survey send in database
          await supabase.from('survey_sends').insert({
            survey_id: surveyId,
            contact_id: contact.id,
            persona_id: match.personaId,
            match_score: match.score,
            match_reasons: match.reasons,
            sent_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error processing contact:', error);
        errors.push({ contact: match.contact.email, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        results, 
        errors,
        totalSent: results.length,
        totalErrors: errors.length 
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
