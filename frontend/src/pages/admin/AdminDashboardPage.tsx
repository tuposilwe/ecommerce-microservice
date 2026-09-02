import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowRight, Banknote, CheckCircle2, Clock, Users } from 'lucide-react';
import { getAdminOrders } from '../../api/orders';
import { getAllUserNames } from '../../api/users';
import type { OrderDto } from '../../types';
import { formatMoney } from '../../lib/format';

// Chart colors from the validated reference palette: one series hue for the
// single-series revenue line; reserved status colors (never reused as series)
// for the status bars, whose identity is carried by the axis labels, not color.
const SERIES_BLUE = '#2a78d6';
const STATUS_COLORS: Record<string, string> = {
  PAID: '#0ca30c',
  PENDING: '#fab219',
  FAILED: '#d03b3b',
  CANCELED: '#94a3b8',
};

const statusStyles: Record<string, string> = {
  PAID: 'bg-green-100 text-green-800',
  PENDING: 'bg-amber-100 text-amber-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELED: 'bg-slate-100 text-slate-600',
};

function StatTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Banknote;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={16} aria-hidden />
        <p className="text-sm">{label}</p>
      </div>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export function AdminDashboardPage() {
  const [orders, setOrders] = useState<OrderDto[] | null>(null);
  const [customerNames, setCustomerNames] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    // Stats aggregate client-side over the most recent orders (capped at the
    // server's max page size).
    getAdminOrders({ size: 100 })
      .then((page) => setOrders(page.content))
      .catch(() => setOrders([]));
    getAllUserNames()
      .then(setCustomerNames)
      .catch(() => {});
  }, []);

  const stats = useMemo(() => {
    if (!orders) return null;
    const paid = orders.filter((o) => o.status === 'PAID');
    const pending = orders.filter((o) => o.status === 'PENDING');
    const revenue = paid.reduce((sum, o) => sum + o.totalPrice, 0);
    const customers = new Set(orders.map((o) => o.customerId)).size;
    return { revenue, paidCount: paid.length, pendingCount: pending.length, customers };
  }, [orders]);

  const revenueByDay = useMemo(() => {
    if (!orders) return [];
    const byDay = new Map<string, number>();
    for (const order of orders) {
      if (order.status !== 'PAID') continue;
      const day = order.createdAt.slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + order.totalPrice);
    }
    return [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, revenue]) => ({
        day: new Date(day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        revenue: Number(revenue.toFixed(2)),
      }));
  }, [orders]);

  const ordersByStatus = useMemo(() => {
    if (!orders) return [];
    const counts = new Map<string, number>();
    for (const order of orders) {
      counts.set(order.status, (counts.get(order.status) ?? 0) + 1);
    }
    return ['PAID', 'PENDING', 'FAILED', 'CANCELED']
      .filter((status) => counts.has(status))
      .map((status) => ({ status, count: counts.get(status)! }));
  }, [orders]);

  if (orders === null || stats === null) {
    return <p className="mx-auto max-w-4xl px-4 py-8 text-sm text-slate-500">Loading…</p>;
  }

  const recent = orders.slice(0, 5);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Revenue (paid)" value={formatMoney(stats.revenue)} icon={Banknote} />
        <StatTile label="Paid orders" value={String(stats.paidCount)} icon={CheckCircle2} />
        <StatTile label="Pending orders" value={String(stats.pendingCount)} icon={Clock} />
        <StatTile label="Customers" value={String(stats.customers)} icon={Users} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-medium text-slate-900">Daily revenue (paid orders)</h2>
          {revenueByDay.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No paid orders yet.</p>
          ) : (
            <div className="mt-3 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueByDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={SERIES_BLUE} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={SERIES_BLUE} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeWidth={1} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                    tickFormatter={(v: number) => `$${v}`}
                  />
                  <Tooltip
                    formatter={(value) => [formatMoney(Number(value)), 'Revenue']}
                    cursor={{ stroke: '#94a3b8', strokeDasharray: '3 3' }}
                    contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#e2e8f0' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={SERIES_BLUE}
                    strokeWidth={2}
                    fill="url(#revenueFill)"
                    dot={{ r: 3, fill: SERIES_BLUE, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-medium text-slate-900">Orders by status</h2>
          {ordersByStatus.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No orders yet.</p>
          ) : (
            <div className="mt-3 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersByStatus} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeWidth={1} />
                  <XAxis
                    dataKey="status"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <Tooltip
                    formatter={(value) => [String(value), 'Orders']}
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#e2e8f0' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {ordersByStatus.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Recent orders</h2>
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1 text-sm text-slate-600 hover:underline"
        >
          View all <ArrowRight size={14} aria-hidden />
        </Link>
      </div>

      {recent.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No orders yet.</p>
      ) : (
        <table className="mt-4 w-full text-left text-sm">
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
            {recent.map((order) => (
              <tr key={order.id}>
                <td className="py-2 font-medium text-slate-900">#{order.id}</td>
                <td className="py-2 text-slate-600">
                  {(order.customerId != null && customerNames.get(order.customerId)) ||
                    `user ${order.customerId}`}
                </td>
                <td className="py-2 text-slate-600">{new Date(order.createdAt).toLocaleString()}</td>
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
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
