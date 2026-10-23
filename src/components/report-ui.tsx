import type { Severity } from "@/lib/resume";

// 網頁報告與 PDF 報告共用的元件

export const SEVERITY_STYLE: Record<Severity, { label: string; className: string }> = {
  high: { label: "優先修改", className: "bg-accent-soft text-accent" },
  medium: { label: "建議修改", className: "bg-warn-soft text-warn" },
  low: { label: "可再加強", className: "bg-paper text-muted border border-line" },
};

export function ScoreRing({ score }: { score: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const color = score >= 80 ? "text-good" : score >= 60 ? "text-warn" : "text-accent";
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="8" className="stroke-line" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          className={`${color} transition-[stroke-dashoffset] duration-1000`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-3xl font-bold leading-none text-ink">{score}</span>
        <span className="mt-1 text-[11px] text-muted">/ 100</span>
      </div>
    </div>
  );
}
