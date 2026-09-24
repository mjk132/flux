"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-gray-text"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-text">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-white",
              "placeholder:text-gray-text/60",
              "focus:border-purple-accent focus:outline-none focus:ring-1 focus:ring-purple-accent/30",
              "disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-10",
              error && "border-danger focus:border-danger focus:ring-danger/30",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-danger">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, type InputProps };
