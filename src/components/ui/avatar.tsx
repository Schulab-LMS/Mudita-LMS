import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses: Record<string, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

const sizePixels: Record<string, number> = {
  sm: 32,
  md: 40,
  lg: 56,
};

export function Avatar({
  src,
  alt,
  fallback,
  size = "md",
  className,
}: AvatarProps) {
  const sizeClass = sizeClasses[size];
  const pixels = sizePixels[size];

  if (src) {
    return (
      <Image
        src={src}
        alt={alt ?? fallback}
        width={pixels}
        height={pixels}
        className={cn(
          "shrink-0 rounded-full object-cover",
          sizeClass,
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary font-medium text-white",
        sizeClass,
        className
      )}
      aria-label={alt ?? fallback}
    >
      {fallback}
    </div>
  );
}
