"use client";

import { useRef, useState } from "react";
import { uploadProductImage } from "@/app/admin/products/actions";

export default function ImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadProductImage(fd);
    setUploading(false);
    if (res.ok && res.url) onChange(res.url);
    else setError(res.error ?? "Upload failed.");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <div className="flex items-start gap-4">
        <div className="w-28 h-32 bg-paper-dark/50 border border-meadow/15 overflow-hidden shrink-0 flex items-center justify-center">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-stone/40 text-xs">No image</span>
          )}
        </div>

        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleFile}
            className="hidden"
            id="product-image-input"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-xs tracking-widest uppercase px-4 py-2 border border-meadow text-meadow hover:bg-meadow hover:text-paper transition-colors disabled:opacity-50"
          >
            {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="ml-3 text-xs tracking-widest uppercase text-stone hover:text-sunset transition-colors"
            >
              Remove
            </button>
          )}
          <p className="text-xs text-ink-soft/60 font-light mt-2">JPG, PNG, WebP · up to 5 MB</p>
          {error && <p className="text-xs text-sunset mt-1">{error}</p>}

          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste an image URL"
            className="w-full mt-3 border border-meadow/15 bg-paper text-ink placeholder:text-ink-soft/40 px-3 py-2 text-xs font-light outline-none focus:border-meadow"
          />
        </div>
      </div>
    </div>
  );
}
