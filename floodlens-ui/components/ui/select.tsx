import { cn } from "@/lib/utils";
import { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ className, label, options, ...props }: SelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm text-gray-400">{label}</label>
      )}
      <select
        className={cn(
          "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50 transition-colors",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
