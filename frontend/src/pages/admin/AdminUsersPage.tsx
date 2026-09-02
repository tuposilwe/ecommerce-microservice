import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Trash2 } from 'lucide-react';
import { SortHeader } from '../../components/SortHeader';
import { deleteUser, getUsers, updateUserRole } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import type { PageResponse, Role, SortDirection, UserDto } from '../../types';

const PAGE_SIZE = 10;

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [result, setResult] = useState<PageResponse<UserDto> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [direction, setDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  function loadUsers() {
    getUsers({ page, size: PAGE_SIZE, search: debouncedSearch || undefined, sort, direction })
      .then(setResult)
      .catch(() => setResult(null));
  }

  useEffect(loadUsers, [page, debouncedSearch, sort, direction]);

  function handleSort(field: string) {
    if (sort === field) {
      setDirection(direction === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(field);
      setDirection('asc');
    }
    setPage(0);
  }

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

  const users = result?.content ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Manage users</h1>
        <div className="relative">
          <Search
            size={15}
            aria-hidden
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email"
            className="w-64 rounded-md border border-slate-300 py-1.5 pl-8 pr-3 text-sm"
          />
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {result === null ? (
        <p className="mt-6 text-sm text-slate-500">Loading users…</p>
      ) : users.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No users match.</p>
      ) : (
        <>
          <table className="mt-6 w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr className="border-b border-slate-200">
                <SortHeader label="Name" field="name" sort={sort} direction={direction} onSort={handleSort} />
                <SortHeader label="Email" field="email" sort={sort} direction={direction} onSort={handleSort} />
                <SortHeader label="Role" field="role" sort={sort} direction={direction} onSort={handleSort} />
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

          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <span>
              Page {result.page + 1} of {Math.max(result.totalPages, 1)} &middot;{' '}
              {result.totalElements} users
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={14} aria-hidden /> Prev
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page + 1 >= result.totalPages}
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40"
              >
                Next <ChevronRight size={14} aria-hidden />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
