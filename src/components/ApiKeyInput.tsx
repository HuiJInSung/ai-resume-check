"use client";

import { useState, useSyncExternalStore } from "react";

const STORAGE_KEY = "openai-api-key";
const listeners = new Set<() => void>();

function readKey(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeKey(value: string | null) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, value);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage 不可用（例如無痕模式被封鎖）時就只是不保存
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

// 其他元件可用這個 hook 取得目前保存的金鑰
export function useApiKey() {
  return useSyncExternalStore(subscribe, readKey, () => null);
}

function maskKey(key: string) {
  if (key.length <= 10) return "••••••••";
  return `${key.slice(0, 5)}••••••••${key.slice(-4)}`;
}

export function StepBadge({ n, done }: { n: number; done: boolean }) {
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
        done ? "bg-good text-surface" : "bg-accent-soft text-accent"
      }`}
    >
      {done ? "✓" : n}
    </span>
  );
}

export default function ApiKeyInput() {
  const savedKey = useApiKey();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const key = draft.trim();
    if (!key.startsWith("sk-")) {
      setError("這看起來不像 OpenAI API Key（應該以 sk- 開頭）");
      return;
    }
    writeKey(key);
    setDraft("");
    setError("");
  }

  return (
    <section className="animate-rise w-full rounded-3xl border border-line bg-surface p-5 [animation-delay:80ms] sm:p-8">
      <div className="flex items-center gap-3">
        <StepBadge done={!!savedKey} n={1} />
        <h2 className="text-lg font-bold text-ink">設定 OpenAI API Key</h2>
      </div>

      {savedKey ? (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="inline-flex min-w-0 items-center gap-2 rounded-xl bg-good-soft px-4 py-3 text-sm text-good">
            <span aria-hidden>✓</span>
            <span>已設定</span>
            <span className="truncate font-mono">{maskKey(savedKey)}</span>
          </span>
          <button
            type="button"
            onClick={() => writeKey(null)}
            className="rounded-xl border border-line px-4 py-3 text-sm text-muted transition-colors hover:border-accent/50 hover:text-accent"
          >
            清除金鑰
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            type="password"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="sk-..."
            autoComplete="off"
            spellCheck={false}
            aria-label="OpenAI API Key"
            className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-4 py-3 font-mono text-sm text-ink outline-none transition-shadow placeholder:text-muted/60 focus:border-accent focus:ring-4 focus:ring-accent/15"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="rounded-xl bg-ink px-6 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
          >
            儲存
          </button>
        </form>
      )}

      {error && <p className="mt-3 text-sm text-accent">{error}</p>}

      <p className="mt-5 flex gap-2 text-sm leading-6 text-muted">
        <span aria-hidden>🔒</span>
        <span>
          金鑰只會存在你自己的瀏覽器（localStorage），我們的伺服器不會保存它。還沒有金鑰？
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            到 OpenAI 申請 API Key ↗
          </a>
        </span>
      </p>
    </section>
  );
}
