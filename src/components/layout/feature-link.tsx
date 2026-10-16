"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { useGoToFeature } from "@/hooks/use-go-to-feature";
import { featureHref } from "@/lib/routes";

/**
 * Link CTA ke fitur dari halaman publik. Memakai `goToFeature(path)`.
 * `href` awal sudah benar untuk status login saat render (berfungsi tanpa JS / buka di tab baru).
 */
export function FeatureLink({
  path,
  isLoggedIn,
  asChild,
  children,
  className,
  ...rest
}: {
  path: string;
  isLoggedIn: boolean;
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick">) {
  const goToFeature = useGoToFeature();
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      href={featureHref(path, isLoggedIn)}
      className={className}
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        void goToFeature(path);
      }}
      {...rest}
    >
      {children}
    </Comp>
  );
}
