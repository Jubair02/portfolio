"use client";

import { motion } from "framer-motion";

/** Elegant centered divider that draws itself in when scrolled into view. */
export function SectionDivider() {
  return (
    <div
      className="container-page flex items-center justify-center py-4"
      aria-hidden="true"
    >
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="section-divider relative w-full max-w-xs origin-center"
      >
        <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_10px_2px_color-mix(in_oklab,var(--primary)_55%,transparent)]" />
      </motion.div>
    </div>
  );
}
