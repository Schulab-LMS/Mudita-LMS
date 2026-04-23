import Image from "next/image";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AvatarStackUser {
  name: string;
  image?: string | null;
}

interface AvatarStackProps {
  users: AvatarStackUser[];
  max?: number;
  size?: "xs" | "sm" | "md" | "lg";
  extraCount?: number;
  className?: string;
}

const SIZES = {
  xs: { box: "h-6 w-6 text-[10px]", ring: "ring-2" },
  sm: { box: "h-7 w-7 text-[11px]", ring: "ring-2" },
  md: { box: "h-8 w-8 text-xs", ring: "ring-2" },
  lg: { box: "h-10 w-10 text-sm", ring: "ring-[3px]" },
};

export function AvatarStack({ users, max = 4, size = "sm", extraCount, className }: AvatarStackProps) {
  const visible = users.slice(0, max);
  const remaining = (extraCount ?? Math.max(0, users.length - max));
  const sz = SIZES[size];

  return (
    <div className={cn("inline-flex -space-x-2 rtl:space-x-reverse", className)}>
      {visible.map((u, i) => (
        <span
          key={`${u.name}-${i}`}
          className={cn(
            "relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 font-semibold text-foreground",
            sz.box,
            sz.ring,
            "ring-background"
          )}
          title={u.name}
        >
          {u.image ? (
            <Image src={u.image} alt={u.name} fill sizes="40px" className="rounded-full object-cover" />
          ) : (
            <span>{getInitials(u.name)}</span>
          )}
        </span>
      ))}
      {remaining > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground",
            sz.box,
            sz.ring,
            "ring-background"
          )}
          aria-label={`${remaining} more`}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}
