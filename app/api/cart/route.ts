import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/cart/auth";
import { prisma } from "@/lib/prisma";

const GUEST_CART_COOKIE = "luring_guest_cart_id";

function normalizeGuestId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const guestId = value.trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    guestId,
  )
    ? guestId
    : null;
}

function toCartItemShape(item: {
  templateId: number;
  quantity: number;
  unitPrice: Prisma.Decimal | string | number;
  template: {
    title?: string | null;
    thumbnail?: string | null;
    price: Prisma.Decimal | string | number;
    categories?: Array<{
      category?: { name?: string | null; slug?: string | null } | null;
    }> | null;
  };
}) {
  return {
    templateId: item.templateId,
    title: item.template.title || "Invitation",
    thumbnail: item.template.thumbnail ?? null,
    category:
      item.template.categories?.[0]?.category?.name || "Invitation",
    categorySlug: item.template.categories?.[0]?.category?.slug || "birthday",
    price: Number(item.template.price ?? item.unitPrice),
    quantity: 1,
  };
}

async function getCartForRequest(userId: string | null, guestId: string | null) {
  if (userId) {
    return prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            template: {
              include: {
                categories: { include: { category: true } },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  if (!guestId) return null;

  return prisma.cart.findUnique({
    where: { guestId },
    include: {
      items: {
        include: {
          template: {
            include: {
              categories: { include: { category: true } },
            },
          },
        },
      },
    },
  });
}

async function listCartItems(cartId: string) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          template: {
            include: {
              categories: { include: { category: true } },
            },
          },
        },
      },
    },
  });

  return (cart?.items ?? []).map((item) => toCartItemShape(item));
}

function setGuestCookie(response: NextResponse, value: string | null) {
  if (value) {
    response.cookies.set(GUEST_CART_COOKIE, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return;
  }

  response.cookies.set(GUEST_CART_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const currentUser = await getCurrentUser();
  const guestId = normalizeGuestId(
    normalizeGuestId(request.cookies.get(GUEST_CART_COOKIE)?.value) ??
      cookieStore.get(GUEST_CART_COOKIE)?.value,
  );

  const cart = await getCartForRequest(currentUser?.id ?? null, guestId);
  const user = currentUser
    ? { id: currentUser.id, email: currentUser.email }
    : null;

  if (!cart) {
    return NextResponse.json(
      { items: [], count: 0, user },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  }

  const items = cart.items.map((item) => toCartItemShape(item));

  return NextResponse.json({
    items,
    count: items.length,
    guestId: cart.guestId ?? null,
    user,
  }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Invalid request payload." },
        { status: 400 },
      );
    }

    const templateId = Number((body as Record<string, unknown>).templateId);
    if (!Number.isInteger(templateId) || templateId <= 0) {
      return NextResponse.json(
        { message: "Invalid template selection." },
        { status: 400 },
      );
    }

    const template = await prisma.template.findUnique({
      where: { id: templateId },
      select: {
        id: true,
        title: true,
        price: true,
        thumbnail: true,
        active: true,
        categories: { include: { category: true } },
      },
    });

    if (!template || !template.active) {
      return NextResponse.json(
        { message: "Template not found." },
        { status: 404 },
      );
    }

    const currentUser = await getCurrentUser();
    const cookieStore = await cookies();
    const guestId = normalizeGuestId(cookieStore.get(GUEST_CART_COOKIE)?.value);

    let resolvedGuestId: string | null = currentUser ? null : guestId;

    const result = await prisma.$transaction(async (tx) => {
      let cart: {
        id: string;
        userId: string | null;
        guestId: string | null;
        items: Array<{
          cartId: string;
          templateId: number;
          quantity: number;
          unitPrice: Prisma.Decimal | string | number;
        }>;
      } | null = null;

      if (currentUser) {
        cart = await tx.cart.findFirst({
          where: { userId: currentUser.id },
          include: { items: true },
          orderBy: { updatedAt: "desc" },
        });

        if (!cart) {
          cart = await tx.cart.create({
            data: { userId: currentUser.id },
            include: { items: true },
          });
        }

      } else {
        const activeGuestId = guestId ?? crypto.randomUUID();
        cart = await tx.cart.findUnique({
          where: { guestId: activeGuestId },
          include: { items: true },
        });

        if (!cart) {
          cart = await tx.cart.create({
            data: { guestId: activeGuestId },
            include: { items: true },
          });
        }

        resolvedGuestId = cart.guestId ?? activeGuestId;
      }

      const unitPrice = new Prisma.Decimal(Number(template.price).toFixed(2));

      await tx.cartItem.upsert({
        where: {
          cartId_templateId: {
            cartId: cart!.id,
            templateId: template.id,
          },
        },
        update: {
          unitPrice,
          quantity: 1,
        },
        create: {
          cartId: cart!.id,
          templateId: template.id,
          quantity: 1,
          unitPrice,
        },
      });

      return tx.cart.findUnique({
        where: { id: cart!.id },
        include: {
          items: {
            include: {
              template: {
                include: {
                  categories: { include: { category: true } },
                },
              },
            },
          },
        },
      });
    });

    const items = (result?.items ?? []).map((item) => toCartItemShape(item));
    const itemCount = items.length;
    const response = NextResponse.json(
      {
        message: "Template added to cart.",
        items,
        count: itemCount,
        guestId: resolvedGuestId ?? null,
      },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );

    if (!currentUser && resolvedGuestId) {
      setGuestCookie(response, resolvedGuestId);
    }

    return response;
  } catch (error) {
    console.error("POST /api/cart failed:", error);
    return NextResponse.json(
      { message: "Unable to add template to cart." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const templateId = Number(
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>).templateId
        : null,
    );

    if (!Number.isInteger(templateId) || templateId <= 0) {
      return NextResponse.json(
        { message: "Invalid template selection." },
        { status: 400 },
      );
    }

    const currentUser = await getCurrentUser();
    const cookieStore = await cookies();
    const guestId = normalizeGuestId(cookieStore.get(GUEST_CART_COOKIE)?.value);
    const cart = await getCartForRequest(currentUser?.id ?? null, guestId);

    if (!cart) {
      return NextResponse.json(
        { items: [], count: 0 },
        { headers: { "Cache-Control": "private, no-store, max-age=0" } },
      );
    }

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        templateId,
      },
    });

    const updatedItems = await listCartItems(cart.id);

    return NextResponse.json(
      {
        items: updatedItems,
        count: updatedItems.length,
      },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("DELETE /api/cart failed:", error);
    return NextResponse.json(
      { message: "Unable to update cart." },
      { status: 500 },
    );
  }
}
