"use client";
import Shell from "@/components/Shell";
import Link from "next/link";

export default function Page() {
  return <Shell><div className="flex-1 p-8 max-w-[820px] mobile-full">
    <div className="flex items-center gap-3 fade-up">
      <span className="text-[24px]">🧠</span>
      <h2 className="font-display text-[24px] font-normal">Mental Models</h2>
      <span className="font-mono text-[10px] py-[3px] px-[8px] rounded-md" style={{ color:"var(--gold)", background:"rgba(196,165,106,.1)", border:"1px solid rgba(196,165,106,.15)" }}>WIP</span>
    </div>
    <p className="text-[14px] mt-4 leading-relaxed fade-up-1" style={{ color:"var(--t3)" }}>Thinking frameworks extracted from 300+ founder conversations. Apply the right model to the right problem, faster.</p>
    <div className="mt-6 rounded-xl p-5 fade-up-2" style={{ background:"var(--bg2)", border:"1px solid var(--border)" }}>
      <p className="text-[13px] leading-relaxed" style={{ color:"var(--t3)" }}>This module is being built right now. In the meantime, the Sage can help you think through any mental model challenge.</p>
      <Link href="/sage" className="inline-block mt-3 px-5 py-2.5 rounded-lg text-[12px] font-medium no-underline" style={{ background:"var(--ac)", color:"var(--bg)" }}>Ask the Sage →</Link>
    </div>
  </div></Shell>;
}
