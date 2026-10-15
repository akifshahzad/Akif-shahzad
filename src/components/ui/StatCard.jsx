import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

export default function StatCard({ value, suffix = "", label }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    const duration = 1200;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    const frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-xl border border-ink-700 light:border-paper-300 bg-ink-800 light:bg-paper-100 p-6 text-center"
    >
      <p className="font-display text-3xl font-semibold text-amber-400">
        {count}
        {suffix}
      </p>
      <p className="mt-1 text-sm text-paper-300 light:text-ink-700">{label}</p>
    </motion.div>
  );
}
