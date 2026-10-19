-- ============================================
-- Lead pipeline (run after billing.sql)
-- ============================================
-- Contractors move each lead through New -> Contacted -> Booked -> Won/Lost
-- and record the job value when they win it, so the dashboard can show how
-- much revenue LeadFast leads brought in.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS job_value NUMERIC(12, 2);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ;
ALTER TABLE leads ALTER COLUMN status SET DEFAULT 'New';

-- Older rows used other labels.
UPDATE leads SET status = 'New' WHERE status IS NULL OR status IN ('received', 'Received');
UPDATE leads SET status = 'Contacted' WHERE status = 'Follow-up';

-- Leads are now written only by the server (service role). The owner UPDATE
-- policy let a contractor reset leads.auto_replied from the browser and get
-- around the monthly reply cap; status changes go through PATCH /api/leads/[id].
DROP POLICY IF EXISTS "Users can update their leads" ON leads;
DROP POLICY IF EXISTS "Users can create leads" ON leads;
