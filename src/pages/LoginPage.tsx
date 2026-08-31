import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ApiError } from '../lib/http';
import Brand from '../components/Brand';
import { useAuth } from '../components/AuthProvider';

export default function LoginPage() {
  const { admin, login } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/admin';
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (admin) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <form
        className="card w-full max-w-md p-6"
        onSubmit={(event) => {
          event.preventDefault();
          setBusy(true);
          setError(null);
          void login(password)
            .catch((err: unknown) => {
              setError(err instanceof ApiError ? err.message : 'Could not sign in.');
            })
            .finally(() => setBusy(false));
        }}
      >
        <Brand href="/login" />
        <h1 className="page-title mt-5">Admin sign in</h1>
        <p className="page-copy">Protected access for reviewing AI Trainers applications.</p>
        <label className="mt-5 grid gap-1 text-[13px] font-semibold">
          Password
          <input
            className="field"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error ? (
          <p className="mt-3 mb-0 text-[13px] text-[#b42318]" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn btn-primary mt-4 w-full" disabled={busy || !password}>
          {busy ? 'Signing in…' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
