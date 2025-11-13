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
    const { productName, productDescription, targetAudience, contentType, variantCount = 3 } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('Generating marketing copy:', { productName, contentType, variantCount });

    const contentTypePrompts = {
      ad_copy: "Create compelling Google/Facebook ad copy with attention-grabbing headlines (max 30 chars), persuasive body text (max 90 chars), and strong CTAs.",
      email: "Write a professional email campaign with subject line (max 50 chars), preview text, email body with value proposition, and clear CTA.",
      landing_page: "Design landing page copy with hero headline, subheadline, benefit bullets, social proof section, and conversion-focused CTA.",
      social_post: "Create engaging social media posts for LinkedIn/Twitter/Instagram with hooks, value statements, and engagement CTAs.",
      blog_post: "Write SEO-optimized blog post outline with compelling headline, introduction hook, H2 sections, key points, and conclusion with CTA."
    };

    const systemPrompt = `You are an expert marketing copywriter specializing in conversion-optimized content.

IMPORTANT: Return ONLY valid JSON with this exact structure:
{
  "variants": [
    {
      "variant_name": "Variant A",
      "headline": "compelling headline here",
      "body_text": "persuasive body copy here",
      "cta": "strong call-to-action here"
    }
  ]
}

Guidelines:
- Create ${variantCount} unique variants (A, B, C...)
- Each variant should have a distinct angle/approach
- Use proven copywriting frameworks (PAS, AIDA, FAB)
- Focus on benefits over features
- Include emotional triggers and urgency
- Make CTAs specific and action-oriented
- Optimize for the platform/format specified`;

    const userPrompt = `Product: ${productName}

Description: ${productDescription}

Target Audience: ${targetAudience}

Content Type: ${contentType}
${contentTypePrompts[contentType as keyof typeof contentTypePrompts]}

Generate ${variantCount} high-converting variants with different angles:
1. Problem-focused
2. Benefit-focused  
3. Social proof-focused

Return as JSON with variant_name, headline, body_text, and cta for each.`;

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
            name: "generate_copy_variants",
            description: "Generate marketing copy variants",
            parameters: {
              type: "object",
              properties: {
                variants: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      variant_name: { type: "string" },
                      headline: { type: "string" },
                      body_text: { type: "string" },
                      cta: { type: "string" }
                    },
                    required: ["variant_name", "headline", "body_text", "cta"]
                  }
                }
              },
              required: ["variants"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_copy_variants" } },
        max_completion_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    if (!data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response from AI');
    }

    const copyData = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);

    if (!copyData.variants || !Array.isArray(copyData.variants)) {
      throw new Error('AI response missing variants array');
    }

    console.log('Successfully generated marketing copy variants');

    return new Response(
      JSON.stringify({ variants: copyData.variants }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-marketing-copy:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
