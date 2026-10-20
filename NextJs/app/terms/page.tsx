import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '../components/LegalPage';

export const metadata: Metadata = { title: 'Terms of Service | LeadFast AI' };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="October 20, 2026">
      <p>
        These terms cover your use of LeadFast AI (&quot;LeadFast&quot;, &quot;we&quot;, &quot;us&quot;), a service of Ivula
        Technologies. By creating an account you agree to them on behalf of yourself and the business you sign up.
      </p>

      <h2 className="no-underline">The service</h2>
      <p>
        LeadFast collects enquiries from your quote request page and website forms, sends each customer an automatic
        email reply in your business name, alerts you about the lead and lets you track it. Replies are written by AI
        from the customer&apos;s message and your business details.
      </p>

      <h2 className="no-underline">Free trial and billing</h2>
      <ul>
        <li>Each business starts with a 14-day free trial. No card is needed and nothing is charged when it ends.</li>
        <li>Paid plans are billed monthly in US dollars, in advance, through Stripe, until you cancel.</li>
        <li>You can cancel any time from Manage billing. Your plan stays active until the end of the period you paid for. We do not give refunds for partial months.</li>
        <li>If we change prices, we will email you at least 30 days before the new price applies to you.</li>
      </ul>

      <h2 className="no-underline">Your responsibilities</h2>
      <ul>
        <li>Only collect enquiries from people who chose to contact your business, and only use LeadFast to reply to them about their enquiry.</li>
        <li>Keep your business name, phone number and contact email accurate; they appear in replies to your customers.</li>
        <li>Do not use LeadFast to send marketing, spam or anything unlawful, and do not try to get around plan limits or access other businesses&apos; data.</li>
        <li>Keep your login secure. You are responsible for activity on your account.</li>
      </ul>

      <h2 className="no-underline">Automatic replies</h2>
      <p>
        Replies are instructed not to quote prices, promise appointment times or make commitments, but AI can make
        mistakes. You can send yourself a test lead at any time to check what customers receive. You remain responsible
        for your dealings with your customers.
      </p>

      <h2 className="no-underline">Your data</h2>
      <p>
        You own your business data and your leads. We use them only to run the service, as described in our{' '}
        <Link href="/privacy" className="text-sky-700 underline">Privacy Policy</Link>. You can delete a business and its leads from
        Settings.
      </p>

      <h2 className="no-underline">Availability and liability</h2>
      <p>
        We work to keep LeadFast running at all times but do not guarantee it will be uninterrupted or error free, or that
        any lead will turn into work. To the extent the law allows, LeadFast is provided &quot;as is&quot;, and our total liability
        for any claim is limited to the amount you paid us in the 3 months before the claim. We are not liable for lost
        profits or indirect damages.
      </p>

      <h2 className="no-underline">Ending the service</h2>
      <p>
        You can stop using LeadFast at any time. We may suspend or close an account that breaks these terms or is unpaid,
        and will tell you by email when we do.
      </p>

      <h2 className="no-underline">Changes and contact</h2>
      <p>
        We may update these terms and will email you about material changes before they take effect. Questions:{' '}
        <a href="mailto:contact@ivula.co.ke" className="text-sky-700 underline">contact@ivula.co.ke</a>.
      </p>
    </LegalPage>
  );
}
