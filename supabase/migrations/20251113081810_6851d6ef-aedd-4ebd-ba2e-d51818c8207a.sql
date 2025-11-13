-- Create contacts table for survey participants
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  age_range TEXT,
  demographics JSONB DEFAULT '{}'::jsonb,
  interests JSONB DEFAULT '[]'::jsonb,
  behavior_data JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, email)
);

-- Create surveys table
CREATE TABLE public.surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  persona_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create survey sends table to track who was sent surveys
CREATE TABLE public.survey_sends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL,
  contact_id UUID NOT NULL,
  persona_id UUID,
  match_score INTEGER NOT NULL,
  match_reasons JSONB,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  opened_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  response_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_sends ENABLE ROW LEVEL SECURITY;

-- Contacts policies
CREATE POLICY "Users can view contacts for their projects" 
ON public.contacts FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.research_projects 
    WHERE research_projects.id = contacts.project_id 
    AND research_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create contacts for their projects" 
ON public.contacts FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.research_projects 
    WHERE research_projects.id = contacts.project_id 
    AND research_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update contacts for their projects" 
ON public.contacts FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.research_projects 
    WHERE research_projects.id = contacts.project_id 
    AND research_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete contacts for their projects" 
ON public.contacts FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.research_projects 
    WHERE research_projects.id = contacts.project_id 
    AND research_projects.user_id = auth.uid()
  )
);

-- Surveys policies
CREATE POLICY "Users can view surveys for their projects" 
ON public.surveys FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.research_projects 
    WHERE research_projects.id = surveys.project_id 
    AND research_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create surveys for their projects" 
ON public.surveys FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.research_projects 
    WHERE research_projects.id = surveys.project_id 
    AND research_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update surveys for their projects" 
ON public.surveys FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.research_projects 
    WHERE research_projects.id = surveys.project_id 
    AND research_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete surveys for their projects" 
ON public.surveys FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.research_projects 
    WHERE research_projects.id = surveys.project_id 
    AND research_projects.user_id = auth.uid()
  )
);

-- Survey sends policies
CREATE POLICY "Users can view survey sends for their projects" 
ON public.survey_sends FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.surveys 
    JOIN public.research_projects ON research_projects.id = surveys.project_id
    WHERE surveys.id = survey_sends.survey_id 
    AND research_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create survey sends for their projects" 
ON public.survey_sends FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.surveys 
    JOIN public.research_projects ON research_projects.id = surveys.project_id
    WHERE surveys.id = survey_sends.survey_id 
    AND research_projects.user_id = auth.uid()
  )
);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at
BEFORE UPDATE ON public.surveys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();