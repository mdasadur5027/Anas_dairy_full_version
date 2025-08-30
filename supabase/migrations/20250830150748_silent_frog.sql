/*
  # Fix Reviews RLS Policies

  1. Security Updates
    - Fix RLS policies for reviews table
    - Ensure proper access control for reading reviews with user data
    - Allow public access to reviews for homepage display

  2. Changes
    - Update review policies to allow joins with users table
    - Ensure reviews can be read publicly for testimonials
*/

-- Drop existing review policies
DROP POLICY IF EXISTS "Anyone can read reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;

-- Create new review policies
CREATE POLICY "Public can read reviews" ON reviews
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Ensure one review per user constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'reviews_user_id_unique'
    AND table_name = 'reviews'
  ) THEN
    ALTER TABLE reviews ADD CONSTRAINT reviews_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- Add comment length constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'reviews_comment_length'
  ) THEN
    ALTER TABLE reviews ADD CONSTRAINT reviews_comment_length CHECK (length(comment) >= 10 AND length(comment) <= 500);
  END IF;
END $$;