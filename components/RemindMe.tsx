"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LeafMark } from "./Ornament";
import { submitReminders } from "@/app/actions/remind-me";
import { SEASON_TOPICS } from "@/lib/season-topics";

export default function RemindMe({ variant = "section" }: { variant?: "section" | "inline" }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || selected.length === 0) return;
    setError(null);
    start(async () => {
      const res = await submitReminders({ email, phone, topics: selected });
      if (res.ok) setSubmitted(true);
      else setError(res.error ?? "Could not save. Try again?");
    });
  }

  if (variant === "inline") {
    return (
      <div className="bg-paper-dark border border-meadow/10 p-8 md:p-10">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
              <LeafMark className="w-6 h-9 text-wheat mx-auto mb-4" />
              <p className="font-serif text-2xl text-meadow mb-2">You&apos;re on the list.</p>
              <p className="text-ink-soft font-light text-sm">We&apos;ll reach out before each season you selected.</p>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleSubmit}>
              <p className="section-label mb-3">Remind Me</p>
              <p className="font-serif text-2xl text-meadow mb-6">Don&apos;t miss a season.</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {SEASON_TOPICS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggle(s.id)}
                    className={`px-4 py-2 text-xs tracking-wide font-light border transition-all duration-200 ${
                      selected.includes(s.id)
                        ? "bg-meadow text-paper border-meadow"
                        : "bg-transparent text-meadow border-meadow/30 hover:border-meadow"
                    }`}
                  >
                    {s.label}
                    <span className={`ml-2 opacity-60 ${selected.includes(s.id) ? "text-paper" : "text-stone"}`}>{s.when}</span>
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
                  className="flex-1 border border-meadow/20 bg-paper text-ink placeholder:text-ink-soft/40 px-4 py-3 text-sm font-light outline-none focus:border-meadow transition-colors"
                />
                <button
                  type="submit"
                  disabled={selected.length === 0 || pending}
                  className="px-6 py-3 bg-meadow text-paper text-xs tracking-widest uppercase font-light hover:bg-meadow-deep transition-colors disabled:opacity-40 shrink-0"
                >
                  {pending ? "…" : "Notify Me"}
                </button>
              </div>
              {error && <p className="text-xs text-sunset font-light mt-2">{error}</p>}
              {selected.length === 0 && email && (
                <p className="text-xs text-ink-soft font-light mt-2">Pick at least one season above.</p>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <section className="py-24 md:py-32 bg-meadow-deep">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div key="success" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <LeafMark className="w-6 h-9 text-wheat mx-auto mb-6" />
              <p className="font-serif text-4xl text-paper mb-4">You&apos;re on the list.</p>
              <p className="text-paper/60 font-light">We&apos;ll reach out before each season you selected. See you at the farm.</p>
            </motion.div>
          ) : (
            <motion.form key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit}>
              <div className="text-center mb-12">
                <LeafMark className="w-5 h-8 text-wheat mx-auto mb-6" />
                <p className="text-xs tracking-widest uppercase font-light text-wheat mb-4">Remind Me</p>
                <h2 className="font-serif text-4xl md:text-5xl text-paper leading-tight mb-4">
                  Never miss a season
                  <br />
                  <em>at Meadowlark.</em>
                </h2>
                <p className="text-paper/60 font-light max-w-lg mx-auto">
                  Select what you want to hear about and we&apos;ll send a heads-up before each one. No spam — just seasonal
                  news.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {SEASON_TOPICS.map((s, i) => (
                  <motion.button
                    key={s.id}
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => toggle(s.id)}
                    className={`group flex flex-col items-center px-5 py-3 border transition-all duration-200 ${
                      selected.includes(s.id)
                        ? "bg-wheat border-wheat text-ink"
                        : "bg-transparent border-paper/20 text-paper/70 hover:border-paper/50 hover:text-paper"
                    }`}
                  >
                    <span className="text-xs tracking-widest uppercase font-light">{s.label}</span>
                    <span className={`text-xs mt-0.5 font-light ${selected.includes(s.id) ? "text-ink/70" : "text-paper/40"}`}>
                      {s.when}
                    </span>
                  </motion.button>
                ))}
              </div>

              <div className="max-w-md mx-auto space-y-3">
                <div className="flex gap-0">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 bg-meadow border border-paper/20 text-paper placeholder:text-paper/30 px-5 py-4 text-sm font-light outline-none focus:border-wheat/60 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={selected.length === 0 || pending}
                    className="px-6 py-4 bg-wheat text-ink text-xs tracking-widest uppercase font-light hover:bg-wheat-light transition-colors disabled:opacity-40 shrink-0"
                  >
                    {pending ? "···" : "Notify Me"}
                  </button>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone (optional — for SMS)"
                  className="w-full bg-meadow border border-paper/10 text-paper placeholder:text-paper/25 px-5 py-3 text-sm font-light outline-none focus:border-wheat/50 transition-colors"
                />
                {error && <p className="text-xs text-sunset/80 font-light text-center">{error}</p>}
                {selected.length === 0 && (
                  <p className="text-xs text-paper/30 font-light text-center">Select at least one season above.</p>
                )}
                <p className="text-xs text-paper/25 font-light text-center">
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
