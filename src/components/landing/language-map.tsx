"use client";

import { useMemo, useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FeatureLink } from "@/components/layout/feature-link";
import { LanguageIcon } from "@/components/learning/language-icon";
import type { RegionWithLanguages } from "@/lib/queries/content";
import { cn } from "@/lib/utils";
import { ISLAND_PATHS, MAP_H, MAP_W, project } from "./map-shapes";

/** Peta bahasa Nusantara: marker dari regions.lat/lng, popover daftar bahasa, filter per pulau. */
export function LanguageMap({ regions, isLoggedIn }: { regions: RegionWithLanguages[]; isLoggedIn: boolean }) {
  const [island, setIsland] = useState<string | null>(null);

  const islands = useMemo(
    () => Array.from(new Set(regions.map((r) => r.island).filter((v): v is string => !!v))).sort((a, b) => a.localeCompare(b, "id")),
    [regions],
  );
  const visible = regions.filter((r) => !island || r.island === island);
  const markers = regions.filter((r) => r.lat !== null && r.lng !== null);
  const gridLanguages = visible.flatMap((r) => r.languages.map((l) => ({ ...l, region: r })));

  if (!regions.length) {
    return (
      <p className="rounded-2xl border-2 border-dashed p-6 text-center text-muted-foreground">
        Peta bahasa sedang disiapkan. Data daerah belum tersedia.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div role="group" aria-label="Filter pulau" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
        {[null, ...islands].map((i) => {
          const active = island === i;
          return (
            <button
              key={i ?? "semua"}
              type="button"
              aria-pressed={active}
              onClick={() => setIsland(i)}
              className={cn(
                "shrink-0 rounded-full border-2 px-4 py-1.5 text-sm font-bold transition-colors",
                active ? "border-primary bg-primary/12 text-primary-700 dark:text-primary" : "bg-card hover:bg-muted",
              )}
            >
              {i ?? "Semua pulau"}
            </button>
          );
        })}
      </div>

      {/* Desktop/tablet: peta interaktif */}
      <div className="relative hidden overflow-hidden rounded-3xl border-2 bg-asisten/8 md:block">
        <div className="relative w-full" style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}>
          <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
            {ISLAND_PATHS.map((p) => (
              <path
                key={p.name}
                d={p.d}
                className="fill-primary/25 stroke-primary/50 dark:fill-primary/20"
                strokeWidth={1.5}
                strokeLinejoin="round"
              />
            ))}
          </svg>
          <ul aria-label="Daerah di peta">
            {markers.map((r) => {
              const { x, y } = project(r.lng!, r.lat!);
              const dim = island !== null && r.island !== island;
              return (
                <li
                  key={r.id}
                  className={cn("absolute -translate-x-1/2 -translate-y-full transition-opacity", dim && "pointer-events-none opacity-25")}
                  style={{ left: `${(x / MAP_W) * 100}%`, top: `${(y / MAP_H) * 100}%` }}
                >
                  <Popover>
                    <PopoverTrigger
                      aria-label={`${r.name}: ${r.languages.length} bahasa`}
                      tabIndex={dim ? -1 : 0}
                      className="group flex flex-col items-center focus-visible:outline-none"
                    >
                      <span className="flex items-center gap-1 rounded-full border-2 border-card bg-accent-600 px-2 py-1 text-xs font-extrabold text-white shadow-soft transition-transform group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2">
                        <MapPin aria-hidden="true" className="size-3.5" />
                        {r.languages.length || ""}
                      </span>
                      <span className="mt-0.5 h-2 w-0.5 bg-accent-600" />
                    </PopoverTrigger>
                    <PopoverContent side="top">
                      <RegionPopover region={r} isLoggedIn={isLoggedIn} />
                    </PopoverContent>
                  </Popover>
                </li>
              );
            })}
          </ul>
        </div>
        {markers.length === 0 ? (
          <p className="absolute inset-x-0 bottom-4 text-center text-sm text-muted-foreground">Koordinat daerah belum diisi.</p>
        ) : null}
      </div>

      {/* Mobile: grid kartu bahasa */}
      <div className="md:hidden">
        {gridLanguages.length ? (
          <ul className="grid grid-cols-2 gap-3">
            {gridLanguages.map((l) => (
              <li key={l.id}>
                <FeatureLink
                  path={`/belajar/${l.code}`}
                  isLoggedIn={isLoggedIn}
                  className="flex h-full flex-col gap-2 rounded-2xl border-2 border-b-4 bg-card p-3"
                >
                  <LanguageIcon name={l.name} iconUrl={l.icon_url} className="size-10 rounded-xl text-base" />
                  <span className="font-extrabold leading-tight">{l.name}</span>
                  <span className="text-xs text-muted-foreground">{l.region.name}</span>
                </FeatureLink>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border-2 border-dashed p-6 text-center text-sm text-muted-foreground">Belum ada bahasa aktif di pulau ini.</p>
        )}
      </div>
    </div>
  );
}

function RegionPopover({ region, isLoggedIn }: { region: RegionWithLanguages; isLoggedIn: boolean }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-lg font-extrabold leading-tight">{region.name}</p>
        <p className="text-xs text-muted-foreground">{[region.province, region.island].filter(Boolean).join(" · ")}</p>
      </div>
      {region.languages.length ? (
        <ul className="space-y-2">
          {region.languages.map((l) => (
            <li key={l.id} className="flex items-center gap-2">
              <LanguageIcon name={l.name} iconUrl={l.icon_url} className="size-9 rounded-xl text-sm" />
              <span className="flex-1 font-bold">{l.name}</span>
              <FeatureLink
                path={`/belajar/${l.code}`}
                isLoggedIn={isLoggedIn}
                className="inline-flex items-center gap-1 rounded-xl bg-primary-600 px-3 py-1.5 text-xs font-extrabold text-white hover:brightness-110"
              >
                Pelajari <ArrowRight aria-hidden="true" className="size-3.5" />
              </FeatureLink>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Belum ada bahasa aktif dari daerah ini.</p>
      )}
    </div>
  );
}
