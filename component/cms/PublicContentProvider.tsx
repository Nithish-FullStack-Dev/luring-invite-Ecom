"use client";
import { createContext, useContext } from "react";
import type { PublicContent } from "@/lib/cms/schema";
const Context = createContext<PublicContent>({});
export function PublicContentProvider({ content, children }: { content: PublicContent; children: React.ReactNode }) {
  return <Context.Provider value={content}>{children}</Context.Provider>;
}
export const usePublicContent = () => useContext(Context);
