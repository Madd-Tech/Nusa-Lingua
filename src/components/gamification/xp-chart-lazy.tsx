"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

/** recharts hanya dirender di browser (mengukur lebar kontainer); skeleton selama dimuat. */
export const XpChartLazy = dynamic(() => import("./xp-chart").then((m) => m.XpChart), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});
