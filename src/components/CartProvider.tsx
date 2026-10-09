"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import type { Product } from "@/data/store";
import {
  emptySnapshot,
  readStorage,
  subscribeToStorage,
  writeStorage,
} from "@/lib/storage";

export type CartProduct = Product;

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CartContextType = {
  items: CartItem[];
  count: number;
  itemCount: number;
  subtotal: number;
  delivery: number;
  total: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "umer-mobile-parts-cart";
const CART_EVENT = "umer-cart-changed";

const CartContext = createContext<CartContextType | undefined>(undefined);

function isCartItem(item: unknown): item is CartItem {
  if (!item || typeof item !== "object") return false;

  const value = item as {
    product?: unknown;
    quantity?: unknown;
  };

  return (
    !!value.product &&
    typeof value.product === "object" &&
    typeof value.quantity === "number" &&
    value.quantity > 0
  );
}

function parseCart(raw: string): CartItem[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

function getCartSnapshot() {
  return readStorage(STORAGE_KEY);
}

function persistCart(items: CartItem[]) {
  writeStorage(STORAGE_KEY, JSON.stringify(items), CART_EVENT);
}

const subscribeCart = subscribeToStorage(CART_EVENT);

export function CartProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    emptySnapshot
  );

  const items = useMemo(() => parseCart(raw), [raw]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    const safeQuantity = Math.max(1, Math.min(quantity, product.stock));
    const current = parseCart(getCartSnapshot());
    const existing = current.find((item) => item.product.id === product.id);

    if (!existing) {
      persistCart([...current, { product, quantity: safeQuantity }]);
      return;
    }

    persistCart(
      current.map((item) =>
        item.product.id === product.id
          ? {
              ...item,
              quantity: Math.min(product.stock, item.quantity + safeQuantity),
            }
          : item
      )
    );
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    persistCart(
      parseCart(getCartSnapshot()).filter(
        (item) => item.product.id !== productId
      )
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }

      persistCart(
        parseCart(getCartSnapshot()).map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: Math.min(item.product.stock, quantity),
              }
            : item
        )
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    persistCart([]);
  }, []);

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  const delivery = subtotal > 0 ? 250 : 0;
  const total = subtotal + delivery;

  const value = useMemo(
    () => ({
      items,
      count,
      itemCount: count,
      subtotal,
      delivery,
      total,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [
      items,
      count,
      subtotal,
      delivery,
      total,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    ]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
