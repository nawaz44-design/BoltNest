/*
# BlogNest - Create core schema (profiles, posts, comments)

## Overview
This migration creates the complete database schema for BlogNest, a multi-user
blogging platform. It sets up three tables (profiles, posts, comments) with
proper foreign key relationships, row-level security policies, and database
triggers for automatic profile creation and timestamp updates.

## Tables

### profiles
- `id` (uuid, PK, references auth.users) — the Supabase auth user
- `full_name` (text, not null) — user's display name
- `username` (text, unique, not null) — unique handle
- `email` (text, unique, not null) — email address
- `bio` (text, nullable) — short bio for profile page
- `avatar_url` (text, nullable) — profile picture URL
- `created_at` (timestamptz) — registration timestamp

### posts
- `id` (uuid, PK)
- `title` (text, not null)
- `content` (text, not null)
- `excerpt` (text, nullable) — short description for cards
- `category` (text, not null) — one of: Technology, Programming, Java, Web Development, AI, Career, Education, Lifestyle
- `author_id` (uuid, not null, FK → profiles, defaults to auth.uid())
- `status` (text, not null, default 'published') — 'published' or 'draft'
- `featured_image_url` (text, nullable)
- `tags` (text[], nullable)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

### comments
- `id` (uuid, PK)
- `content` (text, not null)
- `user_id` (uuid, not null, FK → profiles, defaults to auth.uid())
- `post_id` (uuid, not null, FK → posts, ON DELETE CASCADE)
- `created_at` (timestamptz, default now())

## Security (RLS)
- **profiles**: anyone can read (author info is public); users can update only their own profile
- **posts**: anyone can read published posts; owners can read their drafts; only owners can insert/update/delete their posts
- **comments**: anyone can read comments; only authenticated users can create comments; only comment owners can delete their comments

## Triggers
- `on_auth_user_created` — auto-creates a profile row when a new auth user signs up
- `update_posts_updated_at` — auto-updates `updated_at` on post updates
*/

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read profiles (author info is public)
DROP POLICY IF EXISTS "select_profiles" ON profiles;
CREATE POLICY "select_profiles" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

-- Users can update only their own profile
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- POSTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  category text NOT NULL DEFAULT 'Technology',
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  featured_image_url text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts; owners can also read their own drafts
DROP POLICY IF EXISTS "select_posts" ON posts;
CREATE POLICY "select_posts" ON posts FOR SELECT
  TO anon, authenticated
  USING (status = 'published' OR auth.uid() = author_id);

-- Only authenticated users can insert their own posts
DROP POLICY IF EXISTS "insert_own_posts" ON posts;
CREATE POLICY "insert_own_posts" ON posts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);

-- Only owners can update their own posts
DROP POLICY IF EXISTS "update_own_posts" ON posts;
CREATE POLICY "update_own_posts" ON posts FOR UPDATE
  TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

-- Only owners can delete their own posts
DROP POLICY IF EXISTS "delete_own_posts" ON posts;
CREATE POLICY "delete_own_posts" ON posts FOR DELETE
  TO authenticated USING (auth.uid() = author_id);

-- ============================================================
-- COMMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments
DROP POLICY IF EXISTS "select_comments" ON comments;
CREATE POLICY "select_comments" ON comments FOR SELECT
  TO anon, authenticated USING (true);

-- Only authenticated users can insert their own comments
DROP POLICY IF EXISTS "insert_own_comments" ON comments;
CREATE POLICY "insert_own_comments" ON comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Only comment owners can delete their own comments
DROP POLICY IF EXISTS "delete_own_comments" ON comments;
CREATE POLICY "delete_own_comments" ON comments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at on posts
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_posts_updated_at ON posts;
CREATE TRIGGER trigger_update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();