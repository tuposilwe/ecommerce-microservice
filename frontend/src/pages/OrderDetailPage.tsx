import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrder } from '../api/orders';
import type { OrderDto } from '../types';
import { formatMoney } from '../lib/format';

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDto | null | undefined>(undefined);

  useEffect(() => {
    if (!orderId) return;
    getOrder(Number(orderId))
      .then(setOrder)
      .catch(() => setOrder(null));
  }, [orderId]);

  if (order === undefined) {
    return <p className="mx-auto max-w-3xl px-4 py-8 text-sm text-slate-500">Loading…</p>;
  }

  if (order === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm text-slate-500">Order not found.</p>
        <Link to="/orders" className="mt-4 inline-block text-sm text-slate-900 underline">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/orders" className="text-sm text-slate-500 hover:text-slate-900">
        &larr; Back to orders
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">Order #{order.id}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {new Date(order.createdAt).toLocaleString()} &middot; {order.status}
      </p>

      <ul className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
        {order.items.map((item) => (
          <li key={item.product.id} className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-slate-900">{item.product.name}</p>
              <p className="text-sm text-slate-500">
                {item.quantity} &times; {formatMoney(item.product.price)}
              </p>
            </div>
            <span className="font-medium text-slate-900">{formatMoney(item.totalPrice)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-end">
        <div className="text-right">
          <p className="text-sm text-slate-500">Total</p>
          <p className="text-xl font-semibold text-slate-900">{formatMoney(order.totalPrice)}</p>
        </div>
      </div>
    </div>
  );
}
