// src/lib/loader-context.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

interface LoaderContextType {
  done: boolean;
  finish: () => void;
}

const KEY = "invite-loader-done";

// safe read
function readDone(): boolean {
  try {
    return sessionStorage.getItem(KEY) === "true";
  } catch {
    return false;
  }
}

const LoaderContext = createContext<LoaderContextType | null>(null);

export const LoaderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [done, setDone] = useState<boolean>(() => readDone());

  // ✅ Re-sync when tab becomes visible again (fixes "missing after switching tab")
  useEffect(() => {
    const sync = () => setDone(readDone());

    const onVisibility = () => {
      if (document.visibilityState === "visible") sync();
    };

    // when coming back from bfcache on Safari
    const onPageShow = () => sync();

    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const finish = () => {
    try {
      sessionStorage.setItem(KEY, "true");
    } catch {
      // ignore
    }
    setDone(true);
  };

  return (
    <LoaderContext.Provider value={{ done, finish }}>
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const ctx = useContext(LoaderContext);
  if (!ctx) throw new Error("useLoader must be used inside LoaderProvider");
  return ctx;
};
