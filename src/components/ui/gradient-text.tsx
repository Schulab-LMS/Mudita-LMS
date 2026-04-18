import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  animated?: boolean;
}

/** Signature launch-arc gradient applied to text. */
export function GradientText({
  children,
  as: Tag = "span",
  className,
  animated = false,
}: GradientTextProps) {
  return (
    <Tag
      className={cn(
        "inline-block bg-clip-text text-transparent",
        animated
          ? "bg-[linear-gradient(135deg,#4f3ff0,#8b5cf6,#ff8a3d,#8b5cf6,#4f3ff0)] bg-[length:300%_300%] animate-aurora"
          : "bg-[linear-gradient(135deg,#4f3ff0_0%,#8b5cf6_55%,#ff8a3d_100%)]",
        className
      )}
    >
      {children}
    </Tag>
  );
}
