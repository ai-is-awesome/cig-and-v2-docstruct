"use client";

import { useMemo, useState } from "react";

type Props = {
  datetimes: string[];
  rangeMin: string;
  rangeMax: string;
};

type Streak = {
  fromIso: string;
  toIso: string;
  ms: number;
};

export function LongestStreaks({ datetimes, rangeMin, rangeMax }: Props) {
  const [start, setStart] = useState(rangeMin);
  const [end, setEnd] = useState(rangeMax);

  const { top, totalInRange } = useMemo(() => {
    const filtered = datetimes
      .filter((dt) => {
        const d = dt.slice(0, 10);
        return d >= start && d <= end;
      })
      .map((dt) => ({ iso: dt, ms: new Date(dt).getTime() }))
      .sort((a, b) => a.ms - b.ms);

    const gaps: Streak[] = [];
    for (let i = 1; i < filtered.length; i++) {
      gaps.push({
        fromIso: filtered[i - 1].iso,
        toIso: filtered[i].iso,
        ms: filtered[i].ms - filtered[i - 1].ms,
      });
    }
    gaps.sort((a, b) => b.ms - a.ms);
    return { top: gaps.slice(0, 3), totalInRange: filtered.length };
  }, [datetimes, start, end]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <DateField
          label="From"
          value={start}
          min={rangeMin}
          max={end}
          onChange={setStart}
        />
        <DateField
          label="To"
          value={end}
          min={start}
          max={rangeMax}
          onChange={setEnd}
        />
        <button
          type="button"
          onClick={() => {
            setStart(rangeMin);
            setEnd(rangeMax);
          }}
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          Reset
        </button>
        <span className="text-sm text-zinc-500">
          {totalInRange} entr{totalInRange === 1 ? "y" : "ies"} in range
        </span>
      </div>

      {totalInRange < 2 ? (
        <p className="text-sm text-zinc-500">
          Need at least 2 entries in the selected range to compute gaps.
        </p>
      ) : (
        <ol className="space-y-2">
          {top.map((g, i) => (
            <li
              key={`${g.fromIso}-${g.toIso}`}
              className="rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  #{i + 1}
                </span>
                <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatDuration(g.ms)}
                </span>
              </div>
              <div className="mt-1 text-sm text-zinc-500">
                {formatDateTime(g.fromIso)} → {formatDateTime(g.toIso)}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function DateField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-zinc-500">
      {label}
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-normal normal-case tracking-normal text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:[color-scheme:dark]"
      />
    </label>
  );
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);
  return parts.join(" ");
}

const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDateTime(iso: string): string {
  const y = iso.slice(0, 4);
  const m = parseInt(iso.slice(5, 7), 10);
  const d = parseInt(iso.slice(8, 10), 10);
  const hh = iso.slice(11, 13);
  const mm = iso.slice(14, 16);
  return `${MONTH_ABBR[m - 1]} ${d}, ${y} ${hh}:${mm}`;
}
