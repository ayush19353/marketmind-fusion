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
    const { testName, variantA, variantB, targetAudience, historicalData } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('Predicting A/B test results for:', testName);

    const systemPrompt = `You are an expert marketing analyst and data scientist specializing in A/B testing and predictive analytics. Your role is to analyze campaign variants and predict which will perform better based on marketing principles, historical data patterns, and audience insights.

You must return your analysis as a JSON object with this structure:
{
  "predicted_winner": "A" or "B",
  "confidence_score": 1-100,
  "predicted_metrics": {
    "variant_a": {
      "ctr_estimate": "X.X%",
      "conversion_estimate": "X.X%",
      "engagement_score": 1-10
    },
    "variant_b": {
      "ctr_estimate": "X.X%",
      "conversion_estimate": "X.X%",
      "engagement_score": 1-10
    }
  },
  "key_factors": ["factor 1", "factor 2", "factor 3"],
  "recommendations": "Detailed recommendations for optimizing the test and next steps"
}`;

    const userPrompt = `Analyze these two campaign variants and predict which will perform better:

Test Name: ${testName}

Variant A:
${JSON.stringify(variantA, null, 2)}

Variant B:
${JSON.stringify(variantB, null, 2)}

Target Audience: ${targetAudience}

${historicalData ? `Historical Performance Data:\n${historicalData}` : 'No historical data available - base prediction on marketing best practices and psychological principles.'}

Provide a comprehensive prediction with confidence score, estimated metrics, and actionable recommendations.`;

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
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI');
    }

    const content = data.choices[0].message.content;
    console.log('Content to parse:', content);

    let prediction;
    try {
      prediction = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content that failed to parse:', content);
      throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    if (!prediction.predicted_winner || !prediction.confidence_score || !prediction.predicted_metrics) {
      console.error('Missing required fields in prediction:', prediction);
      throw new Error('AI response missing required fields');
    }

    console.log('Successfully generated prediction:', prediction);

    return new Response(
      JSON.stringify({ prediction }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in predict-ab-test:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
