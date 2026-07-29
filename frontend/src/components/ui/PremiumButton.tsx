import { motion } from "framer-motion";

export default function PremiumButton({
  children,
  onClick,
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative px-6 py-3 rounded-xl font-semibold text-white overflow-hidden group
        bg-[color:var(--color-accent)]
        shadow-soft
        hover:-translate-y-0.5 hover:shadow-float
        transition-all duration-300
        ${className}
      `}
    >
      {/* Soft shine effect */}
      <div className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}