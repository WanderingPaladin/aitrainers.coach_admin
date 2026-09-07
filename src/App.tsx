import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminShell from './components/AdminShell';
import { AuthProvider } from './components/AuthProvider';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import ApplicationsPage from './pages/ApplicationsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CalendarPage from './pages/CalendarPage';
import FeedbackPage from './pages/FeedbackPage';
import InboxPage from './pages/InboxPage';
import JobSourcesPage from './pages/JobSourcesPage';
import JobsPage from './pages/JobsPage';
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin" element={<AdminShell />}>
                <Route index element={<OverviewPage />} />
                <Route path="dashboard" element={<OverviewPage />} />
                <Route path="applications" element={<ApplicationsPage />} />
                <Route path="applications/:id" element={<ApplicationsPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="job-sources" element={<JobSourcesPage />} />
                <Route path="jobs" element={<JobsPage />} />
                <Route path="inbox" element={<InboxPage />} />
                <Route path="feedback" element={<FeedbackPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="/" element={<Navigate to="/admin" replace />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
