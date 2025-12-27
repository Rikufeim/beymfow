-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view prompt listings" ON public.prompts;

-- Create a view for public listings that excludes sensitive prompt_content
CREATE OR REPLACE VIEW public.prompt_listings AS
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

-- Grant access to the view for anonymous and authenticated users
GRANT SELECT ON public.prompt_listings TO anon, authenticated;

-- Create policy for sellers to view their own prompts (including content)
CREATE POLICY "Sellers can view own prompt content" 
ON public.prompts 
FOR SELECT 
USING (auth.uid() = seller_id);

-- Note: A purchases table would be needed to allow buyers to view content
-- For now, only sellers can see full content