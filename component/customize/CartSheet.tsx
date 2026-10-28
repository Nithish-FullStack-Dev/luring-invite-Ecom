"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CreditCard,
  LoaderCircle,
  LogOut,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { mediaUrl } from "@/lib/client-api";
import { CartItem } from "@/lib/cart";
import { useCart } from "@/component/cart/CartProvider";
import EmailAuthDialog from "./EmailAuthDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

function CartThumbnail({ item }: { item: CartItem }) {
  const [failed, setFailed] = useState(false);
  const src = mediaUrl(item.thumbnail);

  if (!src || failed) {
    return (
      <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-lg bg-purple-50">
        <ShoppingBag className="h-7 w-7 text-[#A86DCD]" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={item.title}
      className="h-24 w-20 shrink-0 rounded-lg bg-purple-50 object-cover"
      onError={() => setFailed(true)}
    />
  );
}

const CartSheet = ({
  cartItems,
  isCartOpen,
  setIsCartOpen,
}: {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const {
    user,
    initialized,
    cartError,
    refreshCart,
    removeItem,
    logout,
  } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [busyTemplateId, setBusyTemplateId] = useState<number | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isCartOpen) return;
    void refreshCart().catch((error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to load your cart.",
      );
    });
  }, [isCartOpen, refreshCart]);

  const subtotal = cartItems.reduce((total, item) => total + item.price, 0);

  const handleRemove = async (templateId: number) => {
    setBusyTemplateId(templateId);
    try {
      await removeItem(templateId);
      toast.success("Template removed from your cart.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to remove the template.",
      );
    } finally {
      setBusyTemplateId(null);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setIsCartOpen(false);
      toast.success("You have been signed out.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign out.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-xl text-[#A86DCD]">
              My Shopping Cart ({cartItems.length})
            </SheetTitle>
            <SheetDescription>
              Review your invitation templates before checkout.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-4">
            {cartItems.length === 0 && !initialized ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <LoaderCircle className="mb-4 h-10 w-10 animate-spin text-[#A86DCD]" />
                <p className="font-semibold text-gray-800">Loading your cart...</p>
              </div>
            ) : cartItems.length === 0 && cartError ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {cartError}
              </div>
            ) : cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ShoppingBag className="mb-4 h-12 w-12 text-gray-300" />
                <p className="font-semibold text-gray-800">Your cart is empty</p>
                <p className="mt-1 text-sm text-gray-500">
                  Add an invitation template to get started.
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.templateId}
                  className="flex gap-3 rounded-xl border p-3"
                >
                  <Link
                    href={`/preview/${item.categorySlug || "birthday"}/${item.templateId}`}
                    onClick={() => setIsCartOpen(false)}
                    className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A86DCD]"
                    aria-label={`View ${item.title}`}
                  >
                    <CartThumbnail item={item} />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/preview/${item.categorySlug || "birthday"}/${item.templateId}`}
                      onClick={() => setIsCartOpen(false)}
                      className="line-clamp-2 font-semibold text-gray-900 hover:text-[#9259b7]"
                    >
                      {item.title}
                      <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" />
                    </Link>
                    <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                    <p className="mt-3 font-bold text-[#A86DCD]">
                      ₹{Number(item.price).toLocaleString("en-IN")}
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleRemove(item.templateId)}
                      disabled={busyTemplateId === item.templateId}
                      className="mt-2 inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 disabled:cursor-wait disabled:opacity-60"
                    >
                      {busyTemplateId === item.templateId ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-3 border-t px-4 pt-4">
            {cartItems.length > 0 && (
              <>
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Subtotal</span>
                  <span className="text-[#A86DCD]">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full rounded-full bg-[#A86DCD] py-3 font-semibold text-white transition hover:bg-[#9254B7]"
                >
                  Proceed to Checkout
                </button>
              </>
            )}

            {user ? (
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-xs text-gray-500">
                  Signed in as {user.email}
                </p>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  disabled={isLoggingOut}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  {isLoggingOut ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginOpen(true)}
                className="w-full rounded-lg border border-[#dcc4ee] px-4 py-2.5 text-sm font-semibold text-[#5f4376] transition hover:bg-[#faf5ff]"
              >
                Sign in to save your cart
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#302438]">
              Checkout
            </DialogTitle>
            <DialogDescription>
              Secure checkout is coming soon. Your cart is saved, and no
              payment will be processed in this demo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.templateId}
                className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 px-4 py-3"
              >
                <span className="min-w-0 truncate text-sm font-medium text-gray-800">
                  {item.title}
                </span>
                <span className="shrink-0 text-sm font-semibold text-[#9259b7]">
                  ₹{Number(item.price).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t pt-4 font-semibold">
            <span>Subtotal</span>
            <span className="text-[#9259b7]">
              ₹{subtotal.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-purple-50 px-4 py-3 text-sm text-[#5f4376]">
            <CreditCard className="h-5 w-5 shrink-0" />
            Demo checkout — payment is not available yet.
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(false)}
              className="w-full rounded-xl bg-[#A86DCD] px-4 py-3 font-semibold text-white transition hover:bg-[#9254B7]"
            >
              Continue Shopping
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EmailAuthDialog
        open={isLoginOpen}
        templateTitle="your invitation templates"
        purpose="save"
        onClose={() => setIsLoginOpen(false)}
        onAuthenticated={refreshCart}
      />
    </>
  );
};

export default CartSheet;
