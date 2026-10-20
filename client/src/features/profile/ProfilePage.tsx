import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    navigate('/login');
  }

  if (!user) return null;

  return (
    <section className="mx-auto max-w-sm py-16">
      <h1 className="text-2xl font-bold">Profile</h1>
      <dl className="mt-6 space-y-3 rounded-lg border border-gray-200 p-4">
        <div>
          <dt className="text-sm text-gray-500">Name</dt>
          <dd className="font-medium">{user.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Email</dt>
          <dd className="font-medium">{user.email}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Role</dt>
          <dd className="font-medium">{user.role}</dd>
        </div>
      </dl>
      <button
        type="button"
        onClick={() => void onLogout()}
        className="mt-6 rounded border border-red-300 px-4 py-2 text-red-700 hover:bg-red-50"
      >
        Sign out
      </button>
    </section>
  );
}
