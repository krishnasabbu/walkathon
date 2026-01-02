/*
  # Update daily_activities table for category system

  1. Changes
    - Add `category_id` column to reference workout_categories
    - Remove `steps_count` column (no longer needed in new system)
    - Add index on category_id for better performance
  
  2. Notes
    - workout_type column will remain for backward compatibility
    - New activities will use category_id instead
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_activities' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE daily_activities ADD COLUMN category_id uuid REFERENCES workout_categories(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_activities' AND column_name = 'steps_count'
  ) THEN
    ALTER TABLE daily_activities DROP COLUMN steps_count;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_daily_activities_category_id ON daily_activities(category_id);