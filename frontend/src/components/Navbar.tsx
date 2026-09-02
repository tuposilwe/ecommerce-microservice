import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-lg font-semibold text-slate-900">
          The Store
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="hover:text-slate-900">
              Admin
            </Link>
          )}
          {user && (
            <Link to="/orders" className="hover:text-slate-900">
              Orders
            </Link>
          )}
          <Link to="/cart" className="relative hover:text-slate-900">
            Cart
            {itemCount > 0 && (
              <span className="absolute -right-4 -top-2 rounded-full bg-slate-900 px-1.5 py-0.5 text-xs font-semibold text-white">
                {itemCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-slate-500">{user.name}</span>
              <button
                onClick={handleLogout}
                className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="hover:text-slate-900">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-slate-900 px-3 py-1.5 text-white hover:bg-slate-700"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
