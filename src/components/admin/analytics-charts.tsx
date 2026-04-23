import { useTranslations } from "next-intl";

interface SeriesPoint {
  date: string;
  label: string;
  count: number;
}

interface BarChartProps {
  data: SeriesPoint[];
  height?: number;
  color?: string;
  label?: string;
}

export function BarChart({
  data,
  height = 140,
  color = "bg-primary",
  label,
}: BarChartProps) {
  const t = useTranslations("admin.analytics");
  const max = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const labelInterval = Math.max(1, Math.floor(data.length / 6));

  return (
    <div>
      {label && (
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-sm font-semibold">{label}</h3>
          <span className="text-xs text-muted-foreground">
            {t("totalInLastDays", { total, days: data.length })}
          </span>
        </div>
      )}
      <div className="flex items-end gap-[2px]" style={{ height }}>
        {data.map((d) => {
          const pct = max > 0 ? (d.count / max) * 100 : 0;
          return (
            <div
              key={d.date}
              className="group relative flex-1 min-w-0"
              style={{ height: "100%" }}
            >
              <div
                className={`absolute bottom-0 inset-x-0 rounded-t-sm ${color} opacity-80 group-hover:opacity-100 transition-opacity`}
                style={{ height: `${Math.max(pct, 2)}%` }}
              />
              <div className="absolute bottom-full inset-x-0 mb-1 hidden group-hover:flex justify-center z-10">
                <div className="rounded bg-foreground px-2 py-1 text-xs text-background whitespace-nowrap shadow-lg">
                  {d.label}: {d.count}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-[2px]">
        {data.map((d, i) => (
          <div key={d.date} className="flex-1 min-w-0 text-center">
            {i % labelInterval === 0 ? (
              <span className="text-[9px] text-muted-foreground truncate block">
                {d.label.replace(" ", "\n").split("\n")[1] ?? d.label}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

interface AreaChartProps {
  data: SeriesPoint[];
  height?: number;
  stroke?: string;
  fillFrom?: string;
  fillTo?: string;
  label?: string;
  sublabel?: string;
}

/**
 * Premium area chart with grid lines, axis ticks, and a gradient fill.
 * Uses inline SVG so it's server-render safe, no client JS needed.
 */
export function AreaChart({
  data,
  height = 200,
  stroke = "#4f3ff0",
  fillFrom = "#4f3ff0",
  fillTo = "#4f3ff0",
  label,
  sublabel,
}: AreaChartProps) {
  const t = useTranslations("admin.analytics");
  const width = 600;
  const padTop = 18;
  const padBottom = 24;
  const padStart = 28;
  const padEnd = 8;
  const chartW = width - padStart - padEnd;
  const chartH = height - padTop - padBottom;
  const total = data.reduce((s, d) => s + d.count, 0);
  const max = Math.max(...data.map((d) => d.count), 1);
  const niceMax = niceCeil(max);

  const stepX = data.length > 1 ? chartW / (data.length - 1) : chartW;

  // Build line + area paths
  const points = data.map((d, i) => ({
    x: padStart + i * stepX,
    y: padTop + chartH - (d.count / niceMax) * chartH,
    d,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L${points[points.length - 1].x.toFixed(1)},${padTop + chartH} L${points[0].x.toFixed(1)},${padTop + chartH} Z`
      : "";

  const gridLines = [0, 0.25, 0.5, 0.75, 1];
  const xTickCount = Math.min(6, data.length);
  const xTickIdx = Array.from({ length: xTickCount }).map((_, i) =>
    Math.round((i / (xTickCount - 1)) * (data.length - 1))
  );

  const gradId = `ac-grad-${stroke.replace("#", "")}`;

  return (
    <div>
      {label && (
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{label}</h3>
            {sublabel && (
              <p className="text-xs text-muted-foreground">{sublabel}</p>
            )}
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {t("totalInLastDays", { total, days: data.length })}
          </span>
        </div>
      )}
      <svg
        role="img"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillFrom} stopOpacity="0.28" />
            <stop offset="100%" stopColor={fillTo} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines + y-axis ticks */}
        {gridLines.map((g) => {
          const y = padTop + g * chartH;
          const value = Math.round(niceMax * (1 - g));
          return (
            <g key={g}>
              <line
                x1={padStart}
                x2={width - padEnd}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity={g === 1 ? 0.25 : 0.08}
                strokeDasharray={g === 1 ? "0" : "3 3"}
              />
              <text
                x={padStart - 6}
                y={y + 3}
                textAnchor="end"
                fontSize="9"
                fill="currentColor"
                opacity="0.5"
              >
                {value}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        {areaPath && (
          <path d={areaPath} fill={`url(#${gradId})`} />
        )}

        {/* Line */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points — tiny dots on hover */}
        {points.map((p) => (
          <g key={p.d.date} className="group/point">
            {/* Invisible hover target */}
            <rect
              x={p.x - stepX / 2}
              y={padTop}
              width={stepX}
              height={chartH}
              fill="transparent"
            />
            <circle
              cx={p.x}
              cy={p.y}
              r="3"
              fill={stroke}
              className="opacity-0 group-hover/point:opacity-100 transition-opacity"
            />
            {p.d.count > 0 && (
              <title>
                {p.d.label}: {p.d.count}
              </title>
            )}
          </g>
        ))}

        {/* X-axis labels */}
        {xTickIdx.map((i) => {
          const p = points[i];
          if (!p) return null;
          const text =
            p.d.label.replace(" ", "\n").split("\n")[1] ?? p.d.label;
          return (
            <text
              key={`x-${i}`}
              x={p.x}
              y={height - 6}
              textAnchor="middle"
              fontSize="9"
              fill="currentColor"
              opacity="0.55"
            >
              {text}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function niceCeil(v: number): number {
  if (v <= 5) return 5;
  if (v <= 10) return 10;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * pow;
}

interface DonutSegment {
  label: string;
  count: number;
  color: string;
}

export function DonutChart({
  segments,
  size = 120,
  label,
}: {
  segments: DonutSegment[];
  size?: number;
  label?: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div
          className="rounded-full border-8 border-muted flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <span className="text-sm text-muted-foreground">0</span>
        </div>
        {label && (
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
        )}
      </div>
    );
  }

  const { stops } = segments.reduce<{ offset: number; stops: string[] }>(
    (acc, s) => {
      const start = acc.offset;
      const end = start + (s.count / total) * 100;
      acc.stops.push(`${s.color} ${start}% ${end}%`);
      return { offset: end, stops: acc.stops };
    },
    { offset: 0, stops: [] }
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="rounded-full flex items-center justify-center shadow-soft"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(${stops.join(", ")})`,
        }}
      >
        <div
          className="rounded-full bg-card flex flex-col items-center justify-center"
          style={{ width: size * 0.62, height: size * 0.62 }}
        >
          <span className="font-display text-xl font-bold leading-none">{total}</span>
          <span className="mt-0.5 text-[9px] uppercase tracking-wide text-muted-foreground">total</span>
        </div>
      </div>
      {label && (
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      )}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        {segments.map((s) => {
          const pct = Math.round((s.count / total) * 100);
          return (
            <div key={s.label} className="flex items-center gap-1.5 text-xs">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-muted-foreground">
                {s.label} <span className="font-semibold text-foreground">{s.count}</span>{" "}
                <span className="text-muted-foreground/70">({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
