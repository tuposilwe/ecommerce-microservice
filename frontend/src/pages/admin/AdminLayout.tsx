import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Tags, Users } from 'lucide-react';

const tabs = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/users', label: 'Users', icon: Users },
];

export function AdminLayout() {
  return (
    <div>
      <div className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-4xl gap-6 px-4 text-sm font-medium text-slate-600">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 border-b-2 py-3 ${
                  isActive
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent hover:text-slate-900'
                }`
              }
            >
              <tab.icon size={15} aria-hidden />
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
