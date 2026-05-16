"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";

const QTS = [
  { t: "Most teams confuse movement with progress.", g: "Brian Chesky" },
  { t: "The best focus isn't on building the right thing. It's on not building the wrong thing.", g: "Lenny Rachitsky" },
  { t: "Good strategy is a set of choices. Not a long list of hopes.", g: "Geoffrey Moore" },
];
const REFS = [
  { n: "Lenny Rachitsky", r: "On product-market fit" },
  { n: "Peter Thiel", r: "Zero to One" },
  { n: "Patrick Collison", r: "Scaling decisions" },
  { n: "Geoffrey Moore", r: "Crossing the Chasm" },
];

export default function DashboardPage() {
  const [scenario, setScenario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qi, setQi] = useState(0);
  const router = useRouter();

  useEffect(() => { const t = setInterval(() => setQi(p => (p+1)%QTS.length), 6000); return () => clearInterval(t); }, []);
  useEffect(() => {
    Promise.all([fetch("/api/scenarios/today").then(r=>r.json()), fetch("/api/profile").then(r=>r.json())])
      .then(([s,p]) => { if (!p?.user?.stage) { router.push("/onboarding"); return; } setScenario(s); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) return <Shell><div className="flex-1 flex items-center justify-center"><p style={{ color:"var(--t3)" }}>Loading...</p></div></Shell>;

  const rightPanel = <div>
    <p className="font-mono text-[10px] tracking-wide" style={{ color:"var(--t4)" }}>CONTEXT</p>
    <h3 className="font-display text-[15px] font-medium mt-1.5" style={{ color:"var(--t1)" }}>About Launch Decision</h3>
    <p className="font-mono text-[10px] tracking-wide mt-5" style={{ color:"var(--t4)" }}>KEY REFERENCES</p>
    {REFS.map((g,i) => <div key={i} className="flex items-center gap-2 py-2" style={{ borderTop: i ? "0.5px solid var(--border)" : "none" }}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px]" style={{ background:"var(--bg3)", color:"var(--t3)" }}>{g.n[0]}</div>
      <div><p className="text-[11px] font-medium" style={{ color:"var(--t1)" }}>{g.n}</p><p className="text-[10px]" style={{ color:"var(--t4)" }}>{g.r}</p></div>
    </div>)}
    <p className="font-mono text-[10px] tracking-wide mt-5" style={{ color:"var(--t4)" }}>RECENT INSIGHTS</p>
    <div className="rounded-md p-3 mt-2" style={{ background:"var(--bg3)", border:"0.5px solid var(--border)" }}>
      <p className="font-display text-[13px] italic leading-snug" style={{ color:"var(--t1)" }}>"The best features feel obvious in retrospect and invisible before the breakthrough."</p>
      <p className="text-[10px] mt-1.5" style={{ color:"var(--t4)" }}>Brian Chesky</p>
    </div>
  </div>;

  return <Shell rightPanel={rightPanel}><div className="flex-1 p-7 max-w-[680px]">
    <div className="fade-up">
      <p className="text-[13px]" style={{ color:"var(--t3)" }}>Good morning, Arjun.</p>
      <h1 className="font-display text-[24px] font-normal mt-1">What shall we think through today?</h1>
    </div>
    {/* Search */}
    <div className="mt-4 fade-up-1">
      <div className="flex items-center rounded-lg px-3.5" style={{ background:"var(--bg2)", border:"0.5px solid var(--border)" }}>
        <input onClick={() => router.push("/sage")} readOnly placeholder="Ask Sage anything about strategy, product, or execution..."
          className="flex-1 py-3 bg-transparent border-none text-[13px] outline-none cursor-pointer" style={{ color:"var(--t3)" }} />
        <span className="cursor-pointer" style={{ color:"var(--ac)", fontSize:16 }} onClick={() => router.push("/sage")}>↗</span>
      </div>
    </div>
    {/* Continue */}
    <div className="mt-6 fade-up-2">
      <p className="text-[11px] font-medium mb-2.5" style={{ color:"var(--t3)" }}>Continue where you left off</p>
      <div className="flex gap-2.5">
        {[{tag:"SIMULATION",c:"#8B9A6B",t:"Should we launch this feature?",d:"Updated 2 days ago"},{tag:"DECISION LOG",c:"#C4A56A",t:"Pricing strategy for premium tier",d:"Updated 5 days ago"},{tag:"REFLECTION",c:"#8B9A6B",t:"The moat is in the mindshare",d:"Yesterday"}].map((item,i) => (
          <div key={i} onClick={() => router.push("/reflections")} className="flex-1 rounded-lg p-3.5 cursor-pointer transition-colors" style={{ background:"var(--bg2)", border:"0.5px solid var(--border)" }}>
            <span className="font-mono text-[9px] tracking-wide" style={{ color:item.c }}>{item.tag}</span>
            <p className="text-[13px] font-medium leading-snug mt-1.5" style={{ color:"var(--t1)" }}>{item.t}</p>
            <div className="flex justify-between items-center mt-2.5">
              <span className="text-[10px]" style={{ color:"var(--t4)" }}>{item.d}</span>
              <span style={{ color:"var(--ac)", fontSize:12 }}>↗</span>
            </div>
          </div>
        ))}
      </div>
    </div>
    {/* Today's reflection */}
    <div className="mt-6 fade-up-3">
      <p className="text-[11px] font-medium mb-2.5" style={{ color:"var(--t3)" }}>Today's reflection</p>
      <div className="rounded-lg p-6 cursor-pointer flex gap-5 items-start" style={{ background:"var(--bg2)", border:"0.5px solid var(--border)" }} onClick={() => router.push("/reflections")}>
        <div className="flex-1">
          <p className="font-display text-[20px] font-normal leading-snug" style={{ color:"var(--t1)" }}>{QTS[qi].t}</p>
          <p className="text-[13px] mt-3 leading-relaxed" style={{ color:"var(--t3)" }}>Velocity feels productive. But if you're building the wrong thing faster, you're just getting to the wrong future sooner.</p>
          <p className="mt-3.5 text-xs font-medium" style={{ color:"var(--ac)" }}>Read more →</p>
        </div>
        <div className="text-center flex-shrink-0">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm" style={{ background:"var(--bg3)", color:"var(--t3)" }}>A</div>
          <p className="text-[10px] mt-1" style={{ color:"var(--t3)" }}>Arjun</p>
          <p className="text-[9px]" style={{ color:"var(--t4)" }}>Founder</p>
        </div>
      </div>
    </div>
  </div></Shell>;
}
