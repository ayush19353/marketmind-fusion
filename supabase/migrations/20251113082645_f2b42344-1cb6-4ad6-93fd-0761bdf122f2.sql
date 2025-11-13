-- Fix demographics column to have a default value
ALTER TABLE public.customer_personas 
ALTER COLUMN demographics SET DEFAULT '{}'::jsonb;