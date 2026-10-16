import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary/12 text-primary-700 dark:bg-primary/15 dark:text-primary",
        secondary: "bg-secondary/20 text-[#7A5402] dark:text-secondary",
        accent: "bg-accent/12 text-accent-700 dark:text-accent",
        muted: "bg-muted text-muted-foreground",
        outline: "border-2 text-foreground",
        success: "bg-success/12 text-success-700 dark:text-success",
        danger: "bg-danger/10 text-danger-700 dark:text-danger",
        belajar: "bg-belajar/12 text-[#145C33] dark:text-belajar",
        budaya: "bg-budaya/12 text-budaya-deep dark:text-budaya",
        asisten: "bg-asisten/12 text-asisten-deep dark:text-asisten",
        komunitas: "bg-komunitas/10 text-komunitas-deep dark:text-komunitas",
        progres: "bg-progres/15 text-progres-deep dark:text-progres",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
