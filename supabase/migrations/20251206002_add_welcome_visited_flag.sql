-- Add flag to track if stakeholder has visited the welcome page
ALTER TABLE campaign_assignments
ADD COLUMN IF NOT EXISTS has_visited_welcome BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN campaign_assignments.has_visited_welcome IS 'Tracks if stakeholder has visited the welcome/document upload page';
