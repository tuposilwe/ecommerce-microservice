import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatMoney } from '../lib/format';
import { checkout } from '../api/checkout';

export function CartPage() {
  const { cart, isLoading, updateItemQuantity, removeItem, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    if (!cart) return;
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    setError(null);
    setIsCheckingOut(true);
    try {
      const { checkoutUrl } = await checkout(cart.id);
      window.location.href = checkoutUrl;
    } catch {
      setError('Could not start checkout. Please try again.');
      setIsCheckingOut(false);
    }
  }

  if (isLoading) {
    return <p className="mx-auto max-w-3xl px-4 py-8 text-sm text-slate-500">Loading cart…</p>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-slate-900">Your cart</h1>
        <p className="mt-4 text-sm text-slate-500">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Your cart</h1>

      <ul className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
        {cart.items.map((item) => (
          <li key={item.product.id} className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-slate-900">{item.product.name}</p>
              <p className="text-sm text-slate-500">{formatMoney(item.product.price)} each</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={100}
                value={item.quantity}
                onChange={(e) => {
                  const quantity = Number(e.target.value);
                  if (quantity >= 1 && quantity <= 100) {
                    updateItemQuantity(item.product.id, quantity);
                  }
                }}
                className="w-16 rounded-md border border-slate-300 px-2 py-1 text-sm"
              />
              <span className="w-20 text-right font-medium text-slate-900">
                {formatMoney(item.totalPrice)}
              </span>
              <button
                onClick={() => removeItem(item.product.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between">
        <button onClick={() => clear()} className="text-sm text-slate-500 hover:underline">
          Clear cart
        </button>
        <div className="text-right">
          <p className="text-sm text-slate-500">Total</p>
          <p className="text-xl font-semibold text-slate-900">{formatMoney(cart.totalPrice)}</p>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        onClick={handleCheckout}
        disabled={isCheckingOut}
        className="mt-4 w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {isCheckingOut ? 'Redirecting to checkout…' : 'Proceed to checkout'}
      </button>
    </div>
  );
}
