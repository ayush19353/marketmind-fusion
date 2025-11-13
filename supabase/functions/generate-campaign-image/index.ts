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
    const { productName, imageType, style, brandColors } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('Generating campaign image:', { productName, imageType, style });

    const imageTypePrompts = {
      hero: "Create a stunning hero banner image with dramatic lighting, professional composition, and strong visual hierarchy. High-end commercial photography style.",
      ad_banner: "Design an attention-grabbing advertising banner with bold visuals, clear focal point, and professional marketing aesthetic. Optimized for digital ads.",
      social_media: "Generate an engaging social media image with vibrant colors, modern design, and scroll-stopping visual appeal. Instagram/LinkedIn quality.",
      product_shot: "Create a professional product photography shot with clean background, perfect lighting, and commercial quality presentation."
    };

    const styleModifiers = {
      modern: "sleek, minimalist, contemporary design, clean lines, sophisticated",
      vibrant: "bold colors, energetic, dynamic, eye-catching, high contrast",
      professional: "corporate, polished, trustworthy, premium quality, refined",
      creative: "artistic, unique, innovative, imaginative, trendsetting"
    };

    const prompt = `Professional marketing image for ${productName}.
    
Style: ${imageTypePrompts[imageType as keyof typeof imageTypePrompts]}
${styleModifiers[style as keyof typeof styleModifiers]}

${brandColors ? `Brand colors: ${brandColors}` : ''}

Requirements:
- Commercial photography quality
- Marketing-ready composition
- Strong visual impact
- Brand-appropriate aesthetic
- No text overlays (will be added later)
- High resolution, professional finish

Generate a stunning marketing image that converts.`;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'high',
        response_format: 'b64_json'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI image generation response received');

    if (!data.data?.[0]?.b64_json) {
      console.error('Invalid response structure:', data);
      throw new Error('No image generated in response');
    }

    const imageUrl = `data:image/png;base64,${data.data[0].b64_json}`;

    console.log('Successfully generated campaign image');

    return new Response(
      JSON.stringify({ 
        imageData: imageUrl,
        prompt: prompt
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-campaign-image:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
