import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProducts } from '../api/products';
import type { ProductDto } from '../types';
import { formatMoney } from '../lib/format';
import { useCart } from '../context/CartContext';
import { ProductImage } from '../components/ProductImage';
import { productImageUrl } from '../lib/images';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDto | null | undefined>(undefined);
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    getProducts()
      .then((products) => {
        const found = products.find((p) => String(p.id) === id);
        setProduct(found ?? null);
      })
      .catch(() => setProduct(null));
  }, [id]);

  async function handleAddToCart() {
    if (!product?.id) return;
    setIsAdding(true);
    try {
      await addItem(product.id);
      setAdded(true);
    } finally {
      setIsAdding(false);
    }
  }

  if (product === undefined) {
    return <p className="mx-auto max-w-3xl px-4 py-8 text-sm text-slate-500">Loading…</p>;
  }

  if (product === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm text-slate-500">Product not found.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-slate-900 underline">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/" className="text-sm text-slate-500 hover:text-slate-900">
        &larr; Back to products
      </Link>
      <ProductImage
        src={product.hasImage && product.id ? productImageUrl(product.id) : null}
        alt={product.name}
        className="mt-4 h-64 w-full rounded-lg sm:h-80"
      />
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">{product.name}</h1>
      <p className="mt-2 text-lg font-medium text-slate-700">{formatMoney(product.price)}</p>
      <p className="mt-4 text-slate-600">{product.description}</p>
      <button
        onClick={handleAddToCart}
        disabled={isAdding}
        className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {isAdding ? 'Adding…' : added ? 'Added to cart ✓' : 'Add to cart'}
      </button>
    </div>
  );
}
