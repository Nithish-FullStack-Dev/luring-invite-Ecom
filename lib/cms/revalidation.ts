export function invalidateContent(updateTag: (tag: string) => void, revalidatePath: (path: string, type: "layout") => void) {
  updateTag("cms:published");
  revalidatePath("/", "layout");
}
