"use client";
import { useState } from "react";
import Shell from "@/components/Shell";

const MSGS = ["Reflecting on 300 conversations...","Noticing patterns...","Perspectives forming..."];

export default function SagePage() {
  const [inp, setInp] = useState(""); const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null); const [error, setError] = useState("");
  const [lm, setLm] = useState(0);

  const run = async () => {
    if (inp.trim().length < 20) { setError("Please provide more detail."); return; }
    setError(""); setLoading(true); setLm(0);
    const t1 = setTimeout(() => setLm(1), 1500); const t2 = setTimeout(() => setLm(2), 3000);
    try {
      const res = await fetch("/api/sage/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input_text: inp, input_type: "paste" }) });
      if (!res.ok) throw new Error((await res.json()).error || "Analysis failed");
      setResults(await res.json());
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); clearTimeout(t1); clearTimeout(t2); }
  };

  return <Shell><div className="flex-1 p-7 max-w-[640px]">
    <p className="font-mono text-[10px] tracking-wide fade-up" style={{ color:"var(--t4)" }}>THE SAGE</p>
    <h2 className="font-display text-[22px] font-normal mt-2 leading-snug fade-up-1">What's on <span className="italic" style={{ color:"var(--ac)" }}>your mind?</span></h2>

    {!results ? <div className="mt-5">
      {loading ? <div className="text-center py-9 fade-up">
        <svg width={28} height={28} viewBox="0 0 24 24" fill="none"><path d="M12 3L4 9v6l8 6 8-6V9l-8-6z" stroke="var(--ac)" strokeWidth="1.2" fill="var(--ac-bg)"/><circle cx="12" cy="12" r="2" fill="var(--ac)" opacity=".6"/></svg>
        <p className="font-display italic mt-3.5 text-[14px]" style={{ color:"var(--ac)", animation:"pulse 2.5s ease-in-out infinite" }}>{MSGS[lm]}</p>
      </div> : <div className="fade-up-2">
        <textarea value={inp} onChange={e => setInp(e.target.value)} placeholder="Paste meeting notes, describe a decision, share what's weighing on you..."
          className="w-full h-[140px] px-4 py-3.5 rounded-lg text-[13px] outline-none resize-none leading-relaxed" style={{ background:"var(--bg2)", border:"0.5px solid var(--border)", color:"var(--t1)" }} />
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        <button onClick={run} disabled={inp.length<20} className="w-full py-2.5 mt-2 rounded-md text-[13px] font-medium cursor-pointer transition-all"
          style={{ background:inp.length<20?"var(--bg3)":"var(--ac)", color:inp.length<20?"var(--t4)":"var(--bg)" }}>Reflect →</button>
      </div>}
    </div> : <div className="mt-5">
      <p className="font-mono text-[10px] tracking-wide mb-3.5 fade-up" style={{ color:"var(--t4)" }}>{results.blind_spots?.length||0} PATTERNS THE SAGE NOTICED</p>
      {results.blind_spots?.map((bs: any, i: number) => (
        <div key={i} className="rounded-lg p-[18px] mb-2" style={{ background:"var(--bg2)", border:"0.5px solid var(--border)", animation:`flipIn .5s cubic-bezier(.22,1,.36,1) ${.06+i*.1}s both` }}>
          <h3 className="font-display font-medium text-[15px] mb-1 leading-snug" style={{ color:"var(--t1)" }}>{bs.title}</h3>
          <p className="text-xs leading-relaxed mb-2.5" style={{ color:"var(--t2)" }}>{bs.explanation}</p>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-[7px]" style={{ background:"var(--bg4)", color:"var(--t3)" }}>{bs.guest?.[0]}</div>
            <span className="text-[10px]" style={{ color:"var(--t3)" }}>{bs.guest} · Lenny's Podcast</span>
          </div>
        </div>
      ))}
      {results.tendency_detected && <div className="rounded-lg p-[18px] mt-1.5" style={{ background:"var(--ac-bg)", border:"0.5px solid var(--ac-border)" }}>
        <p className="font-mono text-[9px] tracking-wide mb-1" style={{ color:"var(--ac)" }}>A PATTERN WORTH NOTICING</p>
        <p className="font-display text-[14px] italic leading-relaxed" style={{ color:"var(--t1)" }}>{results.tendency_detected}</p>
      </div>}
      <button onClick={() => { setResults(null); setInp(""); }} className="mt-3 px-5 py-2 rounded-md text-xs font-medium cursor-pointer" style={{ color:"var(--t2)", background:"none", border:"0.5px solid var(--border)" }}>Reflect again</button>
    </div>}
  </div></Shell>;
}
