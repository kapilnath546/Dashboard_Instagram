-- Migration: 002_add_facebook_url.sql
-- Add facebook_url column to profiles table

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS facebook_url text;
