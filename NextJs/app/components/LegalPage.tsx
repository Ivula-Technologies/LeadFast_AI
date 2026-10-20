import Link from 'next/link';

// Shared shell for the Terms and Privacy pages.
export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-[#3B0764]">
            LeadFast <span className="text-[#F5A800]">AI</span>
          </Link>
          <Link href="/login" className="text-sm font-semibold text-slate-600">Log in</Link>
        </div>
      </header>
      <article className="max-w-3xl mx-auto px-4 py-10 space-y-5 leading-relaxed [&_h2]:text-xl [&_h2]:!mt-8 [&_h2]:!mb-0 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5">
        <h1 className="no-underline text-3xl font-bold !block !mb-0">{title}</h1>
        <p className="text-sm text-slate-500">Last updated {updated}</p>
        {children}
      </article>
    </div>
  );
}
