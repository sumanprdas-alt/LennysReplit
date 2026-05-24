"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  { q: "What stage are you at?", sage: "The Sage calibrates to your world.", opts: ["Pre-seed","Seed","Series A","Series B+","Growth"] },
  { q: "What are you building?", sage: "Different problems, different playbooks.", opts: ["B2B SaaS","Consumer","Dev Tools","Marketplace","AI / ML"] },
  { q: "How big is your team?", sage: "A solo founder and a 50-person team think differently.", opts: ["Solo","2–5","6–15","16–50","50+"] },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0); const [sel, setSel] = useState<Record<number,string>>({}); const [ch, setCh] = useState("");
  const [loading, setLoading] = useState(false); const router = useRouter();

  const handleFinish = async () => {
    setLoading(true);
    await fetch("/api/onboarding", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: sel[0]||"seed", business_model: sel[1]||"b2b-saas", domain: sel[1]||"b2b-saas", team_size: sel[2]||"2-5", current_challenge: ch }) });
    router.push("/dashboard");
  };

  const bar = <div className="flex gap-1 max-w-[240px]">{[...Array(STEPS.length+1)].map((_,i) => <div key={i} className="h-[3px] rounded-sm transition-all duration-500" style={{ flex: i<=step?4:1, background: i<=step?"var(--ac)":"var(--border)" }} />)}</div>;

  const wrap = (c: React.ReactNode) => <div className="min-h-screen flex items-center justify-center" style={{ background:"var(--bg)", color:"var(--t1)" }}><div className="max-w-[380px] w-full px-8">{c}</div></div>;

  if (step === STEPS.length) return wrap(<>
    <div className="fade-up">{bar}</div>
    <p className="text-[13px] mt-6 italic font-display fade-up-1" style={{ color:"var(--t3)" }}>One more thing.</p>
    <h2 className="font-display text-[28px] font-light mt-3.5 leading-tight fade-up-2" style={{ color:"var(--t1)" }}>What's the hardest decision you're<br/><span className="font-medium italic" style={{ color:"var(--ac)" }}>facing right now?</span></h2>
    <textarea value={ch} onChange={e=>setCh(e.target.value)} placeholder="e.g. We're growing but churn is eating our gains. Should we fix onboarding or double down on acquisition?"
      className="w-full h-[100px] px-3.5 py-3 mt-5 rounded-md text-[13px] outline-none resize-none leading-relaxed fade-up-3" style={{ background:"var(--bg2)", border:"0.5px solid var(--border)", color:"var(--t1)" }} />
    <button onClick={handleFinish} disabled={loading} className="w-full py-2.5 mt-2.5 rounded-md text-[13px] font-medium cursor-pointer disabled:opacity-50 fade-up-3" style={{ background:"var(--ac)", color:"var(--bg)" }}>{loading?"Preparing your space...":"Begin →"}</button>
  </>);

  const c = STEPS[step];
  return wrap(<>
    <div className="fade-up">{bar}</div>
    <p className="text-[13px] mt-6 italic font-display fade-up-1" style={{ color:"var(--t3)" }}>{c.sage}</p>
    <h2 className="font-display text-[28px] font-light mt-3.5 leading-tight fade-up-2" style={{ color:"var(--t1)" }}>{c.q}</h2>
    <div className="flex flex-wrap gap-[7px] mt-5 fade-up-3">
      {c.opts.map(o => <button key={o} onClick={() => { setSel({...sel,[step]:o}); setTimeout(()=>setStep(step+1),300); }}
        className="px-5 py-2.5 rounded-md text-[13px] font-medium cursor-pointer transition-all"
        style={{ border:`0.5px solid ${sel[step]===o?"var(--ac)":"var(--border)"}`, background:sel[step]===o?"var(--ac-bg)":"var(--bg2)", color:sel[step]===o?"var(--ac)":"var(--t2)" }}>{o}</button>)}
    </div>
    {step>0 && <button onClick={()=>setStep(step-1)} className="mt-[18px] text-[11px] cursor-pointer" style={{ background:"none", border:"none", color:"var(--t4)" }}>← Back</button>}
  </>);
}
