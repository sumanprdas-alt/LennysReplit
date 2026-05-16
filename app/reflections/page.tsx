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
  const router = useRouter();

  useEffect(() => { fetch("/api/scenarios/today").then(r => r.json()).then(d => { setScenario(d); setLoading(false); }); }, []);

  const handleSubmit = async () => {
    if (!sel || !scenario) return; setSubmitting(true);
    const res = await fetch("/api/scenarios/respond", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario_id: scenario.id, chosen_option: sel, reasoning }) });
    const data = await res.json(); setReveal(data); setSubmitting(false);
  };

  const ICONS = ["💰", "✨", "🎯", "📊"];

  if (loading) return <Shell><div className="flex-1 flex items-center justify-center"><p style={{ color: "var(--t4)" }}>Loading...</p></div></Shell>;

  if (reveal) return <Shell><div className="flex-1 p-6 max-w-[640px]">
    <p className="font-mono text-[8px] tracking-[1px] fade-up" style={{ color: "var(--t5)" }}>REFLECTION RESULT</p>
    <h2 className="font-display text-[20px] font-normal mt-2 fade-up-1">You aligned with <span className="italic" style={{ color: "var(--ac)" }}>the builder.</span></h2>

    <div className="flex rounded-[8px] overflow-hidden mt-5 fade-up-2" style={{ border: "1px solid var(--border)" }}>
      <div className="w-[3px] flex-shrink-0" style={{ background: "var(--ac)" }} />
      <div className="flex-1 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-medium" style={{ background: "var(--bg3)", color: "var(--t4)" }}>{reveal.guest?.[0] || "G"}</div>
          <span className="text-[9px]" style={{ color: "var(--t4)" }}>{reveal.guest} · {reveal.episode_title}</span>
        </div>
        <p className="text-[12px] leading-relaxed">{reveal.what_happened}</p>
      </div>
    </div>

    {reveal.personal_insight && (
      <div className="rounded-[8px] p-3.5 mt-3 fade-up-3" style={{ background: "var(--ac-bg)", border: "1px solid var(--ac-border)" }}>
        <p className="font-mono text-[7px] tracking-[1px] mb-1.5" style={{ color: "var(--ac)" }}>A PATTERN WORTH NOTICING</p>
        <p className="font-display text-[11px] italic leading-relaxed" style={{ color: "var(--t2)" }}>{reveal.personal_insight}</p>
      </div>
    )}

    <button onClick={() => router.push("/dashboard")} className="mt-4 px-5 py-2 rounded-md text-[10px] font-medium cursor-pointer fade-up-4" style={{ color: "var(--t4)", border: "1px solid var(--border2)" }}>← Back to today</button>
  </div></Shell>;

  return <Shell><div className="flex-1 p-6 max-w-[640px]">
    <p className="font-mono text-[8px] tracking-[1px] fade-up" style={{ color: "var(--t5)" }}>REFLECTION · {scenario?.decision_category?.toUpperCase()}</p>
    <h2 className="font-display text-[20px] font-normal mt-2 leading-snug fade-up-1">A {scenario?.decision_category} decision <span className="italic" style={{ color: "var(--ac)" }}>worth examining.</span></h2>
    <p className="text-[12px] mt-4 leading-relaxed fade-up-2" style={{ color: "var(--t3)" }}>{scenario?.situation}</p>
    <p className="text-[9px] mt-1.5 fade-up-2" style={{ color: "var(--t5)" }}>{scenario?.guest} · Lenny's Podcast</p>

    <p className="font-mono text-[8px] tracking-[1px] mt-6 mb-3 fade-up-3" style={{ color: "var(--t5)" }}>WHAT WOULD YOU DO?</p>
    <div className="flex flex-col gap-2 fade-up-3">
      {scenario?.options?.map((opt: any, i: number) => (
        <button key={opt.label} onClick={() => setSel(opt.label)}
          className="flex items-center gap-3 px-4 py-3 rounded-[8px] text-left cursor-pointer transition-all"
          style={{ border: `1px solid ${sel === opt.label ? "var(--ac)" : "var(--border)"}`, background: sel === opt.label ? "var(--ac-bg)" : "var(--bg2)" }}>
          <span className="text-[15px]">{ICONS[i]}</span>
          <div className="flex-1"><p className="text-[12px] font-medium">{opt.text}</p></div>
          <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-mono transition-all" style={{ background: sel === opt.label ? "var(--ac)" : "var(--bg4)", color: sel === opt.label ? "var(--bg)" : "var(--t5)" }}>{opt.label}</div>
        </button>
      ))}
    </div>
    {sel && <div className="fade-up">
      <textarea value={reasoning} onChange={e => setReasoning(e.target.value)} placeholder="Your reasoning (optional)"
        className="w-full h-[50px] px-3.5 py-2.5 mt-3 rounded-[8px] text-[11px] outline-none resize-none leading-relaxed" style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--t1)" }} />
      <button onClick={handleSubmit} disabled={submitting} className="w-full py-3 mt-2 rounded-lg text-[13px] font-medium cursor-pointer disabled:opacity-50" style={{ background: "var(--ac)", color: "var(--bg)" }}>
        {submitting ? <span className="flex items-center justify-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-black/20 border-t-black animate-spin inline-block" />Reflecting...</span> : "Submit →"}
      </button>
    </div>}
  </div></Shell>;
}
