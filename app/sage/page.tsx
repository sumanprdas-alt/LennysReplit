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
  { border: "var(--gold)", label: "MODERATE", color: "var(--gold)", bg: "rgba(196,165,106,.04)" },
  { border: "var(--green)", label: "INVESTIGATE", color: "var(--green)", bg: "rgba(90,122,58,.04)" },
];


function gradeInput(text: string): { level: string; color: string; message: string; ready: boolean; wordCount: number } {
  const words = text.trim().split(/\s+/).filter(w => w.length > 1);
  const wordCount = words.length;
  
  if (wordCount === 0) return { level: "", color: "var(--t5)", message: "", ready: false, wordCount: 0 };
  
  // Gibberish check: repeated chars or no real words
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const uniqueRatio = uniqueWords.size / Math.max(wordCount, 1);
  const hasRealWords = /(the|and|but|our|we|my|is|are|have|this|that|with|for|not|how|what|should|team|product|user|customer|growth|build)/i.test(text);
  
  if (wordCount >= 5 && (uniqueRatio < 0.3 || !hasRealWords)) return { level: "🔴", color: "var(--red)", message: "That doesn't look like a real situation. Describe what you're facing.", ready: false, wordCount };
  
  // Domain relevance check
  const domainWords = /(product|team|customer|user|revenue|churn|growth|market|pricing|hire|fund|feature|launch|pivot|retention|onboard|strategy|decision|startup|founder|company|build|ship|metric|conversion|engagement|roadmap|competitor|fundrais|investor|scale|acquisition|activation|monetiz|positioning|segment|enterprise|saas|b2b|b2c|arpu|arr|mrr|nps|cac|ltv)/i;
  const hasDomain = domainWords.test(text);
  const hasNumbers = /\d/.test(text);
  const hasDecision = /(should|whether|debating|deciding|considering|thinking|help|how do|what if|trade-?off|vs|or |dilemma|struggling|challenge|problem|question|concern|worried|unsure)/i.test(text);
  const signals = [hasNumbers, hasDecision, hasDomain].filter(Boolean).length;
  
  if (wordCount < 10) return { level: "🔴", color: "var(--red)", message: "Keep going — what's the situation and what are you weighing?", ready: false, wordCount };
  if (wordCount < 30) return { level: "🟠", color: "var(--gold)", message: `${30 - wordCount} more words. Add your stage, numbers, or what you've tried.`, ready: false, wordCount };
  
  // 30+ words — minimum viable context
  if (wordCount < 50) {
    if (!hasDomain) return { level: "🟡", color: "var(--gold)", message: "Try adding specifics — numbers, team size, what you've tried.", ready: true, wordCount };
    if (signals >= 2) return { level: "🟢", color: "var(--ac)", message: "Good. A few more details and the diagnosis gets sharper.", ready: true, wordCount };
    return { level: "🟡", color: "var(--gold)", message: "Almost — drop in some numbers (users, revenue, runway) for precision.", ready: true, wordCount };
  }
  
  // 50+ words — excellent territory
  if (!hasDomain) return { level: "🟡", color: "var(--gold)", message: "Good context. Mention your product type for sharper results.", ready: true, wordCount };
  if (signals >= 2) return { level: "🟢", color: "var(--ac)", message: "Strong input. Expect a precise diagnosis.", ready: true, wordCount };
  return { level: "🟢", color: "var(--ac)", message: "Good to go.", ready: true, wordCount };
}

export default function SagePage() {
  const [inp, setInp] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [expandedDetail, setExpandedDetail] = useState<Set<number>>(new Set());
  const [followUp, setFollowUp] = useState("");
  const [followUpResult, setFollowUpResult] = useState<string | null>(null);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakResults = () => {
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    if (!results) return;
    const spots = results.blind_spots || [];
    const text = spots.map((bs: any, i: number) => 
      `Finding ${i + 1}: ${bs.title}. ${bs.explanation}`
    ).join(". ") + ". " + (results.tendency_detected ? `Diagnosis: ${results.tendency_detected}` : "");
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const run = async () => {
    const grade = gradeInput(inp); if (!grade.ready) { setError("Please provide more context — at least 50 words."); return; }
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

  return <Shell><div className="flex-1 p-6 max-w-[820px] mobile-full">
    {!results ? (
      <div>
        <p className="font-mono text-[12px] tracking-[1px] fade-up" style={{color:"var(--t5)"}}>THE SAGE</p>
        <h2 className="font-display text-[22px] font-normal mt-2 fade-up-1">Describe <span className="italic" style={{color:"var(--ac)"}}>the decision.</span></h2>

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
                    <p className="text-[13px] font-medium" style={{color: i <= step ? "var(--t1)" : "var(--t5)"}}>{s.text}</p>
                    <p className="text-[13px]" style={{color:"var(--t5)"}}>{s.sub}</p>
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
              <textarea value={inp} onChange={e => setInp(e.target.value)} placeholder="What's the situation? What are you weighing? What have you tried?"
                className="w-full h-[150px] px-4 py-4 rounded-xl text-[13px] outline-none resize-none leading-relaxed pr-12" style={{background:"var(--bg2)", border:"1px solid var(--border)", color:"var(--t1)"}} />
              <div className="absolute top-3 right-3"><VoiceRecorder onTranscript={t => setInp(prev => prev + t)} /></div>
            </div>
            {(() => { const g = gradeInput(inp); return inp.trim().length > 0 ? (
                <div className="flex items-center gap-2 mt-2 px-1">
                  <span className="text-[13px]">{g.level || "✏️"}</span>
                  <p className="text-[11px] flex-1" style={{color: g.color}}>{g.message || "Start describing your situation..."}</p>
                  <span className="font-mono text-[12px]" style={{color: g.wordCount >= 50 ? "var(--ac)" : g.wordCount >= 30 ? "var(--gold)" : "var(--t5)"}}>{g.wordCount} words</span>
                </div>
              ) : null; })()}
              {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            <button onClick={run} disabled={!gradeInput(inp).ready} className="w-full py-3 mt-3 rounded-xl text-[13px] font-medium cursor-pointer transition-all"
              style={{background: !gradeInput(inp).ready ? "var(--bg3)" : "var(--ac)", color: !gradeInput(inp).ready ? "var(--t5)" : "var(--bg)"}}>Run diagnosis →</button>
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
            <p className="font-mono text-[12px] tracking-[1px]" style={{color:"var(--t5)"}}>DIAGNOSTIC REPORT</p>
            <p className="font-display text-[18px] font-normal mt-0.5">{results.blind_spots?.length || 0} blind spots <span className="italic" style={{color:"var(--ac)"}}>identified.</span></p>
            <p className="text-[13px] mt-0.5" style={{color:"var(--t5)"}}>12 segments matched · {new Set(results.blind_spots?.map((b: any) => b.guest)).size || 0} guests cited</p>
          </div>
        </div>

        {/* Severity bar */}
        <div className="flex h-1 rounded-full overflow-hidden mb-1 fade-up-1">
          {results.blind_spots?.map((_: any, i: number) => <div key={i} style={{flex:1, background: SEV[i % 3].border}} />)}
          <div style={{flex: Math.max(0, 3 - (results.blind_spots?.length || 0)), background:"var(--border)"}} />
        </div>
        <div className="flex mb-5 fade-up-1">
          {results.blind_spots?.map((_: any, i: number) => <div key={i} className="text-[12px]" style={{flex:1, color: SEV[i % 3].color}}>{SEV[i % 3].label.toLowerCase()}</div>)}
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
                    <span className="font-mono text-[12px] font-medium tracking-[.5px]" style={{color: sev.color}}>{sev.label}</span>
                    <span className="text-[12px]" style={{color:"var(--border2)"}}>—</span>
                    <span className="text-[12px]" style={{color:"var(--t5)"}}>{bs.episode || bs.decision_category}</span>
                  </div>
                  <p className="text-[13px] font-medium leading-snug mb-2">{bs.title}</p>
                  <div className="mb-3">
                    <p className="text-[13px] leading-relaxed" style={{color:"var(--t3)"}}>
                      {expandedDetail.has(i) ? bs.explanation : bs.explanation?.slice(0, 120) + (bs.explanation?.length > 120 ? "..." : "")}
                    </p>
                    {bs.explanation?.length > 120 && (
                      <button onClick={() => { const s = new Set(expandedDetail); s.has(i) ? s.delete(i) : s.add(i); setExpandedDetail(s); }} className="mt-1.5 font-medium cursor-pointer text-[12px]" style={{color: sev.color, background:"none", border:"none"}}>
                        {expandedDetail.has(i) ? "↑ Show less" : "↓ Read more"}
                      </button>
                    )}
                  </div>
                  {/* Guest + expand source */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-medium" style={{background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--t4)"}}>{bs.guest?.[0]}</div>
                      <span className="text-[12px]" style={{color:"var(--t4)"}}>{bs.guest}</span>
                    </div>
                    <button onClick={() => setExpanded(isExpanded ? null : i)} className="text-[13px] font-medium cursor-pointer" style={{color: sev.color, background:"none", border:"none"}}>
                      {isExpanded ? "Hide evidence ↑" : "See the evidence ↓"}
                    </button>
                  </div>
                </div>
              </div>
              {/* Expanded source */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0">
                  <div className="rounded-lg p-3 mt-2" style={{background:"var(--bg)", border:"1px solid var(--border)"}}>
                    <p className="font-mono text-[12px] tracking-[.5px] mb-2" style={{color:"var(--t5)"}}>FROM THE CONVERSATION</p>
                    <p className="text-[12px] italic leading-relaxed" style={{color:"var(--t3)"}}>"{bs.guest_insight || bs.explanation}"</p>
                    <p className="text-[13px] mt-2" style={{color:"var(--t5)"}}>— {bs.guest}{bs.episode ? `, ${bs.episode}` : ""}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Diagnosis */}
        {results.tendency_detected && (
          <div className="rounded-xl p-4 mt-3 fade-up-3" style={{background:"var(--ac-bg)", border:"1px solid var(--ac-border)"}}>
            <p className="font-mono text-[12px] tracking-[1px] mb-1.5" style={{color:"var(--ac)"}}>DIAGNOSIS</p>
            <p className="font-display text-[12px] italic leading-relaxed" style={{color:"var(--t2)"}}>{results.tendency_detected}</p>
          </div>
        )}

        {/* Recommended gameplan */}
        {results.blind_spots?.length > 0 && (
          <div className="rounded-xl p-5 mt-3 fade-up-3" style={{background:"var(--bg2)", border:"1px solid var(--border)"}}>
            <p className="font-mono text-[12px] tracking-[1px] mb-3" style={{color:"var(--gold)"}}>RECOMMENDED NEXT STEPS</p>
            {(results.next_steps || results.blind_spots?.map((bs: any, i: number) => 
              i === 0 ? `Investigate: ${bs.title?.split(",")[0]?.slice(0, 60)}` :
              i === 1 ? `Validate with 3-5 customer conversations this week` :
              `Define a tracking metric and review in 30 days`
            ))?.map((step: string, i: number) => (
              <div key={`gp-${i}`} className="flex gap-3 mb-3 last:mb-0">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0 mt-0.5" style={{background:"rgba(196,165,106,.1)", color:"var(--gold)"}}>{i + 1}</div>
                <div>
                  <p className="text-[13px] font-medium" style={{color:"var(--t1)"}}>{step}</p>
                  <p className="text-[11px] mt-1" style={{color:"var(--t4)"}}>{
                    i === 0 ? "This week — before making any other decisions." :
                    i === 1 ? "Within 5 days — conversations reveal the truth." :
                    "Set it now — review in 30 days."
                  }</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Follow-up conversation */}
        <div className="mt-5 rounded-xl p-4 fade-up-4" style={{background:"var(--bg2)", border:"1px solid var(--border)"}}>
          <p className="font-mono text-[12px] tracking-[1px] mb-2" style={{color:"var(--ac)"}}>DIG DEEPER</p>
          <p className="text-[13px] mb-3" style={{color:"var(--t3)"}}>What stood out? Ask a follow-up and the Sage will go deeper.</p>
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
          <button onClick={speakResults} className="px-4 py-2 rounded-lg text-[11px] font-medium cursor-pointer flex items-center gap-1.5" style={{background: isSpeaking ? "var(--red)" : "var(--bg2)", border:"1px solid var(--border2)", color: isSpeaking ? "var(--t1)" : "var(--t3)"}}>
            {isSpeaking ? "■ Stop" : "🔊 Listen"}
          </button>
          <button onClick={() => { setResults(null); setInp(""); setFollowUp(""); setFollowUpResult(null); window.speechSynthesis.cancel(); setIsSpeaking(false); }} className="px-4 py-2 rounded-lg text-[11px] font-medium cursor-pointer" style={{border:"1px solid var(--border2)", color:"var(--t4)"}}>Start over</button>
        </div>
      </div>
    )}
  </div></Shell>;
}
