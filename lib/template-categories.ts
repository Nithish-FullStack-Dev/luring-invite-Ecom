export const TEMPLATE_CATEGORIES = [
  { name: "Wedding", slug: "wedding", aliases: ["wedding"] },
  { name: "Birthday", slug: "birthday", aliases: ["birthday"] },
  { name: "Anniversary", slug: "anniversary", aliases: ["anniversary"] },
  {
    name: "Housewarming",
    slug: "housewarming",
    aliases: ["housewarming", "house-warming"],
  },
  { name: "Others", slug: "others", aliases: ["others", "other"] },
] as const;

export type TemplateCategorySlug =
  (typeof TEMPLATE_CATEGORIES)[number]["slug"];

export function templateCategoryForSlug(value: unknown) {
  if (typeof value !== "string") return undefined;
  return TEMPLATE_CATEGORIES.find((category) =>
    (category.aliases as readonly string[]).includes(value),
  );
}

export function templateCategoryFilterSlugs(value: string): string[] {
  const category = templateCategoryForSlug(value);
  return category ? [...category.aliases] : [value];
}

export function selectedTemplateCategorySlug(
  categories: readonly { slug?: unknown }[],
): TemplateCategorySlug | undefined {
  for (const option of TEMPLATE_CATEGORIES) {
    if (
      categories.some((category) =>
        (option.aliases as readonly string[]).includes(
          typeof category.slug === "string" ? category.slug : "",
        ),
      )
    ) {
      return option.slug;
    }
  }
  return undefined;
}
