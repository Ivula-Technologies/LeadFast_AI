// Prints a fresh key pair for phone alerts (Web Push). Run once from NextJs/:
//   node scripts/vapid-keys.mjs
// and paste the three lines into cPanel's environment variables. Keep the
// private key secret; changing the keys later turns off every device's alerts.
import webpush from "web-push";

const { publicKey, privateKey } = webpush.generateVAPIDKeys();
console.log(`VAPID_PUBLIC_KEY=${publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${privateKey}`);
console.log("VAPID_SUBJECT=mailto:contact@ivula.co.ke");
