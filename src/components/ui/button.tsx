"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-purple-accent text-white hover:bg-violet active:bg-purple-accent/80 shadow-[0_2px_12px_-4px_rgba(47,123,255,0.55)] hover:shadow-[0_10px_28px_-8px_rgba(47,123,255,0.7)]",
  secondary:
    "bg-surface text-white border border-border hover:bg-deep-purple active:bg-dark-purple hover:shadow-[0_10px_26px_-14px_rgba(0,0,0,0.7)]",
  outline:
    "border border-border text-white hover:bg-surface hover:border-purple-accent/40 active:bg-deep-purple",
  ghost: "text-gray-text hover:bg-surface hover:text-white active:bg-deep-purple",
  danger:
    "bg-danger text-white hover:bg-danger/80 active:bg-danger/70 shadow-[0_2px_12px_-4px_rgba(244,63,94,0.5)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm rounded-md",
  md: "h-10 px-4 text-sm rounded-lg",
  lg: "h-12 px-6 text-base rounded-lg",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200",
          "hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-accent/50",
          "disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize };
