import { cn } from "@/lib/utils";

interface AuroraBlobsProps {
  className?: string;
  variant?: "hero" | "soft" | "warm";
}

/**
 * Ambient colored blobs used behind hero sections — purely decorative,
 * pointer-events disabled. Three tokens so the "mood" can shift per page.
 */
export function AuroraBlobs({ className, variant = "hero" }: AuroraBlobsProps) {
  const a =
    variant === "warm"
      ? "from-[#ff8a3d]/40"
      : variant === "soft"
        ? "from-[#8b5cf6]/30"
        : "from-[#4f3ff0]/40";
  const b =
    variant === "warm"
      ? "from-[#ef4444]/30"
      : variant === "soft"
        ? "from-[#4f3ff0]/25"
        : "from-[#ff8a3d]/35";
  const c =
    variant === "warm"
      ? "from-[#8b5cf6]/25"
      : variant === "soft"
        ? "from-[#34d399]/25"
        : "from-[#8b5cf6]/30";

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <div
        className={cn(
          "absolute -top-40 -left-20 h-[32rem] w-[32rem] rounded-full blur-3xl animate-float-slow bg-radial-gradient",
          "bg-gradient-radial",
          a
        )}
        style={{
          background: `radial-gradient(circle, ${variant === "warm" ? "#ff8a3d" : variant === "soft" ? "#8b5cf6" : "#4f3ff0"}33, transparent 60%)`,
        }}
      />
      <div
        className={cn(
          "absolute -bottom-40 -right-20 h-[36rem] w-[36rem] rounded-full blur-3xl animate-float",
          b
        )}
        style={{
          background: `radial-gradient(circle, ${variant === "warm" ? "#ef4444" : variant === "soft" ? "#4f3ff0" : "#ff8a3d"}33, transparent 60%)`,
          animationDelay: "2.5s",
        }}
      />
      <div
        className={cn(
          "absolute top-1/3 left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full blur-3xl animate-float-delayed",
          c
        )}
        style={{
          background: `radial-gradient(circle, ${variant === "warm" ? "#8b5cf6" : variant === "soft" ? "#34d399" : "#8b5cf6"}22, transparent 60%)`,
        }}
      />
    </div>
  );
}
