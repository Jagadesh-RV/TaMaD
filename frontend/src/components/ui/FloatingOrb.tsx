export default function FloatingOrb({
  size = 300,
  top,
  left,
  right,
  bottom,
  color,
}) {
  return (
    <div
      className="absolute rounded-full blur-[100px] opacity-30 animate-pulse"
      style={{
        width: size,
        height: size,
        top,
        left,
        right,
        bottom,
        background: color,
      }}
    />
  );
}