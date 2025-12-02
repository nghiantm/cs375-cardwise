// src/components/Alert.tsx
import type { ReactNode } from "react";

type AlertVariant = "error" | "success" | "info";

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
}

const variantClasses: Record<AlertVariant, string> = {
  error: "bg-red-50 text-red-700 border-red-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function Alert({ variant = "info", children }: AlertProps) {
  return (
    <div
      className={`mt-3 rounded-md border px-3 py-2 text-sm ${variantClasses[variant]}`}
    >
      {children}
    </div>
  );
}
