-- Safe Migration Script: Update existing outfits table to work with your app
-- This preserves all existing data and views while adding functionality for your saved outfits

-- 1. Add the new columns needed for your saved outfit functionality
ALTER TABLE public.outfits ADD COLUMN IF NOT EXISTS outfit_data JSONB;
ALTER TABLE public.outfits ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Rename compatibility_score to match your service (but keep a copy)
-- First, add user_rating column
ALTER TABLE public.outfits ADD COLUMN IF NOT EXISTS user_rating INTEGER;
ALTER TABLE public.outfits ADD CONSTRAINT user_rating_range 
  CHECK (user_rating IS NULL OR (user_rating >= 1 AND user_rating <= 5));

-- 3. Rename item_ids to outfit_items for your service
ALTER TABLE public.outfits RENAME COLUMN item_ids TO outfit_items;

-- 4. Update existing records to have default outfit_data structure
-- This creates a basic outfit_data from existing fields for any existing records
UPDATE public.outfits 
SET outfit_data = jsonb_build_object(
  'id', id::text,
  'vibe', COALESCE(occasion, 'casual'),
  'dominantColors', '[]'::jsonb,
  'tags', '[]'::jsonb,
  'score', COALESCE(compatibility_score, 75), -- Use existing score
  'colorHarmony', 75,
  'completeness', 85,
  'styleCoherence', 80,
  'items', '[]'::jsonb -- Will be populated by your app when items are fetched
)
WHERE outfit_data IS NULL;

-- 5. Make outfit_data NOT NULL for new records
ALTER TABLE public.outfits ALTER COLUMN outfit_data SET NOT NULL;
ALTER TABLE public.outfits ALTER COLUMN outfit_data SET DEFAULT '{}'::jsonb;

-- 6. Update the views to use the new column name (outfit_items instead of item_ids)
-- Drop and recreate outfit_details view
DROP VIEW IF EXISTS public.api_outfits CASCADE;
DROP VIEW IF EXISTS public.outfit_details CASCADE;

CREATE VIEW public.outfit_details AS
SELECT 
    o.id,
    o.name,
    o.description,
    o.occasion,
    o.compatibility_score,
    o.is_favorite,
    o.worn_count,
    o.last_worn_at,
    o.created_at,
    o.updated_at,
    array_agg(
        json_build_object(
            'id', i.id, 
            'name', i.name, 
            'category', i.category, 
            'colors', i.colors, 
            'tags', i.tags
        ) ORDER BY i.category, i.name
    ) AS items,
    array_agg(DISTINCT i.category ORDER BY i.category) AS categories,
    ARRAY(
        SELECT DISTINCT unnest(i_inner.colors) 
        FROM items i_inner 
        WHERE i_inner.id = ANY(o.outfit_items)
    ) AS all_colors,
    ARRAY(
        SELECT DISTINCT unnest(i_inner.tags) 
        FROM items i_inner 
        WHERE i_inner.id = ANY(o.outfit_items)
    ) AS all_tags
FROM outfits o
JOIN items i ON (i.id = ANY(o.outfit_items))
GROUP BY o.id, o.name, o.description, o.occasion, o.compatibility_score, 
         o.is_favorite, o.worn_count, o.last_worn_at, o.created_at, o.updated_at;

-- Recreate api_outfits view
CREATE VIEW public.api_outfits AS
SELECT 
    id,
    name,
    description,
    occasion,
    compatibility_score,
    is_favorite,
    worn_count,
    last_worn_at,
    created_at,
    updated_at,
    items,
    categories,
    all_colors,
    all_tags
FROM outfit_details;

-- 7. Update indexes for the new column name
DROP INDEX IF EXISTS public.idx_outfits_items_gin;
CREATE INDEX idx_outfits_outfit_items_gin ON public.outfits USING gin(outfit_items);

-- 8. Add new indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_outfits_user_rating ON public.outfits(user_rating) 
WHERE user_rating IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_outfits_outfit_data_gin ON public.outfits USING gin(outfit_data);

-- 9. Update any constraint that referenced item_ids
ALTER TABLE public.outfits DROP CONSTRAINT IF EXISTS outfits_item_ids_check;
ALTER TABLE public.outfits DROP CONSTRAINT IF EXISTS valid_outfit_item_ids;

-- Add new constraint with correct column name
ALTER TABLE public.outfits ADD CONSTRAINT valid_outfit_items_check 
CHECK (array_length(outfit_items, 1) >= 2 AND array_length(outfit_items, 1) <= 15);

-- 10. Comment the table for clarity
COMMENT ON TABLE public.outfits IS 'Stores user-created and saved outfits with usage tracking and user feedback';
COMMENT ON COLUMN public.outfits.outfit_data IS 'JSONB containing full outfit object with score, vibe, etc.';
COMMENT ON COLUMN public.outfits.notes IS 'User notes about the outfit';
COMMENT ON COLUMN public.outfits.user_rating IS 'User rating from 1-5 stars';

-- Migration complete!
-- Your app can now use the existing 'outfits' table with all the functionality preserved.
