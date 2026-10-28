-- ============================================================
-- LeadFast AI: complete database setup (one paste)
-- ============================================================
-- Supabase > SQL Editor > New query > paste this whole file > Run.
-- It is schema.sql, rls.sql, billing.sql, pipeline.sql and push.sql in order,
-- and is safe to run again on an existing project.
-- Generated from those four files; edit them, not this one.


-- ===================== schema.sql =====================
-- ============================================
-- Enable UUID generation
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- Businesses Table
-- ============================================

CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    trade TEXT,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    plan TEXT DEFAULT 'starter',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Leads Table
-- ============================================

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    lead_name TEXT,
    lead_email TEXT,
    lead_phone TEXT,
    message TEXT,
    status TEXT DEFAULT 'received',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- AI Responses Table
-- ============================================

CREATE TABLE IF NOT EXISTS ai_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    generated_text TEXT NOT NULL,
    model_used TEXT DEFAULT 'claude-haiku',
    sent_at TIMESTAMPTZ,
    delivery_status TEXT
);

-- ============================================
-- Settings Table
-- ============================================

CREATE TABLE IF NOT EXISTS settings (
    business_id UUID PRIMARY KEY REFERENCES businesses(id) ON DELETE CASCADE,
    reply_tone TEXT DEFAULT 'friendly_professional',
    sms_alerts_enabled BOOLEAN DEFAULT FALSE,
    custom_signature TEXT
);
-- ===================== rls.sql =====================
-- ============================================
-- Enable Row Level Security
-- ============================================

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BUSINESSES
-- ============================================

DROP POLICY IF EXISTS "Users can view their business" ON businesses;
CREATE POLICY "Users can view their business"
ON businesses
FOR SELECT
TO authenticated
USING (
    owner_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can create their business" ON businesses;
CREATE POLICY "Users can create their business"
ON businesses
FOR INSERT
TO authenticated
WITH CHECK (
    owner_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can update their business" ON businesses;
CREATE POLICY "Users can update their business"
ON businesses
FOR UPDATE
TO authenticated
USING (
    owner_id = auth.uid()
)
WITH CHECK (
    owner_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can delete their business" ON businesses;
CREATE POLICY "Users can delete their business"
ON businesses
FOR DELETE
TO authenticated
USING (
    owner_id = auth.uid()
);

-- ============================================
-- LEADS
-- ============================================

DROP POLICY IF EXISTS "Users can view their leads" ON leads;
CREATE POLICY "Users can view their leads"
ON leads
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM businesses
        WHERE businesses.id = leads.business_id
        AND businesses.owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can create leads" ON leads;
CREATE POLICY "Users can create leads"
ON leads
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM businesses
        WHERE businesses.id = leads.business_id
        AND businesses.owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can update their leads" ON leads;
CREATE POLICY "Users can update their leads"
ON leads
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM businesses
        WHERE businesses.id = leads.business_id
        AND businesses.owner_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM businesses
        WHERE businesses.id = leads.business_id
        AND businesses.owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can delete their leads" ON leads;
CREATE POLICY "Users can delete their leads"
ON leads
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM businesses
        WHERE businesses.id = leads.business_id
        AND businesses.owner_id = auth.uid()
    )
);

-- ============================================
-- AI RESPONSES
-- ============================================

DROP POLICY IF EXISTS "Users can view their AI responses" ON ai_responses;
CREATE POLICY "Users can view their AI responses"
ON ai_responses
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM leads
        JOIN businesses
        ON businesses.id = leads.business_id
        WHERE leads.id = ai_responses.lead_id
        AND businesses.owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can create AI responses" ON ai_responses;
CREATE POLICY "Users can create AI responses"
ON ai_responses
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM leads
        JOIN businesses
        ON businesses.id = leads.business_id
        WHERE leads.id = ai_responses.lead_id
        AND businesses.owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can update their AI responses" ON ai_responses;
CREATE POLICY "Users can update their AI responses"
ON ai_responses
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM leads
        JOIN businesses
        ON businesses.id = leads.business_id
        WHERE leads.id = ai_responses.lead_id
        AND businesses.owner_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM leads
        JOIN businesses
        ON businesses.id = leads.business_id
        WHERE leads.id = ai_responses.lead_id
        AND businesses.owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can delete their AI responses" ON ai_responses;
CREATE POLICY "Users can delete their AI responses"
ON ai_responses
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM leads
        JOIN businesses
        ON businesses.id = leads.business_id
        WHERE leads.id = ai_responses.lead_id
        AND businesses.owner_id = auth.uid()
    )
);

-- ============================================
-- SETTINGS
-- ============================================

DROP POLICY IF EXISTS "Users can view their settings" ON settings;
CREATE POLICY "Users can view their settings"
ON settings
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM businesses
        WHERE businesses.id = settings.business_id
        AND businesses.owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can create their settings" ON settings;
CREATE POLICY "Users can create their settings"
ON settings
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM businesses
        WHERE businesses.id = settings.business_id
        AND businesses.owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can update their settings" ON settings;
CREATE POLICY "Users can update their settings"
ON settings
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM businesses
        WHERE businesses.id = settings.business_id
        AND businesses.owner_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM businesses
        WHERE businesses.id = settings.business_id
        AND businesses.owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can delete their settings" ON settings;
CREATE POLICY "Users can delete their settings"
ON settings
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM businesses
        WHERE businesses.id = settings.business_id
        AND businesses.owner_id = auth.uid()
    )
);
-- ===================== billing.sql =====================
-- ============================================
-- Billing (run after schema.sql and rls.sql)
-- ============================================
-- One row per business. Written only by the server (service role) from
-- Stripe webhooks; contractors can read their own row but never change it,
-- so nobody can grant themselves a plan from the browser.

CREATE TABLE IF NOT EXISTS billing (
    business_id UUID PRIMARY KEY REFERENCES businesses(id) ON DELETE CASCADE,
    plan TEXT,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_price_id TEXT,
    subscription_status TEXT,
    current_period_end TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE billing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their billing" ON billing;
CREATE POLICY "Users can view their billing"
ON billing
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM businesses
        WHERE businesses.id = billing.business_id
        AND businesses.owner_id = auth.uid()
    )
);

-- No INSERT/UPDATE/DELETE policies: only the service role writes billing.

-- businesses.plan is editable by its owner, so the app no longer trusts it.
-- The paid plan lives in billing.plan.
ALTER TABLE businesses ALTER COLUMN plan SET DEFAULT NULL;

-- Marks leads that received an automatic AI reply (counts toward plan caps).
ALTER TABLE leads ADD COLUMN IF NOT EXISTS auto_replied BOOLEAN DEFAULT FALSE;

-- Used by the monthly auto-reply cap.
CREATE INDEX IF NOT EXISTS leads_business_created_idx ON leads (business_id, created_at DESC);

-- A business with a live subscription can't be deleted, otherwise Stripe would
-- keep charging for a workspace that no longer exists.
CREATE OR REPLACE FUNCTION prevent_delete_with_active_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM billing
        WHERE billing.business_id = OLD.id
        AND billing.subscription_status IN ('active', 'trialing', 'past_due')
    ) THEN
        RAISE EXCEPTION 'Cancel this business''s subscription under Manage billing before deleting it.';
    END IF;
    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS businesses_block_delete_when_subscribed ON businesses;
CREATE TRIGGER businesses_block_delete_when_subscribed
BEFORE DELETE ON businesses
FOR EACH ROW EXECUTE FUNCTION prevent_delete_with_active_subscription();

-- Atomically claims one automatic reply for a lead against the monthly cap.
-- Locks the business row so concurrent leads can't all pass the same count.
-- p_cap NULL means unlimited. Returns true when the lead may be auto-replied.
CREATE OR REPLACE FUNCTION reserve_auto_reply(p_business_id UUID, p_lead_id UUID, p_cap INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    used INTEGER;
BEGIN
    PERFORM 1 FROM businesses WHERE id = p_business_id FOR UPDATE;

    IF p_cap IS NOT NULL THEN
        SELECT count(*) INTO used
        FROM leads
        WHERE business_id = p_business_id
        AND auto_replied
        AND created_at >= date_trunc('month', now() AT TIME ZONE 'utc') AT TIME ZONE 'utc';

        IF used >= p_cap THEN
            RETURN FALSE;
        END IF;
    END IF;

    UPDATE leads SET auto_replied = TRUE
    WHERE id = p_lead_id AND business_id = p_business_id AND NOT auto_replied;
    RETURN FOUND;
END;
$$;

-- Server (service role) only.
REVOKE EXECUTE ON FUNCTION reserve_auto_reply(UUID, UUID, INTEGER) FROM PUBLIC;
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        EXECUTE 'REVOKE EXECUTE ON FUNCTION reserve_auto_reply(UUID, UUID, INTEGER) FROM anon';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        EXECUTE 'REVOKE EXECUTE ON FUNCTION reserve_auto_reply(UUID, UUID, INTEGER) FROM authenticated';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        EXECUTE 'GRANT EXECUTE ON FUNCTION reserve_auto_reply(UUID, UUID, INTEGER) TO service_role';
    END IF;
END;
$$;

-- ===================== pipeline.sql =====================
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

-- ===================== push.sql =====================
-- ============================================
-- Phone alerts for new leads (run after pipeline.sql)
-- ============================================
-- One row per phone or browser that turned on "New lead alerts" in the app.
-- Written and read only by the server (service role): the browser has no
-- direct access, so RLS is on with no policies.

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS push_subscriptions_business_idx ON push_subscriptions (business_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
