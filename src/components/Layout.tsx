import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { clearStoredApiKey } from '../auth';

export default function Layout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  function signOut() {
    clearStoredApiKey();
    window.location.href = '/login';
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#10203c]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#14C7E5] to-[#7C3AED] text-sm font-bold text-white">
              A
            </span>
            <span>
              <strong className="block text-[15px] leading-none">AI Trainers</strong>
              <small className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Applications</small>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="hidden text-sm font-semibold text-slate-600 sm:block">{title}</h1>
            <button
              type="button"
              onClick={signOut}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-400"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
