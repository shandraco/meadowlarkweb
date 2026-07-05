"use client";

import { useEffect, useRef, useState } from "react";

export interface FarmVideoBlock {
  eyebrow: string;
  headline: string;
  emphasis: string;
  videos: { title: string; url: string; posterUrl?: string }[];
}

// Lazy-load videos as they scroll into view. When they leave, the src is
// unloaded so we're not keeping three MP4s alive at once. Keeps the page fast
// even with a handful of short clips.
function LazyVideo({ src, poster, title }: { src: string; poster?: string; title: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
          } else {
            setVisible(false);
            node.pause();
          }
        }
      },
      { threshold: 0.35 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className="w-full h-full object-cover"
      muted
      loop
      playsInline
      autoPlay={visible}
      poster={poster}
      src={visible ? src : undefined}
      aria-label={title}
    />
  );
}

export default function FarmVideos({ block }: { block: FarmVideoBlock }) {
  const videos = (block.videos ?? []).filter((v) => v.url?.trim());
  if (videos.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-paper-dark">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-10">
          <p className="section-label mb-2">{block.eyebrow}</p>
          <h2 className="font-serif text-4xl md:text-5xl text-ink leading-tight">
            {block.headline} <em>{block.emphasis}</em>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {videos.map((v, i) => (
            <figure key={i} className="relative aspect-[3/4] overflow-hidden bg-meadow-deep">
              <LazyVideo src={v.url} poster={v.posterUrl} title={v.title} />
              <figcaption className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-meadow-deep/80 to-transparent">
                <p className="text-xs tracking-widest uppercase font-light text-wheat">{v.title}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
