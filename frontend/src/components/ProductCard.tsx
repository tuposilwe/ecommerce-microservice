import { Link } from 'react-router-dom';
import type { ProductDto } from '../types';
import { formatMoney } from '../lib/format';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { ProductImage } from './ProductImage';
import { productImageUrl } from '../lib/images';

export function ProductCard({ product }: { product: ProductDto }) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  async function handleAddToCart() {
    if (!product.id) return;
    setIsAdding(true);
    try {
      await addItem(product.id);
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
      <Link to={`/products/${product.id}`} className="flex flex-1 flex-col">
        <ProductImage
          src={product.hasImage && product.id ? productImageUrl(product.id) : null}
          alt={product.name}
          className="h-40 w-full"
        />
        <div className="p-4">
          <h3 className="font-medium text-slate-900">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{product.description}</p>
        </div>
      </Link>
      <div className="flex items-center justify-between p-4 pt-0">
        <span className="font-semibold text-slate-900">{formatMoney(product.price)}</span>
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {isAdding ? 'Adding…' : 'Add to cart'}
        </button>
      </div>
    </div>
  );
}
