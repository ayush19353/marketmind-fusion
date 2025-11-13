-- Allow public access to read surveys (for survey response page)
DROP POLICY IF EXISTS "Public can view surveys" ON public.surveys;
CREATE POLICY "Public can view surveys"
ON public.surveys
FOR SELECT
USING (true);

-- Allow public to insert survey responses
DROP POLICY IF EXISTS "Anyone can submit survey responses" ON public.survey_responses;
CREATE POLICY "Anyone can submit survey responses"
ON public.survey_responses
FOR INSERT
WITH CHECK (true);

-- Allow public to read survey responses for analysis
DROP POLICY IF EXISTS "Public can view survey responses" ON public.survey_responses;
CREATE POLICY "Public can view survey responses"
ON public.survey_responses
FOR SELECT
USING (true);