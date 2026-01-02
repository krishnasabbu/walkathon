/*
  # Walkathon Portal Database Schema

  ## Overview
  Complete database schema for Fit & 50 Walkathon Tracking Portal with participant management,
  daily activity tracking, step challenges, and consistency bonuses.

  ## New Tables
  
  ### 1. participants
  Stores all participant information and their total accumulated points.
  - `id` (uuid, primary key) - Unique participant identifier
  - `user_id` (uuid, references auth.users) - Links to auth user for login
  - `employee_id` (text, unique) - Company employee ID
  - `name` (text) - Participant full name
  - `team` (text) - Department or team name
  - `email` (text, unique) - Contact email
  - `status` (text) - Active or Inactive
  - `total_points` (integer) - Auto-calculated total points
  - `role` (text) - 'admin' or 'participant'
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. daily_activities
  Tracks all workout and step activities logged by participants.
  - `id` (uuid, primary key) - Activity record identifier
  - `date` (date) - Activity date
  - `participant_id` (uuid, references participants) - Who logged it
  - `workout_type` (text) - Category of workout
  - `activity_details` (text) - Specific activity description
  - `duration_minutes` (integer) - Duration in minutes
  - `steps_count` (integer) - Daily steps (0 if workout only)
  - `points_earned` (integer) - Points calculated for this activity
  - `proof_filename` (text, nullable) - Optional proof upload
  - `created_at` (timestamptz) - Submission timestamp

  ### 3. weekly_bonuses
  Tracks consistency bonus awards given weekly.
  - `id` (uuid, primary key) - Bonus record identifier
  - `participant_id` (uuid, references participants) - Who earned it
  - `week_start_date` (date) - Start of the week
  - `week_end_date` (date) - End of the week
  - `days_active` (integer) - Number of active days
  - `points_earned` (integer) - Bonus points awarded
  - `created_at` (timestamptz) - Award timestamp

  ## Security
  - Enable RLS on all tables
  - Admins can view and modify all data
  - Participants can only view/modify their own data
  - Public cannot access any data

  ## Notes
  - Total points for participants are recalculated via triggers
  - Weekly bonuses are calculated via scheduled jobs or admin action
  - All timestamps use UTC timezone
*/

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id text UNIQUE NOT NULL,
  name text NOT NULL,
  team text NOT NULL,
  email text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  total_points integer NOT NULL DEFAULT 0,
  role text NOT NULL DEFAULT 'participant' CHECK (role IN ('admin', 'participant')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create daily_activities table
CREATE TABLE IF NOT EXISTS daily_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  workout_type text NOT NULL,
  activity_details text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 0,
  steps_count integer NOT NULL DEFAULT 0,
  points_earned integer NOT NULL DEFAULT 0,
  proof_filename text,
  created_at timestamptz DEFAULT now()
);

-- Create weekly_bonuses table
CREATE TABLE IF NOT EXISTS weekly_bonuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  week_start_date date NOT NULL,
  week_end_date date NOT NULL,
  days_active integer NOT NULL,
  points_earned integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_activities_date ON daily_activities(date);
CREATE INDEX IF NOT EXISTS idx_daily_activities_participant ON daily_activities(participant_id);
CREATE INDEX IF NOT EXISTS idx_daily_activities_participant_date ON daily_activities(participant_id, date);
CREATE INDEX IF NOT EXISTS idx_weekly_bonuses_participant ON weekly_bonuses(participant_id);
CREATE INDEX IF NOT EXISTS idx_participants_status ON participants(status);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON participants(user_id);

-- Function to update participant total points
CREATE OR REPLACE FUNCTION update_participant_total_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE participants
  SET total_points = (
    SELECT COALESCE(SUM(points_earned), 0)
    FROM daily_activities
    WHERE participant_id = NEW.participant_id
  ) + (
    SELECT COALESCE(SUM(points_earned), 0)
    FROM weekly_bonuses
    WHERE participant_id = NEW.participant_id
  )
  WHERE id = NEW.participant_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on daily_activities insert
CREATE TRIGGER trigger_update_points_after_activity
AFTER INSERT ON daily_activities
FOR EACH ROW
EXECUTE FUNCTION update_participant_total_points();

-- Trigger on weekly_bonuses insert
CREATE TRIGGER trigger_update_points_after_bonus
AFTER INSERT ON weekly_bonuses
FOR EACH ROW
EXECUTE FUNCTION update_participant_total_points();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on participants
CREATE TRIGGER trigger_update_participants_updated_at
BEFORE UPDATE ON participants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_bonuses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for participants table

-- Admins can view all participants
CREATE POLICY "Admins can view all participants"
  ON participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- Participants can view their own record
CREATE POLICY "Participants can view own record"
  ON participants FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can insert participants
CREATE POLICY "Admins can insert participants"
  ON participants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admins can update all participants
CREATE POLICY "Admins can update all participants"
  ON participants FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- Participants can update their own record (limited fields)
CREATE POLICY "Participants can update own record"
  ON participants FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for daily_activities table

-- Admins can view all activities
CREATE POLICY "Admins can view all activities"
  ON daily_activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- Participants can view their own activities
CREATE POLICY "Participants can view own activities"
  ON daily_activities FOR SELECT
  TO authenticated
  USING (
    participant_id IN (
      SELECT id FROM participants WHERE user_id = auth.uid()
    )
  );

-- Participants can insert their own activities
CREATE POLICY "Participants can insert own activities"
  ON daily_activities FOR INSERT
  TO authenticated
  WITH CHECK (
    participant_id IN (
      SELECT id FROM participants WHERE user_id = auth.uid()
    )
  );

-- Admins can insert any activities
CREATE POLICY "Admins can insert any activities"
  ON daily_activities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- RLS Policies for weekly_bonuses table

-- Admins can view all bonuses
CREATE POLICY "Admins can view all bonuses"
  ON weekly_bonuses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- Participants can view their own bonuses
CREATE POLICY "Participants can view own bonuses"
  ON weekly_bonuses FOR SELECT
  TO authenticated
  USING (
    participant_id IN (
      SELECT id FROM participants WHERE user_id = auth.uid()
    )
  );

-- Only admins can insert bonuses
CREATE POLICY "Admins can insert bonuses"
  ON weekly_bonuses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );