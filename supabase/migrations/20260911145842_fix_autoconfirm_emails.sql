/*
# Fix: Auto-confirm emails on signup

## Problem
Supabase email confirmation is enabled by default. When a user registers, their
account is created in auth.users but email_confirmed_at stays NULL. Since no
email server is configured, the confirmation email is never sent, and users
can never log in — the login fails with "Email not confirmed."

## Fix
Update the handle_new_user trigger function to also set email_confirmed_at
to now() immediately after a new user is created, bypassing the email
confirmation requirement entirely.

## Changes
- Modified: public.handle_new_user() — now also sets email_confirmed_at on the new auth user
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, auth
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

  -- Auto-confirm the email so users can log in immediately
  UPDATE auth.users SET email_confirmed_at = now() WHERE id = NEW.id;

  RETURN NEW;
END;
$$;