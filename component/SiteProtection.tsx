"use client";

import { useEffect, useState } from "react";

export function SiteProtection() {
  const [showWarning, setShowWarning] = useState(false);
  const [locked, setLocked] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const triggerWarning = () => {
    setAttempts((prev) => {
      const next = prev + 1;

      if (next >= 3) {
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 4000);
      }

      if (next >= 6) {
        setLocked(true);
        setTimeout(() => setLocked(false), 6000);
      }

      return next;
    });
  };

  useEffect(() => {
    // 🚫 Right Click
    const onRightClick = (e: MouseEvent) => {
      e.preventDefault();
      triggerWarning();
    };

    // 🚫 Drag
    const onDrag = (e: DragEvent) => {
      e.preventDefault();
    };

    // 🚫 Keys
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (
        key === "f12" ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key)) ||
        (e.ctrlKey && ["u", "s", "p", "c"].includes(key))
      ) {
        e.preventDefault();
        triggerWarning();
      }
    };

    // 🚫 Copy
    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerWarning();
    };

    // 🔥 DevTools Detection (Strong)
    const detectDevTools = () => {
      const threshold = 160;

      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        setLocked(true);
      }
    };

    // 🔥 Debugger Trap (VERY IMPORTANT)
    const debuggerTrap = () => {
      const start = Date.now();
      debugger;
      const end = Date.now();

      if (end - start > 100) {
        setLocked(true);
      }
    };

    // 🔥 Tab visibility (user switching tricks)
    const onVisibilityChange = () => {
      if (document.hidden) {
        setLocked(true);
      }
    };

    const devtoolsInterval = setInterval(detectDevTools, 1000);
    const debuggerInterval = setInterval(debuggerTrap, 2000);

    document.addEventListener("contextmenu", onRightClick);
    document.addEventListener("dragstart", onDrag);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("copy", onCopy);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(devtoolsInterval);
      clearInterval(debuggerInterval);
      document.removeEventListener("contextmenu", onRightClick);
      document.removeEventListener("dragstart", onDrag);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <>
      {/* 🔥 LOCK SCREEN */}
      {locked && (
        <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex items-center justify-center text-center px-6">
          <div className="max-w-md">
            <h2 className="text-white text-2xl font-bold mb-3">
              ⚠️ Protected Content
            </h2>
            <p className="text-gray-300">
              Unauthorized access detected. Please close developer tools.
            </p>
          </div>
        </div>
      )}

      {/* ⚠️ Warning */}
      {showWarning && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] bg-red-600 text-white px-6 py-3 rounded-full shadow-xl">
          Content protection enabled ⚠️
        </div>
      )}
    </>
  );
}
