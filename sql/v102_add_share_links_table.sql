-- Migration: Add share_links table for 2FA code sharing feature
-- Run this SQL in your Supabase SQL Editor

-- Create the share_links table
CREATE TABLE IF NOT EXISTS share_links (
  id SERIAL PRIMARY KEY,
  short_link VARCHAR(16) NOT NULL UNIQUE,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_share_links_short_link ON share_links(short_link);
CREATE INDEX IF NOT EXISTS idx_share_links_account_id ON share_links(account_id);

-- Ensure only one share link per account
CREATE UNIQUE INDEX IF NOT EXISTS idx_share_links_account_unique ON share_links(account_id);
