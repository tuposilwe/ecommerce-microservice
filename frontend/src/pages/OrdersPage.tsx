import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { checkoutOrder, getOrders } from '../api/orders';
import type { OrderDto } from '../types';
import { formatMoney } from '../lib/format';

export function OrdersPage() {
  const [orders, setOrders] = useState<OrderDto[] | null>(null);
  const [payingOrderId, setPayingOrderId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  async function handlePay(orderId: number) {
    setError(null);
    setPayingOrderId(orderId);
    try {
      const { checkoutUrl } = await checkoutOrder(orderId);
      window.location.href = checkoutUrl;
    } catch {
      setError('Could not start checkout. Please try again.');
      setPayingOrderId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Your orders</h1>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {orders === null ? (
        <p className="mt-6 text-sm text-slate-500">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">You haven&apos;t placed any orders yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                to={`/orders/${order.id}`}
                className="flex items-center justify-between py-4 hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">Order #{order.id}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString()} &middot; {order.status}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {order.status === 'PENDING' && (
                    <button
                      type="button"
                      disabled={payingOrderId !== null}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePay(order.id);
                      }}
                      className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
                    >
                      {payingOrderId === order.id ? 'Redirecting…' : 'Pay now'}
                    </button>
                  )}
                  <span className="font-medium text-slate-900">{formatMoney(order.totalPrice)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
