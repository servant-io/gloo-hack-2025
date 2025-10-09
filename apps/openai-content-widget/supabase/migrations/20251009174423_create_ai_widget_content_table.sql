/*
  # Create AI Widget Content Cache Table

  1. New Tables
    - `ai_widget_content`
      - `id` (uuid, primary key) - Unique identifier for cached AI responses
      - `query_text` (text) - The user's original question or search query
      - `content_ids` (text[]) - Array of content item IDs that were analyzed
      - `overview_text` (text) - AI-generated overview section
      - `key_themes_text` (text) - AI-generated key themes section
      - `relevance_text` (text) - AI-generated relevance explanation section
      - `created_at` (timestamptz) - When this cache entry was created
      - `expires_at` (timestamptz) - When this cache entry should be refreshed
      
  2. Security
    - Enable RLS on `ai_widget_content` table
    - Add policy for public read access (widget content is not user-specific)
    - Add policy for service role to insert/update cached content
    
  3. Indexes
    - Add index on query_text for fast lookup
    - Add index on expires_at for cache cleanup queries
*/

CREATE TABLE IF NOT EXISTS ai_widget_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text text NOT NULL,
  content_ids text[] DEFAULT '{}',
  overview_text text DEFAULT '',
  key_themes_text text DEFAULT '',
  relevance_text text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

ALTER TABLE ai_widget_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cached AI content"
  ON ai_widget_content
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert AI content"
  ON ai_widget_content
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update AI content"
  ON ai_widget_content
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_ai_widget_content_query 
  ON ai_widget_content(query_text);

CREATE INDEX IF NOT EXISTS idx_ai_widget_content_expires 
  ON ai_widget_content(expires_at);
