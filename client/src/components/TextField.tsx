// client/src/components/TextField.tsx
import type React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export default function TextField({ label, className = "", ...props }: Props) {
  return (
    <label className="block">
      <span className="block text-sm text-navy mb-1">{label}</span>
      <input
        {...props}
        className={`w-full rounded-md border border-aqua/40 bg-mint/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-aqua/60 ${className}`}
      />
    </label>
  );
}
