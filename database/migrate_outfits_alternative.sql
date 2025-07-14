-- Alternative migration: Keep existing data and add new columns
-- This approach preserves existing outfit data while adding new functionality

-- 1. Add the new columns needed for saved_outfits functionality
ALTER TABLE public.outfits ADD COLUMN IF NOT EXISTS outfit_data JSONB;
ALTER TABLE public.outfits ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Rename compatibility_score to user_rating for consistency
-- (Note: This assumes compatibility_score can be converted to a 1-5 rating)
ALTER TABLE public.outfits RENAME COLUMN compatibility_score TO user_rating;

-- 3. Update the constraint for user_rating
ALTER TABLE public.outfits DROP CONSTRAINT IF EXISTS valid_outfit_score;
ALTER TABLE public.outfits ADD CONSTRAINT valid_user_rating 
  CHECK (user_rating IS NULL OR (user_rating >= 1 AND user_rating <= 5));

-- 4. Rename item_ids to outfit_items for consistency with the service
ALTER TABLE public.outfits RENAME COLUMN item_ids TO outfit_items;

-- 5. Update existing data to have outfit_data (if there are existing records)
-- This creates a basic outfit_data structure from existing fields
UPDATE public.outfits 
SET outfit_data = jsonb_build_object(
  'id', id::text,
  'vibe', COALESCE(occasion, 'casual'),
  'dominantColors', '[]'::jsonb,
  'tags', '[]'::jsonb,
  'score', COALESCE(user_rating * 20, 75), -- Convert 1-5 rating to 0-100 score
  'colorHarmony', 75,
  'completeness', 85,
  'styleCoherence', 80,
  'items', '[]'::jsonb -- This would need to be populated with actual item data
)
WHERE outfit_data IS NULL;

-- 6. Make outfit_data NOT NULL after populating existing records
ALTER TABLE public.outfits ALTER COLUMN outfit_data SET NOT NULL;

-- 7. Update the service to use the existing table by renaming it
-- Option A: Rename the table to saved_outfits
-- ALTER TABLE public.outfits RENAME TO saved_outfits;

-- Option B: Keep the table as 'outfits' and update the service code instead
-- (See the code changes below)

-- 8. Add new indexes for better performance
CREATE INDEX IF NOT EXISTS idx_outfits_user_rating_not_null 
  ON public.outfits(user_rating) WHERE user_rating IS NOT NULL;

-- 9. Keep the existing trigger but ensure it works
-- The trigger should already exist and work fine

COMMENT ON TABLE public.outfits IS 'Saved outfit combinations with user ratings and notes';
