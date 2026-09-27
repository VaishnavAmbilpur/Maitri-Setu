import * as React from "react";
import { cn } from "../../lib/utils";

const buttonVariants = ({ variant = "default", size = "default", className = "" }) => {
  const base = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]";
  
  const variants = {
    default: "bg-zinc-100 text-zinc-950 hover:bg-white border border-zinc-200 shadow-sm font-bold",
    destructive: "bg-zinc-900 text-zinc-100 border border-zinc-700 hover:bg-zinc-800 font-bold",
    outline: "border border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white hover:border-zinc-700",
    secondary: "bg-zinc-900 text-zinc-200 hover:bg-zinc-800 border border-zinc-800",
    ghost: "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100",
    success: "bg-zinc-100 text-zinc-950 hover:bg-white border border-zinc-200 font-bold",
    amber: "bg-zinc-900 text-zinc-100 border border-zinc-700 hover:bg-zinc-800"
  };

  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-[11px]",
    lg: "h-10 rounded-lg px-5 text-xs font-bold",
    icon: "h-8 w-8 rounded-md"
  };

  return cn(base, variants[variant] || variants.default, sizes[size] || sizes.default, className);
};

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
