"use client";
import Shell from "@/components/Shell";
import Link from "next/link";

const MODULES = [
  { n: "Stage Patterns", d: "What works at each stage", ico: "📈" },
  { n: "Anti-patterns", d: "Mistakes to avoid", ico: "⚠️" },
  { n: "Archetype Analysis", d: "Your decision style", ico: "🎭" },
  { n: "Peer Benchmarks", d: "How you compare", ico: "📊" },
];

export default function Page() {
  return <Shell><div className="flex-1 p-7 max-w-[640px]">
    <div className="flex items-center gap-2 fade-up">
      <span className="text-[20px]">👤</span>
      <h2 className="font-display text-[22px] font-normal">Founder Patterns</h2>
      <span className="font-mono text-[8px] py-[2px] px-[7px] rounded" style={{ color:"var(--t5)", background:"var(--bg4)", letterSpacing:".8px" }}>COMING SOON</span>
    </div>
    <p className="text-[13px] mt-3 leading-relaxed fade-up-1" style={{ color:"var(--t3)" }}>Common patterns, anti-patterns, and decision archetypes from hundreds of founders.</p>
    <div className="mt-5 fade-up-2">
      <p className="font-mono text-[10px] tracking-wide mb-3" style={{ color:"var(--t4)" }}>PLANNED MODULES</p>
      <div className="grid grid-cols-2 gap-2">
        {MODULES.map((m, i) => (
          <div key={i} className="rounded-lg p-3.5 opacity-70" style={{ background:"var(--bg2)", border:"0.5px solid var(--border)" }}>
            <div className="flex items-center gap-1.5 mb-1"><span className="text-[14px]">{m.ico}</span><span className="text-xs font-medium" style={{ color:"var(--t1)" }}>{m.n}</span></div>
            <p className="text-[10px] leading-snug" style={{ color:"var(--t4)" }}>{m.d}</p>
          </div>
        ))}
      </div>
    </div>
    <div className="mt-5 rounded-lg px-4 py-3 fade-up-3" style={{ background:"var(--ac-bg)", border:"0.5px solid var(--ac-border)" }}>
      <p className="text-xs leading-relaxed" style={{ color:"var(--t2)" }}>We're building this now. <Link href="/sage" className="font-medium" style={{ color:"var(--ac)" }}>Consult the Sage →</Link></p>
    </div>
  </div></Shell>;
}
