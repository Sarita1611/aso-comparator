export default function ScoreRing({ score, size = 80, strokeWidth = 7, label, grade }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;

  const getColor = (s) => {
    if (s >= 80) return '#22c55e';
    if (s >= 65) return '#6366f1';
    if (s >= 45) return '#f59e0b';
    return '#ef4444';
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-slate-800" style={{ fontSize: size * 0.22 }}>
            {score}
          </span>
          {grade && (
            <span className="font-display font-bold" style={{ fontSize: size * 0.14, color }}>
              {grade}
            </span>
          )}
        </div>
      </div>
      {label && <p className="text-xs text-slate-500 text-center font-medium">{label}</p>}
    </div>
  );
}

export function PillarScoreBar({ label, score, maxScore = 10 }) {
  const percentage = (score / maxScore) * 100;

  const getColor = (s) => {
    const pct = (s / maxScore) * 100;
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 65) return 'bg-brand-500';
    if (pct >= 45) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getTextColor = (s) => {
    const pct = (s / maxScore) * 100;
    if (pct >= 80) return 'text-green-700';
    if (pct >= 65) return 'text-brand-700';
    if (pct >= 45) return 'text-amber-700';
    return 'text-red-700';
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className={`text-xs font-bold ${getTextColor(score)}`}>{score}/{maxScore}</span>
      </div>
      <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${getColor(score)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
