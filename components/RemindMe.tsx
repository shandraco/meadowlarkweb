"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LeafMark } from "./Ornament";

const seasons = [
  { id: "strawberries", label: "Strawberry U-Pick", when: "May" },
  { id: "peaches", label: "Peach Season", when: "July–Aug" },
  { id: "apples", label: "Apple Harvest", when: "Aug–Oct" },
  { id: "pumpkins", label: "Pumpkin Patch", when: "October" },
  { id: "cider-release", label: "Cider Club Releases", when: "4× per year" },
  { id: "live-music", label: "Live Music & Events", when: "Seasonal" },
  { id: "farmers-market", label: "Farmers Market Updates", when: "Every Saturday" },
];

export default function RemindMe({ variant = "section" }: { variant?: "section" | "inline" }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || selected.length === 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  };

  if (variant === "inline") {
    return (
      <div className="bg-cream-dark border border-orchard/10 p-8 md:p-10">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-6"
            >
              <LeafMark className="w-6 h-9 text-maroon mx-auto mb-4" />
              <p className="font-serif text-2xl text-orchard mb-2">You're on the list.</p>
              <p className="text-stone font-light text-sm">We'll reach out before each season you selected.</p>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleSubmit}>
              <p className="section-label mb-3">Remind Me</p>
              <p className="font-serif text-2xl text-orchard mb-6">Don't miss a season.</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {seasons.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggle(s.id)}
                    className={`px-4 py-2 text-xs tracking-wide font-light border transition-all duration-200 ${
                      selected.includes(s.id)
                        ? "bg-orchard text-cream border-orchard"
                        : "bg-transparent text-orchard border-orchard/30 hover:border-orchard"
                    }`}
                  >
                    {s.label}
                    <span className={`ml-2 opacity-60 ${selected.includes(s.id) ? "text-cream" : "text-stone"}`}>
                      {s.when}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex gap-0">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 border border-orchard/20 bg-cream text-orchard placeholder:text-stone/40 px-4 py-3 text-sm font-light outline-none focus:border-amber/60 transition-colors"
                />
                <button
                  type="submit"
                  disabled={selected.length === 0 || loading}
                  className="px-6 py-3 bg-orchard text-cream text-xs tracking-widest uppercase font-light hover:bg-orchard-light transition-colors disabled:opacity-40 shrink-0"
                >
                  {loading ? "..." : "Notify Me"}
                </button>
              </div>
              {selected.length === 0 && email && (
                <p className="text-xs text-maroon font-light mt-2">Pick at least one season above.</p>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full section variant
  return (
    <section className="py-24 md:py-32 bg-orchard">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <LeafMark className="w-6 h-9 text-amber mx-auto mb-6" />
              <p className="font-serif text-4xl text-cream mb-4">You're on the list.</p>
              <p className="text-cream/60 font-light">
                We'll reach out before each season you selected. See you at the farm.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
            >
              <div className="text-center mb-12">
                <LeafMark className="w-5 h-8 text-amber mx-auto mb-6" />
                <p className="section-label text-amber mb-4">Remind Me</p>
                <h2 className="font-serif text-4xl md:text-5xl text-cream leading-tight mb-4">
                  Never miss a season
                  <br />
                  <em>at Meadowlark.</em>
                </h2>
                <p className="text-cream/55 font-light max-w-lg mx-auto">
                  Select what you want to hear about and we'll send a heads-up before
                  each one. No spam, just seasonal news from the farm.
                </p>
              </div>

              {/* Season chips */}
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {seasons.map((s, i) => (
                  <motion.button
                    key={s.id}
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => toggle(s.id)}
                    className={`group flex flex-col items-center px-5 py-3 border transition-all duration-200 ${
                      selected.includes(s.id)
                        ? "bg-amber border-amber text-orchard"
                        : "bg-transparent border-cream/20 text-cream/70 hover:border-cream/50 hover:text-cream"
                    }`}
                  >
                    <span className="text-xs tracking-widest uppercase font-light">{s.label}</span>
                    <span className={`text-xs mt-0.5 font-light ${selected.includes(s.id) ? "text-orchard/70" : "text-cream/35"}`}>
                      {s.when}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Email + submit */}
              <div className="max-w-md mx-auto">
                <div className="flex gap-0">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 bg-orchard-light border border-cream/15 text-cream placeholder:text-cream/25 px-5 py-4 text-sm font-light outline-none focus:border-amber/50 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={selected.length === 0 || loading}
                    className="px-6 py-4 bg-amber text-orchard text-xs tracking-widest uppercase font-light hover:bg-amber-light transition-colors disabled:opacity-35 shrink-0"
                  >
                    {loading ? "···" : "Notify Me"}
                  </button>
                </div>
                {selected.length === 0 && (
                  <p className="text-xs text-cream/30 font-light mt-3 text-center">Select at least one season above.</p>
                )}
                <p className="text-xs text-cream/25 font-light mt-3 text-center">
                  No spam. Unsubscribe anytime. Your email stays at the farm.
                </p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
