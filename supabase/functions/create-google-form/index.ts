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
    const { title, description, questions } = await req.json();
    const GOOGLE_FORMS_API_KEY = Deno.env.get('GOOGLE_FORMS_API_KEY');

    if (!GOOGLE_FORMS_API_KEY) {
      throw new Error('GOOGLE_FORMS_API_KEY is not configured');
    }

    console.log(`Creating Google Form: ${title} with ${questions.length} questions`);

    // Create the form
    const createFormResponse = await fetch('https://forms.googleapis.com/v1/forms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GOOGLE_FORMS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        info: {
          title: title,
          documentTitle: title,
        }
      }),
    });

    if (!createFormResponse.ok) {
      const errorText = await createFormResponse.text();
      console.error('Google Forms API error:', createFormResponse.status, errorText);
      throw new Error(`Google Forms API error: ${createFormResponse.status}`);
    }

    const formData = await createFormResponse.json();
    const formId = formData.formId;
    const formUrl = formData.responderUri;

    console.log('Form created:', formId);

    // Add description and questions using batchUpdate
    const requests = [];

    // Add description
    if (description) {
      requests.push({
        updateFormInfo: {
          info: {
            description: description,
          },
          updateMask: 'description',
        }
      });
    }

    // Add questions
    questions.forEach((question: any, index: number) => {
      const questionItem: any = {
        title: question.text,
        questionId: `q${index}`,
      };

      if (question.type === 'multiple_choice' && question.options) {
        questionItem.choiceQuestion = {
          type: 'RADIO',
          options: question.options.map((opt: string) => ({ value: opt })),
        };
      } else if (question.type === 'rating') {
        questionItem.scaleQuestion = {
          low: 1,
          high: 5,
          lowLabel: 'Poor',
          highLabel: 'Excellent',
        };
      } else {
        questionItem.textQuestion = {
          paragraph: true,
        };
      }

      requests.push({
        createItem: {
          item: {
            title: question.text,
            questionItem: questionItem,
          },
          location: {
            index: index,
          },
        },
      });
    });

    // Apply all updates
    if (requests.length > 0) {
      const batchUpdateResponse = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GOOGLE_FORMS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      });

      if (!batchUpdateResponse.ok) {
        const errorText = await batchUpdateResponse.text();
        console.error('Batch update error:', batchUpdateResponse.status, errorText);
      }
    }

    return new Response(
      JSON.stringify({ formUrl, formId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-google-form:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
