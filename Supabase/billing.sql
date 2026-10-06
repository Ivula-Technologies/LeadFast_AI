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
