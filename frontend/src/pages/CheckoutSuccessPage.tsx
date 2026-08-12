import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getOrder } from '../api/orders';
import type { OrderDto } from '../types';
import { formatMoney } from '../lib/format';
import { useCart } from '../context/CartContext';

export function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<OrderDto | null>(null);
  const { forgetCart } = useCart();

  useEffect(() => {
    forgetCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!orderId) return;
    getOrder(Number(orderId))
      .then(setOrder)
      .catch(() => setOrder(null));
  }, [orderId]);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Thank you for your order!</h1>
      {order ? (
        <p className="mt-2 text-slate-600">
          Order #{order.id} for {formatMoney(order.totalPrice)} has been placed.
        </p>
      ) : (
        <p className="mt-2 text-slate-600">Your order has been placed.</p>
      )}
      <div className="mt-6 flex justify-center gap-4">
        <Link to="/orders" className="text-sm text-slate-900 underline">
          View your orders
        </Link>
        <Link to="/" className="text-sm text-slate-900 underline">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
