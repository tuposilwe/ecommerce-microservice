import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { getAdminOrders } from '../../api/orders';
import { getUsers } from '../../api/users';
import type { OrderDto } from '../../types';
import { formatMoney } from '../../lib/format';

const statusStyles: Record<string, string> = {
  PAID: 'bg-green-100 text-green-800',
  PENDING: 'bg-amber-100 text-amber-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELED: 'bg-slate-100 text-slate-600',
};

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderDto[] | null>(null);
  const [customerNames, setCustomerNames] = useState<Map<number, string>>(new Map());
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    getAdminOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
    getUsers()
      .then((users) => setCustomerNames(new Map(users.map((u) => [u.user_id, u.name]))))
      .catch(() => {});
  }, []);

  if (orders === null) {
    return <p className="mx-auto max-w-4xl px-4 py-8 text-sm text-slate-500">Loading orders…</p>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">All orders</h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No orders yet.</p>
      ) : (
        <table className="mt-6 w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="py-2">Order</th>
              <th className="py-2">Customer</th>
              <th className="py-2">Date</th>
              <th className="py-2">Status</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.map((order) => (
              <>
                <tr
                  key={order.id}
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  className="cursor-pointer hover:bg-slate-50"
                >
                  <td className="py-2 font-medium text-slate-900">
                    <span className="inline-flex items-center gap-1">
                      {expandedId === order.id ? (
                        <ChevronDown size={14} aria-hidden className="text-slate-400" />
                      ) : (
                        <ChevronRight size={14} aria-hidden className="text-slate-400" />
                      )}
                      #{order.id}
                    </span>
                  </td>
                  <td className="py-2 text-slate-600">
                    {(order.customerId != null && customerNames.get(order.customerId)) ||
                      `user ${order.customerId}`}
                  </td>
                  <td className="py-2 text-slate-600">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        statusStyles[order.status] ?? 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-2 text-right font-medium text-slate-900">
                    {formatMoney(order.totalPrice)}
                  </td>
                </tr>
                {expandedId === order.id && (
                  <tr key={`${order.id}-items`}>
                    <td colSpan={5} className="bg-slate-50 px-4 py-3">
                      <ul className="space-y-1 text-slate-600">
                        {order.items.map((item) => (
                          <li key={item.product.id} className="flex justify-between">
                            <span>
                              {item.quantity} &times; {item.product.name}
                            </span>
                            <span>{formatMoney(item.totalPrice)}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
