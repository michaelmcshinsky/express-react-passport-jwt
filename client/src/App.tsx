import type { ReactNode } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './shared/context/AuthContext';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { ProfilePage } from './features/profile/ProfilePage';

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-400">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function Nav() {
  const { user } = useAuth();
  return (
    <header className="border-b border-gray-200">
      <nav className="mx-auto flex max-w-lg items-center gap-4 py-4">
        <Link className="font-semibold" to="/">
          Auth Demo
        </Link>
        <div className="ml-auto flex gap-3 text-sm">
          {user ? (
            <Link className="text-gray-700 hover:text-black" to="/profile">
              Profile
            </Link>
          ) : (
            <>
              <Link className="text-gray-700 hover:text-black" to="/login">
                Sign in
              </Link>
              <Link className="text-gray-700 hover:text-black" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export function App() {
  return (
    <AuthProvider>
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/profile" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/profile"
            element={
              <Protected>
                <ProfilePage />
              </Protected>
            }
          />
        </Routes>
      </main>
    </AuthProvider>
  );
}
