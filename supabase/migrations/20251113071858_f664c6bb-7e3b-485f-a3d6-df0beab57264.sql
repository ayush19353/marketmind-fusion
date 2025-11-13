-- Add archived field to research_projects table
ALTER TABLE public.research_projects 
ADD COLUMN archived boolean NOT NULL DEFAULT false;

-- Create index for better query performance on archived projects
CREATE INDEX idx_research_projects_archived ON public.research_projects(archived);

-- Create index for status filtering
CREATE INDEX idx_research_projects_status ON public.research_projects(status);