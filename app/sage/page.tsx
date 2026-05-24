"use client";
import { useState } from "react";
import Shell from "@/components/Shell";
import VoiceRecorder from "@/components/VoiceRecorder";

const STEPS = [
  { icon: "🔍", text: "Understanding your context...", sub: "Mapping your situation" },
  { icon: "📚", text: "Consulting 3,839 conversations...", sub: "Finding the builders who've been here" },
  { icon: "🎯", text: "Connecting the patterns...", sub: "Surfacing what others missed" },
  { icon: "🧠", text: "Forming the diagnosis...", sub: "The Sage is reflecting" },
];
const SEV = [
  { border: "var(--red)", label: "CRITICAL", color: "var(--red)", bg: "rgba(226,75,74,.04)" },
  { border: "var(--gold)", label: "WORTH EXAMINING", color: "var(--gold)", bg: "rgba(196,165,106,.04)" },
  { border: "var(--green)", label: "INVESTIGATE", color: "var(--green)", bg: "rgba(90,122,58,.04)" },
];

export default function SagePage() {
  const [inp, setInp] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [followUp, setFollowUp] = useState("");
  const [followUpResult, setFollowUpResult] = useState<string | null>(null);
  const [followUpLoading, setFollowUpLoading] = useState(false);

  const run = async () => {
    if (inp.trim().length < 20) { setError("Please provide more detail."); return; }
    setError(""); setLoading(true); setStep(0);
    const t0 = setTimeout(() => setStep(1), 800);
    const t1 = setTimeout(() => setStep(2), 2500);
    const t2 = setTimeout(() => setStep(3), 4000);
    try {
      const res = await fetch("/api/sage/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input_text: inp, input_type: "paste" }) });
      if (!res.ok) throw new Error((await res.json()).error || "Analysis failed");
      setResults(await res.json());
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); }
  };

  const handleFollowUp = async () => {
    if (!followUp.trim() || !results) return;
    setFollowUpLoading(true);
    try {
      const res = await fetch("/api/sage/analyze", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_text: `Original context: ${inp.slice(0,500)}\n\nSage found these patterns:\n${results.blind_spots?.map((b:any) => `- ${b.title} (${b.guest})`).join("\n")}\n\nFollow-up question: ${followUp}`, input_type: "followup" }) });
      const data = await res.json();
      setFollowUpResult(data.blind_spots?.[0]?.explanation || data.tendency_detected || "The Sage is reflecting further...");
    } catch { setFollowUpResult("Unable to process follow-up. Try rephrasing."); }
    finally { setFollowUpLoading(false); }
  };

  return <Shell><div className="flex-1 p-6 max-w-[660px]">
    {!results ? (
      <div>
        <p className="font-mono text-[8px] tracking-[1px] fade-up" style={{color:"var(--t5)"}}>THE SAGE</p>
        <h2 className="font-display text-[22px] font-normal mt-2 fade-up-1">What's on <span className="italic" style={{color:"var(--ac)"}}>your mind?</span></h2>

        {loading ? (
          <div className="mt-8 fade-up">
            {/* Real-time thinking steps */}
            <div className="space-y-3">
              {STEPS.map((s, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-500" style={{
                  background: i <= step ? "var(--bg2)" : "transparent",
                  border: `1px solid ${i <= step ? "var(--border)" : "transparent"}`,
                  opacity: i <= step ? 1 : 0.2,
                  transform: i <= step ? "translateX(0)" : "translateX(-8px)",
                }}>
                  <span className="text-[16px]">{s.icon}</span>
                  <div className="flex-1">
                    <p className="text-[12px] font-medium" style={{color: i <= step ? "var(--t1)" : "var(--t5)"}}>{s.text}</p>
                    <p className="text-[9px]" style={{color:"var(--t5)"}}>{s.sub}</p>
                  </div>
                  {i < step && <span className="text-[11px]" style={{color:"var(--ac)"}}>✓</span>}
                  {i === step && <span className="w-3 h-3 rounded-full border-2 animate-spin" style={{borderColor:"var(--border)", borderTopColor:"var(--ac)"}} />}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-5 fade-up-2">
            <div className="relative">
              <textarea value={inp} onChange={e => setInp(e.target.value)} placeholder="Paste meeting notes, describe a decision, share what's weighing on you..."
                className="w-full h-[150px] px-4 py-4 rounded-xl text-[13px] outline-none resize-none leading-relaxed pr-12" style={{background:"var(--bg2)", border:"1px solid var(--border)", color:"var(--t1)"}} />
              <div className="absolute top-3 right-3"><VoiceRecorder onTranscript={t => setInp(prev => prev + t)} /></div>
            </div>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            <button onClick={run} disabled={inp.length < 20} className="w-full py-3 mt-3 rounded-xl text-[13px] font-medium cursor-pointer transition-all"
              style={{background: inp.length < 20 ? "var(--bg3)" : "var(--ac)", color: inp.length < 20 ? "var(--t5)" : "var(--bg)"}}>Reflect →</button>
          </div>
        )}
      </div>
    ) : (
      <div>
        {/* Diagnostic header */}
        <div className="flex items-center gap-3.5 mb-5 fade-up">
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="21" fill="none" stroke="var(--border2)" strokeWidth="2.5" />
            <circle cx="24" cy="24" r="21" fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeDasharray="88 44" strokeLinecap="round" transform="rotate(-90 24 24)" />
            <text x="24" y="22" textAnchor="middle" fill="var(--gold)" fontSize="14" fontWeight="500">{results.blind_spots?.length || 0}</text>
            <text x="24" y="31" textAnchor="middle" fill="var(--t5)" fontSize="6">found</text>
          </svg>
          <div>
            <p className="font-mono text-[7px] tracking-[1px]" style={{color:"var(--t5)"}}>DIAGNOSTIC REPORT</p>
            <p className="font-display text-[18px] font-normal mt-0.5">{results.blind_spots?.length || 0} patterns <span className="italic" style={{color:"var(--ac)"}}>the Sage noticed.</span></p>
            <p className="text-[9px] mt-0.5" style={{color:"var(--t5)"}}>12 segments matched · {new Set(results.blind_spots?.map((b: any) => b.guest)).size || 0} guests cited</p>
          </div>
        </div>

        {/* Severity bar */}
        <div className="flex h-1 rounded-full overflow-hidden mb-1 fade-up-1">
          {results.blind_spots?.map((_: any, i: number) => <div key={i} style={{flex:1, background: SEV[i % 3].border}} />)}
          <div style={{flex: Math.max(0, 3 - (results.blind_spots?.length || 0)), background:"var(--border)"}} />
        </div>
        <div className="flex mb-5 fade-up-1">
          {results.blind_spots?.map((_: any, i: number) => <div key={i} className="text-[7px]" style={{flex:1, color: SEV[i % 3].color}}>{SEV[i % 3].label.toLowerCase()}</div>)}
        </div>

        {/* Findings with expandable sources */}
        {results.blind_spots?.map((bs: any, i: number) => {
          const sev = SEV[i % 3];
          const isExpanded = expanded === i;
          return (
            <div key={i} className="rounded-xl overflow-hidden mb-2.5" style={{border:"1px solid var(--border)", animation:`flipIn .5s cubic-bezier(.22,1,.36,1) ${.06+i*.1}s both`}}>
              <div className="flex">
                <div className="w-[3px] flex-shrink-0" style={{background: sev.border}} />
                <div className="flex-1 p-4">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="font-mono text-[7px] font-medium tracking-[.5px]" style={{color: sev.color}}>{sev.label}</span>
                    <span className="text-[7px]" style={{color:"var(--border2)"}}>—</span>
                    <span className="text-[7px]" style={{color:"var(--t5)"}}>{bs.episode || bs.decision_category}</span>
                  </div>
                  <p className="text-[13px] font-medium leading-snug mb-2">{bs.title}</p>
                  <p className="text-[11px] leading-relaxed mb-3" style={{color:"var(--t3)"}}>{bs.explanation}</p>
                  {/* Guest + expand source */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-medium" style={{background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--t4)"}}>{bs.guest?.[0]}</div>
                      <span className="text-[10px]" style={{color:"var(--t4)"}}>{bs.guest} · Lenny's Podcast</span>
                    </div>
                    <button onClick={() => setExpanded(isExpanded ? null : i)} className="text-[9px] font-medium cursor-pointer" style={{color: sev.color, background:"none", border:"none"}}>
                      {isExpanded ? "Hide source ↑" : "View source ↓"}
                    </button>
                  </div>
                </div>
              </div>
              {/* Expanded source */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0">
                  <div className="rounded-lg p-3 mt-2" style={{background:"var(--bg)", border:"1px solid var(--border)"}}>
                    <p className="font-mono text-[7px] tracking-[.5px] mb-2" style={{color:"var(--t5)"}}>SOURCE TRANSCRIPT</p>
                    <p className="text-[10px] italic leading-relaxed" style={{color:"var(--t3)"}}>"{bs.guest_insight || bs.explanation}"</p>
                    <p className="text-[8px] mt-2" style={{color:"var(--t5)"}}>— {bs.guest}, {bs.episode || "Lenny's Podcast"}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Diagnosis */}
        {results.tendency_detected && (
          <div className="rounded-xl p-4 mt-3 fade-up-3" style={{background:"var(--ac-bg)", border:"1px solid var(--ac-border)"}}>
            <p className="font-mono text-[7px] tracking-[1px] mb-1.5" style={{color:"var(--ac)"}}>DIAGNOSIS</p>
            <p className="font-display text-[12px] italic leading-relaxed" style={{color:"var(--t2)"}}>{results.tendency_detected}</p>
          </div>
        )}

        {/* Follow-up conversation */}
        <div className="mt-5 rounded-xl p-4 fade-up-4" style={{background:"var(--bg2)", border:"1px solid var(--border)"}}>
          <p className="font-mono text-[7px] tracking-[1px] mb-2" style={{color:"var(--ac)"}}>GO DEEPER</p>
          <p className="text-[12px] mb-3" style={{color:"var(--t3)"}}>Which pattern surprised you? The Sage can dig deeper.</p>
          {followUpResult ? (
            <div className="rounded-lg p-3 mb-3" style={{background:"var(--bg)", border:"1px solid var(--border)"}}>
              <p className="text-[11px] leading-relaxed" style={{color:"var(--t2)"}}>{followUpResult}</p>
            </div>
          ) : null}
          <div className="flex gap-2">
            <input value={followUp} onChange={e => setFollowUp(e.target.value)} placeholder="Ask a follow-up..."
              className="flex-1 px-3 py-2 rounded-lg text-[12px] outline-none" style={{background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--t1)"}}
              onKeyDown={e => e.key === "Enter" && handleFollowUp()} />
            <button onClick={handleFollowUp} disabled={followUpLoading || !followUp.trim()} className="px-4 py-2 rounded-lg text-[11px] font-medium cursor-pointer disabled:opacity-40"
              style={{background:"var(--ac)", color:"var(--bg)"}}>
              {followUpLoading ? "..." : "Ask →"}
            </button>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={() => { setResults(null); setInp(""); setFollowUp(""); setFollowUpResult(null); }} className="px-4 py-2 rounded-lg text-[10px] font-medium cursor-pointer" style={{border:"1px solid var(--border2)", color:"var(--t4)"}}>New consultation</button>
        </div>
      </div>
    )}
  </div></Shell>;
}
