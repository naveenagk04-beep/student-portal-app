/** Custom SVG donut — matches the reference ring style without extra deps. */
export function AttendanceDonut({
  percent,
  size = 128,
  stroke = 13,
}: {
  percent: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (percent / 100) * circumference;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Attendance ${percent}%`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EAF2FC"
          strokeWidth={stroke}
        />
        {/* value */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#0B3B78"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference - filled}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-[#0B3B78]">{percent}%</span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-[#5B6B83]">
          Attendance
        </span>
      </div>
    </div>
  );
}
