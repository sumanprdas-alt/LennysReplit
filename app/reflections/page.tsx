"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";

export default function ReflectionsPage() {
  const [scenario, setScenario] = useState<any>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState("");
  const [reveal, setReveal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [totalSc, setTotalSc] = useState(0);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const router = useRouter();
  const ICONS = ["💰", "✨", "🎯", "📊"];

  useEffect(() => {
    Promise.all([
      fetch("/api/scenarios/today").then(r => r.json()).catch(() => null),
      fetch("/api/profile").then(r => r.json()).catch(() => null)
    ]).then(([s, p]) => {
      setScenario(s);
      setTotalSc(p?.profile?.total_scenarios || 0);
      // Check if this scenario was already completed
      if (s && p?.recent_scenarios?.some((rs: any) => rs.scenario_id === s.id)) {
        setAlreadyCompleted(true);
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async () => {
    if (!sel || !scenario) return; setSubmitting(true);
    const res = await fetch("/api/scenarios/respond", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario_id: scenario.id, chosen_option: sel, reasoning }) });
    const data = await res.json(); setReveal(data); setSubmitting(false);
  };

  if (loading) return <Shell><div className="flex-1 flex items-center justify-center"><p style={{color:"var(--t4)"}}>Loading...</p></div></Shell>;

  // Reveal state
  if (reveal) return <Shell><div className="flex-1 p-6 max-w-[820px] mobile-full">
    <div className="text-center mb-6 fade-up">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3" style={{background: reveal.calibration_correct ? "rgba(184,212,90,.1)" : "rgba(196,165,106,.1)", border: `1px solid ${reveal.calibration_correct ? "var(--ac-border)" : "rgba(196,165,106,.2)"}`}}>
        <span className="text-2xl">{reveal.calibration_correct ? "🎯" : "🔄"}</span>
      </div>
      <p className="font-mono text-[12px] tracking-[1px]" style={{color:"var(--t5)"}}>REFLECTION RESULT · {totalSc + 1} OF 18</p>
      <h2 className="font-display text-[22px] font-normal mt-1">{reveal.calibration_correct ? <>Same instinct as <span className="italic" style={{color:"var(--ac)"}}>the builder.</span></> : <>You saw it <span className="italic" style={{color:"var(--gold)"}}>differently.</span></>}</h2>
    </div>

    <div className="flex rounded-xl overflow-hidden fade-up-1" style={{border:"1px solid var(--border)"}}>
      <div className="w-[3px] flex-shrink-0" style={{background: reveal.calibration_correct ? "var(--ac)" : "var(--gold)"}} />
      <div className="flex-1 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-medium" style={{background:"var(--bg3)", color:"var(--t4)"}}>{reveal.guest?.[0] || "G"}</div>
          <span className="text-[12px]" style={{color:"var(--t4)"}}>{reveal.guest} · {reveal.episode_title}</span>
        </div>
        <p className="text-[13px] leading-relaxed">{reveal.what_happened}</p>
      </div>
    </div>

    {reveal.personal_insight && (
      <div className="rounded-xl p-4 mt-3 fade-up-2" style={{background:"var(--ac-bg)", border:"1px solid var(--ac-border)"}}>
        <p className="font-mono text-[12px] tracking-[1px] mb-1.5" style={{color:"var(--ac)"}}>THE SAGE OBSERVES</p>
        <p className="font-display text-[12px] italic leading-relaxed" style={{color:"var(--t2)"}}>{reveal.personal_insight}</p>
      </div>
    )}

    {/* Progress bar */}
    <div className="flex items-center gap-3 mt-4 px-4 py-3 rounded-xl fade-up-3" style={{background:"var(--bg3)", border:"1px solid var(--border)"}}>
      <div className="flex-1 h-1 rounded-full" style={{background:"var(--border)"}}>
        <div className="h-full rounded-full transition-all" style={{width:`${((totalSc+1)/18)*100}%`, background:"var(--ac)"}} />
      </div>
      <p className="text-[13px]" style={{color:"var(--t4)"}}>{totalSc + 1}/18 reflections</p>
    </div>

    <div className="flex gap-2 mt-4 fade-up-4">
      <button onClick={() => router.push("/dashboard")} className="px-5 py-2.5 rounded-lg text-[11px] font-medium cursor-pointer" style={{border:"1px solid var(--border2)", color:"var(--t4)"}}>← Dashboard</button>
      <button onClick={() => { setReveal(null); setSel(null); setReasoning(""); setAlreadyCompleted(false); }} className="px-5 py-2.5 rounded-lg text-[11px] font-medium cursor-pointer" style={{background:"var(--ac)", color:"var(--bg)"}}>Next →</button>
    </div>
  </div></Shell>;

  // Already completed state
  if (alreadyCompleted) return <Shell><div className="flex-1 p-6 max-w-[820px] mobile-full">
    <div className="text-center py-8 fade-up">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{background:"rgba(184,212,90,.1)", border:"1px solid var(--ac-border)"}}>
        <span className="text-2xl">✅</span>
      </div>
      <h2 className="font-display text-[22px] font-normal mb-2">Reflection <span className="italic" style={{color:"var(--ac)"}}>locked in.</span></h2>
      <p className="text-[13px] leading-relaxed max-w-[360px] mx-auto mb-2" style={{color:"var(--t3)"}}>You've completed {totalSc} of 18. New reflections drop daily — or bring a live challenge to the Sage.</p>
      <div className="flex items-center gap-3 justify-center mt-2 mb-6 px-4 py-2 rounded-full inline-flex" style={{background:"var(--bg3)"}}>
        <div className="flex-1 h-1 rounded-full w-32" style={{background:"var(--border)"}}>
          <div className="h-full rounded-full" style={{width:`${(totalSc/18)*100}%`, background:"var(--ac)"}} />
        </div>
        <p className="text-[13px]" style={{color:"var(--t4)"}}>{totalSc}/18</p>
      </div>
      <div className="flex gap-3 justify-center">
        <button onClick={() => router.push("/sage")} className="px-5 py-2.5 rounded-lg text-[12px] font-medium cursor-pointer" style={{background:"var(--ac)", color:"var(--bg)"}}>Consult the Sage →</button>
        <button onClick={() => router.push("/dashboard")} className="px-5 py-2.5 rounded-lg text-[12px] font-medium cursor-pointer" style={{border:"1px solid var(--border2)", color:"var(--t4)"}}>Back to today</button>
      </div>
    </div>
  </div></Shell>;

  // Scenario view
  return <Shell><div className="flex-1 p-6 max-w-[820px] mobile-full">
    <p className="font-mono text-[12px] tracking-[1px] fade-up" style={{color:"var(--t5)"}}>REFLECTION · {scenario?.decision_category?.toUpperCase()} · {totalSc + 1} OF 18</p>
    <h2 className="font-display text-[22px] font-normal mt-2 leading-snug fade-up-1">A real <span className="italic" style={{color:"var(--ac)"}}>{scenario?.decision_category}</span> decision.</h2>
    <p className="text-[13px] mt-4 leading-relaxed fade-up-2" style={{color:"var(--t3)"}}>{scenario?.situation}</p>
    <p className="text-[12px] mt-2 fade-up-2" style={{color:"var(--t5)"}}>{scenario?.guest} · Lenny's Podcast</p>

    <p className="font-mono text-[12px] tracking-[1px] mt-6 mb-3 fade-up-3" style={{color:"var(--t5)"}}>YOUR CALL</p>
    <div className="flex flex-col gap-2 fade-up-3">
      {scenario?.options?.map((opt: any, i: number) => (
        <button key={opt.label} onClick={() => setSel(opt.label)}
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-left cursor-pointer transition-all"
          style={{border:`1px solid ${sel === opt.label ? "var(--ac)" : "var(--border)"}`, background: sel === opt.label ? "var(--ac-bg)" : "var(--bg2)"}}>
          <span className="text-[16px]">{ICONS[i]}</span>
          <div className="flex-1"><p className="text-[13px] font-medium leading-snug">{opt.text}</p></div>
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-mono transition-all" style={{background: sel === opt.label ? "var(--ac)" : "var(--bg4)", color: sel === opt.label ? "var(--bg)" : "var(--t5)"}}>{opt.label}</div>
        </button>
      ))}
    </div>
    {sel && <div className="fade-up">
      <textarea value={reasoning} onChange={e => setReasoning(e.target.value)} placeholder="Why this choice? (optional — sharpens your profile)"
        className="w-full h-[55px] px-4 py-3 mt-3 rounded-xl text-[12px] outline-none resize-none leading-relaxed" style={{background:"var(--bg2)", border:"1px solid var(--border)", color:"var(--t1)"}} />
      <button onClick={handleSubmit} disabled={submitting} className="w-full py-3 mt-2.5 rounded-xl text-[13px] font-medium cursor-pointer disabled:opacity-50" style={{background:"var(--ac)", color:"var(--bg)"}}>
        {submitting ? <span className="flex items-center justify-center gap-2"><span className="w-3 h-3 rounded-full border-2 animate-spin" style={{borderColor:"rgba(0,0,0,.2)", borderTopColor:"var(--bg)"}} />Reflecting...</span> : "Lock it in →"}
      </button>
    </div>}
  </div></Shell>;
}
