"use client";

import { useEffect, useRef, useState } from "react";
import { SEVERITY_STYLE, ScoreRing } from "@/components/report-ui";
import { CATEGORIES, type AnalysisResult } from "@/lib/resume";

interface ReportProps {
  result: AnalysisResult;
  jobType: string;
  fileName: string;
}

// A4 版面（mm）與報告 DOM 寬度（px）
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 14;
const DOC_WIDTH_PX = 720;
const MM_PER_PX = (PAGE_W - MARGIN * 2) / DOC_WIDTH_PX;
const BLOCK_GAP = 4;
const SCALE = 2;

function today() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return { label: `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`, compact: `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` };
}

export default function DownloadPdfButton(props: ReportProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const docRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!busy) return;
    let cancelled = false;

    (async () => {
      try {
        await document.fonts.ready;
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        if (cancelled || !docRef.current) return;
        await renderPdf(docRef.current, `履歷健檢報告_${props.jobType}_${today().compact}.pdf`);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("PDF 產生失敗，請再試一次");
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [busy, props.jobType]);

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <button
        type="button"
        onClick={() => {
          setError("");
          setBusy(true);
        }}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-full border border-ink bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-paper disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
            產生 PDF 中…
          </>
        ) : (
          <>
            <span aria-hidden>↓</span> 下載 PDF 報告
          </>
        )}
      </button>
      {error && <p className="text-xs text-accent">{error}</p>}

      {/* 匯出期間才掛載的 A4 報告版面，放在畫面外 */}
      {busy && (
        <div aria-hidden className="pointer-events-none fixed left-[-10000px] top-0">
          <div ref={docRef} className="pdf-light font-sans text-ink" style={{ width: DOC_WIDTH_PX }}>
            <ReportDocument {...props} />
          </div>
        </div>
      )}
    </div>
  );
}

// 每個 data-pdf-block 是一個不可切開的區塊；data-pdf-keep-next 表示要和下一塊放在同一頁
function ReportDocument({ result, jobType, fileName }: ReportProps) {
  const total = result.categories.reduce((n, c) => n + c.suggestions.length, 0);

  return (
    <div className="flex flex-col bg-white">
      <div data-pdf-block className="bg-white pb-2">
        <div className="flex items-center justify-between border-b-2 border-ink pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent font-serif text-lg font-bold text-surface">
              履
            </span>
            <span className="font-serif text-lg font-semibold">AI 履歷健檢</span>
          </div>
          <span className="text-sm text-muted">{today().label}</span>
        </div>

        <h1 className="mt-7 font-serif text-3xl font-bold">履歷健檢報告</h1>
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-muted">目標職缺</dt>
          <dd className="font-medium">{jobType}</dd>
          <dt className="text-muted">履歷檔案</dt>
          <dd className="font-medium [overflow-wrap:anywhere]">{fileName}</dd>
          <dt className="text-muted">建議總數</dt>
          <dd className="font-medium">{total} 條</dd>
        </dl>

        <div className="mt-6 flex items-center gap-6 rounded-2xl bg-ink p-6 text-paper">
          <div className="rounded-full bg-paper p-1">
            <ScoreRing score={result.score} />
          </div>
          <p className="leading-7">{result.summary}</p>
        </div>

        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th className="py-2 font-normal">面向</th>
              <th className="py-2 font-normal">說明</th>
              <th className="py-2 text-right font-normal">建議數</th>
            </tr>
          </thead>
          <tbody>
            {result.categories.map((c) => (
              <tr key={c.id} className="border-b border-line">
                <td className="py-2.5 font-medium">{CATEGORIES[c.id].title}</td>
                <td className="py-2.5 text-muted">{CATEGORIES[c.id].description}</td>
                <td className="py-2.5 text-right tabular-nums">{c.suggestions.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result.categories.map((cat, ci) => (
        <div key={cat.id} className="contents">
          <div
            data-pdf-block
            {...(cat.suggestions.length > 0 ? { "data-pdf-keep-next": "" } : {})}
            className="bg-white pt-4"
          >
            <div className="flex items-baseline gap-3 border-b border-line pb-3">
              <span className="font-serif text-2xl font-bold text-accent/70">{String(ci + 1).padStart(2, "0")}</span>
              <h2 className="font-serif text-xl font-semibold">{CATEGORIES[cat.id].title}</h2>
              <span className="text-sm text-muted">{CATEGORIES[cat.id].description}</span>
            </div>
            {cat.suggestions.length === 0 && (
              <p className="mt-3 rounded-lg bg-good-soft px-4 py-2.5 text-sm text-good">✓ 這個面向沒有明顯問題</p>
            )}
          </div>

          {cat.suggestions.map((s, i) => (
            <div key={i} data-pdf-block className="flex flex-col gap-2.5 bg-white py-3">
              <span className={`w-fit rounded-md px-2 py-0.5 text-xs font-medium ${SEVERITY_STYLE[s.severity].className}`}>
                {SEVERITY_STYLE[s.severity].label}
              </span>
              <div className="grid grid-cols-[3.5rem_1fr] gap-x-3 gap-y-2 text-[14px] leading-6">
                <span className="text-xs leading-6 text-muted">原句</span>
                <p className="border-l-2 border-line pl-3 text-muted [overflow-wrap:anywhere]">{s.quote}</p>
                <span className="text-xs leading-6 text-muted">問題</span>
                <p className="[overflow-wrap:anywhere]">{s.problem}</p>
                <span className="text-xs leading-6 text-good">建議改成</span>
                <p className="rounded-lg bg-good-soft px-3 py-2 [overflow-wrap:anywhere]">{s.fix}</p>
              </div>
            </div>
          ))}
        </div>
      ))}

      <div data-pdf-block className="bg-white pt-6">
        <p className="border-t border-line pt-3 text-xs text-muted">
          本報告由 AI 依你上傳的履歷自動產生，僅供參考；引用原句請以你的履歷原文為準。
        </p>
      </div>
    </div>
  );
}

async function renderPdf(root: HTMLElement, filename: string) {
  const [{ jsPDF }, { domToCanvas }] = await Promise.all([import("jspdf"), import("modern-screenshot")]);

  const blocks = Array.from(root.querySelectorAll<HTMLElement>("[data-pdf-block]"));
  const images: { canvas: HTMLCanvasElement; h: number; keepNext: boolean }[] = [];
  for (const el of blocks) {
    const canvas = await domToCanvas(el, { scale: SCALE, backgroundColor: "#ffffff" });
    images.push({ canvas, h: (canvas.height / SCALE) * MM_PER_PX, keepNext: el.hasAttribute("data-pdf-keep-next") });
  }

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
  const contentW = PAGE_W - MARGIN * 2;
  const bottom = PAGE_H - MARGIN - 6; // 留位置給頁碼
  let y = MARGIN;

  images.forEach((img, i) => {
    // 標題區塊要跟下一個建議放同一頁
    const needed = img.keepNext && images[i + 1] ? img.h + images[i + 1].h : img.h;
    if (y > MARGIN && y + Math.min(needed, bottom - MARGIN) > bottom) {
      pdf.addPage();
      y = MARGIN;
    }

    if (img.h <= bottom - MARGIN) {
      pdf.addImage(img.canvas.toDataURL("image/jpeg", 0.92), "JPEG", MARGIN, y, contentW, img.h);
      y += img.h + BLOCK_GAP;
      return;
    }

    // 單一區塊超過一頁時才切開
    const pxPerMm = img.canvas.height / img.h;
    let offsetMm = 0;
    while (offsetMm < img.h) {
      const sliceMm = Math.min(bottom - y, img.h - offsetMm);
      const slice = document.createElement("canvas");
      slice.width = img.canvas.width;
      slice.height = Math.round(sliceMm * pxPerMm);
      slice.getContext("2d")!.drawImage(img.canvas, 0, -Math.round(offsetMm * pxPerMm));
      pdf.addImage(slice.toDataURL("image/jpeg", 0.92), "JPEG", MARGIN, y, contentW, sliceMm);
      offsetMm += sliceMm;
      y += sliceMm + BLOCK_GAP;
      if (offsetMm < img.h) {
        pdf.addPage();
        y = MARGIN;
      }
    }
  });

  const pages = pdf.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    pdf.setPage(p);
    pdf.setFontSize(9);
    pdf.setTextColor(150);
    pdf.text(`${p} / ${pages}`, PAGE_W / 2, PAGE_H - MARGIN / 2, { align: "center" });
  }

  pdf.save(filename);
}
