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
