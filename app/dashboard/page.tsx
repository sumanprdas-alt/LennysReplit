"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";

const QTS = [
  { t: "Most teams confuse movement with progress.", g: "Brian Chesky" },
  { t: "The best focus isn't on building the right thing. It's on not building the wrong thing.", g: "Lenny Rachitsky" },
  { t: "Good strategy is a set of choices. Not a long list of hopes.", g: "Geoffrey Moore" },
];

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [scenario, setScenario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qi, setQi] = useState(0);
  const router = useRouter();

  useEffect(() => { const t = setInterval(() => setQi(p => (p+1)%QTS.length), 6000); return () => clearInterval(t); }, []);
  useEffect(() => {
    Promise.all([
      fetch("/api/scenarios/today").then(r=>r.json()).catch(()=>null),
      fetch("/api/profile").then(r=>r.json()).catch(()=>null)
    ]).then(([s,p]) => {
      if (p?.user && !p.user.stage && !p.user.business_model) {
        router.push("/onboarding");
        return;
      }
      setScenario(s);
      setProfile(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [router]);

  if (loading) return <Shell><div className="flex-1 flex items-center justify-center"><p style={{ color:"var(--t3)" }}>Loading...</p></div></Shell>;

  const userName = profile?.user?.name || "there";
  const totalScenarios = profile?.profile?.total_scenarios || 0;
  const totalSage = profile?.profile?.total_sage_sessions || 0;
  const calibration = profile?.profile?.calibration_score || 0;

  return <Shell><div className="flex-1 p-7 max-w-[680px]">
    {/* Greeting */}
    <div className="fade-up">
      <p className="text-[13px]" style={{ color:"var(--t3)" }}>Welcome back, {userName}.</p>
      <h1 className="font-display text-[24px] font-normal mt-1">What shall we think through today?</h1>
    </div>

    {/* Search */}
    <div className="mt-5 fade-up-1">
      <div className="flex items-center rounded-lg px-3.5" style={{ background:"var(--bg2)", border:"0.5px solid var(--border)" }}>
        <input onClick={() => router.push("/sage")} readOnly placeholder="Ask Sage anything about strategy, product, or execution..."
          className="flex-1 py-3 bg-transparent border-none text-[13px] outline-none cursor-pointer" style={{ color:"var(--t3)" }} />
        <span className="cursor-pointer" style={{ color:"var(--ac)", fontSize:16 }} onClick={() => router.push("/sage")}>↗</span>
      </div>
    </div>

    {/* Quick stats — only show if user has activity */}
    {(totalScenarios > 0 || totalSage > 0) && (
      <div className="flex gap-2.5 mt-6 fade-up-2">
        <div className="flex-1 rounded-lg p-4" style={{ background:"var(--bg2)", border:"0.5px solid var(--border)" }}>
          <div className="font-display text-[22px] font-normal" style={{ color:"var(--t1)" }}>{Math.round(calibration)}%</div>
          <p className="font-mono text-[9px] mt-1 tracking-wide" style={{ color:"var(--t4)" }}>Calibration</p>
        </div>
        <div className="flex-1 rounded-lg p-4" style={{ background:"var(--bg2)", border:"0.5px solid var(--border)" }}>
          <div className="font-display text-[22px] font-normal" style={{ color:"var(--t1)" }}>{totalScenarios}</div>
          <p className="font-mono text-[9px] mt-1 tracking-wide" style={{ color:"var(--t4)" }}>Reflections</p>
        </div>
        <div className="flex-1 rounded-lg p-4" style={{ background:"var(--bg2)", border:"0.5px solid var(--border)" }}>
          <div className="font-display text-[22px] font-normal" style={{ color:"var(--t1)" }}>{totalSage}</div>
          <p className="font-mono text-[9px] mt-1 tracking-wide" style={{ color:"var(--t4)" }}>Sage sessions</p>
        </div>
      </div>
    )}

    {/* Today's reflection — links to real scenario */}
    <div className="mt-6 fade-up-3">
      <p className="text-[11px] font-medium mb-2.5" style={{ color:"var(--t3)" }}>Today's reflection</p>
      <div className="rounded-lg p-6 cursor-pointer" style={{ background:"var(--bg2)", border:"0.5px solid var(--border)" }} onClick={() => router.push("/reflections")}>
        {scenario && !scenario.error ? (
          <>
            <p className="font-mono text-[9px] tracking-wide mb-2" style={{ color:"var(--ac)" }}>{scenario.decision_category?.toUpperCase()}</p>
            <p className="font-display text-[18px] font-normal leading-snug" style={{ color:"var(--t1)" }}>{scenario.situation?.slice(0, 120)}...</p>
            <p className="text-[11px] mt-2" style={{ color:"var(--t4)" }}>{scenario.guest} · Lenny's Podcast</p>
          </>
        ) : (
          <p className="font-display text-[18px] font-normal leading-snug" style={{ color:"var(--t1)" }}>A new reflection is waiting for you.</p>
        )}
        <p className="mt-4 text-xs font-medium" style={{ color:"var(--ac)" }}>Start reflecting →</p>
      </div>
    </div>

    {/* Daily wisdom */}
    <div className="mt-6 fade-up-4">
      <p className="text-[11px] font-medium mb-2.5" style={{ color:"var(--t3)" }}>Daily wisdom</p>
      <div className="rounded-lg p-5" style={{ background:"var(--bg2)", border:"0.5px solid var(--border)" }}>
        <p className="font-display text-[16px] font-normal italic leading-snug" style={{ color:"var(--t1)" }}>"{QTS[qi].t}"</p>
        <p className="text-[11px] mt-3" style={{ color:"var(--t4)" }}>— {QTS[qi].g} · Lenny's Podcast</p>
      </div>
    </div>
  </div></Shell>;
}
