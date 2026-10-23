"use client";

import { useEffect, useRef, useState } from "react";
import { StepBadge, useApiKey } from "@/components/ApiKeyInput";
import {
  CATEGORIES,
  JOB_TYPES,
  MAX_PDF_BYTES,
  type AnalysisResult,
  type AnalyzeResponse,
  type Severity,
} from "@/lib/resume";

const SEVERITY_STYLE: Record<Severity, { label: string; className: string }> = {
  high: { label: "優先修改", className: "bg-accent-soft text-accent" },
  medium: { label: "建議修改", className: "bg-warn-soft text-warn" },
  low: { label: "可再加強", className: "bg-paper text-muted border border-line" },
};

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function ResumeAnalyzer() {
  const apiKey = useApiKey();
  const [file, setFile] = useState<File | null>(null);
  const [jobType, setJobType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setError("");
    if (f && f.size > MAX_PDF_BYTES) {
      setError("PDF 不能超過 10 MB");
      setFile(null);
      return;
    }
    setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey || !file || !jobType) return;

    setLoading(true);
    setError("");
    setResult(null);

    const body = new FormData();
    body.append("file", file);
    body.append("jobType", jobType);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "x-openai-key": apiKey },
        body,
      });
      const data: AnalyzeResponse = await res.json();
      if (data.ok) setResult(data.result);
      else setError(data.error);
    } catch {
      setError("連線失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = !!apiKey && !!file && !!jobType && !loading;

  return (
    <>
      <section className="animate-rise w-full rounded-3xl border border-line bg-surface p-5 [animation-delay:160ms] sm:p-8">
        <div className="flex items-center gap-3">
          <StepBadge n={2} done={!!result} />
          <h2 className="text-lg font-bold text-ink">上傳履歷、選擇職缺</h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-7">
          {/* 上傳區：透明 input 蓋滿整塊，點擊與拖放都由原生 input 處理 */}
          <div>
            <p className="mb-2.5 text-sm font-medium text-ink">履歷 PDF</p>
            <label
              className={`group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-9 text-center transition-colors focus-within:border-accent hover:border-accent/60 ${
                file ? "border-good/50 bg-good-soft/50" : "border-line bg-paper"
              }`}
            >
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFile}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              {file ? (
                <>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-good text-sm font-bold text-surface">
                    PDF
                  </span>
                  <span className="max-w-full break-all text-sm font-medium text-ink">{file.name}</span>
                  <span className="text-xs text-muted">{formatSize(file.size)}・點擊可更換檔案</span>
                </>
              ) : (
                <>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-xl text-accent transition-transform group-hover:-translate-y-0.5">
                    ↑
                  </span>
                  <span className="text-sm font-medium text-ink">點擊或拖曳履歷 PDF 到這裡</span>
                  <span className="text-xs text-muted">僅限 PDF，最大 10 MB</span>
                </>
              )}
            </label>
          </div>

          <fieldset>
            <legend className="mb-2.5 text-sm font-medium text-ink">目標職缺類型</legend>
            <div className="grid grid-cols-2 gap-2.5">
              {JOB_TYPES.map((t) => (
                <label
                  key={t}
                  className="flex cursor-pointer items-center justify-center rounded-xl border border-line bg-paper px-3 py-3 text-center text-sm text-muted transition-colors hover:border-ink/30 hover:text-ink has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:font-medium has-[:checked]:text-paper has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-accent/20"
                >
                  <input
                    type="radio"
                    name="jobType"
                    value={t}
                    checked={jobType === t}
                    onChange={(e) => setJobType(e.target.value)}
                    className="sr-only"
                  />
                  {t}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-base font-medium text-surface shadow-[0_8px_24px_-10px] shadow-accent/60 transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-surface/40 border-t-surface" />
                  AI 分析中，約需 30–60 秒…
                </>
              ) : (
                <>開始分析 →</>
              )}
            </button>

            {!apiKey && <p className="text-center text-sm text-muted">請先完成步驟 1，設定 OpenAI API Key。</p>}
            {error && (
              <p role="alert" className="rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent">
                {error}
              </p>
            )}
          </div>
        </form>
      </section>

      {loading && <LoadingCard />}

      <div ref={resultRef} className="scroll-mt-20">
        {result && <AnalysisView result={result} jobType={jobType} />}
      </div>
    </>
  );
}

function LoadingCard() {
  return (
    <section className="w-full rounded-3xl border border-line bg-surface p-5 sm:p-8" aria-live="polite">
      <p className="text-sm text-muted">AI 正在逐句閱讀你的履歷…</p>
      <div className="mt-5 flex animate-pulse flex-col gap-3">
        <div className="h-4 w-2/3 rounded-full bg-line" />
        <div className="h-4 w-full rounded-full bg-line" />
        <div className="h-4 w-5/6 rounded-full bg-line" />
        <div className="mt-2 h-16 w-full rounded-2xl bg-line/60" />
      </div>
    </section>
  );
}

function ScoreRing({ score }: { score: number }) {
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

function AnalysisView({ result, jobType }: { result: AnalysisResult; jobType: string }) {
  const total = result.categories.reduce((n, c) => n + c.suggestions.length, 0);

  return (
    <section className="animate-rise flex w-full flex-col gap-5 pt-6">
      <div>
        <p className="text-xs font-medium tracking-[0.25em] text-accent">REPORT</p>
        <h2 className="mt-2 font-serif text-2xl font-bold text-ink sm:text-3xl">健檢報告</h2>
      </div>

      <div className="flex flex-col items-center gap-6 rounded-3xl bg-ink p-6 text-paper sm:flex-row sm:items-center sm:p-8">
        <div className="rounded-full bg-paper p-1">
          <ScoreRing score={result.score} />
        </div>
        <div className="w-full">
          <p className="text-center text-xs tracking-widest opacity-60 sm:text-left">
            目標職缺・{jobType}・共 {total} 條建議
          </p>
          <p className="mt-2 leading-7">{result.summary}</p>
        </div>
      </div>

      {/* 面向導覽：手機可橫向滑動 */}
      <nav className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          {result.categories.map((cat) => (
            <li key={cat.id}>
              <a
                href={`#cat-${cat.id}`}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-muted transition-colors hover:border-ink/30 hover:text-ink"
              >
                {CATEGORIES[cat.id].title}
                <span className="rounded-full bg-paper px-1.5 text-xs tabular-nums">{cat.suggestions.length}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {result.categories.map((cat, ci) => (
        <article
          key={cat.id}
          id={`cat-${cat.id}`}
          className="scroll-mt-20 rounded-3xl border border-line bg-surface p-5 sm:p-8"
        >
          <header className="flex items-start gap-4 border-b border-line pb-5">
            <span className="font-serif text-3xl font-bold leading-none text-accent/70">
              {String(ci + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h3 className="font-serif text-xl font-semibold text-ink">{CATEGORIES[cat.id].title}</h3>
              <p className="mt-1 text-sm text-muted">{CATEGORIES[cat.id].description}</p>
            </div>
          </header>

          {cat.suggestions.length === 0 ? (
            <p className="mt-5 flex items-center gap-2 rounded-xl bg-good-soft px-4 py-3 text-sm text-good">
              ✓ 這個面向沒有明顯問題，做得很好
            </p>
          ) : (
            <ol className="flex flex-col divide-y divide-line">
              {cat.suggestions.map((s, i) => (
                <SuggestionItem key={i} s={s} />
              ))}
            </ol>
          )}
        </article>
      ))}
    </section>
  );
}

function SuggestionItem({ s }: { s: AnalysisResult["categories"][number]["suggestions"][number] }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(s.fix);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 剪貼簿不可用時不做事
    }
  }

  return (
    <li className="flex flex-col gap-4 py-6 last:pb-0">
      <span className={`w-fit rounded-md px-2 py-0.5 text-xs font-medium ${SEVERITY_STYLE[s.severity].className}`}>
        {SEVERITY_STYLE[s.severity].label}
      </span>

      <div>
        <p className="text-xs text-muted">原句</p>
        <blockquote className="mt-1.5 border-l-2 border-line pl-3 text-[15px] leading-7 text-muted [overflow-wrap:anywhere]">
          {s.quote}
        </blockquote>
      </div>

      <div>
        <p className="text-xs text-muted">問題</p>
        <p className="mt-1.5 text-[15px] leading-7 text-ink [overflow-wrap:anywhere]">{s.problem}</p>
      </div>

      <div className="rounded-2xl bg-good-soft p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-good">建議改成</p>
          <button
            type="button"
            onClick={copy}
            className="rounded-md px-2 py-0.5 text-xs text-good transition-colors hover:bg-good/10"
          >
            {copied ? "已複製 ✓" : "複製"}
          </button>
        </div>
        <p className="mt-1.5 text-[15px] leading-7 text-ink [overflow-wrap:anywhere]">{s.fix}</p>
      </div>
    </li>
  );
}
