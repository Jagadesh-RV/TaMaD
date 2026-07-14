import { motion } from "framer-motion";

export default function PremiumButton({
  children,
  onClick,
  className = "",
  type = "button",
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative px-6 py-3 rounded-xl font-semibold text-white overflow-hidden group
        bg-gradient-to-r from-primary to-purple-600
        shadow-[0_0_20px_rgba(139,92,246,0.3)]
        hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]
        transition-all duration-300
        ${className}
      `}
    >
      {/* Hover gradient sweep effect */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
      
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}