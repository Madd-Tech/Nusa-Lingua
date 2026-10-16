"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatNumber } from "@/lib/utils";

const dayFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "UTC" });

/** Grafik batang XP 30 hari. Disertai ringkasan teks untuk pembaca layar. */
export function XpChart({ data }: { data: { date: string; xp: number }[] }) {
  const rows = data.map((d) => ({ ...d, label: dayFmt.format(new Date(`${d.date}T12:00:00Z`)) }));
  const total = data.reduce((s, d) => s + d.xp, 0);
  const activeDays = data.filter((d) => d.xp > 0).length;
  const best = data.reduce((m, d) => (d.xp > m.xp ? d : m), { date: "", xp: 0 });

  return (
    <figure className="space-y-3">
      <figcaption className="text-sm text-muted-foreground">
        {formatNumber(total)} XP dalam 30 hari · aktif {activeDays} hari
        {best.xp > 0 ? ` · tertinggi ${formatNumber(best.xp)} XP (${dayFmt.format(new Date(`${best.date}T12:00:00Z`))})` : ""}
      </figcaption>
      <div className="h-56 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="rgb(var(--border))" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval={6}
              tick={{ fill: "rgb(var(--muted-foreground))", fontSize: 11 }}
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "rgb(var(--muted-foreground))", fontSize: 11 }} />
            <Tooltip
              cursor={{ fill: "rgb(var(--muted))" }}
              contentStyle={{
                background: "rgb(var(--popover))",
                border: "2px solid rgb(var(--border))",
                borderRadius: 14,
                color: "rgb(var(--popover-foreground))",
                fontWeight: 700,
              }}
              formatter={(v: number) => [`${formatNumber(v)} XP`, "XP"]}
            />
            <Bar dataKey="xp" fill="rgb(var(--secondary))" radius={[6, 6, 0, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
