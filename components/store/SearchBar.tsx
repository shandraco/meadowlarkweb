"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { effectivePriceCents } from "@/lib/types";
import { formatUSD } from "@/lib/money";
import { searchProducts } from "@/app/store/search/actions";
import { Search as SearchIcon, Close as CloseIcon } from "@/components/Icons";

// Typeahead search dropdown. Debounced 250ms. Enter → jumps to first result.
export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Focus the input as soon as the search is opened.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Live search — debounced 250ms.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      start(async () => {
        if (q.trim().length < 2) {
          setResults([]);
          return;
        }
        const res = await searchProducts({ q, limit: 8 });
        setResults(res.ok && res.results ? res.results : []);
      });
    }, 250);
    return () => clearTimeout(t);
  }, [q, open]);

  // Click-outside to close.
  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function closeAndClear() {
    setOpen(false);
    setQ("");
    setResults([]);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Search"
        className="p-1 text-meadow hover:text-meadow-deep transition-colors"
      >
        <SearchIcon className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-wheat border border-meadow/15 shadow-lg z-40">
          <div className="flex items-center gap-2 border-b border-meadow/10 px-4 py-3">
            <SearchIcon className="w-4 h-4 text-stone" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cider, peach, apple butter…"
              className="flex-1 bg-transparent text-ink placeholder:text-ink-soft/50 text-sm font-light outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && results[0]) {
                  closeAndClear();
                  window.location.href = `/store/${results[0].slug}`;
                }
                if (e.key === "Escape") closeAndClear();
              }}
            />
            <button onClick={closeAndClear} aria-label="Close search" className="text-stone hover:text-cider">
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-auto">
            {pending && q.length >= 2 && (
              <p className="p-4 text-xs text-ink-soft font-light">Searching…</p>
            )}
            {!pending && q.length >= 2 && results.length === 0 && (
              <p className="p-4 text-sm text-ink-soft font-light">
                Nothing matched &ldquo;{q}&rdquo;. Try &ldquo;cider&rdquo; or &ldquo;peach.&rdquo;
              </p>
            )}
            {q.length < 2 && (
              <div className="p-4 text-xs text-ink-soft/70 font-light">
                Type at least two letters to search the catalog.
              </div>
            )}
            {results.length > 0 && (
              <ul className="divide-y divide-meadow/10">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/store/${p.slug}`}
                      onClick={closeAndClear}
                      className="flex items-center gap-3 p-3 hover:bg-wheat-dark transition-colors"
                    >
                      <div className="w-12 h-14 shrink-0 bg-wheat-dark overflow-hidden">
                        {p.image_url && (
                          <Image
                            src={p.image_url}
                            alt={p.name}
                            width={48}
                            height={56}
                            className="w-full h-full object-cover estate-photo"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-base text-ink truncate">{p.name}</p>
                        {p.tier && <p className="text-[10px] tracking-widest uppercase text-stone">{p.tier}</p>}
                      </div>
                      <span className="text-cider font-serif text-sm whitespace-nowrap">
                        {formatUSD(effectivePriceCents(p))}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
