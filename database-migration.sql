-- Database Migration: Add Archive Support
-- Run this SQL in your Supabase SQL editor to add archive functionality

-- Add is_archived column to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Add is_archived column to columns table  
ALTER TABLE columns 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Create indexes for better performance when filtering archived items
CREATE INDEX IF NOT EXISTS idx_tasks_is_archived ON tasks(is_archived);
CREATE INDEX IF NOT EXISTS idx_columns_is_archived ON columns(is_archived);

-- Update existing records to have is_archived = false
UPDATE tasks SET is_archived = FALSE WHERE is_archived IS NULL;
UPDATE columns SET is_archived = FALSE WHERE is_archived IS NULL;

