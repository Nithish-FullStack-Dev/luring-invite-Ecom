"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { CartItem, persistCartItem } from "@/lib/cart";

export type CartUser = {
  id: string;
  email: string;
};

type CartContextValue = {
  cartItems: CartItem[];
  user: CartUser | null;
  initialized: boolean;
  cartError: string | null;
  refreshCart: () => Promise<void>;
  refreshSessionAndCart: () => Promise<CartUser | null>;
  addItem: (item: Omit<CartItem, "quantity">) => Promise<void>;
  removeItem: (templateId: number) => Promise<void>;
  logout: () => Promise<void>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isCartItem(value: unknown): value is CartItem {
  if (!isRecord(value)) return false;
  return (
    typeof value.templateId === "number" &&
    typeof value.title === "string" &&
    typeof value.price === "number" &&
    (typeof value.thumbnail === "string" || value.thumbnail === null) &&
    typeof value.category === "string" &&
    (typeof value.categorySlug === "string" ||
      value.categorySlug === undefined) &&
    typeof value.quantity === "number"
  );
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<CartUser | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const requestId = useRef(0);

  const refreshSessionAndCart = useCallback(async (): Promise<CartUser | null> => {
    const currentRequestId = ++requestId.current;
    try {
      const [cartResponse, sessionResponse] = await Promise.all([
        fetch("/api/cart", { cache: "no-store" }),
        fetch("/api/cart/me", { cache: "no-store" }),
      ]);

      if (!cartResponse.ok) {
        throw new Error("Unable to load your cart.");
      }

      const cartResult: unknown = await cartResponse.json();
      let currentUser: CartUser | null = null;

      if (sessionResponse.ok) {
        const sessionResult: unknown = await sessionResponse.json();
        if (
          !isRecord(sessionResult) ||
          !isRecord(sessionResult.user) ||
          typeof sessionResult.user.id !== "string" ||
          typeof sessionResult.user.email !== "string"
        ) {
          throw new Error("The session response was invalid.");
        }
        currentUser = {
          id: sessionResult.user.id,
          email: sessionResult.user.email,
        };
      } else if (sessionResponse.status !== 401) {
        throw new Error("Unable to validate your sign-in session.");
      }

      if (
        !isRecord(cartResult) ||
        !Array.isArray(cartResult.items) ||
        !cartResult.items.every(isCartItem)
      ) {
        throw new Error("The cart response was invalid.");
      }

      if (currentRequestId !== requestId.current) return currentUser;

      setCartItems(cartResult.items);
      setUser(currentUser);
      setCartError(null);
      return currentUser;
    } catch (error) {
      if (currentRequestId === requestId.current) {
        setCartItems([]);
        setUser(null);
        setCartError(
          error instanceof Error ? error.message : "Unable to load your cart.",
        );
      }
      throw error;
    } finally {
      if (currentRequestId === requestId.current) {
        setInitialized(true);
      }
    }
  }, []);

  const refreshCart = useCallback(async () => {
    await refreshSessionAndCart();
  }, [refreshSessionAndCart]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void refreshCart().catch((error: unknown) => {
        console.error("Unable to initialize cart:", error);
      });
    }, 0);

    return () => window.clearTimeout(initialLoad);
  }, [refreshCart]);

  const addItem = useCallback(
    async (item: Omit<CartItem, "quantity">) => {
      const responseItems = await persistCartItem(item);
      setCartItems(responseItems);
      setInitialized(true);
    },
    [],
  );

  const removeItem = useCallback(async (templateId: number) => {
    const response = await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ templateId }),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || !Array.isArray(result.items)) {
      throw new Error(result.message || "Unable to remove the template.");
    }
    setCartItems(result.items);
  }, []);

  const logout = useCallback(async () => {
    const response = await fetch("/api/cart/logout", {
      method: "POST",
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || "Unable to sign out.");
    }

    setUser(null);
    setCartItems([]);
    await refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        user,
        initialized,
        cartError,
        refreshCart,
        refreshSessionAndCart,
        addItem,
        removeItem,
        logout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart must be used within a CartProvider.");
  }
  return value;
}
