export default function PremiumButton({
  children,
}) {
  return (
    <button
      className="
      px-6 py-3 rounded-2xl
      bg-gradient-to-r
      from-blue-500
      via-purple-500
      to-pink-500

      hover:scale-105
      transition-all duration-300

      shadow-[0_0_25px_rgba(168,85,247,.35)]

      font-semibold
    "
    >
      {children}
    </button>
  );
}