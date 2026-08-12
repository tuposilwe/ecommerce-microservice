import { useEffect, useState } from 'react';
import { getProducts } from '../api/products';
import { getCategories } from '../api/categories';
import type { CategoryDto, ProductDto } from '../types';
import { ProductCard } from '../components/ProductCard';

export function HomePage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getProducts(selectedCategoryId)
      .then(setProducts)
      .catch(() => setError('Could not load products. Is the API running?'))
      .finally(() => setIsLoading(false));
  }, [selectedCategoryId]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Products</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategoryId(undefined)}
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            selectedCategoryId === undefined
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategoryId(category.id)}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              selectedCategoryId === category.id
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      {isLoading ? (
        <p className="mt-6 text-sm text-slate-500">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No products found.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
