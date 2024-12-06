import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { RoleGuard } from './components/RoleGuard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CommandPage } from './pages/CommandPage';
import { ReportsPage } from './pages/ReportsPage';
import { ArchivePage } from './pages/ArchivePage';
import { SystemStatusPage } from './pages/SystemStatusPage';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  return (
    <ErrorBoundary component="App">
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/sign-in/*"
              element={
                <AuthLayout>
                  <SignIn />
                </AuthLayout>
              }
            />
            <Route
              path="/sign-up/*"
              element={
                <AuthLayout>
                  <SignUp />
                </AuthLayout>
              }
            />
            <Route
              path="/*"
              element={
                <>
                  <SignedIn>
                    <DashboardLayout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/commands" element={<CommandPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                        <Route path="/archive" element={<ArchivePage />} />
                        <Route path="/status" element={<SystemStatusPage />} />
                        <Route
                          path="/admin"
                          element={
                            <RoleGuard allowedRoles={['admin']}>
                              <AdminDashboard />
                            </RoleGuard>
                          }
                        />
                      </Routes>
                    </DashboardLayout>
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />
          </Routes>
        </BrowserRouter>
      </ClerkProvider>
    </ErrorBoundary>
  );
}

export default App;