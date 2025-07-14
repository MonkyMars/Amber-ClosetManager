-- SQL to modify the existing 'outfits' table to align with 'saved_outfits' structure
-- This will update the existing table to match what your app expects

-- 1. Rename the table to saved_outfits
ALTER TABLE public.outfits RENAME TO saved_outfits;

-- 2. Rename/modify columns to match the expected structure
ALTER TABLE public.saved_outfits RENAME COLUMN item_ids TO outfit_items;
ALTER TABLE public.saved_outfits RENAME COLUMN compatibility_score TO user_rating;

-- 3. Add the outfit_data column (JSONB to store the full outfit object)
ALTER TABLE public.saved_outfits ADD COLUMN outfit_data JSONB NOT NULL DEFAULT '{}';

-- 4. Rename notes column if it doesn't exist, or add it
-- (The existing table doesn't have notes, so we add it)
ALTER TABLE public.saved_outfits ADD COLUMN notes TEXT;

-- 5. Update constraints to match new structure
-- Remove old constraints
ALTER TABLE public.saved_outfits DROP CONSTRAINT IF EXISTS valid_outfit_score;
ALTER TABLE public.saved_outfits DROP CONSTRAINT IF EXISTS valid_outfit_item_ids;
ALTER TABLE public.saved_outfits DROP CONSTRAINT IF EXISTS outfits_item_ids_check;
ALTER TABLE public.saved_outfits DROP CONSTRAINT IF EXISTS non_negative_worn_count;

-- Add new constraints
ALTER TABLE public.saved_outfits ADD CONSTRAINT valid_user_rating 
  CHECK (user_rating IS NULL OR (user_rating >= 1 AND user_rating <= 5));

-- 6. Drop columns that are not needed for saved_outfits
ALTER TABLE public.saved_outfits DROP COLUMN IF EXISTS name;
ALTER TABLE public.saved_outfits DROP COLUMN IF EXISTS description;
ALTER TABLE public.saved_outfits DROP COLUMN IF EXISTS occasion;
ALTER TABLE public.saved_outfits DROP COLUMN IF EXISTS is_favorite;
ALTER TABLE public.saved_outfits DROP COLUMN IF EXISTS worn_count;
ALTER TABLE public.saved_outfits DROP COLUMN IF EXISTS last_worn_at;

-- 7. Update indexes to match saved_outfits structure
-- Drop old indexes
DROP INDEX IF EXISTS public.idx_outfits_items_gin;
DROP INDEX IF EXISTS public.idx_outfits_occasion;
DROP INDEX IF EXISTS public.idx_outfits_score;
DROP INDEX IF EXISTS public.idx_outfits_favorite;
DROP INDEX IF EXISTS public.idx_outfits_worn_count;
DROP INDEX IF EXISTS public.idx_outfits_last_worn;
DROP INDEX IF EXISTS public.idx_outfits_created_at;
DROP INDEX IF EXISTS public.idx_outfits_updated_at;
DROP INDEX IF EXISTS public.idx_outfits_occasion_score;
DROP INDEX IF EXISTS public.idx_outfits_favorite_worn;
DROP INDEX IF EXISTS public.idx_outfits_created_timestamp;

-- Create new indexes for saved_outfits
CREATE INDEX idx_saved_outfits_created_at ON public.saved_outfits(created_at DESC);
CREATE INDEX idx_saved_outfits_user_rating ON public.saved_outfits(user_rating) WHERE user_rating IS NOT NULL;
CREATE INDEX idx_saved_outfits_outfit_items ON public.saved_outfits USING GIN(outfit_items);

-- 8. Update the trigger name to match saved_outfits
DROP TRIGGER IF EXISTS update_outfits_updated_at ON public.saved_outfits;
CREATE TRIGGER update_saved_outfits_updated_at 
  BEFORE UPDATE ON public.saved_outfits 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 9. Enable RLS if you want it
ALTER TABLE public.saved_outfits ENABLE ROW LEVEL SECURITY;

-- Optional: Add RLS policies (uncomment if you have user authentication)
-- CREATE POLICY "Users can view their own saved outfits" ON public.saved_outfits
--   FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "Users can insert their own saved outfits" ON public.saved_outfits
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update their own saved outfits" ON public.saved_outfits
--   FOR UPDATE USING (auth.uid() = user_id);

-- CREATE POLICY "Users can delete their own saved outfits" ON public.saved_outfits
--   FOR DELETE USING (auth.uid() = user_id);

-- Note: If you have user authentication, you may want to add a user_id column:
-- ALTER TABLE public.saved_outfits ADD COLUMN user_id UUID REFERENCES auth.users(id);
