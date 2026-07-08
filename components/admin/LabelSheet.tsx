"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { formatUSD } from "@/lib/money";

export interface LabelItem {
  id: string;
  name: string;
  priceCents: number;
  code: string;
}

export default function LabelSheet({
  items,
  initialProductId,
  initialQty,
}: {
  items: LabelItem[];
  initialProductId?: string;
  initialQty?: number;
}) {
  const [productId, setProductId] = useState(
    initialProductId && items.some((i) => i.id === initialProductId) ? initialProductId : items[0]?.id ?? "",
  );
  const [qty, setQty] = useState(String(Math.min(Math.max(initialQty ?? 12, 1), 200)));
  const [dataUrl, setDataUrl] = useState<string>("");

  const product = useMemo(() => items.find((i) => i.id === productId), [items, productId]);
  const count = Math.min(Math.max(parseInt(qty, 10) || 0, 0), 200);

  useEffect(() => {
    let cancelled = false;
    if (!product) {
      setDataUrl("");
      return;
    }
    QRCode.toDataURL(product.code, { width: 320, margin: 1, errorCorrectionLevel: "M" })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl("");
      });
    return () => {
      cancelled = true;
    };
  }, [product]);

  const inputCls = "border border-meadow/20 bg-paper px-3 py-2 text-ink focus:outline-none focus:border-meadow";

  return (
    <div>
      {/* Controls — hidden when printing */}
      <div className="no-print flex flex-wrap items-end gap-4 mb-8">
        <div>
          <label className="block text-xs tracking-widest uppercase font-light text-stone mb-2">Product</label>
          <select className={inputCls} value={productId} onChange={(e) => setProductId(e.target.value)}>
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase font-light text-stone mb-2">Labels</label>
          <input
            type="number"
            min={1}
            max={200}
            className={`${inputCls} w-28`}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </div>
        <button onClick={() => window.print()} className="btn-primary" disabled={!dataUrl || count === 0}>
          Print {count} label{count === 1 ? "" : "s"}
        </button>
      </div>

      {product && (
        <p className="no-print text-xs text-stone mb-4">
          Encodes: <code className="text-ink-soft">{product.code}</code>
          {" — "}scanning it at the POS pulls up “{product.name}”.
        </p>
      )}

      {/* Printable area */}
      <div className="print-area">
        <div className="grid grid-cols-3 gap-2 print:gap-0">
          {product && dataUrl
            ? Array.from({ length: count }).map((_, i) => (
                <div
                  key={i}
                  className="qr-label flex items-center gap-3 border border-ink/20 p-2 break-inside-avoid"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={dataUrl} alt="" className="w-16 h-16 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-serif text-sm text-ink leading-tight truncate">{product.name}</p>
                    <p className="text-sm text-ink font-semibold">{formatUSD(product.priceCents)}</p>
                    <p className="text-[9px] text-ink/60 truncate font-mono">{product.code}</p>
                  </div>
                </div>
              ))
            : null}
        </div>
      </div>
    </div>
  );
}
