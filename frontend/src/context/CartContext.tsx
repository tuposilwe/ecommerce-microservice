import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as cartApi from '../api/cart';
import type { CartDto } from '../types';

const CART_STORAGE_KEY = 'store_cart_id';

interface CartContextValue {
  cart: CartDto | null;
  isLoading: boolean;
  itemCount: number;
  addItem: (productId: number) => Promise<void>;
  updateItemQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clear: () => Promise<void>;
  forgetCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cartId = localStorage.getItem(CART_STORAGE_KEY);
    if (!cartId) {
      setIsLoading(false);
      return;
    }
    cartApi
      .getCart(cartId)
      .then(setCart)
      .catch(() => localStorage.removeItem(CART_STORAGE_KEY))
      .finally(() => setIsLoading(false));
  }, []);

  const ensureCartId = useCallback(async (): Promise<string> => {
    const existing = localStorage.getItem(CART_STORAGE_KEY);
    if (existing) {
      return existing;
    }
    const created = await cartApi.createCart();
    localStorage.setItem(CART_STORAGE_KEY, created.id);
    setCart(created);
    return created.id;
  }, []);

  const refresh = useCallback(async (cartId: string) => {
    const updated = await cartApi.getCart(cartId);
    setCart(updated);
  }, []);

  const forgetCart = useCallback(() => {
    localStorage.removeItem(CART_STORAGE_KEY);
    setCart(null);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isLoading,
      itemCount: cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
      async addItem(productId) {
        const cartId = await ensureCartId();
        await cartApi.addToCart(cartId, productId);
        await refresh(cartId);
      },
      async updateItemQuantity(productId, quantity) {
        if (!cart) return;
        await cartApi.updateCartItem(cart.id, productId, quantity);
        await refresh(cart.id);
      },
      async removeItem(productId) {
        if (!cart) return;
        await cartApi.removeCartItem(cart.id, productId);
        await refresh(cart.id);
      },
      async clear() {
        if (!cart) return;
        await cartApi.clearCart(cart.id);
        await refresh(cart.id);
      },
      forgetCart,
    }),
    [cart, isLoading, ensureCartId, refresh, forgetCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
