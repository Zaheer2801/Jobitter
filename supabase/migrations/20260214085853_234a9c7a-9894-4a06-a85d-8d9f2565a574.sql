
CREATE TABLE public.job_alert_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_or_identifier TEXT,
  zapier_webhook_url TEXT,
  positions TEXT[] NOT NULL DEFAULT '{}',
  skills TEXT[] NOT NULL DEFAULT '{}',
  role_title TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_alerted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.job_alert_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write for job alert profiles"
ON public.job_alert_profiles
FOR ALL
USING (true)
WITH CHECK (true);

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
