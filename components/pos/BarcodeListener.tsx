"use client";

import { useEffect, useRef } from "react";
import type { Product } from "@/lib/types";
import { findProductByBarcodeAction } from "@/app/pos/actions";

// Global key listener that watches for keyboard-wedge barcode scanners. The
// heuristic: a scanner fires many keystrokes very fast, terminated by Enter.
// We buffer characters and, on Enter, look up the barcode. Manual typing
// spread over > 60ms per keystroke is ignored — so a cashier typing in an
// input field never triggers a false scan.
//
// The listener attaches at document level. It ignores the event when the
// active element is an editable input so cashiers can still type numeric
// quantities or search a customer name.
const MAX_KEY_INTERVAL_MS = 60;
const MIN_CODE_LENGTH = 4;

export default function BarcodeListener({ onScan }: { onScan: (product: Product) => void }) {
  const bufferRef = useRef<string>("");
  const lastKeyRef = useRef<number>(0);

  useEffect(() => {
    function isEditable(el: Element | null): boolean {
      if (!el) return false;
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if ((el as HTMLElement).isContentEditable) return true;
      return false;
    }

    function onKey(e: KeyboardEvent) {
      if (isEditable(document.activeElement)) return;

      const now = performance.now();
      const gap = now - lastKeyRef.current;
      lastKeyRef.current = now;

      // Reset the buffer if too much time passed — treat as fresh keystroke.
      if (gap > MAX_KEY_INTERVAL_MS && bufferRef.current.length > 0) {
        bufferRef.current = "";
      }

      if (e.key === "Enter") {
        const code = bufferRef.current;
        bufferRef.current = "";
        if (code.length < MIN_CODE_LENGTH) return;
        e.preventDefault();
        void (async () => {
          const res = await findProductByBarcodeAction({ barcode: code });
          if (res.ok && res.product) onScan(res.product);
        })();
        return;
      }

      // Only accumulate visible characters — arrows, meta, shift etc. skipped.
      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onScan]);

  return null;
}
