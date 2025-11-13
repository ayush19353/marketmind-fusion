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
    const { textResponses } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log(`Analyzing sentiment for ${textResponses.length} text responses`);

    const systemPrompt = `You are a sentiment analysis expert. Analyze the provided survey responses and provide:
1. Overall sentiment (positive, neutral, negative)
2. Key themes and topics mentioned
3. Common pain points or concerns
4. Positive highlights
5. Actionable insights

Be concise and specific.`;

    const userPrompt = `Analyze these survey responses:

${textResponses.map((r: any, i: number) => `Response ${i + 1}: "${r.text}"`).join('\n\n')}

Return ONLY a JSON object with this structure:
{
  "overall_sentiment": "positive" | "neutral" | "negative",
  "sentiment_score": 0-100,
  "key_themes": ["theme1", "theme2", ...],
  "pain_points": ["point1", "point2", ...],
  "positive_highlights": ["highlight1", "highlight2", ...],
  "actionable_insights": ["insight1", "insight2", ...],
  "individual_sentiments": [
    {"response_index": 0, "sentiment": "positive", "score": 85},
    ...
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
        max_completion_tokens: 2000,
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
    const parsed = JSON.parse(content);
    
    console.log('Successfully analyzed sentiment');

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-survey-responses:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
