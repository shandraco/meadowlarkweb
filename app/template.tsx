"use client";

import { motion } from "framer-motion";

// Re-mounts on every navigation, so the content gently rises and fades in —
// turning page changes into a bound, deliberate motion rather than a hard cut.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
