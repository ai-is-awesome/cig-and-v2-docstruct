"use client";

import { useState } from "react";
import { BarChart } from "./charts";
import type { MonthStat } from "@/lib/stats";

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

type Props = {
  monthStats: MonthStat[];
  years: string[];
};

export function MonthlyByYear({ monthStats, years }: Props) {
  const [selected, setSelected] = useState<string>("all");

  const isAll = selected === "all";
  const filtered = isAll
    ? monthStats
    : monthStats.filter((m) => m.month.startsWith(selected));

  const data = isAll
    ? filtered.map((m) => ({
        label: m.month.slice(2).replace("-", "/"),
        value: m.total,
      }))
    : Array.from({ length: 12 }, (_, i) => {
        const key = `${selected}-${String(i + 1).padStart(2, "0")}`;
        const hit = filtered.find((m) => m.month === key);
        return { label: MONTH_ABBR[i], value: hit?.total ?? 0 };
      });

  const total = data.reduce((s, d) => s + d.value, 0);
  const monthsWithData = data.filter((d) => d.value > 0).length;
  const avg = monthsWithData > 0 ? total / monthsWithData : 0;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <YearButton active={isAll} onClick={() => setSelected("all")}>
          All time
        </YearButton>
        {years.map((y) => (
          <YearButton
            key={y}
            active={selected === y}
            onClick={() => setSelected(y)}
          >
            {y}
          </YearButton>
        ))}
      </div>
      <BarChart data={data} height={220} showAllLabels={!isAll} />
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-500">
        <span>
          Total{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {Math.round(total * 10) / 10}
          </span>
        </span>
        <span>
          {monthsWithData} active month{monthsWithData === 1 ? "" : "s"}
        </span>
        {monthsWithData > 0 && (
          <span>
            Avg{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {Math.round(avg * 10) / 10}
            </span>{" "}
            / active month
          </span>
        )}
      </div>
    </div>
  );
}

function YearButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const base =
    "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors";
  const cls = active
    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
    : "border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900";
  return (
    <button type="button" onClick={onClick} className={`${base} ${cls}`}>
      {children}
    </button>
  );
}
