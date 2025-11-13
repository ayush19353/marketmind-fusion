import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId } = await req.json();
    
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Create Supabase client with the auth token from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    console.log('Duplicating project:', projectId);

    // 1. Fetch the original project
    const { data: originalProject, error: projectError } = await supabase
      .from('research_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !originalProject) {
      console.error('Error fetching project:', projectError);
      throw new Error('Project not found or access denied');
    }

    // 2. Create a new project (copy of the original)
    const { data: newProject, error: createError } = await supabase
      .from('research_projects')
      .insert({
        user_id: originalProject.user_id,
        product_name: `${originalProject.product_name} (Copy)`,
        product_description: originalProject.product_description,
        status: originalProject.status,
        mode: originalProject.mode,
        archived: false,
      })
      .select()
      .single();

    if (createError || !newProject) {
      console.error('Error creating project copy:', createError);
      throw new Error('Failed to create project copy');
    }

    console.log('Created new project:', newProject.id);

    // 3. Fetch and duplicate hypotheses
    const { data: originalHypotheses, error: hypothesesFetchError } = await supabase
      .from('hypotheses')
      .select('*')
      .eq('project_id', projectId);

    if (hypothesesFetchError) {
      console.error('Error fetching hypotheses:', hypothesesFetchError);
    } else if (originalHypotheses && originalHypotheses.length > 0) {
      const newHypotheses = originalHypotheses.map(h => ({
        project_id: newProject.id,
        statement: h.statement,
        method: h.method,
        method_technical: h.method_technical,
        decision_rule: h.decision_rule,
        confidence: h.confidence,
        order_index: h.order_index,
      }));

      const { error: hypothesesInsertError } = await supabase
        .from('hypotheses')
        .insert(newHypotheses);

      if (hypothesesInsertError) {
        console.error('Error duplicating hypotheses:', hypothesesInsertError);
      } else {
        console.log(`Duplicated ${newHypotheses.length} hypotheses`);
      }
    }

    // 4. Fetch and duplicate research plan
    const { data: originalPlan, error: planFetchError } = await supabase
      .from('research_plans')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (planFetchError) {
      console.error('Error fetching research plan:', planFetchError);
    } else if (originalPlan) {
      const { error: planInsertError } = await supabase
        .from('research_plans')
        .insert({
          project_id: newProject.id,
          target_audience: originalPlan.target_audience,
          sample: originalPlan.sample,
          methodology: originalPlan.methodology,
          timeline: originalPlan.timeline,
          budget: originalPlan.budget,
        });

      if (planInsertError) {
        console.error('Error duplicating research plan:', planInsertError);
      } else {
        console.log('Duplicated research plan');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        projectId: newProject.id,
        message: 'Project duplicated successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in duplicate-project:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
