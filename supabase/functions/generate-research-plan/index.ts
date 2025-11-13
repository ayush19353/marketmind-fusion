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

    const systemPrompt = `You are a marketing research strategist. Create a comprehensive research plan.

IMPORTANT: Return ONLY valid JSON with this exact structure:
{
  "targetAudience": {
    "demographics": "string",
    "psychographics": "string",
    "size": "string"
  },
  "sample": {
    "size": number,
    "type": "string",
    "typePlain": "string",
    "confidence": number,
    "margin": number
  },
  "methodology": {
    "primary": "string",
    "techniques": [
      {"name": "string", "plain": "string", "responses": number}
    ]
  },
  "timeline": {
    "total": "string",
    "phases": [
      {"phase": "string", "duration": "string"}
    ]
  },
  "budget": {
    "estimated": "string",
    "breakdown": [
      {"item": "string", "cost": "string"}
    ]
  }
}

Include:
1. Target Audience (demographics, psychographics, market size)
2. Sample (size calculation, sampling method, confidence level, margin of error)
3. Methodology (research techniques with participant counts)
4. Timeline (phases with durations, total estimated time)
5. Budget (itemized breakdown with ranges, total estimated cost)`;

    const hypothesesText = hypotheses.map((h: any) => h.statement).join('\n');
    const userPrompt = `Product: ${productName}\n\nDescription: ${productDescription}\n\nHypotheses:\n${hypothesesText}\n\nCreate plan.`;

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
    console.log('OpenAI raw response:', JSON.stringify(data));

    // Validate response structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI');
    }

    const content = data.choices[0].message.content;
    console.log('Content to parse:', content);

    let plan;
    try {
      plan = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content that failed to parse:', content);
      throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    // Validate required fields
    if (!plan.targetAudience || !plan.sample || !plan.methodology) {
      console.error('Missing required fields in plan:', plan);
      throw new Error('AI response missing required fields');
    }

    console.log('Successfully parsed research plan');

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
