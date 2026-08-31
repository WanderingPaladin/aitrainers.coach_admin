import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Brand from './Brand';
import { useAuth } from './AuthProvider';

export default function AdminShell() {
  const { ready, admin } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  if (!ready) {
    return (
      <div className="page">
        <div className="skeleton h-10 w-48" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="admin-shell">
      <div className="mobile-header">
        <Brand />
        <button type="button" className="btn" aria-label="Open navigation" onClick={() => setOpen(true)}>
          <Menu size={18} />
        </button>
      </div>
      <AdminSidebar />
      {open ? (
        <div className="drawer-backdrop" onClick={() => setOpen(false)}>
          <div className="drawer drawer-left" onClick={(event) => event.stopPropagation()}>
            <AdminSidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
