import { Link } from 'react-router-dom';

export function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Checkout cancelled</h1>
      <p className="mt-2 text-slate-600">No charge was made. Your cart is still saved.</p>
      <Link to="/cart" className="mt-6 inline-block text-sm text-slate-900 underline">
        Back to cart
      </Link>
    </div>
  );
}
