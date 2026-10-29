import type { Prisma } from "@prisma/client";
import {
  templateCategoryForSlug,
  type TemplateCategorySlug,
} from "@/lib/template-categories";

export async function resolveTemplateCategoryId(
  transaction: Prisma.TransactionClient,
  slug: TemplateCategorySlug,
) {
  const definition = templateCategoryForSlug(slug);
  if (!definition) {
    throw new Error(`Unknown template category: ${slug}`);
  }

  for (const alias of definition.aliases) {
    const category = await transaction.category.findUnique({
      where: { slug: alias },
      select: { id: true },
    });
    if (category) return category.id;
  }

  const category = await transaction.category.upsert({
    where: { slug: definition.slug },
    update: {},
    create: { name: definition.name, slug: definition.slug },
    select: { id: true },
  });
  return category.id;
}
