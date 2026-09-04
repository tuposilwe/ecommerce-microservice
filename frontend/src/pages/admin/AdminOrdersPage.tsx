import { Fragment, useEffect, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { SortHeader } from '../../components/SortHeader';
import { deleteOrder, getAdminOrders } from '../../api/orders';
import { getAllUserNames } from '../../api/users';
import type { OrderDto, PageResponse, SortDirection } from '../../types';
import { formatMoney } from '../../lib/format';

const PAGE_SIZE = 10;

const statusStyles: Record<string, string> = {
  PAID: 'bg-green-100 text-green-800',
  PENDING: 'bg-amber-100 text-amber-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELED: 'bg-slate-100 text-slate-600',
};

export function AdminOrdersPage() {
  const [result, setResult] = useState<PageResponse<OrderDto> | null>(null);
  const [customerNames, setCustomerNames] = useState<Map<number, string>>(new Map());
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [direction, setDirection] = useState<SortDirection>('desc');
  const [error, setError] = useState<string | null>(null);

  function loadOrders() {
    getAdminOrders({ page, size: PAGE_SIZE, status: status || undefined, sort, direction })
      .then(setResult)
      .catch(() => setResult(null));
  }

  useEffect(loadOrders, [page, status, sort, direction]);

  async function handleDelete(orderId: number) {
    if (!confirm(`Delete order #${orderId}? This cannot be undone.`)) return;
    setError(null);
    try {
      await deleteOrder(orderId);
      loadOrders();
    } catch {
      setError('Could not delete the order.');
    }
  }

  useEffect(() => {
    getAllUserNames()
      .then(setCustomerNames)
      .catch(() => {});
  }, []);

  function handleSort(field: string) {
    if (sort === field) {
      setDirection(direction === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(field);
      setDirection(field === 'createdAt' ? 'desc' : 'asc');
    }
    setPage(0);
  }

  const orders = result?.content ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">All orders</h1>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="CANCELED">Canceled</option>
        </select>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {result === null ? (
        <p className="mt-6 text-sm text-slate-500">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No orders match.</p>
      ) : (
        <>
          <table className="mt-6 w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr className="border-b border-slate-200">
                <SortHeader label="Order" field="id" sort={sort} direction={direction} onSort={handleSort} />
                <th className="py-2">Customer</th>
                <SortHeader label="Date" field="createdAt" sort={sort} direction={direction} onSort={handleSort} />
                <SortHeader label="Status" field="status" sort={sort} direction={direction} onSort={handleSort} />
                <SortHeader label="Total" field="totalPrice" sort={sort} direction={direction} onSort={handleSort} className="text-right" />
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {orders.map((order) => (
                <Fragment key={order.id}>
                  <tr
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
                    <td className="py-2 pl-3 text-right">
                      <button
                        aria-label={`Delete order ${order.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(order.id);
                        }}
                        className="inline-flex items-center gap-1 text-red-600 hover:underline"
                      >
                        <Trash2 size={14} aria-hidden /> Delete
                      </button>
                    </td>
                  </tr>
                  {expandedId === order.id && (
                    <tr>
                      <td colSpan={6} className="bg-slate-50 px-4 py-3">
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
                </Fragment>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <span>
              Page {result.page + 1} of {Math.max(result.totalPages, 1)} &middot;{' '}
              {result.totalElements} orders
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={14} aria-hidden /> Prev
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page + 1 >= result.totalPages}
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40"
              >
                Next <ChevronRight size={14} aria-hidden />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
