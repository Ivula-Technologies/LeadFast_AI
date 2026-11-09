import type { Metadata } from 'next';
import LegalPage from '../components/LegalPage';

export const metadata: Metadata = { title: 'Delete your account | LeadFast AI' };

const REQUEST = `mailto:contact@ivula.co.ke?subject=${encodeURIComponent('Delete my LeadFast account')}&body=${encodeURIComponent(
  'Please delete my LeadFast account and all of its businesses and leads.\n\nBusiness name:\n',
)}`;

// Linked from Settings and from the Google Play listing, which requires a page
// where people can ask for their account to be deleted without the app.
export default function DeleteAccountPage() {
  return (
    <LegalPage title="Delete your account" updated="October 25, 2026">
      <p>
        To delete a single business and its leads straight away, use <strong>Delete Business</strong> at the bottom of
        Settings. To delete your whole LeadFast account, send us a request from the email address you sign in with, so
        we know it&apos;s you:
      </p>
      <p>
        <a href={REQUEST} className="text-sky-700 underline">Email contact@ivula.co.ke to delete my account</a>
      </p>

      <h2 className="no-underline">What happens</h2>
      <ul>
        <li>We confirm by email and delete your login, businesses, leads and replies within 30 days, usually within 2 working days.</li>
        <li>Any active subscription is cancelled first, so you are not charged again.</li>
        <li>We keep billing records (invoices and payments) for as long as tax law requires, and nothing else.</li>
      </ul>
    </LegalPage>
  );
}
