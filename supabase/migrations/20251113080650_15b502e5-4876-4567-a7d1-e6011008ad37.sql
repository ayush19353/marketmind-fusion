-- Create table for A/B test predictions
CREATE TABLE public.ab_test_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  test_name TEXT NOT NULL,
  variant_a JSONB NOT NULL,
  variant_b JSONB NOT NULL,
  predicted_winner TEXT NOT NULL,
  confidence_score INTEGER NOT NULL,
  predicted_metrics JSONB NOT NULL,
  recommendations TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ab_test_predictions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view predictions for their projects" 
ON public.ab_test_predictions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.research_projects 
    WHERE research_projects.id = ab_test_predictions.project_id 
    AND research_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create predictions for their projects" 
ON public.ab_test_predictions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.research_projects 
    WHERE research_projects.id = ab_test_predictions.project_id 
    AND research_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete predictions for their projects" 
ON public.ab_test_predictions 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.research_projects 
    WHERE research_projects.id = ab_test_predictions.project_id 
    AND research_projects.user_id = auth.uid()
  )
);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_ab_test_predictions_updated_at
BEFORE UPDATE ON public.ab_test_predictions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();