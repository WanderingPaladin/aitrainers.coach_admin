import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { isSignedIn } from './auth';
import ApplicationDetailPage from './pages/ApplicationDetail';
import ApplicationsPage from './pages/Applications';
import LoginPage from './pages/Login';

function RequireAuth({ children }: { children: ReactNode }) {
  if (!isSignedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <ApplicationsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/applications/:id"
        element={
          <RequireAuth>
            <ApplicationDetailPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
