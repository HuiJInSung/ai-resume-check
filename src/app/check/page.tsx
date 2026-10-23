import type { Metadata } from "next";
import ApiKeyInput from "@/components/ApiKeyInput";
import ResumeAnalyzer from "@/components/ResumeAnalyzer";
import SiteHeader, { SiteFooter } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "開始健檢｜AI 履歷健檢",
};

export default function CheckPage() {
  return (
    <>
      <SiteHeader showCta={false} />
      <main className="flex-1">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-24 pt-10 sm:px-8 sm:pt-14">
          <header className="animate-rise mb-2">
            <p className="text-xs font-medium tracking-[0.25em] text-accent">RESUME CHECK</p>
            <h1 className="mt-3 font-serif text-3xl font-bold leading-snug text-ink sm:text-4xl">
              開始你的履歷健檢
            </h1>
            <p className="mt-3 leading-7 text-muted">兩個步驟：設定金鑰、上傳履歷。AI 會逐句告訴你怎麼改。</p>
          </header>
          <ApiKeyInput />
          <ResumeAnalyzer />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
