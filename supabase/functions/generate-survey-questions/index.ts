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
    const { surveyTitle, surveyDescription, personaInfo, questionCount = 5 } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log(`Generating ${questionCount} survey questions for: ${surveyTitle}`);

    const systemPrompt = `You are an expert survey designer. Generate effective survey questions that will gather meaningful insights.

Question types available:
- "text": Open-ended text responses
- "multiple_choice": Select one from predefined options
- "rating": Rating scale (will be rendered as 1-5 or 1-10)

Guidelines:
- Start with broader questions, then get more specific
- Mix question types for engagement
- For multiple_choice, provide 4-6 clear, mutually exclusive options
- For rating questions, use clear endpoints (e.g., "Very Unlikely" to "Very Likely")
- Make questions concise and unambiguous
- Avoid leading or biased questions`;

    const userPrompt = `Survey Title: ${surveyTitle}
${surveyDescription ? `Description: ${surveyDescription}` : ''}
${personaInfo ? `Target Persona: ${personaInfo}` : ''}

Generate ${questionCount} high-quality survey questions. Return ONLY a JSON object with this structure:
{
  "questions": [
    {
      "text": "Question text here",
      "type": "text" | "multiple_choice" | "rating",
      "required": true | false,
      "options": ["Option 1", "Option 2", ...] // only for multiple_choice
    }
  ]
}`;

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
        max_completion_tokens: 3000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI raw response:', JSON.stringify(data));

    const content = data.choices[0].message.content;
    console.log('Content to parse:', content);

    const parsed = JSON.parse(content);
    console.log('Successfully parsed questions:', parsed.questions?.length || 0);

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid response format from AI');
    }

    return new Response(
      JSON.stringify({ questions: parsed.questions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-survey-questions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
