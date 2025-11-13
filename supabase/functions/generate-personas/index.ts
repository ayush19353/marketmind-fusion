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
    const { productName, productDescription, researchData, personaCount = 3 } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('Generating customer personas for:', productName);

    const systemPrompt = `You are an expert market researcher specializing in customer persona development.

IMPORTANT: Return ONLY valid JSON with this exact structure:
{
  "personas": [
    {
      "name": "Persona Name",
      "age_range": "25-34",
      "demographics": {
        "gender": "Non-binary",
        "location": "Urban areas",
        "income": "$75k-$100k",
        "education": "Bachelor's degree",
        "occupation": "Marketing Manager"
      },
      "psychographics": {
        "values": ["Innovation", "Efficiency"],
        "interests": ["Technology", "Professional development"],
        "lifestyle": "Career-focused, tech-savvy",
        "personality": "Ambitious, analytical"
      },
      "pain_points": ["Time constraints", "Information overload"],
      "goals": ["Career advancement", "Work-life balance"],
      "preferred_channels": ["LinkedIn", "Email", "Podcasts"],
      "buying_behavior": {
        "decision_factors": ["ROI", "Ease of use"],
        "budget_sensitivity": "Medium",
        "research_depth": "Thorough",
        "influence_sources": ["Peer reviews", "Case studies"]
      }
    }
  ]
}

Create detailed, realistic personas based on actual market research data.`;

    const userPrompt = `Product: ${productName}

Description: ${productDescription}

Research Data: ${JSON.stringify(researchData)}

Generate ${personaCount} distinct customer personas representing key segments of the target market. Each persona should be:
1. Based on realistic demographic and psychographic data
2. Include specific pain points and goals
3. Detail preferred communication channels
4. Describe buying behavior and decision-making process
5. Be actionable for marketing campaigns

Make each persona unique and representative of a different market segment.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_personas",
            description: "Generate customer personas",
            parameters: {
              type: "object",
              properties: {
                personas: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      age_range: { type: "string" },
                      demographics: { type: "object" },
                      psychographics: { type: "object" },
                      pain_points: { type: "array", items: { type: "string" } },
                      goals: { type: "array", items: { type: "string" } },
                      preferred_channels: { type: "array", items: { type: "string" } },
                      buying_behavior: { type: "object" }
                    },
                    required: ["name", "age_range", "demographics", "psychographics", "pain_points", "goals", "preferred_channels", "buying_behavior"]
                  }
                }
              },
              required: ["personas"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_personas" } },
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

    const personaData = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);

    if (!personaData.personas || !Array.isArray(personaData.personas)) {
      throw new Error('AI response missing personas array');
    }

    // Sanitize persona data to ensure all fields have proper defaults
    const sanitizedPersonas = personaData.personas.map((p: any) => ({
      name: p.name || 'Unnamed Persona',
      age_range: p.age_range || 'Not specified',
      demographics: p.demographics || {},
      psychographics: p.psychographics || {},
      pain_points: Array.isArray(p.pain_points) ? p.pain_points : [],
      goals: Array.isArray(p.goals) ? p.goals : [],
      preferred_channels: Array.isArray(p.preferred_channels) ? p.preferred_channels : [],
      buying_behavior: p.buying_behavior || {}
    }));

    console.log('Successfully generated customer personas');

    return new Response(
      JSON.stringify({ personas: sanitizedPersonas }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-personas:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
