"use client";

import { createContext, forwardRef, useContext, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface RadioGroupContextValue {
  name: string;
  value?: string;
  onChange?: (v: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(undefined);

interface RadioGroupProps {
  name?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  className?: string;
  children: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  "aria-label"?: string;
}

export function RadioGroup({ name, value, onValueChange, className, children, orientation = "vertical", ...rest }: RadioGroupProps) {
  const generated = useId();
  return (
    <RadioGroupContext.Provider value={{ name: name ?? generated, value, onChange: onValueChange }}>
      <div role="radiogroup" aria-label={rest["aria-label"]} className={cn(orientation === "vertical" ? "flex flex-col gap-2" : "flex flex-wrap gap-3", className)}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

interface RadioItemProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "name" | "checked" | "onChange" | "value"> {
  value: string;
  label?: React.ReactNode;
  description?: string;
}

export const RadioItem = forwardRef<HTMLInputElement, RadioItemProps>(
  ({ value, label, description, className, id, ...rest }, ref) => {
    const ctx = useContext(RadioGroupContext);
    const generated = useId();
    const inputId = id ?? `radio-${value}-${generated}`;
    const checked = ctx?.value === value;
    return (
      <label
        htmlFor={inputId}
        className={cn(
          "inline-flex cursor-pointer items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-muted/50",
          checked && "bg-primary/5",
          className
        )}
      >
        <input
          ref={ref}
          id={inputId}
          type="radio"
          name={ctx?.name}
          value={value}
          checked={checked}
          onChange={() => ctx?.onChange?.(value)}
          className="peer sr-only"
          {...rest}
        />
        <span
          aria-hidden
          className={cn(
            "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-input bg-background transition-colors",
            "peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2"
          )}
        >
          {checked && <span className="block h-2.5 w-2.5 rounded-full bg-primary" />}
        </span>
        {(label || description) && (
          <span className="min-w-0">
            {label && <span className="block text-sm font-medium leading-tight text-foreground">{label}</span>}
            {description && <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>}
          </span>
        )}
      </label>
    );
  }
);
RadioItem.displayName = "RadioItem";
