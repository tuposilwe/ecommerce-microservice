import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteUser, getUsers, updateUserRole } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import type { Role, UserDto } from '../../types';

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function loadUsers() {
    getUsers()
      .then(setUsers)
      .catch(() => setUsers([]));
  }

  useEffect(loadUsers, []);

  async function handleRoleChange(userId: number, role: Role) {
    setError(null);
    try {
      await updateUserRole(userId, role);
      loadUsers();
    } catch {
      setError('Could not update the role.');
    }
  }

  async function handleDelete(userId: number) {
    if (!confirm('Delete this user?')) return;
    setError(null);
    try {
      await deleteUser(userId);
      loadUsers();
    } catch {
      setError('Could not delete the user.');
    }
  }

  if (users === null) {
    return <p className="mx-auto max-w-4xl px-4 py-8 text-sm text-slate-500">Loading users…</p>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Manage users</h1>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <table className="mt-6 w-full text-left text-sm">
        <thead className="text-slate-500">
          <tr className="border-b border-slate-200">
            <th className="py-2">Name</th>
            <th className="py-2">Email</th>
            <th className="py-2">Role</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {users.map((user) => {
            const isSelf = user.user_id === currentUser?.id;
            return (
              <tr key={user.user_id}>
                <td className="py-2 font-medium text-slate-900">
                  {user.name}
                  {isSelf && <span className="ml-2 text-xs text-slate-400">(you)</span>}
                </td>
                <td className="py-2 text-slate-600">{user.email}</td>
                <td className="py-2">
                  <select
                    value={user.role}
                    disabled={isSelf}
                    onChange={(e) => handleRoleChange(user.user_id, e.target.value as Role)}
                    className="rounded-md border border-slate-300 px-2 py-1 text-sm disabled:opacity-50"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="py-2 text-right">
                  <button
                    onClick={() => handleDelete(user.user_id)}
                    disabled={isSelf}
                    className="inline-flex items-center gap-1 text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 size={14} aria-hidden /> Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
