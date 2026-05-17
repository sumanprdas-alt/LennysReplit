"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [scenario, setScenario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [qi, setQi] = useState(0);
  const QTS = [
    { t: "Most teams confuse movement with progress.", g: "Brian Chesky" },
    { t: "The best focus isn't on building the right thing. It's on not building the wrong thing.", g: "Lenny Rachitsky" },
    { t: "Good strategy is a set of choices. Not a long list of hopes.", g: "Geoffrey Moore" },
    { t: "Your first 30 seconds is your entire product.", g: "Grant Lee" },
    { t: "Retention is the silent killer. By the time you see it, it's too late.", g: "Elena Verna" },
  ];

  useEffect(() => { const qt = setInterval(() => setQi(p => (p+1)%5), 7000); return () => clearInterval(qt); }, []);
  useEffect(() => {
    Promise.all([
      fetch("/api/scenarios/today").then(r => r.json()).catch(() => null),
      fetch("/api/profile").then(r => r.json()).catch(() => null)
    ]).then(([s, p]) => {
      if (p?.user && !p.user.stage && !p.user.business_model) { router.push("/onboarding"); return; }
      setScenario(s); setProfile(p); setLoading(false);
    }).catch(() => setLoading(false));
  }, [router]);

  if (loading) return <Shell><div className="flex-1 flex items-center justify-center"><p style={{ color: "var(--t4)" }}>Loading...</p></div></Shell>;

  const userName = profile?.user?.name || "there";
  const cal = Math.round(profile?.profile?.calibration_score || 0);
  const totalSc = profile?.profile?.total_scenarios || 0;
  const totalSg = profile?.profile?.total_sage_sessions || 0;

  return <Shell><div className="flex-1 p-6 max-w-[640px]">
    {/* Greeting */}
    <div className="fade-up">
      <p className="text-[11px]" style={{ color: "var(--t4)" }}>{(() => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; })()}, {userName}.</p>
      <h1 className="font-display text-[20px] font-normal mt-1">What shall we think through today?</h1>
    </div>

    {/* Search */}
    <div className="mt-3 fade-up-1">
      <div className="flex items-center rounded-[10px] px-4 py-[10px] cursor-pointer" onClick={() => router.push("/sage")} style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}>
        <span className="flex-1 text-[12px]" style={{ color: "var(--t4)" }}>Ask Sage anything about strategy, product, or execution...</span>
        <span className="w-6 h-6 rounded-md flex items-center justify-center text-[11px]" style={{ background: "var(--ac)", color: "var(--bg)" }}>↑</span>
      </div>
    </div>

    {/* Two action cards */}
    <div className="flex gap-3 mt-5 fade-up-2">
      {/* Reflect */}
      <div onClick={() => router.push("/reflections")} className="flex-1 rounded-[10px] p-4 cursor-pointer relative overflow-hidden" style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderLeft: "3px solid var(--ac)" }}>
        <div className="absolute top-0 right-0 w-[60px] h-[60px] pointer-events-none" style={{ background: "radial-gradient(circle at 100% 0%, rgba(184,212,90,.08), transparent 70%)" }} />
        <p className="font-mono text-[8px] tracking-[1.2px] mb-2" style={{ color: "var(--ac)" }}>REFLECT</p>
        <p className="text-[13px] font-medium leading-snug mb-1" style={{ color: "var(--t1)" }}>
          {scenario && !scenario.error ? scenario.situation?.slice(0, 80) + "..." : "A new reflection is waiting for you."}
        </p>
        <p className="text-[9px] mb-3" style={{ color: "var(--t4)" }}>
          {scenario?.guest || "Lenny's Podcast"} · {scenario?.decision_category || "Strategy"}
        </p>
        <div className="h-[2px] rounded-full mb-2" style={{ background: "var(--border)" }}>
          <div className="h-full rounded-full" style={{ width: `${Math.max(5, (totalSc / 18) * 100)}%`, background: "var(--ac)" }} />
        </div>
        <p className="text-[8px]" style={{ color: "var(--t5)" }}>{totalSc} of 18 reflections</p>
      </div>
      {/* Consult */}
      <div onClick={() => router.push("/sage")} className="flex-1 rounded-[10px] p-4 cursor-pointer relative overflow-hidden" style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderLeft: "3px solid var(--gold)" }}>
        <div className="absolute top-0 right-0 w-[60px] h-[60px] pointer-events-none" style={{ background: "radial-gradient(circle at 100% 0%, rgba(196,165,106,.08), transparent 70%)" }} />
        <p className="font-mono text-[8px] tracking-[1.2px] mb-2" style={{ color: "var(--gold)" }}>CONSULT</p>
        <p className="text-[13px] font-medium leading-snug mb-1" style={{ color: "var(--t1)" }}>Paste a challenge, get clarity from 300+ builders.</p>
        <p className="text-[9px] mb-3" style={{ color: "var(--t4)" }}>3,839 conversations indexed</p>
        <div className="flex gap-[3px] mb-1">
          <span className="w-[6px] h-[6px] rounded-full" style={{ background: "var(--ac)" }} />
          <span className="w-[6px] h-[6px] rounded-full" style={{ background: "var(--gold)" }} />
          <span className="w-[6px] h-[6px] rounded-full" style={{ background: "var(--red)" }} />
        </div>
        <p className="text-[8px]" style={{ color: "var(--t5)" }}>{totalSg} session{totalSg !== 1 ? "s" : ""} completed</p>
      </div>
    </div>

    {/* Recent activity */}
    {(profile?.recent_scenarios?.length > 0 || profile?.recent_sage_sessions?.length > 0) && (
      <div className="mt-4 fade-up-3">
        <p className="font-mono text-[7px] tracking-[1.2px] mb-2" style={{ color: "var(--t5)" }}>RECENT ACTIVITY</p>
        {profile?.recent_sage_sessions?.slice(0, 2).map((s: any, i: number) => (
          <div key={`sg-${i}`} className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] mb-1.5 cursor-pointer" onClick={() => router.push("/sage")} style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}>
            <span className="w-5 h-5 rounded flex items-center justify-center text-[9px]" style={{ background: "var(--ac-bg)", color: "var(--ac)" }}>🧭</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium truncate">Sage: {s.decision_category || "Strategy"}</p>
              <p className="text-[8px] truncate" style={{ color: "var(--t5)" }}>
                {(() => { try { const a = typeof s.sage_analysis === "string" ? JSON.parse(s.sage_analysis) : s.sage_analysis; return `${a.blind_spots?.length || 0} patterns found`; } catch { return "Analysis completed"; } })()}
              </p>
            </div>
            <span className="text-[8px] flex-shrink-0" style={{ color: "var(--t5)" }}>{new Date(s.created_at).toLocaleDateString()}</span>
          </div>
        ))}
        {profile?.recent_scenarios?.slice(0, 2).map((s: any, i: number) => (
          <div key={`sc-${i}`} className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] mb-1.5 cursor-pointer" onClick={() => router.push("/reflections")} style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}>
            <span className="w-5 h-5 rounded flex items-center justify-center text-[9px]" style={{ background: s.calibration_correct ? "rgba(90,122,58,.1)" : "rgba(226,75,74,.1)", color: s.calibration_correct ? "var(--green)" : "var(--red)" }}>{s.calibration_correct ? "✓" : "✗"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium truncate">{s.guest || "Reflection"}: {s.decision_category || "Strategy"}</p>
              <p className="text-[8px]" style={{ color: "var(--t5)" }}>{s.calibration_correct ? "Aligned with the builder" : "Different perspective"}</p>
            </div>
            <span className="text-[8px] flex-shrink-0" style={{ color: "var(--t5)" }}>{new Date(s.created_at).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    )}

    {/* Calibration bar */}
    <div className="flex items-center gap-4 mt-4 px-4 py-3 rounded-[10px] fade-up-3" style={{ background: "var(--bg3)", border: "1px solid var(--border)" }}>
      <div>
        <span className="font-display text-[22px] font-medium" style={{ color: "var(--ac)" }}>{cal}</span>
        <span className="text-[10px] ml-0.5" style={{ color: "var(--t4)" }}>%</span>
      </div>
      <div className="flex-1 h-[3px] rounded-full" style={{ background: "var(--border)" }}>
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${cal}%`, background: "linear-gradient(90deg, var(--ac), var(--ac-dark))" }} />
      </div>
      <p className="text-[8px]" style={{ color: "var(--t4)" }}>{totalSc + totalSg} sessions · {Math.min(totalSc + totalSg, 8)} categories explored</p>
    </div>

    {/* Daily wisdom */}
    <div className="mt-4 rounded-[10px] p-4 fade-up-4" style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}>
      <p className="font-display text-[13px] italic leading-snug" style={{ color: "var(--t2)" }}>"{QTS[qi].t}"</p>
      <p className="text-[9px] mt-2" style={{ color: "var(--t5)" }}>— {QTS[qi].g} · Lenny's Podcast</p>
    </div>
  </div></Shell>;
}
