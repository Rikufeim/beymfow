-- Fix SECURITY DEFINER view issue by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.prompt_listings;

CREATE VIEW public.prompt_listings
WITH (security_invoker=on)
AS
SELECT 
  id,
  title,
  description,
  category,
  price,
  rating,
  thumbnail_url,
  seller_id,
  created_at,
  updated_at
FROM public.prompts;

-- Re-grant access to the view
GRANT SELECT ON public.prompt_listings TO anon, authenticated;