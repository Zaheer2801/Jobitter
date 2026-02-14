
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow public read/write for job alert profiles" ON public.job_alert_profiles;

-- Create proper RLS policies for job_alert_profiles
CREATE POLICY "Users can view their own job alert profiles"
  ON public.job_alert_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own job alert profiles"
  ON public.job_alert_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job alert profiles"
  ON public.job_alert_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job alert profiles"
  ON public.job_alert_profiles FOR DELETE
  USING (auth.uid() = user_id);
