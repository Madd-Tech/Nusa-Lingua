"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

type ProgressProps = React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
  indicatorClassName?: string;
};

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value, max = 100, indicatorClassName, ...props }, ref) => {
    const pct = Math.max(0, Math.min(100, ((value ?? 0) / max) * 100));
    return (
      <ProgressPrimitive.Root
        ref={ref}
        value={value}
        max={max}
        className={cn("relative h-4 w-full overflow-hidden rounded-full bg-muted", className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "relative h-full rounded-full bg-primary transition-[width] duration-500 ease-out",
            "after:absolute after:inset-x-2 after:top-1 after:h-1 after:rounded-full after:bg-white/30",
            indicatorClassName,
          )}
          style={{ width: `${pct}%` }}
        />
      </ProgressPrimitive.Root>
    );
  },
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
