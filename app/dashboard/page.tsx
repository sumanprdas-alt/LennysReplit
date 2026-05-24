"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import Tour from "@/components/Tour";

const QTS = [
  { t: "Most teams confuse movement with progress.", g: "Brian Chesky" },
  { t: "The best focus isn't on building the right thing. It's on not building the wrong thing.", g: "Lenny Rachitsky" },
  { t: "Good strategy is a set of choices. Not a long list of hopes.", g: "Geoffrey Moore" },
  { t: "Your first 30 seconds is your entire product.", g: "Grant Lee" },
  { t: "Retention is the silent killer. By the time you see it, it's too late.", g: "Elena Verna" },
];

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [scenario, setScenario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qi, setQi] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const router = useRouter();

  useEffect(() => { const t = setInterval(() => setQi(p => (p+1)%QTS.length), 7000); return () => clearInterval(t); }, []);
  useEffect(() => {
    Promise.all([
      fetch("/api/scenarios/today").then(r => r.json()).catch(() => null),
      fetch("/api/profile").then(r => r.json()).catch(() => null)
    ]).then(([s, p]) => {
      if (p?.user && !p.user.stage && !p.user.business_model) { router.push("/onboarding"); return; }
      setScenario(s); setProfile(p); setLoading(false);
    }).catch(() => setLoading(false));
    // Show tour for first-time users
    if (typeof window !== "undefined" && !localStorage.getItem("sage_tour_done")) {
      setTimeout(() => setShowTour(true), 800);
    }
  }, [router]);

  if (loading) return <Shell><div className="flex-1 flex items-center justify-center"><p style={{color:"var(--t4)"}}>Loading...</p></div></Shell>;

  const userName = profile?.user?.name || "there";
  const cal = Math.round(profile?.profile?.calibration_score || 0);
  const totalSc = profile?.profile?.total_scenarios || 0;
  const totalSg = profile?.profile?.total_sage_sessions || 0;
  const isNew = totalSc === 0 && totalSg === 0;
  const greeting = (() => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; })();

  return <Shell><div className="flex-1 p-6 max-w-[640px]">
    {showTour && <Tour onComplete={() => { setShowTour(false); localStorage.setItem("sage_tour_done", "1"); }} />}
    <div className="fade-up">
      <p className="text-[11px]" style={{color:"var(--t4)"}}>{greeting}, {userName}.</p>
      <h1 className="font-display text-[22px] font-normal mt-1">What's the decision?</h1>
    </div>

    {/* Search */}
    <div className="mt-4 fade-up-1">
      <div id="search-bar" className="flex items-center rounded-xl px-5 py-3 cursor-pointer transition-all hover:border-[var(--border2)]" onClick={() => router.push("/sage")} style={{background:"var(--bg2)", border:"1px solid var(--border)"}}>
        <span className="flex-1 text-[13px]" style={{color:"var(--t4)"}}>Ask Sage anything about strategy, product, or execution...</span>
        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px]" style={{background:"var(--ac)", color:"var(--bg)"}}>↑</span>
      </div>
    </div>

    {/* NEW USER: Welcome state */}
    {isNew ? (
      <div className="mt-6 fade-up-2">
        <div className="rounded-xl p-6 text-center" style={{background:"linear-gradient(135deg, rgba(184,212,90,.06), rgba(196,165,106,.04))", border:"1px solid var(--border)"}}>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{background:"var(--ac-bg)", border:"1px solid var(--ac-border)"}}>
            <span className="text-2xl">🧭</span>
          </div>
          <h2 className="font-display text-[18px] font-normal mb-2">Your strategic advisor is ready.</h2>
          <p className="text-[12px] leading-relaxed max-w-[360px] mx-auto mb-5" style={{color:"var(--t3)"}}>Start with a daily reflection to sharpen your judgment, or bring a real challenge to the Sage.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push("/reflections")} className="px-5 py-2.5 rounded-lg text-[12px] font-medium cursor-pointer" style={{background:"var(--ac)", color:"var(--bg)"}}>Try a reflection →</button>
            <button onClick={() => router.push("/sage")} className="px-5 py-2.5 rounded-lg text-[12px] font-medium cursor-pointer" style={{border:"1px solid var(--border2)", color:"var(--t3)"}}>Ask the Sage</button>
          </div>
        </div>
      </div>
    ) : (
      <>
        {/* RETURNING USER: Action cards */}
        <div className="flex gap-3 mt-5 fade-up-2">
          <div onClick={() => router.push("/reflections")} id="reflect-card" className="flex-1 rounded-xl p-4 cursor-pointer relative overflow-hidden transition-all hover:border-[var(--border2)]" style={{background:"var(--bg2)", border:"1px solid var(--border)", borderLeft:"3px solid var(--ac)"}}>
            <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none" style={{background:"radial-gradient(circle at 100% 0%, rgba(184,212,90,.1), transparent 70%)"}} />
            <p className="font-mono text-[11px] tracking-[1.2px] mb-2" style={{color:"var(--ac)"}}>REFLECT</p>
            <p className="text-[13px] font-medium leading-snug mb-1">{scenario && !scenario.error ? scenario.situation?.slice(0, 80) + "..." : "A new reflection awaits."}</p>
            <p className="text-[12px] mb-3" style={{color:"var(--t4)"}}>{scenario?.guest || "Lenny's Podcast"} · {scenario?.decision_category || "Strategy"}</p>
            <div className="h-[3px] rounded-full mb-2" style={{background:"var(--border)"}}>
              <div className="h-full rounded-full transition-all duration-1000" style={{width:`${Math.max(5,(totalSc/18)*100)}%`, background:"var(--ac)"}} />
            </div>
            <p className="text-[12px]" style={{color:"var(--t4)"}}>{totalSc} of 18 completed</p>
          </div>
          <div onClick={() => router.push("/sage")} id="consult-card" className="flex-1 rounded-xl p-4 cursor-pointer relative overflow-hidden transition-all hover:border-[var(--border2)]" style={{background:"var(--bg2)", border:"1px solid var(--border)", borderLeft:"3px solid var(--gold)"}}>
            <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none" style={{background:"radial-gradient(circle at 100% 0%, rgba(196,165,106,.1), transparent 70%)"}} />
            <p className="font-mono text-[11px] tracking-[1.2px] mb-2" style={{color:"var(--gold)"}}>CONSULT</p>
            <p className="text-[13px] font-medium leading-snug mb-1">Bring a real decision. Get patterns you're missing.</p>
            <p className="text-[12px] mb-3" style={{color:"var(--t4)"}}>Drawing from 3,839 conversations</p>
            <div className="flex gap-1 mb-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{background:"var(--ac)"}} /><span className="w-1.5 h-1.5 rounded-full" style={{background:"var(--gold)"}} /><span className="w-1.5 h-1.5 rounded-full" style={{background:"var(--red)"}} />
            </div>
            <p className="text-[12px]" style={{color:"var(--t4)"}}>{totalSg} session{totalSg !== 1 ? "s" : ""} completed</p>
          </div>
        </div>

        {/* Recent activity */}
        {(profile?.recent_scenarios?.length > 0 || profile?.recent_sage_sessions?.length > 0) && (
          <div className="mt-4 fade-up-3">
            <p className="font-mono text-[11px] tracking-[1.2px] mb-2" style={{color:"var(--t5)"}}>RECENT ACTIVITY</p>
            {profile?.recent_sage_sessions?.slice(0, 2).map((s: any, i: number) => (
              <div key={`sg-${i}`} className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1.5 cursor-pointer transition-all hover:border-[var(--border2)]" onClick={() => router.push("/sage")} style={{background:"var(--bg2)", border:"1px solid var(--border)"}}>
                <span className="w-5 h-5 rounded flex items-center justify-center text-[9px]" style={{background:"var(--ac-bg)", color:"var(--ac)"}}>🧭</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium truncate">Sage: {s.decision_category || "Strategy"}</p>
                  <p className="text-[12px] truncate" style={{color:"var(--t5)"}}>{(() => { try { const a = typeof s.sage_analysis === "string" ? JSON.parse(s.sage_analysis) : s.sage_analysis; return `${a.blind_spots?.length || 0} patterns found`; } catch { return "Completed"; } })()}</p>
                </div>
                <span className="text-[12px] flex-shrink-0" style={{color:"var(--t5)"}}>{new Date(s.created_at).toLocaleDateString()}</span>
              </div>
            ))}
            {profile?.recent_scenarios?.slice(0, 2).map((s: any, i: number) => (
              <div key={`sc-${i}`} className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1.5 cursor-pointer" onClick={() => router.push("/reflections")} style={{background:"var(--bg2)", border:"1px solid var(--border)"}}>
                <span className="w-5 h-5 rounded flex items-center justify-center text-[9px]" style={{background: s.calibration_correct ? "rgba(90,122,58,.15)" : "rgba(226,75,74,.1)", color: s.calibration_correct ? "var(--green)" : "var(--red)"}}>{s.calibration_correct ? "✓" : "✗"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium truncate">{s.guest}: {s.decision_category}</p>
                  <p className="text-[12px]" style={{color:"var(--t5)"}}>{s.calibration_correct ? "Aligned with the builder" : "Different perspective"}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Calibration bar */}
        <div className="flex items-center gap-4 mt-4 px-4 py-3 rounded-xl fade-up-3" style={{background:"var(--bg3)", border:"1px solid var(--border)"}}>
          <div className="flex items-center gap-2">
        <span className="font-display text-[24px] font-medium" style={{color:"var(--ac)"}}>{cal}</span><span className="text-[11px]" style={{color:"var(--t4)"}}>%</span>
        <span title="Calibration measures how often your instinct matches what the builder actually did. Higher = sharper product judgment." className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] cursor-help" style={{background:"var(--bg4)", color:"var(--t4)", border:"1px solid var(--border)"}}>i</span>
      </div>
          <div className="flex-1 h-1 rounded-full" style={{background:"var(--border)"}}><div className="h-full rounded-full transition-all duration-1000" style={{width:`${Math.max(3, cal)}%`, background:"linear-gradient(90deg, var(--ac), var(--ac-dark))"}} /></div>
          <p className="text-[12px]" style={{color:"var(--t4)"}}>{totalSc + totalSg} sessions</p>
        </div>
      </>
    )}

    {/* Daily wisdom */}
    <div className="mt-4 rounded-xl p-4 fade-up-4" style={{background:"var(--bg2)", border:"1px solid var(--border)"}}>
      <p className="font-display text-[14px] italic leading-snug" style={{color:"var(--t2)"}}>"{QTS[qi].t}"</p>
      <p className="text-[12px] mt-2" style={{color:"var(--t4)"}}>— {QTS[qi].g} · Lenny's Podcast</p>
    </div>
  </div></Shell>;
}
