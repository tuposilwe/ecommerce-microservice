import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../api/orders';
import type { OrderDto } from '../types';
import { formatMoney } from '../lib/format';

export function OrdersPage() {
  const [orders, setOrders] = useState<OrderDto[] | null>(null);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Your orders</h1>

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
                <span className="font-medium text-slate-900">{formatMoney(order.totalPrice)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
