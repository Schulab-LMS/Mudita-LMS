"use client";

import { forwardRef, useId, useMemo, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  showStrength?: boolean;
  showRequirements?: boolean;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Too short" | "Weak" | "Okay" | "Strong" | "Excellent";
  checks: {
    length: boolean;
    lower: boolean;
    upper: boolean;
    number: boolean;
    symbol: boolean;
  };
}

export function getPasswordStrength(pw: string): PasswordStrength {
  const checks = {
    length: pw.length >= 8,
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    number: /\d/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
  };
  let score = 0;
  if (checks.length) score += 1;
  if (checks.upper && checks.lower) score += 1;
  if (checks.number) score += 1;
  if (checks.symbol && pw.length >= 12) score += 1;
  const s = (pw.length < 6 ? 0 : score) as 0 | 1 | 2 | 3 | 4;
  const label = (["Too short", "Weak", "Okay", "Strong", "Excellent"] as const)[s];
  return { score: s, label, checks };
}

const BAR_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-400",
  "bg-lime-500",
  "bg-emerald-500",
];

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrength, showRequirements, value, id, ...rest }, ref) => {
    const [visible, setVisible] = useState(false);
    const generated = useId();
    const inputId = id ?? `pw-${generated}`;
    const pw = typeof value === "string" ? value : "";
    const strength = useMemo(() => getPasswordStrength(pw), [pw]);

    return (
      <div className="space-y-2">
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            value={value}
            className={cn(
              "input-pretty flex h-11 w-full rounded-lg border border-input bg-background px-3 pe-10 text-sm placeholder:text-muted-foreground focus-visible:outline-none",
              className
            )}
            {...rest}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute end-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {showStrength && pw.length > 0 && (
          <div className="space-y-1" aria-live="polite">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    i < strength.score ? BAR_COLORS[strength.score] : "bg-muted"
                  )}
                />
              ))}
            </div>
            <p className={cn("text-xs font-medium", strength.score >= 3 ? "text-emerald-600" : strength.score === 2 ? "text-amber-600" : "text-muted-foreground")}>
              {strength.label}
            </p>
          </div>
        )}

        {showRequirements && (
          <ul className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
            <Requirement ok={strength.checks.length} label="At least 8 characters" />
            <Requirement ok={strength.checks.upper} label="Uppercase letter" />
            <Requirement ok={strength.checks.lower} label="Lowercase letter" />
            <Requirement ok={strength.checks.number} label="Number" />
            <Requirement ok={strength.checks.symbol} label="Symbol" />
          </ul>
        )}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

function Requirement({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={cn("inline-flex items-center gap-1.5 transition-colors", ok && "text-emerald-600")}>
      {ok ? <Check className="h-3.5 w-3.5 shrink-0" aria-hidden /> : <X className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" aria-hidden />}
      {label}
    </li>
  );
}
