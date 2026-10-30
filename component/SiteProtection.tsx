"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PROTECTION_STYLE = "site-protection-styles";

function isAllowedTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;

  return Boolean(
    target.closest(
      [
        "input",
        "textarea",
        "select",
        '[contenteditable="true"]',
        '[data-allow-copy="true"]',
      ].join(",")
    )
  );
}

function isDragAllowed(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;

  return Boolean(target.closest('[data-allow-drag="true"]'));
}

function isRestrictedShortcut(event: KeyboardEvent): boolean {
  const key = event.key.toLowerCase();
  const modifier = event.ctrlKey || event.metaKey;

  // Developer Tools
  if (key === "f12") {
    return true;
  }

  // Ctrl/Cmd + Shift + I, J, C, K, M
  if (
    modifier &&
    event.shiftKey &&
    ["i", "j", "c", "k", "m"].includes(key)
  ) {
    return true;
  }

  // Ctrl/Cmd + Alt/Option + I, J, C
  if (
    modifier &&
    event.altKey &&
    ["i", "j", "c"].includes(key)
  ) {
    return true;
  }

  // View Source, Save Page, Print
  if (modifier && ["u", "s", "p"].includes(key)) {
    return true;
  }

  // Copy page content (but allow copying inside forms and permitted areas)
  if (
    modifier &&
    key === "c" &&
    !isAllowedTarget(event.target)
  ) {
    return true;
  }

  return false;
}

export function SiteProtection() {
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState(
    "This action is disabled on this page."
  );

  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const triggerWarning = useCallback((message: string) => {
    setWarningMessage(message);
    setShowWarning(true);

    if (warningTimer.current) {
      clearTimeout(warningTimer.current);
    }

    warningTimer.current = setTimeout(() => {
      setShowWarning(false);
      warningTimer.current = null;
    }, 2800);
  }, []);

  useEffect(() => {
    // Add protection styles
    const style = document.createElement("style");
    style.id = PROTECTION_STYLE;

    style.textContent = `
      html.site-protection-active,
      html.site-protection-active body,
      html.site-protection-active body * {
        -webkit-user-select: none !important;
        user-select: none !important;
      }

      /* Allow normal interaction with form fields */
      html.site-protection-active input,
      html.site-protection-active textarea,
      html.site-protection-active select,
      html.site-protection-active [contenteditable="true"] {
        -webkit-user-select: text !important;
        user-select: text !important;
      }

      /* Allow copying inside explicitly permitted areas */
      html.site-protection-active [data-allow-copy="true"],
      html.site-protection-active [data-allow-copy="true"] * {
        -webkit-user-select: text !important;
        user-select: text !important;
      }

      /* Discourage dragging images and videos */
      html.site-protection-active img,
      html.site-protection-active video {
        -webkit-user-drag: none !important;
      }

      /* Hide page content in the browser print preview */
      @media print {
        html.site-protection-active body {
          display: none !important;
        }
      }
    `;

    document.head.appendChild(style);
    document.documentElement.classList.add(
      "site-protection-active"
    );

    // 1. Block right-click
    const onContextMenu = (event: MouseEvent) => {
      if (isAllowedTarget(event.target)) return;

      event.preventDefault();
      event.stopPropagation();

      triggerWarning("Right-click is disabled on this page.");
    };

    // 2. Block dragging images, videos and other elements
    const onDragStart = (event: DragEvent) => {
      if (isDragAllowed(event.target)) return;

      event.preventDefault();
      event.stopPropagation();

      triggerWarning("Dragging content is disabled.");
    };

    // 3. Block restricted keyboard shortcuts
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isRestrictedShortcut(event)) return;

      event.preventDefault();
      event.stopPropagation();

      triggerWarning(
        "This browser shortcut is disabled on this page."
      );
    };

    // 4. Block copying page content
    const onCopy = (event: ClipboardEvent) => {
      if (isAllowedTarget(event.target)) return;

      event.preventDefault();
      event.stopPropagation();

      triggerWarning("Copying page content is disabled.");
    };

    // 5. Block cutting page content
    const onCut = (event: ClipboardEvent) => {
      if (isAllowedTarget(event.target)) return;

      event.preventDefault();
      event.stopPropagation();

      triggerWarning("Cutting page content is disabled.");
    };

    // 6. Prevent selecting ordinary page text
    const onSelectStart = (event: Event) => {
      if (isAllowedTarget(event.target)) return;

      event.preventDefault();
    };

    // 7. Warn if someone tries to print using the browser menu
    const onBeforePrint = () => {
      triggerWarning("Printing is disabled on this page.");
    };

    document.addEventListener("contextmenu", onContextMenu, true);
    document.addEventListener("dragstart", onDragStart, true);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("copy", onCopy, true);
    document.addEventListener("cut", onCut, true);
    document.addEventListener("selectstart", onSelectStart, true);

    window.addEventListener("beforeprint", onBeforePrint);

    return () => {
      document.removeEventListener(
        "contextmenu",
        onContextMenu,
        true
      );
      document.removeEventListener(
        "dragstart",
        onDragStart,
        true
      );
      document.removeEventListener(
        "keydown",
        onKeyDown,
        true
      );
      document.removeEventListener("copy", onCopy, true);
      document.removeEventListener("cut", onCut, true);
      document.removeEventListener(
        "selectstart",
        onSelectStart,
        true
      );

      window.removeEventListener("beforeprint", onBeforePrint);

      document.documentElement.classList.remove(
        "site-protection-active"
      );

      style.remove();

      if (warningTimer.current) {
        clearTimeout(warningTimer.current);
        warningTimer.current = null;
      }
    };
  }, [triggerWarning]);

  return (
    <>
      {showWarning && (
        <div
          role="status"
          aria-live="polite"
          className="
            pointer-events-none
            fixed
            left-1/2
            top-5
            z-[100000]
            w-[calc(100%-2rem)]
            max-w-md
            -translate-x-1/2
            rounded-xl
            border
            border-white/10
            bg-neutral-950/95
            px-5
            py-3
            text-center
            text-sm
            font-medium
            text-white
            shadow-2xl
            backdrop-blur-md
          "
        >
          <span className="mr-2">⚠️</span>
          {warningMessage}
        </div>
      )}
    </>
  );
}