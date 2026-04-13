interface BarChartProps {
  data: { date: string; label: string; count: number }[];
  height?: number;
  color?: string;
  label?: string;
}

export function BarChart({
  data,
  height = 120,
  color = "bg-primary",
  label,
}: BarChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  // Show every ~5th label to avoid crowding
  const labelInterval = Math.max(1, Math.floor(data.length / 6));

  return (
    <div>
      {label && (
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-sm font-semibold">{label}</h3>
          <span className="text-xs text-muted-foreground">
            {total} total in last {data.length} days
          </span>
        </div>
      )}
      <div className="flex items-end gap-[2px]" style={{ height }}>
        {data.map((d, i) => {
          const pct = max > 0 ? (d.count / max) * 100 : 0;
          return (
            <div
              key={d.date}
              className="group relative flex-1 min-w-0"
              style={{ height: "100%" }}
            >
              <div
                className={`absolute bottom-0 left-0 right-0 rounded-t-sm ${color} opacity-80 group-hover:opacity-100 transition-opacity`}
                style={{ height: `${Math.max(pct, 2)}%` }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                <div className="rounded bg-foreground px-2 py-1 text-xs text-background whitespace-nowrap shadow-lg">
                  {d.label}: {d.count}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* X-axis labels */}
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

  // Build conic-gradient stops by walking the segments and snapshotting the
  // running offset into each output entry. Using `reduce` keeps the running
  // state inside the accumulator instead of mutating a free variable from
  // inside `map`, which React would otherwise treat as an impure render.
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
        className="rounded-full flex items-center justify-center"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(${stops.join(", ")})`,
        }}
      >
        <div className="rounded-full bg-background flex items-center justify-center"
          style={{ width: size * 0.6, height: size * 0.6 }}>
          <span className="text-lg font-bold">{total}</span>
        </div>
      </div>
      {label && (
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      )}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5 text-xs">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-muted-foreground">
              {s.label} ({s.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
