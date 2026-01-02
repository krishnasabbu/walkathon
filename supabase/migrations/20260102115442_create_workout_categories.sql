/*
  # Create workout categories table

  1. New Tables
    - `workout_categories`
      - `id` (uuid, primary key) - Unique identifier for each category
      - `name` (text) - Category name (e.g., "Running", "Cycling")
      - `points_per_minute` (integer) - Points earned per minute of activity
      - `created_at` (timestamptz) - When category was created
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS on `workout_categories` table
    - Add policy for all authenticated users to read categories
    - Add policy for admin users to create/update/delete categories
  
  3. Seed Data
    - Add default categories: Running, Cycling, Swimming, Gym Workout, Yoga
*/

CREATE TABLE IF NOT EXISTS workout_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  points_per_minute integer NOT NULL DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workout_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view workout categories"
  ON workout_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can insert workout categories"
  ON workout_categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants
      WHERE participants.user_id = auth.uid()
      AND participants.role = 'admin'
    )
  );

CREATE POLICY "Admin can update workout categories"
  ON workout_categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM participants
      WHERE participants.user_id = auth.uid()
      AND participants.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants
      WHERE participants.user_id = auth.uid()
      AND participants.role = 'admin'
    )
  );

CREATE POLICY "Admin can delete workout categories"
  ON workout_categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM participants
      WHERE participants.user_id = auth.uid()
      AND participants.role = 'admin'
    )
  );

INSERT INTO workout_categories (name, points_per_minute) VALUES
  ('Running', 7),
  ('Cycling', 6),
  ('Swimming', 8),
  ('Gym Workout', 7),
  ('Yoga', 5)
ON CONFLICT (name) DO NOTHING;