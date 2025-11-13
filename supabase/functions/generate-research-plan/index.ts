import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, productDescription, hypotheses, mode } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('Generating research plan for:', productName);

    const systemPrompt = `You are a marketing research strategist. Create a comprehensive research plan based on the product and hypotheses provided.

The plan should include:
1. Target Audience (demographics, psychographics, market size)
2. Sample (size calculation, sampling method, confidence level, margin of error)
3. Methodology (research techniques with participant counts)
4. Timeline (phases with durations, total estimated time)
5. Budget (itemized breakdown with ranges, total estimated cost)

Format the response as a JSON object with these exact keys: targetAudience, sample, methodology, timeline, budget.
Make the plan realistic and actionable.`;

    const hypothesesText = hypotheses.map((h: any) => h.statement).join('\n');
    const userPrompt = `Product: ${productName}\n\nDescription: ${productDescription}\n\nHypotheses to test:\n${hypothesesText}\n\nCreate a detailed research plan.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        max_completion_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    const plan = JSON.parse(data.choices[0].message.content);

    return new Response(
      JSON.stringify({ plan }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-research-plan:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
