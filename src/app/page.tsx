import Link from "next/link";
import SiteHeader, { SiteFooter } from "@/components/SiteHeader";
import { CATEGORIES, CATEGORY_IDS, JOB_TYPES } from "@/lib/resume";

const STEPS = [
  { title: "貼上 API Key", body: "使用你自己的 OpenAI 金鑰，只存在你的瀏覽器，下次回來不用重貼。" },
  { title: "上傳履歷、選職缺", body: "直接上傳 PDF，選擇你要投遞的職缺類型，不用另外整理文字。" },
  { title: "逐句拿到改法", body: "AI 引用你履歷中的原句，指出問題，並給出可以直接替換的寫法。" },
];

const JOB_NOTES: Record<string, string> = {
  行政人員: "文書流程、會議與跨部門協調",
  人事人員: "招募、薪資、勞健保與教育訓練",
  都市更新相關人員: "整合協調、法規程序與住戶溝通",
  總務人員: "採購、資產、庶務與廠商管理",
  文件管理人員: "檔案歸檔、版本控管與文件系統",
  文書人員: "公文收發、繕打校對與檔案整理",
  業務助理: "報價訂單、客戶聯繫與業績報表",
};

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1 overflow-x-clip">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pb-28">
          <div className="animate-rise">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              專為行政・人事・都更・總務・文書・業助職缺設計
            </p>
            <h1 className="font-serif text-4xl font-bold leading-[1.25] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              讓履歷上的
              <br />
              每一句話，
              <br />
              <span className="text-accent">都替你說話。</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-muted sm:text-lg">
              上傳履歷 PDF，AI 會從五個面向逐句檢查，引用你寫下的原句、說清楚問題在哪，並直接給你改好的版本。
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/check"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-medium text-surface shadow-[0_8px_24px_-8px] shadow-accent/50 transition-transform hover:-translate-y-0.5"
              >
                免費開始健檢 <span aria-hidden>→</span>
              </Link>
              <a href="#how" className="inline-flex items-center justify-center px-4 py-3 text-sm text-muted hover:text-ink">
                看看怎麼運作
              </a>
            </div>
          </div>

          {/* 範例建議卡 */}
          <div className="animate-rise relative [animation-delay:150ms]">
            <div className="absolute -inset-4 -z-10 rotate-2 rounded-[2rem] bg-accent-soft sm:-inset-6" />
            <div className="rounded-3xl border border-line bg-surface p-5 shadow-xl shadow-ink/5 sm:p-7">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-widest text-muted">成果與量化</span>
                <span className="rounded-md bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">優先修改</span>
              </div>
              <p className="mt-5 text-xs text-muted">原句</p>
              <p className="mt-1.5 border-l-2 border-line pl-3 text-[15px] leading-7 text-muted line-through decoration-accent/50">
                負責公司行政庶務及相關事宜。
              </p>
              <p className="mt-5 text-xs text-muted">問題</p>
              <p className="mt-1.5 text-[15px] leading-7 text-ink">
                只描述職責、看不出規模與成果，招募者無法判斷你的能力。
              </p>
              <div className="mt-5 rounded-2xl bg-good-soft p-4">
                <p className="text-xs font-medium text-good">建議改成</p>
                <p className="mt-1.5 text-[15px] leading-7 text-ink">
                  統籌 80 人辦公室行政庶務，導入線上請購流程，採購作業時間縮短 40%。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 流程 */}
        <section id="how" className="scroll-mt-20 border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
            <SectionTitle eyebrow="HOW IT WORKS" title="三步驟，五分鐘內完成" />
            <ol className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="bg-surface p-7 sm:p-8">
                  <span className="font-serif text-5xl font-bold text-accent/80">0{i + 1}</span>
                  <h3 className="mt-5 text-lg font-bold text-ink">{s.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 五個面向 */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
          <SectionTitle eyebrow="FIVE LENSES" title="從五個面向，看見履歷的盲點" />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {CATEGORY_IDS.map((id, i) => (
              <li
                key={id}
                className="group rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-accent/50"
              >
                <span className="text-xs tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 font-serif text-xl font-semibold text-ink group-hover:text-accent">
                  {CATEGORIES[id].title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">{CATEGORIES[id].description}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 職缺 */}
        <section className="bg-ink text-paper">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-8 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <p className="text-xs font-medium tracking-[0.25em] text-accent">FOR YOUR ROLE</p>
              <h2 className="mt-4 font-serif text-3xl font-bold leading-snug sm:text-4xl">
                針對你要投的職缺，
                <br />
                給對方向的建議。
              </h2>
              <p className="mt-5 leading-8 opacity-70">
                同一句話，投行政和投都更要強調的重點不同。選好職缺，AI 會依照該職位看重的能力來檢查。
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {JOB_TYPES.map((job) => (
                <li key={job} className="rounded-2xl border border-paper/15 p-5">
                  <p className="font-serif text-lg font-semibold">{job}</p>
                  <p className="mt-1 text-sm opacity-60">{JOB_NOTES[job]}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 隱私 */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
          <div className="grid gap-8 rounded-3xl border border-line bg-surface p-7 sm:p-12 md:grid-cols-[auto_1fr] md:items-center md:gap-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-good-soft text-3xl" aria-hidden>
              🔒
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-ink sm:text-3xl">你的金鑰與履歷，只屬於你</h2>
              <p className="mt-3 max-w-2xl leading-8 text-muted">
                API Key 只存在你自己的瀏覽器，我們的伺服器不會保存；履歷只在分析時轉交給 OpenAI，並要求對方不保留這次的回應。
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-accent px-6 py-14 text-center text-surface sm:px-12 sm:py-20">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-surface/10" />
            <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-surface/10" />
            <h2 className="relative font-serif text-3xl font-bold sm:text-4xl">下一份面試通知，從改好履歷開始</h2>
            <Link
              href="/check"
              className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-surface px-7 py-3.5 font-medium text-accent transition-transform hover:-translate-y-0.5"
            >
              立即健檢我的履歷 <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-medium tracking-[0.25em] text-accent">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-3xl font-bold text-ink sm:text-4xl">{title}</h2>
    </div>
  );
}
