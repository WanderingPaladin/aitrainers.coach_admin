import { Activity, Briefcase, CalendarDays, Inbox, LayoutDashboard, MessageCircle, Rss, Settings2, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import Brand from './Brand';
import { useAuth } from './AuthProvider';

const links = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/applications', label: 'Applications', icon: Users },
  { to: '/admin/inbox', label: 'Inbox', icon: Inbox },
  { to: '/admin/calendar', label: 'Demo calls', icon: CalendarDays },
  { to: '/admin/job-sources', label: 'Job sources', icon: Rss },
  { to: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/admin/feedback', label: 'Feedback', icon: MessageCircle },
  { to: '/admin/analytics', label: 'Analytics', icon: Activity },
  { to: '/admin/settings', label: 'Settings', icon: Settings2 },
];

export default function AdminSidebar({
  onNavigate,
  inboxUnread = 0,
}: {
  onNavigate?: () => void;
  inboxUnread?: number;
}) {
  const { admin, logout } = useAuth();
  return (
    <aside className="sidebar">
      <Brand />
      <nav aria-label="Admin" className="flex flex-col gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          const unread = link.to === '/admin/inbox' ? inboxUnread : 0;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')}
              onClick={onNavigate}
              aria-label={unread ? `${link.label}, ${unread} unread` : undefined}
            >
              <Icon size={16} strokeWidth={2.1} aria-hidden="true" />
              {link.label}
              {unread > 0 ? <span className="nav-badge">{unread > 99 ? '99+' : unread}</span> : null}
            </NavLink>
          );
        })}
      </nav>
      <div className="mt-auto text-[13px] text-[var(--color-muted)]">
        <p className="m-0 font-semibold text-[var(--color-ink)]">{admin?.name ?? 'Admin'}</p>
        <button type="button" className="btn btn-ghost mt-2 px-0" onClick={() => void logout()}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
