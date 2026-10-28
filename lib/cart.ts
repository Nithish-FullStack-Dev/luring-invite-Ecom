export interface CartItem {
  templateId: number;
  title: string;
  price: number;
  thumbnail: string | null;
  category: string;
  categorySlug?: string;
  quantity: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function normalizeCartItem(value: unknown): CartItem | null {
  if (!isRecord(value)) return null;

  const templateId = Number(value.templateId);
  if (!Number.isSafeInteger(templateId) || templateId <= 0) return null;

  const quantity = Number(value.quantity ?? 1);
  const price = Number(value.price);

  return {
    templateId,
    title:
      typeof value.title === "string" && value.title.trim()
        ? value.title.trim()
        : "Invitation",
    price: Number.isFinite(price) ? price : 0,
    thumbnail: typeof value.thumbnail === "string" ? value.thumbnail : null,
    category:
      typeof value.category === "string" && value.category.trim()
        ? value.category.trim()
        : "Invitation",
    categorySlug:
      typeof value.categorySlug === "string" && value.categorySlug.trim()
        ? value.categorySlug.trim()
        : undefined,
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
  };
}

export async function persistCartItem(
  item: Omit<CartItem, "quantity">,
): Promise<CartItem[]> {
  const response = await fetch("/api/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({ templateId: item.templateId }),
  });

  const result: unknown = await response.json().catch(() => null);
  if (!isRecord(result) || !response.ok || !Array.isArray(result.items)) {
    const message =
      isRecord(result) && typeof result.message === "string"
        ? result.message
        : "Unable to add the template to cart.";
    throw new Error(message);
  }

  return result.items
    .map(normalizeCartItem)
    .filter((cartItem): cartItem is CartItem => cartItem !== null);
}
