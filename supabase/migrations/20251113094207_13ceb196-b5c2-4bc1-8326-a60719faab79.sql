-- Create survey_responses table to store contact responses
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert responses (public survey - no auth required)
CREATE POLICY "Anyone can submit survey responses"
ON public.survey_responses
FOR INSERT
WITH CHECK (true);

-- Allow anyone to read their own response (by survey_id)
CREATE POLICY "Anyone can view survey responses"
ON public.survey_responses
FOR SELECT
USING (true);

-- Create indexes for faster lookups
CREATE INDEX idx_survey_responses_survey_id ON public.survey_responses(survey_id);
CREATE INDEX idx_survey_responses_contact_id ON public.survey_responses(contact_id);