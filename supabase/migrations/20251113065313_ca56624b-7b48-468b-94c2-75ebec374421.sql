-- Create research_projects table
CREATE TABLE public.research_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed')),
  mode TEXT NOT NULL DEFAULT 'guided' CHECK (mode IN ('guided', 'expert')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.research_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for research_projects
CREATE POLICY "Users can view their own projects"
ON public.research_projects FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
ON public.research_projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
ON public.research_projects FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
ON public.research_projects FOR DELETE
USING (auth.uid() = user_id);

-- Create hypotheses table
CREATE TABLE public.hypotheses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.research_projects(id) ON DELETE CASCADE,
  statement TEXT NOT NULL,
  method TEXT NOT NULL,
  method_technical TEXT NOT NULL,
  decision_rule TEXT NOT NULL,
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hypotheses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hypotheses
CREATE POLICY "Users can view hypotheses for their projects"
ON public.hypotheses FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.research_projects
  WHERE id = project_id AND user_id = auth.uid()
));

CREATE POLICY "Users can create hypotheses for their projects"
ON public.hypotheses FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.research_projects
  WHERE id = project_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update hypotheses for their projects"
ON public.hypotheses FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.research_projects
  WHERE id = project_id AND user_id = auth.uid()
));

CREATE POLICY "Users can delete hypotheses for their projects"
ON public.hypotheses FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.research_projects
  WHERE id = project_id AND user_id = auth.uid()
));

-- Create research_plans table
CREATE TABLE public.research_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.research_projects(id) ON DELETE CASCADE,
  target_audience JSONB NOT NULL,
  sample JSONB NOT NULL,
  methodology JSONB NOT NULL,
  timeline JSONB NOT NULL,
  budget JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.research_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for research_plans
CREATE POLICY "Users can view plans for their projects"
ON public.research_plans FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.research_projects
  WHERE id = project_id AND user_id = auth.uid()
));

CREATE POLICY "Users can create plans for their projects"
ON public.research_plans FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.research_projects
  WHERE id = project_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update plans for their projects"
ON public.research_plans FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.research_projects
  WHERE id = project_id AND user_id = auth.uid()
));

CREATE POLICY "Users can delete plans for their projects"
ON public.research_plans FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.research_projects
  WHERE id = project_id AND user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_research_projects_updated_at
BEFORE UPDATE ON public.research_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hypotheses_updated_at
BEFORE UPDATE ON public.hypotheses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_research_plans_updated_at
BEFORE UPDATE ON public.research_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();