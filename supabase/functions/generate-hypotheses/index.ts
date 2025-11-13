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
    const { productName, productDescription, mode } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('Generating hypotheses for:', productName);

    const systemPrompt = mode === 'expert' 
      ? `You are a marketing research expert. Generate 3 testable, data-driven marketing hypotheses for the given product. 
      
      For each hypothesis, provide:
      1. A clear, testable statement
      2. The recommended research method (use technical terminology)
      3. A plain language version of the method
      4. A specific decision rule with quantifiable thresholds
      5. A confidence score (0-100) based on market relevance
      
      Format the response as a JSON array with exactly 3 hypotheses.`
      : `You are a helpful marketing assistant. Generate 3 simple, testable ideas about the given product that we can research.
      
      For each idea, provide:
      1. A clear statement about the product or its target customers
      2. How we should test it (use simple, plain language)
      3. The technical name for the research method
      4. What result would tell us to move forward
      5. How confident you are this is worth testing (0-100)
      
      Format the response as a JSON array with exactly 3 hypotheses.`;

    const userPrompt = `Product: ${productName}\n\nDescription: ${productDescription}\n\nGenerate 3 hypotheses for this product.`;

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

    const content = JSON.parse(data.choices[0].message.content);
    const hypotheses = content.hypotheses || [];

    // Ensure we have the correct structure
    const formattedHypotheses = hypotheses.map((h: any, index: number) => ({
      id: index + 1,
      statement: h.statement || h.idea || '',
      method: h.method || h.howToTest || '',
      methodTechnical: h.methodTechnical || h.technicalName || '',
      decisionRule: h.decisionRule || h.nextSteps || '',
      confidence: h.confidence || 85,
    }));

    return new Response(
      JSON.stringify({ hypotheses: formattedHypotheses }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-hypotheses:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
