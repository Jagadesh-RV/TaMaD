import { motion } from "framer-motion";
import clsx from "clsx";

/**
 * GlassCard — a floating pane of frosted light.
 * Fades and lifts in with a soft spring, casting an aurora sheen along
 * its top edge. Used for floating surfaces: panels, inspector, overlays.
 */
export default function GlassCard({
  children,
  className = "",
  delay = 0,
  luminous = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  luminous?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 30,
        delay,
      }}
      className={clsx("glass card", luminous && "card-luminous", className)}
    >
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}
