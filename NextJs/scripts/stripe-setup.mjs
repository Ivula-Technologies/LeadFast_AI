// Creates the LeadFast AI product, its two monthly prices and the billing
// webhook in Stripe, then prints the env vars to paste into cPanel.
//
//   STRIPE_SECRET_KEY=sk_test_... APP_URL=https://leadfast.ivulatechnologies.com \
//     node scripts/stripe-setup.mjs
//
// Refuses live keys unless --live is passed. Safe to re-run: it reuses the
// product, prices and webhook it finds instead of creating duplicates.
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
const appUrl = (process.env.APP_URL || "https://leadfast.ivulatechnologies.com").replace(/\/$/, "");
const live = process.argv.includes("--live");

if (!key) {
  console.error("Set STRIPE_SECRET_KEY first.");
  process.exit(1);
}
if (key.startsWith("sk_live") && !live) {
  console.error("This is a live key. Re-run with --live if you really mean to create live objects.");
  process.exit(1);
}

const stripe = new Stripe(key);

const PLANS = [
  { lookup: "leadfast_starter_monthly", nickname: "Starter", amount: 4900, env: "STRIPE_PRICE_STARTER" },
  { lookup: "leadfast_pro_monthly", nickname: "Pro", amount: 9900, env: "STRIPE_PRICE_PRO" },
];

const EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
];

const existing = await stripe.products.search({ query: "metadata['app']:'leadfast'" });
const product =
  existing.data[0] ??
  (await stripe.products.create({ name: "LeadFast AI", metadata: { app: "leadfast" } }));

const out = {};
for (const plan of PLANS) {
  const found = await stripe.prices.list({ lookup_keys: [plan.lookup], active: true });
  const price =
    found.data[0] ??
    (await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: plan.amount,
      recurring: { interval: "month" },
      nickname: plan.nickname,
      lookup_key: plan.lookup,
    }));
  out[plan.env] = price.id;
}

const webhookUrl = `${appUrl}/api/billing/webhook`;
const hooks = await stripe.webhookEndpoints.list({ limit: 100 });
let secret = "(already exists; copy its signing secret from the Stripe dashboard)";
if (!hooks.data.some((h) => h.url === webhookUrl)) {
  const hook = await stripe.webhookEndpoints.create({ url: webhookUrl, enabled_events: EVENTS });
  secret = hook.secret;
}
out.STRIPE_WEBHOOK_SECRET = secret;

console.log(`\nStripe ${key.startsWith("sk_live") ? "LIVE" : "test"} setup done. Add these to cPanel:\n`);
for (const [name, value] of Object.entries(out)) console.log(`${name}=${value}`);
console.log("\nAlso turn on the customer portal: Settings > Billing > Customer portal.");
