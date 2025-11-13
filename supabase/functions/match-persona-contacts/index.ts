import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { personaId, projectId, minMatchScore = 60 } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    console.log('Matching persona to contacts:', personaId);

    // Fetch the persona
    const { data: persona, error: personaError } = await supabase
      .from('customer_personas')
      .select('*')
      .eq('id', personaId)
      .single();

    if (personaError) throw personaError;

    // Fetch all contacts for the project
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .eq('project_id', projectId);

    if (contactsError) throw contactsError;

    if (!contacts || contacts.length === 0) {
      return new Response(
        JSON.stringify({ matches: [], message: 'No contacts found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${contacts.length} contacts to match against`);

    // Use AI to score each contact against the persona
    const systemPrompt = `You are an expert at matching customer personas with real individuals based on demographic and psychographic data. 

IMPORTANT MATCHING GUIDELINES:
- Prioritize interests, behaviors, and psychographic alignment over strict demographic matching
- When demographic data is limited or missing, focus heavily on available interests and behaviors
- Age differences of 5-10 years should not heavily penalize the score if interests align well
- A strong interest match (e.g., both interested in fitness) should result in 60-80+ score even with some demographic differences
- Only give low scores (below 50) when there are clear mismatches in interests or goals

Return a JSON array with this structure:
[
  {
    "contact_id": "uuid",
    "match_score": 85,
    "reasons": ["Strong interest alignment in fitness", "Demographics partially align", "Behavior patterns match persona goals"]
  }
]`;

    const userPrompt = `Target Persona:
Name: ${persona.name}
Age Range: ${persona.age_range}
Demographics: ${JSON.stringify(persona.demographics)}
Psychographics: ${JSON.stringify(persona.psychographics)}
Pain Points: ${JSON.stringify(persona.pain_points)}
Goals: ${JSON.stringify(persona.goals)}

Contacts to Match (${contacts.length} total):
${contacts.map(c => `
ID: ${c.id}
Name: ${c.first_name} ${c.last_name || ''}
Email: ${c.email}
Age Range: ${c.age_range || 'Not specified'}
Demographics: ${JSON.stringify(c.demographics)}
Interests: ${JSON.stringify(c.interests)}
Behavior: ${JSON.stringify(c.behavior_data)}
`).join('\n---\n')}

Score each contact's match with the persona (0-100) and explain why.`;

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
        response_format: { type: 'json_object' },
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', JSON.stringify(data));
    
    const content = data.choices[0].message.content;
    const parsedResult = JSON.parse(content);
    
    // Handle multiple response formats: array, or object with matches/results/contacts key
    let matchResults = [];
    if (Array.isArray(parsedResult)) {
      matchResults = parsedResult;
    } else if (parsedResult.matches && Array.isArray(parsedResult.matches)) {
      matchResults = parsedResult.matches;
    } else if (parsedResult.results && Array.isArray(parsedResult.results)) {
      matchResults = parsedResult.results;
    } else if (parsedResult.contacts && Array.isArray(parsedResult.contacts)) {
      matchResults = parsedResult.contacts;
    }
    console.log(`Parsed ${matchResults.length} match results`);

    // Filter matches above minimum score
    const goodMatches = matchResults
      .filter((m: any) => m.match_score >= minMatchScore)
      .sort((a: any, b: any) => b.match_score - a.match_score);

    console.log(`Found ${goodMatches.length} matches above ${minMatchScore}% score`);

    // Enrich matches with full contact data
    const enrichedMatches = goodMatches.map((match: any) => {
      const contact = contacts.find(c => c.id === match.contact_id);
      return {
        ...match,
        contact
      };
    });

    return new Response(
      JSON.stringify({ matches: enrichedMatches }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in match-persona-contacts:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
