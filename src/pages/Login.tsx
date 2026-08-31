import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listApplications } from '../api';
import { getDefaultApiKey, getStoredApiKey, isSignedIn, setStoredApiKey } from '../auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState(getStoredApiKey() || getDefaultApiKey());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSignedIn()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    setStoredApiKey(apiKey);
    try {
      await listApplications({ pageSize: 1 });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#070b1c] px-4 text-white">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">AI Trainers</p>
        <h1 className="mt-3 text-3xl font-bold">Application desk</h1>
        <p className="mt-2 text-sm leading-6 text-white/65">
          Enter the admin API key to watch incoming applications and intro-call bookings.
        </p>
        <label className="mt-6 block text-xs font-semibold uppercase tracking-[0.12em] text-white/50">
          Admin API key
          <input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-sky-400"
            autoComplete="off"
            required
          />
        </label>
        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-gradient-to-r from-[#14C7E5] to-[#7C3AED] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Checking…' : 'Open applications'}
        </button>
      </form>
    </div>
  );
}
