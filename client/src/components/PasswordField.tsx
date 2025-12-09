// client/src/components/PasswordField.tsx
import { useState } from "react";
import type React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export default function PasswordField({ label, ...props }: Props) {
  const [show, setShow] = useState(false);

  return (
    <label className="block">
      <span className="block text-sm text-navy mb-1">{label}</span>
      <div className="relative">
        <input
          {...props}
          type={show ? "text" : "password"}
          className="w-full rounded-md border border-aqua/40 bg-mint/60 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-aqua/60"
          placeholder="••••••••"
        />
        <button
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-navy/70 hover:text-yellow"
        >
          {show ? "🙈" : "👁️"}
        </button>
      </div>
    </label>
  );
}
