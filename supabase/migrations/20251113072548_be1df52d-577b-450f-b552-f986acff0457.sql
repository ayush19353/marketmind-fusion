-- Create table for AI-generated marketing content
CREATE TABLE public.marketing_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.research_projects(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('ad_copy', 'email', 'landing_page', 'social_post', 'blog_post')),
  variant_name TEXT NOT NULL,
  headline TEXT,
  body_text TEXT,
  cta TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for AI-generated personas
CREATE TABLE public.customer_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.research_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age_range TEXT NOT NULL,
  demographics JSONB NOT NULL,
  psychographics JSONB NOT NULL,
  pain_points TEXT[] NOT NULL,
  goals TEXT[] NOT NULL,
  preferred_channels TEXT[] NOT NULL,
  buying_behavior JSONB NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for competitive analysis
CREATE TABLE public.competitive_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.research_projects(id) ON DELETE CASCADE,
  competitor_name TEXT NOT NULL,
  strengths TEXT[] NOT NULL,
  weaknesses TEXT[] NOT NULL,
  opportunities TEXT[] NOT NULL,
  threats TEXT[] NOT NULL,
  positioning TEXT NOT NULL,
  recommendations JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for generated campaign images
CREATE TABLE public.campaign_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.research_projects(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL CHECK (image_type IN ('hero', 'ad_banner', 'social_media', 'product_shot')),
  prompt TEXT NOT NULL,
  image_data TEXT NOT NULL, -- base64 encoded
  dimensions TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketing_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitive_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketing_content
CREATE POLICY "Users can view marketing content for their projects"
ON public.marketing_content FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.research_projects
  WHERE research_projects.id = marketing_content.project_id
  AND research_projects.user_id = auth.uid()
));

CREATE POLICY "Users can create marketing content for their projects"
ON public.marketing_content FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.research_projects
  WHERE research_projects.id = marketing_content.project_id
  AND research_projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete marketing content for their projects"
ON public.marketing_content FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.research_projects
  WHERE research_projects.id = marketing_content.project_id
  AND research_projects.user_id = auth.uid()
));

-- RLS Policies for customer_personas
CREATE POLICY "Users can view personas for their projects"
ON public.customer_personas FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.research_projects
  WHERE research_projects.id = customer_personas.project_id
  AND research_projects.user_id = auth.uid()
));

CREATE POLICY "Users can create personas for their projects"
ON public.customer_personas FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.research_projects
  WHERE research_projects.id = customer_personas.project_id
  AND research_projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete personas for their projects"
ON public.customer_personas FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.research_projects
  WHERE research_projects.id = customer_personas.project_id
  AND research_projects.user_id = auth.uid()
));

-- RLS Policies for competitive_analysis
CREATE POLICY "Users can view competitive analysis for their projects"
ON public.competitive_analysis FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.research_projects
  WHERE research_projects.id = competitive_analysis.project_id
  AND research_projects.user_id = auth.uid()
));

CREATE POLICY "Users can create competitive analysis for their projects"
ON public.competitive_analysis FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.research_projects
  WHERE research_projects.id = competitive_analysis.project_id
  AND research_projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete competitive analysis for their projects"
ON public.competitive_analysis FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.research_projects
  WHERE research_projects.id = competitive_analysis.project_id
  AND research_projects.user_id = auth.uid()
));

-- RLS Policies for campaign_images
CREATE POLICY "Users can view campaign images for their projects"
ON public.campaign_images FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.research_projects
  WHERE research_projects.id = campaign_images.project_id
  AND research_projects.user_id = auth.uid()
));

CREATE POLICY "Users can create campaign images for their projects"
ON public.campaign_images FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.research_projects
  WHERE research_projects.id = campaign_images.project_id
  AND research_projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete campaign images for their projects"
ON public.campaign_images FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.research_projects
  WHERE research_projects.id = campaign_images.project_id
  AND research_projects.user_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX idx_marketing_content_project_id ON public.marketing_content(project_id);
CREATE INDEX idx_customer_personas_project_id ON public.customer_personas(project_id);
CREATE INDEX idx_competitive_analysis_project_id ON public.competitive_analysis(project_id);
CREATE INDEX idx_campaign_images_project_id ON public.campaign_images(project_id);

-- Update triggers for updated_at
CREATE TRIGGER update_marketing_content_updated_at
  BEFORE UPDATE ON public.marketing_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_personas_updated_at
  BEFORE UPDATE ON public.customer_personas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_competitive_analysis_updated_at
  BEFORE UPDATE ON public.competitive_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();