import type { DayStat, MonthDetailed } from "@/lib/stats";

type BarDatum = { label: string; value: number; sublabel?: string };

type BarChartProps = {
  data: BarDatum[];
  height?: number;
  showAllLabels?: boolean;
  labelEvery?: number;
  valueFormat?: (v: number) => string;
  className?: string;
};

export function BarChart({
  data,
  height = 220,
  showAllLabels = false,
  labelEvery,
  valueFormat = (v) => String(Math.round(v * 10) / 10),
  className = "",
}: BarChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-zinc-500">No data.</p>;
  }
  const W = 1000;
  const H = height;
  const pad = { left: 8, right: 8, top: 24, bottom: 36 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const max = Math.max(...data.map((d) => d.value), 1);
  const slot = innerW / data.length;
  const barW = Math.max(2, slot - 4);
  const step = labelEvery ?? Math.max(1, Math.ceil(data.length / 14));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={`w-full text-zinc-700 dark:text-zinc-200 ${className}`}
      role="img"
    >
      <line
        x1={pad.left}
        x2={W - pad.right}
        y1={H - pad.bottom}
        y2={H - pad.bottom}
        stroke="currentColor"
        strokeOpacity={0.15}
      />
      {data.map((d, i) => {
        const h = (d.value / max) * innerH;
        const x = pad.left + i * slot + (slot - barW) / 2;
        const y = H - pad.bottom - h;
        const showLabel = showAllLabels || i % step === 0 || i === data.length - 1;
        return (
          <g key={`${d.label}-${i}`}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={1.5}
              className="fill-emerald-500/70"
            >
              <title>{`${d.label}: ${valueFormat(d.value)}${d.sublabel ? ` (${d.sublabel})` : ""}`}</title>
            </rect>
            {showLabel && (
              <text
                x={x + barW / 2}
                y={H - pad.bottom + 14}
                textAnchor="middle"
                fontSize="11"
                fill="currentColor"
                opacity={0.55}
              >
                {d.label}
              </text>
            )}
            {d.value > 0 && (data.length <= 24 || showAllLabels) && (
              <text
                x={x + barW / 2}
                y={Math.max(y - 4, pad.top + 8)}
                textAnchor="middle"
                fontSize="10"
                fill="currentColor"
                opacity={0.7}
              >
                {valueFormat(d.value)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
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

function shortDate(iso: string): string {
  const m = parseInt(iso.slice(5, 7), 10);
  const d = parseInt(iso.slice(8, 10), 10);
  return `${MONTH_ABBR[m - 1]} ${d}`;
}

type DailyTimelineProps = {
  days: DayStat[];
};

export function DailyTimeline({ days }: DailyTimelineProps) {
  if (days.length === 0) {
    return <p className="text-sm text-zinc-500">No data.</p>;
  }
  const rowH = 18;
  const labelW = 64;
  const totalW = 44;
  const innerW = 720;
  const W = labelW + innerW + totalW;
  const H = days.length * rowH + 32;
  const max = Math.max(...days.map((d) => d.total), 1);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMinYMin meet"
      className="w-full text-zinc-700 dark:text-zinc-200"
      role="img"
    >
      {[0, 6, 12, 18, 24].map((h) => {
        const x = labelW + (h / 24) * innerW;
        return (
          <g key={h}>
            <line
              x1={x}
              x2={x}
              y1={20}
              y2={H - 8}
              stroke="currentColor"
              strokeOpacity={0.08}
            />
            <text
              x={x}
              y={14}
              textAnchor="middle"
              fontSize="10"
              fill="currentColor"
              opacity={0.5}
            >
              {h === 24 ? "24" : `${h.toString().padStart(2, "0")}:00`}
            </text>
          </g>
        );
      })}
      {days.map((d, i) => {
        const y = 20 + i * rowH + rowH / 2;
        const intensity = 0.3 + 0.6 * (d.total / max);
        return (
          <g key={d.date}>
            <line
              x1={labelW}
              x2={labelW + innerW}
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeOpacity={0.05}
            />
            <text
              x={labelW - 8}
              y={y + 3}
              textAnchor="end"
              fontSize="11"
              fill="currentColor"
              opacity={0.65}
            >
              {shortDate(d.date)}
            </text>
            {d.events.map((e, j) => {
              const frac = (e.hour + e.minute / 60) / 24;
              const cx = labelW + frac * innerW;
              return (
                <circle
                  key={j}
                  cx={cx}
                  cy={y}
                  r={3}
                  className="fill-emerald-400"
                  opacity={intensity}
                >
                  <title>{`${d.date} ${e.hour.toString().padStart(2, "0")}:${e.minute.toString().padStart(2, "0")} — ${e.count} cig`}</title>
                </circle>
              );
            })}
            <text
              x={labelW + innerW + 8}
              y={y + 3}
              fontSize="11"
              fill="currentColor"
              opacity={d.total > 0 ? 0.85 : 0.3}
            >
              {d.total === 0 ? "—" : d.total}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  sublabel?: string;
};

export function StatCard({ label, value, sublabel }: StatCardProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {value}
      </div>
      {sublabel && (
        <div className="mt-1 text-xs text-zinc-500">{sublabel}</div>
      )}
    </div>
  );
}

const MONTH_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function MonthCard({ data }: { data: MonthDetailed }) {
  const W = 320;
  const H = 90;
  const pad = { top: 6, bottom: 16, left: 4, right: 4 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const max = Math.max(...data.days, 1);
  const slot = innerW / data.daysInMonth;
  const barW = Math.max(2, slot - 1);
  const activeDays = data.days.filter((v) => v > 0).length;
  const dayTicks = [1, 8, 15, 22, data.daysInMonth].filter(
    (d, i, arr) => arr.indexOf(d) === i,
  );

  return (
    <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {MONTH_FULL[data.monthIndex]} {data.year}
        </span>
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {Math.round(data.total * 10) / 10}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-20 w-full text-zinc-700 dark:text-zinc-200"
        role="img"
      >
        <line
          x1={0}
          x2={W}
          y1={H - pad.bottom}
          y2={H - pad.bottom}
          stroke="currentColor"
          strokeOpacity={0.15}
        />
        {data.days.map((v, i) => {
          const h = (v / max) * innerH;
          const x = pad.left + i * slot + (slot - barW) / 2;
          const y = H - pad.bottom - h;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barW}
              height={h}
              className="fill-emerald-500/70"
            >
              <title>{`${MONTH_FULL[data.monthIndex]} ${i + 1}, ${data.year}: ${v}`}</title>
            </rect>
          );
        })}
        {dayTicks.map((d) => (
          <text
            key={d}
            x={pad.left + (d - 1) * slot + slot / 2}
            y={H - 4}
            textAnchor="middle"
            fontSize="9"
            fill="currentColor"
            opacity={0.55}
          >
            {d}
          </text>
        ))}
      </svg>
      <div className="mt-1 text-xs text-zinc-500">
        {activeDays} active day{activeDays === 1 ? "" : "s"} · max{" "}
        {Math.round(max * 10) / 10}/day
      </div>
    </div>
  );
}

export function AllMonthsGrid({ months }: { months: MonthDetailed[] }) {
  if (months.length === 0) {
    return <p className="text-sm text-zinc-500">No data.</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {months.map((m) => (
        <MonthCard key={m.month} data={m} />
      ))}
    </div>
  );
}
