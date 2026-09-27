import * as React from "react";
import { cn } from "../../lib/utils";

function Badge({ className, variant = "default", ...props }) {
  const base = "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors";
  
  const variants = {
    default: "bg-zinc-100 text-zinc-950 border border-zinc-200 font-bold",
    approved: "bg-zinc-100 text-zinc-950 border border-zinc-200 font-bold",
    in_progress: "bg-transparent text-zinc-200 border border-zinc-700 font-semibold",
    action_needed: "bg-zinc-900 text-zinc-200 border border-dashed border-zinc-500 font-semibold",
    secondary: "bg-zinc-900 text-zinc-300 border border-zinc-800",
    destructive: "bg-zinc-950 text-white border-2 border-zinc-100 font-extrabold shadow-sm",
    warning: "bg-zinc-900 text-zinc-100 border border-dashed border-zinc-400 font-bold",
    outline: "text-zinc-300 border border-zinc-700",
    draft: "text-zinc-500 border border-zinc-800 font-normal"
  };

  return (
    <div className={cn(base, variants[variant] || variants.default, className)} {...props} />
  );
}

export { Badge };
