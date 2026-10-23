import Link from "next/link";

export default function SiteHeader({ showCta = true }: { showCta?: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent font-serif text-lg font-bold text-surface">
            履
          </span>
          <span className="font-serif text-lg font-semibold tracking-wide text-ink">AI 履歷健檢</span>
        </Link>
        {showCta && (
          <Link
            href="/check"
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-85"
          >
            開始健檢
          </Link>
        )}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span className="font-serif text-ink">AI 履歷健檢</span>
        <span>金鑰只存在你的瀏覽器・履歷不會被保存</span>
      </div>
    </footer>
  );
}
