import { motion } from "framer-motion";

export default function GlassCard({
  children,
  className = "",
}) {
  return (
    <motion.div
      whileHover={{
        y: -6,
        scale: 1.01,
      }}
      transition={{
        duration: 0.25,
      }}
      className={`
        bg-surface
        border border-border
        shadow-soft hover:shadow-float
        rounded-2xl
        p-6
        relative
        overflow-hidden
        transition-shadow
        ${className}
      `}
    >

      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}