-- Migration: v1.0.1
-- Description: Add remark field to accounts table
-- Date: 2026-02-02

-- Add remark column to accounts table
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS remark text;

-- Add comment for the column
COMMENT ON COLUMN accounts.remark IS 'Account remark/note';
