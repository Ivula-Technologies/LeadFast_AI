# Deploying LeadFast AI on cPanel

LeadFast runs as a Node.js app (Next.js standalone server) under cPanel's **Setup Node.js App**. It is not a static site: the lead intake, billing and webhook routes need a server.

## 1. Supabase (once)

1. Create a Supabase project.
2. In the SQL editor, run these files from `Supabase/` in order: `schema.sql`, `rls.sql`, `billing.sql`. All three are safe to re-run.
3. Auth > URL Configuration: set **Site URL** to `https://leadfast.ivulatechnologies.com` and add `https://leadfast.ivulatechnologies.com/login` to **Redirect URLs** (used by email confirmation and magic links).

## 2. Resend (once)

Verify a sending domain (for example `leadfast.ivulatechnologies.com`) and set `RESEND_FROM_EMAIL` to an address on it. Without a verified domain, no lead replies or contractor alerts are sent; the app never falls back to Resend's sandbox sender.

## 3. Stripe (once, in test mode first)

1. Create a product **LeadFast AI** with two monthly prices: **Starter $49** and **Pro $99**. Put their IDs in `STRIPE_PRICE_STARTER` and `STRIPE_PRICE_PRO`.
2. Add a webhook endpoint `https://leadfast.ivulatechnologies.com/api/billing/webhook` listening to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

   Copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
3. Settings > Billing > Customer portal: turn it on and allow cancelling and switching between the two prices.

Until the price IDs are set, the dashboard shows the plans as "Coming soon" and everyone stays on the free trial.

## 4. Build the package

Either download the `leadfast-cpanel` artifact from the **Build cPanel Package** GitHub Action (set the `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_APP_URL` repository variables first, since they are baked into the browser bundle), or build locally:

```bash
cd NextJs
npm ci
# with the NEXT_PUBLIC_* values exported
npm run build
mkdir -p ../cpanel-package/.next
cp -a .next/standalone/. ../cpanel-package/
cp -a .next/static ../cpanel-package/.next/static
cp -a public ../cpanel-package/public
```

## 5. cPanel

1. Upload and extract the package into a folder outside `public_html`, e.g. `~/leadfast`.
2. **Setup Node.js App** > Create application: Node.js 20+, mode Production, application root `leadfast`, application URL `leadfast.ivulatechnologies.com`, startup file `server.js`.
3. Add every variable from `NextJs/.env.example` under **Environment variables**, then restart the app.
4. Make sure SSL (AutoSSL) is active on the subdomain.

## 6. Smoke test

- `https://leadfast.ivulatechnologies.com/login` loads; sign up, confirm the email, and land on the dashboard with the trial banner.
- Paste the dashboard's embed snippet into a test HTML page with a form, submit it, and check that the lead appears in the dashboard, the customer gets a reply from your business name, and the contractor email gets a "New lead" alert.
- `curl https://leadfast.ivulatechnologies.com/api/leads?business_id=x` returns **401** (lead data is never public).
- Choose a plan with Stripe test card `4242 4242 4242 4242`; the dashboard should switch to the paid plan within a few seconds.
