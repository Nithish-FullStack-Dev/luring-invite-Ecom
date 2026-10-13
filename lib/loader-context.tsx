"use client";
import React, { createContext, useContext, useState, useSyncExternalStore } from "react";
interface LoaderContextType { done: boolean; finish: () => void }
const KEY = "invite-loader-done";
function readDone(): boolean {
  try { return sessionStorage.getItem(KEY) === "true"; } catch { return false; }
}
function subscribe(notify: () => void) {
  window.addEventListener("pageshow", notify);
  window.addEventListener("storage", notify);
  document.addEventListener("visibilitychange", notify);
  return () => {
    window.removeEventListener("pageshow", notify);
    window.removeEventListener("storage", notify);
    document.removeEventListener("visibilitychange", notify);
  };
}
const serverSnapshot = () => false;
const LoaderContext = createContext<LoaderContextType | null>(null);
export const LoaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Match the server during hydration, then read the tab's existing animation flag.
  const persisted = useSyncExternalStore(subscribe, readDone, serverSnapshot);
  const [finished, setFinished] = useState(false);
  const finish = () => {
    try { sessionStorage.setItem(KEY, "true"); } catch { /* Storage may be disabled. */ }
    setFinished(true);
  };
  return <LoaderContext.Provider value={{ done: finished || persisted, finish }}>{children}</LoaderContext.Provider>;
};
export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) throw new Error("useLoader must be used inside LoaderProvider");
  return context;
};
