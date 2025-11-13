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
    const { productName, productDescription, competitors } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('Generating competitive analysis for:', productName);

    const systemPrompt = `You are an expert competitive intelligence analyst.

IMPORTANT: Return ONLY valid JSON with this exact structure:
{
  "analyses": [
    {
      "competitor_name": "Competitor Inc",
      "strengths": ["Market leader", "Strong brand"],
      "weaknesses": ["High pricing", "Limited features"],
      "opportunities": ["Expand to new segment"],
      "threats": ["New entrants", "Technology disruption"],
      "positioning": "Premium market leader",
      "recommendations": {
        "differentiation_strategy": "Focus on value pricing",
        "messaging_angles": ["Better value", "More features"],
        "target_segments": ["Price-conscious buyers"],
        "tactical_moves": ["Feature comparison campaigns"]
      }
    }
  ]
}

Provide actionable competitive insights using SWOT framework.`;

    const competitorList = competitors && competitors.length > 0 
      ? competitors.join(', ') 
      : 'Top 3 competitors in the market';

    const userPrompt = `Our Product: ${productName}

Description: ${productDescription}

Competitors to Analyze: ${competitorList}

Conduct a comprehensive competitive analysis including:
1. SWOT analysis for each competitor
2. Market positioning assessment
3. Competitive differentiation opportunities
4. Strategic recommendations for our product
5. Tactical marketing moves to gain advantage

Focus on actionable insights that inform marketing strategy and positioning.`;

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
        tools: [{
          type: "function",
          function: {
            name: "generate_competitive_analysis",
            description: "Generate competitive analysis",
            parameters: {
              type: "object",
              properties: {
                analyses: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      competitor_name: { type: "string" },
                      strengths: { type: "array", items: { type: "string" } },
                      weaknesses: { type: "array", items: { type: "string" } },
                      opportunities: { type: "array", items: { type: "string" } },
                      threats: { type: "array", items: { type: "string" } },
                      positioning: { type: "string" },
                      recommendations: { type: "object" }
                    },
                    required: ["competitor_name", "strengths", "weaknesses", "opportunities", "threats", "positioning", "recommendations"]
                  }
                }
              },
              required: ["analyses"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_competitive_analysis" } },
        max_completion_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response from AI');
    }

    const analysisData = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);

    if (!analysisData.analyses || !Array.isArray(analysisData.analyses)) {
      throw new Error('AI response missing analyses array');
    }

    console.log('Successfully generated competitive analysis');

    return new Response(
      JSON.stringify({ analyses: analysisData.analyses }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-competitive-analysis:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
