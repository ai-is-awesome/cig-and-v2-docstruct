import {
  AllMonthsGrid,
  BarChart,
  DailyTimeline,
  StatCard,
} from "@/components/charts";
import { LongestStreaks } from "@/components/longest-streaks";
import { MonthlyByYear } from "@/components/monthly-by-year";
import {
  byDay,
  byHourOfDay,
  byMonth,
  byMonthDetailed,
  byWeek,
  byYear,
  dateRange,
  getCleanEntries,
  getMeta,
} from "@/lib/stats";

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

function formatNumber(n: number, decimals = 1): string {
  const factor = Math.pow(10, decimals);
  const rounded = Math.round(n * factor) / factor;
  return rounded.toString();
}

function formatLongDate(iso: string): string {
  if (!iso) return "—";
  const y = iso.slice(0, 4);
  const m = parseInt(iso.slice(5, 7), 10);
  const d = parseInt(iso.slice(8, 10), 10);
  return `${MONTH_ABBR[m - 1]} ${d}, ${y}`;
}

export default function Home() {
  const entries = getCleanEntries();
  const meta = getMeta();
  const range = dateRange(entries);

  const yearStats = byYear(entries);
  const monthStats = byMonth(entries);
  const monthDetailed = byMonthDetailed(entries);
  const weekStats = byWeek(entries);
  const last30 = byDay(entries, 30);
  const hourStats = byHourOfDay(entries);

  const recentWeeks = weekStats.slice(-26);
  const overallAvg = range.days > 0 ? meta.total_cigs_clean / range.days : 0;

  return (
    <div className="min-h-screen w-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">
            Cigarette Counter Stats
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            {formatLongDate(range.first)} → {formatLongDate(range.last)} ·{" "}
            {range.days} days tracked
          </p>
        </header>

        <section className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Total smoked"
            value={formatNumber(meta.total_cigs_clean, 1)}
            sublabel={`${entries.length} entries`}
          />
          <StatCard
            label="Avg / day"
            value={formatNumber(overallAvg, 2)}
            sublabel="across full span"
          />
          <StatCard
            label="Days tracked"
            value={range.days.toString()}
            sublabel={`${formatNumber(
              (entries.length / Math.max(range.days, 1)) * 100,
              0
            )}% logged days`}
          />
          <StatCard
            label="Suspicious"
            value={meta.suspicious_entries.toString()}
            sublabel="excluded from totals"
          />
        </section>

        <ChartSection
          title="Longest no-smoke streaks"
          subtitle="Pick a date range — top 3 longest gaps between consecutive cigarette events."
        >
          <LongestStreaks
            datetimes={entries.map((e) => e.datetime)}
            rangeMin={range.first}
            rangeMax={range.last}
          />
        </ChartSection>

        <ChartSection
          title="Yearly"
          subtitle="Total cigarettes per year, with average per day across the year's tracked span."
        >
          <BarChart
            data={yearStats.map((y) => ({
              label: y.year,
              value: y.total,
              sublabel: `${formatNumber(y.avgPerDay, 2)}/day`,
            }))}
            height={260}
            showAllLabels
          />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {yearStats.map((y) => (
              <div
                key={y.year}
                className="rounded-md border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="text-zinc-500">{y.year}</div>
                <div className="mt-0.5 text-lg font-semibold">
                  {formatNumber(y.total, 1)}
                </div>
                <div className="text-xs text-zinc-500">
                  {formatNumber(y.avgPerDay, 2)} / day · {y.daysWithEntries}{" "}
                  active days
                </div>
              </div>
            ))}
          </div>
        </ChartSection>

        <ChartSection
          title="Monthly"
          subtitle="Pick a year to break it down by month, or view all time."
        >
          <MonthlyByYear
            monthStats={monthStats}
            years={yearStats.map((y) => y.year)}
          />
        </ChartSection>

        <ChartSection
          title={`Every month — daily breakdown (${monthDetailed.length} months)`}
          subtitle="One mini chart per month showing each day's count. Hover any bar for the exact value."
        >
          <AllMonthsGrid months={monthDetailed} />
        </ChartSection>

        <ChartSection
          title="Weekly"
          subtitle={`Last ${recentWeeks.length} weeks (Mon–Sun).`}
        >
          <BarChart
            data={recentWeeks.map((w) => ({
              label: w.weekStart.slice(5),
              value: w.total,
            }))}
            height={200}
          />
        </ChartSection>

        <ChartSection
          title="Daily — last 30 days"
          subtitle="Each dot is a logged event placed at its time of day. Right column shows the day's total."
        >
          <div className="overflow-x-auto">
            <DailyTimeline days={last30} />
          </div>
        </ChartSection>

        <ChartSection
          title="Time of day"
          subtitle="When you typically smoke, aggregated across the full history."
        >
          <BarChart
            data={hourStats.map((h) => ({
              label: h.hour.toString().padStart(2, "0"),
              value: h.total,
            }))}
            height={200}
            showAllLabels
          />
        </ChartSection>

        <footer className="mt-12 text-xs text-zinc-500">
          Data generated {new Date(meta.generated_at).toLocaleString()} from{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-900">
            src/data/whatsapp counting _chat.txt
          </code>
          . Re-run{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-900">
            node scripts/parse-whatsapp-chat.mjs
          </code>{" "}
          to refresh.
        </footer>
      </main>
    </div>
  );
}

function ChartSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}
