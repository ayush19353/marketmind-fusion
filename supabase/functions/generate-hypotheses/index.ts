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
      
      IMPORTANT: Return ONLY valid JSON with this exact structure:
      {
        "hypotheses": [
          {
            "statement": "hypothesis statement",
            "method": "plain language method",
            "methodTechnical": "technical method name",
            "decisionRule": "decision criteria",
            "confidence": 85
          }
        ]
      }
      
      For each hypothesis:
      1. A clear, testable statement
      2. A plain language version of the method
      3. The recommended research method (use technical terminology)
      4. A specific decision rule with quantifiable thresholds
      5. A confidence score (0-100) based on market relevance`
      : `You are a helpful marketing assistant. Generate 3 simple, testable ideas about the given product that we can research.
      
      IMPORTANT: Return ONLY valid JSON with this exact structure:
      {
        "hypotheses": [
          {
            "statement": "clear idea about the product",
            "method": "how to test it in simple words",
            "methodTechnical": "technical research method name",
            "decisionRule": "what result means move forward",
            "confidence": 85
          }
        ]
      }
      
      Generate exactly 3 hypotheses.`;

    const userPrompt = `Product: ${productName}\n\nDescription: ${productDescription}\n\nGenerate 3 hypotheses.`;

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
    console.log('OpenAI raw response:', JSON.stringify(data));

    // Validate response structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI');
    }

    const content = data.choices[0].message.content;
    console.log('Content to parse:', content);

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content that failed to parse:', content);
      throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    const hypotheses = parsedContent.hypotheses || [];
    
    if (!Array.isArray(hypotheses) || hypotheses.length === 0) {
      console.error('No hypotheses in response:', parsedContent);
      throw new Error('AI did not generate hypotheses');
    }

    console.log('Successfully parsed hypotheses:', hypotheses.length);

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
