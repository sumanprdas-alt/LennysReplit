"use client";
import { useState } from "react";
import Shell from "@/components/Shell";
import VoiceRecorder from "@/components/VoiceRecorder";

const MSGS = ["Reflecting on 300 conversations...", "Noticing patterns...", "Perspectives forming..."];
const SEV_COLORS = [
  { border: "var(--red)", label: "CRITICAL", labelColor: "var(--red)", bg: "rgba(226,75,74,.06)" },
  { border: "var(--gold)", label: "WORTH EXAMINING", labelColor: "var(--gold)", bg: "rgba(196,165,106,.06)" },
  { border: "var(--green)", label: "INVESTIGATE", labelColor: "var(--green)", bg: "rgba(90,122,58,.06)" },
];

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

  return <Shell><div className="flex-1 p-6 max-w-[640px]">
    {!results ? (
      <div>
        <p className="font-mono text-[8px] tracking-[1px] fade-up" style={{ color: "var(--t5)" }}>THE SAGE</p>
        <h2 className="font-display text-[20px] font-normal mt-2 fade-up-1">What's on <span className="italic" style={{ color: "var(--ac)" }}>your mind?</span></h2>
        <div className="mt-5">
          {loading ? (
            <div className="text-center py-12 fade-up">
              <div className="relative inline-flex items-center justify-center">
                <svg width="64" height="64" viewBox="0 0 64 64" className="animate-spin" style={{ animationDuration: "8s" }}>
                  <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border)" strokeWidth="1" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="var(--ac)" strokeWidth="1.5" strokeDasharray="40 136" strokeLinecap="round" />
                </svg>
                <span className="absolute w-8 h-8 rounded-full border flex items-center justify-center text-[12px] font-medium" style={{ borderColor: "var(--ac)", color: "var(--ac)" }}>S</span>
              </div>
              <p className="font-display italic mt-5 text-[14px]" style={{ color: "var(--ac)", animation: "pulse 2.5s ease-in-out infinite" }}>{MSGS[lm]}</p>
              <p className="text-[9px] mt-2" style={{ color: "var(--t5)" }}>Searching 3,839 conversations...</p>
            </div>
          ) : (
            <div className="fade-up-2">
              <div className="relative">
                <textarea value={inp} onChange={e => setInp(e.target.value)} placeholder="Paste meeting notes, describe a decision, share what's weighing on you..."
                  className="w-full h-[140px] px-4 py-3.5 rounded-[10px] text-[13px] outline-none resize-none leading-relaxed pr-12" style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--t1)" }} />
                <div className="absolute top-3 right-3"><VoiceRecorder onTranscript={t => setInp(prev => prev + t)} /></div>
              </div>
              {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
              <button onClick={run} disabled={inp.length < 20} className="w-full py-3 mt-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all"
                style={{ background: inp.length < 20 ? "var(--bg3)" : "var(--ac)", color: inp.length < 20 ? "var(--t5)" : "var(--bg)" }}>Reflect →</button>
            </div>
          )}
        </div>
      </div>
    ) : (
      <div>
        {/* Diagnostic header */}
        <div className="flex items-center gap-3 mb-4 fade-up">
          <svg width="44" height="44" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="19" fill="none" stroke="var(--border2)" strokeWidth="2.5" />
            <circle cx="22" cy="22" r="19" fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeDasharray="80 40" strokeLinecap="round" transform="rotate(-90 22 22)" />
            <text x="22" y="20" textAnchor="middle" fill="var(--gold)" fontSize="12" fontWeight="500">{results.blind_spots?.length || 0}</text>
            <text x="22" y="28" textAnchor="middle" fill="var(--t5)" fontSize="5">found</text>
          </svg>
          <div>
            <p className="font-mono text-[7px] tracking-[1px]" style={{ color: "var(--t5)" }}>DIAGNOSTIC REPORT</p>
            <p className="font-display text-[16px] font-medium mt-0.5">{results.blind_spots?.length || 0} patterns <span className="italic" style={{ color: "var(--ac)" }}>the Sage noticed.</span></p>
            <p className="text-[8px] mt-0.5" style={{ color: "var(--t5)" }}>12 segments matched · {new Set(results.blind_spots?.map((b: any) => b.guest)).size || 0} guests cited</p>
          </div>
        </div>

        {/* Severity bar */}
        <div className="flex h-[3px] rounded-full overflow-hidden mb-1 fade-up-1">
          {results.blind_spots?.map((_: any, i: number) => <div key={i} style={{ flex: 1, background: SEV_COLORS[i % 3].border }} />)}
          <div style={{ flex: Math.max(0, 3 - (results.blind_spots?.length || 0)), background: "var(--border)" }} />
        </div>
        <div className="flex mb-4 fade-up-1">
          {results.blind_spots?.map((_: any, i: number) => <div key={i} style={{ flex: 1, fontSize: 7, color: SEV_COLORS[i % 3].labelColor }}>{SEV_COLORS[i % 3].label.toLowerCase()}</div>)}
        </div>

        {/* Findings */}
        {results.blind_spots?.map((bs: any, i: number) => {
          const sev = SEV_COLORS[i % 3];
          return (
            <div key={i} className="flex rounded-[8px] overflow-hidden mb-2" style={{ border: "1px solid var(--border)", animation: `flipIn .5s cubic-bezier(.22,1,.36,1) ${.06 + i * .1}s both` }}>
              <div className="w-[3px] flex-shrink-0" style={{ background: sev.border }} />
              <div className="flex-1 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-mono text-[7px] font-medium tracking-[.5px]" style={{ color: sev.labelColor }}>{sev.label}</span>
                  <span className="text-[7px]" style={{ color: "var(--border2)" }}>—</span>
                  <span className="text-[7px]" style={{ color: "var(--t5)" }}>{bs.episode || bs.title?.split(" ").slice(0, 3).join(" ")}</span>
                </div>
                <p className="text-[12px] font-medium leading-snug mb-1.5" style={{ color: "var(--t1)" }}>{bs.title}</p>
                <p className="text-[10px] leading-relaxed" style={{ color: "var(--t3)" }}>{bs.explanation}</p>
              </div>
              <div className="w-[70px] border-l flex flex-col items-center justify-center flex-shrink-0" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-medium" style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--t4)" }}>{bs.guest?.[0]}</div>
                <p className="text-[6px] mt-1 text-center" style={{ color: "var(--t5)" }}>{bs.guest?.split(" ").pop()}</p>
              </div>
            </div>
          );
        })}

        {/* Diagnosis */}
        {results.tendency_detected && (
          <div className="rounded-[8px] p-3.5 mt-3 fade-up-3" style={{ background: "var(--ac-bg)", border: "1px solid var(--ac-border)" }}>
            <p className="font-mono text-[7px] tracking-[1px] mb-1.5" style={{ color: "var(--ac)" }}>DIAGNOSIS</p>
            <p className="font-display text-[11px] italic leading-relaxed" style={{ color: "var(--t2)" }}>{results.tendency_detected}</p>
          </div>
        )}

        <div className="flex gap-2 mt-4 fade-up-4">
          <button className="px-4 py-2 rounded-md text-[10px] font-medium" style={{ background: "var(--ac)", color: "var(--bg)" }}>Save to decisions →</button>
          <button onClick={() => { setResults(null); setInp(""); }} className="px-4 py-2 rounded-md text-[10px]" style={{ border: "1px solid var(--border2)", color: "var(--t4)" }}>Reflect again</button>
        </div>
      </div>
    )}
  </div></Shell>;
}
