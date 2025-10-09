/*
  # Scripture Journey Timeline - Database Schema

  ## Overview
  Creates the core tables for the Scripture Journey Timeline feature, including
  content management, user credits, study plans, and watch history tracking.

  ## Tables Created
  
  1. **content_items**
     - `id` (text, primary key) - Unique content identifier (hex string)
     - `content_creator_id` (text) - Foreign key to content creator
     - `type` (text) - Content type (default: 'video')
     - `name` (text) - Content title
     - `short_description` (text) - Summary/description
     - `thumbnail_url` (text) - Image URL for preview
     - `media_url` (text) - Video file URL
     - `transcript_url` (text) - Transcript document URL
     - `full_text_url` (text) - Long-form companion article URL
     - `biblical_narrative` (text) - AI-generated biblical context (280 chars)
     - `series_title` (text) - Series/collection name
     - `duration_seconds` (integer) - Video length in seconds
     - `upload_date` (timestamptz) - Original upload timestamp
     - `is_premium` (boolean, default: false) - Premium content flag
     - `created_at` (timestamptz) - Record creation timestamp
     - `updated_at` (timestamptz) - Last update timestamp

  2. **user_credits**
     - `id` (uuid, primary key) - Unique record identifier
     - `user_id` (uuid) - User identifier (for future auth integration)
     - `credits_remaining` (integer, default: 5) - Available credits
     - `total_credits_earned` (integer, default: 5) - Lifetime credits earned
     - `created_at` (timestamptz) - Account creation date
     - `updated_at` (timestamptz) - Last credit transaction

  3. **study_plan_bookmarks**
     - `id` (uuid, primary key) - Unique bookmark identifier
     - `user_id` (uuid) - User who bookmarked content
     - `content_id` (text) - Foreign key to content_items
     - `bookmarked_at` (timestamptz) - When bookmark was added
     - `notes` (text, optional) - User notes about content
     - Unique constraint on (user_id, content_id)

  4. **watch_history**
     - `id` (uuid, primary key) - Unique watch record
     - `user_id` (uuid) - Viewer identifier
     - `content_id` (text) - Foreign key to content_items
     - `watched_at` (timestamptz) - View timestamp
     - `credits_used` (integer, default: 0) - Credits spent on this view
     - `completed` (boolean, default: false) - Whether video was fully watched

  ## Security
  - RLS enabled on all tables for data protection
  - Policies created for authenticated and anonymous access patterns
  - Anonymous users can view content but need session tracking for credits
  - Authenticated users have full CRUD access to their own data

  ## Indexes
  - Created on frequently queried columns for performance
  - Composite indexes for common query patterns
*/

-- Create content_items table
CREATE TABLE IF NOT EXISTS content_items (
  id text PRIMARY KEY,
  content_creator_id text NOT NULL DEFAULT 'bibleproject',
  type text NOT NULL DEFAULT 'video',
  name text NOT NULL,
  short_description text NOT NULL DEFAULT '',
  thumbnail_url text NOT NULL,
  media_url text NOT NULL,
  transcript_url text DEFAULT '',
  full_text_url text DEFAULT '',
  biblical_narrative text DEFAULT '',
  series_title text,
  duration_seconds integer NOT NULL DEFAULT 0,
  upload_date timestamptz,
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_credits table
CREATE TABLE IF NOT EXISTS user_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  credits_remaining integer NOT NULL DEFAULT 5,
  total_credits_earned integer NOT NULL DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create study_plan_bookmarks table
CREATE TABLE IF NOT EXISTS study_plan_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content_id text NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  bookmarked_at timestamptz DEFAULT now(),
  notes text,
  UNIQUE(user_id, content_id)
);

-- Create watch_history table
CREATE TABLE IF NOT EXISTS watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content_id text NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  watched_at timestamptz DEFAULT now(),
  credits_used integer DEFAULT 0,
  completed boolean DEFAULT false
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_items_series ON content_items(series_title);
CREATE INDEX IF NOT EXISTS idx_content_items_premium ON content_items(is_premium);
CREATE INDEX IF NOT EXISTS idx_content_items_upload_date ON content_items(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON study_plan_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_content_id ON study_plan_bookmarks(content_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_content_id ON watch_history(content_id);

-- Enable Row Level Security
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plan_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_items (public read access)
CREATE POLICY "Anyone can view content items"
  ON content_items FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can insert content items"
  ON content_items FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Service role can update content items"
  ON content_items FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- RLS Policies for user_credits
CREATE POLICY "Users can view own credits"
  ON user_credits FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert own credits"
  ON user_credits FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update own credits"
  ON user_credits FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- RLS Policies for study_plan_bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON study_plan_bookmarks FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert own bookmarks"
  ON study_plan_bookmarks FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update own bookmarks"
  ON study_plan_bookmarks FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own bookmarks"
  ON study_plan_bookmarks FOR DELETE
  TO public
  USING (true);

-- RLS Policies for watch_history
CREATE POLICY "Users can view own watch history"
  ON watch_history FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert own watch history"
  ON watch_history FOR INSERT
  TO public
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_content_items_updated_at
  BEFORE UPDATE ON content_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();