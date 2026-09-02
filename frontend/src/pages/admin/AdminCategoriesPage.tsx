import { useEffect, useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../../api/categories';
import type { CategoryDto } from '../../types';

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState<string | null>(null);

  function loadCategories() {
    getCategories().then(setCategories);
  }

  useEffect(loadCategories, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setError(null);
    try {
      await createCategory(newName.trim());
      setNewName('');
      loadCategories();
    } catch {
      setError('Could not create the category.');
    }
  }

  async function handleRename(id: number) {
    if (!editingName.trim()) return;
    setError(null);
    try {
      await updateCategory(id, editingName.trim());
      setEditingId(null);
      loadCategories();
    } catch {
      setError('Could not rename the category.');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this category?')) return;
    setError(null);
    try {
      await deleteCategory(id);
      loadCategories();
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setError('This category still has products assigned to it — reassign them first.');
      } else {
        setError('Could not delete the category.');
      }
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Manage categories</h1>

      <form onSubmit={handleCreate} className="mt-6 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          <Plus size={15} aria-hidden /> Add
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <table className="mt-6 w-full text-left text-sm">
        <thead className="text-slate-500">
          <tr className="border-b border-slate-200">
            <th className="py-2">ID</th>
            <th className="py-2">Name</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="py-2 text-slate-500">{category.id}</td>
              <td className="py-2 font-medium text-slate-900">
                {editingId === category.id ? (
                  <input
                    value={editingName}
                    autoFocus
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename(category.id)}
                    className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                  />
                ) : (
                  category.name
                )}
              </td>
              <td className="py-2 text-right">
                {editingId === category.id ? (
                  <>
                    <button
                      onClick={() => handleRename(category.id)}
                      className="mr-3 inline-flex items-center gap-1 text-slate-600 hover:underline"
                    >
                      <Check size={14} aria-hidden /> Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="inline-flex items-center gap-1 text-slate-600 hover:underline"
                    >
                      <X size={14} aria-hidden /> Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(category.id);
                        setEditingName(category.name);
                      }}
                      className="mr-3 inline-flex items-center gap-1 text-slate-600 hover:underline"
                    >
                      <Pencil size={14} aria-hidden /> Rename
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="inline-flex items-center gap-1 text-red-600 hover:underline"
                    >
                      <Trash2 size={14} aria-hidden /> Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
