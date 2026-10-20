import type { Metadata } from 'next';
import LegalPage from '../components/LegalPage';

export const metadata: Metadata = { title: 'Privacy Policy | LeadFast AI' };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 20, 2026">
      <p>
        This policy explains what LeadFast AI, a service of Ivula Technologies, collects and how it is used. We do not sell
        personal information and we do not use it for advertising.
      </p>

      <h2 className="no-underline">What we collect</h2>
      <ul>
        <li><strong>Your account:</strong> your login email and password (stored hashed by our authentication provider).</li>
        <li><strong>Your business:</strong> business name, trade, contact email and phone, and your reply settings.</li>
        <li><strong>Leads:</strong> what your customers enter on your quote page or website form (name, email, phone, message) and the replies sent to them.</li>
        <li><strong>Billing:</strong> your plan and subscription status. Card details go directly to Stripe and never reach our servers.</li>
        <li><strong>Technical data:</strong> IP addresses, used briefly to limit spam and abuse.</li>
      </ul>

      <h2 className="no-underline">How it is used</h2>
      <p>
        To run the service: store and show you your leads, write and send automatic replies, email you new-lead alerts and
        account notices (such as your trial ending), process payments and keep the service secure. For leads, you decide
        why the data is collected and we process it on your behalf.
      </p>

      <h2 className="no-underline">Who processes it for us</h2>
      <ul>
        <li>Supabase: database and login</li>
        <li>Stripe: payments</li>
        <li>Resend: sending emails</li>
        <li>Google (Gemini) and Anthropic (Claude): writing reply text from the customer&apos;s message.</li>
        <li>Our hosting provider: running the application</li>
      </ul>

      <h2 className="no-underline">How long we keep it</h2>
      <p>
        For as long as your account is open. When you delete a business, its leads and replies are deleted with it. Ask us
        to close your account and we will delete your data within 30 days, apart from billing records we must keep by law.
      </p>

      <h2 className="no-underline">Your choices and rights</h2>
      <p>
        You can see and correct your business details in Settings and delete a business there (if it has a paid plan, cancel it under Manage billing first). To access, export or delete
        your data, or if you are a customer of a business that uses LeadFast and want your enquiry removed, email{' '}
        <a href="mailto:contact@ivula.co.ke" className="text-sky-700 underline">contact@ivula.co.ke</a>. We respond within 30
        days. California residents have the rights described in the CCPA, and we honor them for everyone.
      </p>

      <h2 className="no-underline">Security</h2>
      <p>
        Data is encrypted in transit, each business can only see its own leads, and access to production systems is
        limited. No system is perfectly secure; we will notify affected users promptly if a breach affects their data.
      </p>

      <h2 className="no-underline">Changes and contact</h2>
      <p>
        We will post changes here and email you about material ones. Ivula Technologies, Emperor Plaza, 05 Koinange Street,
        Nairobi, Kenya ·{' '}
        <a href="mailto:contact@ivula.co.ke" className="text-sky-700 underline">contact@ivula.co.ke</a>
      </p>
    </LegalPage>
  );
}
