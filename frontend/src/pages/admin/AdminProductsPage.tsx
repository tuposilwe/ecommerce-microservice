import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  createProduct,
  deleteProduct,
  deleteProductImage,
  getProducts,
  updateProduct,
  uploadProductImage,
} from '../../api/products';
import { getCategories } from '../../api/categories';
import type { CategoryDto, ProductDto } from '../../types';
import { formatMoney } from '../../lib/format';
import { ProductImage } from '../../components/ProductImage';
import { productImageUrl } from '../../lib/images';

const emptyForm: ProductDto = { name: '', price: 0, description: '', hasImage: false, categoryId: null };

export function AdminProductsPage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);
  const [form, setForm] = useState<ProductDto>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function loadProducts() {
    getProducts().then(setProducts);
  }

  useEffect(() => {
    loadProducts();
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  function resetImageState() {
    setImageFile(null);
    setRemoveExistingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function startCreate() {
    setEditingProduct(emptyForm);
    setForm(emptyForm);
    resetImageState();
    setError(null);
  }

  function startEdit(product: ProductDto) {
    setEditingProduct(product);
    setForm(product);
    resetImageState();
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.categoryId === null) {
      setError('Please select a category.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const id = form.id ? (await updateProduct(form.id, form)).id! : (await createProduct(form)).id!;

      if (imageFile) {
        await uploadProductImage(id, imageFile);
      } else if (removeExistingImage) {
        await deleteProductImage(id);
      }

      setEditingProduct(null);
      resetImageState();
      loadProducts();
    } catch {
      setError('Could not save the product.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this product?')) return;
    await deleteProduct(id);
    loadProducts();
  }

  const showExistingImage = editingProduct?.hasImage && editingProduct.id && !removeExistingImage && !imageFile;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Manage products</h1>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          <Plus size={15} aria-hidden /> New product
        </button>
      </div>

      {editingProduct && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
        >
          <h2 className="font-medium text-slate-900">
            {editingProduct.id ? `Edit product #${editingProduct.id}` : 'New product'}
          </h2>
          <div>
            <label className="text-sm font-medium text-slate-700">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Image</label>
            <div className="mt-1 flex items-center gap-3">
              {showExistingImage && editingProduct.id ? (
                <ProductImage
                  src={productImageUrl(editingProduct.id)}
                  alt="Current"
                  className="h-16 w-16 rounded-md"
                />
              ) : imagePreview ? (
                <ProductImage src={imagePreview} alt="Preview" className="h-16 w-16 rounded-md" />
              ) : null}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setImageFile(e.target.files?.[0] ?? null);
                  setRemoveExistingImage(false);
                }}
                className="text-sm"
              />
              {showExistingImage && (
                <button
                  type="button"
                  onClick={() => setRemoveExistingImage(true)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select
              required
              value={form.categoryId ?? ''}
              onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setEditingProduct(null)}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <table className="mt-6 w-full text-left text-sm">
        <thead className="text-slate-500">
          <tr className="border-b border-slate-200">
            <th className="py-2"></th>
            <th className="py-2">Name</th>
            <th className="py-2">Price</th>
            <th className="py-2">Category</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="py-2">
                <ProductImage
                  src={product.hasImage && product.id ? productImageUrl(product.id) : null}
                  alt={product.name}
                  className="h-10 w-10 rounded-md"
                />
              </td>
              <td className="py-2 font-medium text-slate-900">{product.name}</td>
              <td className="py-2">{formatMoney(product.price)}</td>
              <td className="py-2">
                {categories.find((c) => c.id === product.categoryId)?.name ?? '—'}
              </td>
              <td className="py-2 text-right">
                <button
                  onClick={() => startEdit(product)}
                  className="mr-3 inline-flex items-center gap-1 text-slate-600 hover:underline"
                >
                  <Pencil size={14} aria-hidden /> Edit
                </button>
                <button
                  onClick={() => product.id && handleDelete(product.id)}
                  className="inline-flex items-center gap-1 text-red-600 hover:underline"
                >
                  <Trash2 size={14} aria-hidden /> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
