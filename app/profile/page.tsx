"use client";
import { useState, useEffect } from "react";
import Shell from "@/components/Shell";

const CATS: Record<string, [string, string]> = { growth:["📈","Growth"], positioning:["🎯","Positioning"], product:["🔨","Product"], pricing:["💰","Pricing"], hiring:["👥","Hiring"], gtm:["🚀","GTM"], retention:["🔄","Retention"], fundraising:["💎","Fundraising"] };

export default function ProfilePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/profile").then(r => r.json()).then(d => { setData(d); setLoading(false); }); }, []);

  if (loading) return <Shell><div className="flex-1 flex items-center justify-center"><p style={{color:"var(--t4)"}}>Loading...</p></div></Shell>;

  const p = data?.profile;
  const cal = Math.round(p?.calibration_score || 0);
  const totalSc = p?.total_scenarios || 0;
  const totalSg = p?.total_sage_sessions || 0;
  const cats = Object.entries(p?.category_scores || {}).sort((a: any, b: any) => b[1] - a[1]);
  const bls = p?.blind_spots || [];
  const recentSage = data?.recent_sage_sessions || [];
  const recentScenarios = data?.recent_scenarios || [];
  const isEmpty = totalSc === 0 && totalSg === 0;

  return <Shell><div className="flex-1 p-8 max-w-[680px]">
    <p className="font-mono text-[10px] tracking-[1px] fade-up" style={{color:"var(--t4)"}}>FOUNDER PROFILE</p>
    <h2 className="font-display text-[28px] font-normal mt-2 fade-up-1">Here's what <span className="italic" style={{color:"var(--ac)"}}>the Sage notices.</span></h2>

    {isEmpty ? (
      <div className="mt-8 rounded-xl p-10 text-center fade-up-2" style={{background:"var(--bg2)", border:"1px solid var(--border)"}}>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{background:"var(--ac-bg)", border:"1px solid var(--ac-border)"}}>
          <span className="text-3xl">📊</span>
        </div>
        <h3 className="font-display text-[20px] font-normal mb-3">Your journey starts here.</h3>
        <p className="text-[14px] leading-relaxed max-w-[380px] mx-auto mb-6" style={{color:"var(--t3)"}}>Complete reflections and consult the Sage to build your founder profile. The more you think, the clearer your patterns become.</p>
        <div className="flex gap-3 justify-center">
          <a href="/reflections" className="px-6 py-3 rounded-lg text-[14px] font-medium cursor-pointer no-underline" style={{background:"var(--ac)", color:"var(--bg)"}}>Start your first reflection →</a>
          <a href="/sage" className="px-6 py-3 rounded-lg text-[14px] font-medium cursor-pointer no-underline" style={{border:"1px solid var(--border2)", color:"var(--t3)"}}>Consult the Sage</a>
        </div>
      </div>
    ) : (
      <>
        {/* Stats */}
        <div className="flex gap-4 mt-6 fade-up-2">
          <div className="flex-1 rounded-xl p-5 text-center" style={{background:"var(--bg2)", border:"1px solid var(--border)"}}>
            <div className="font-display text-[32px] font-medium" style={{color:"var(--ac)"}}>{cal}%</div>
            <p className="font-mono text-[10px] mt-1 tracking-[1px]" style={{color:"var(--t4)"}}>CALIBRATION</p>
          </div>
          <div className="flex-1 rounded-xl p-5 text-center" style={{background:"var(--bg2)", border:"1px solid var(--border)"}}>
            <div className="font-display text-[32px] font-medium">{totalSc}</div>
            <p className="font-mono text-[10px] mt-1 tracking-[1px]" style={{color:"var(--t4)"}}>REFLECTIONS</p>
          </div>
          <div className="flex-1 rounded-xl p-5 text-center" style={{background:"var(--bg2)", border:"1px solid var(--border)"}}>
            <div className="font-display text-[32px] font-medium">{totalSg}</div>
            <p className="font-mono text-[10px] mt-1 tracking-[1px]" style={{color:"var(--t4)"}}>SAGE SESSIONS</p>
          </div>
        </div>

        {/* Decision landscape */}
        {cats.length > 0 && (
          <div className="mt-6 rounded-xl p-5 fade-up-3" style={{background:"var(--bg2)", border:"1px solid var(--border)"}}>
            <p className="font-mono text-[10px] tracking-[1px] mb-4" style={{color:"var(--t4)"}}>DECISION LANDSCAPE</p>
            {cats.map(([k, v]: any) => {
              const bl = bls.includes(k);
              const [ico] = CATS[k] || ["📊"];
              return <div key={k} className="flex items-center gap-3 mb-3">
                <span className="text-[14px] w-5 text-center">{ico}</span>
                <span className="text-[13px] w-[90px] font-medium capitalize" style={{color: bl ? "var(--red)" : "var(--t2)"}}>{k}{bl ? " ⚠" : ""}</span>
                <div className="flex-1 h-[5px] rounded-full" style={{background:"var(--border)"}}>
                  <div className="h-full rounded-full transition-all duration-1000" style={{width:`${v}%`, background: bl ? "var(--red)" : "var(--ac)"}} />
                </div>
                <span className="font-mono text-[12px] w-8 text-right" style={{color:"var(--t3)"}}>{v}%</span>
              </div>;
            })}
          </div>
        )}

        {/* Journey timeline */}
        <div className="mt-6 fade-up-3">
          <p className="font-mono text-[10px] tracking-[1px] mb-4" style={{color:"var(--t4)"}}>YOUR THINKING JOURNEY</p>
          <div className="pl-5 border-l-2 ml-2" style={{borderColor:"var(--border)"}}>
            {recentSage.map((s: any, i: number) => (
              <div key={`sg-${i}`} className="relative mb-5">
                <div className="absolute -left-[23px] top-[4px] w-3 h-3 rounded-full border-2" style={{background:"var(--ac)", borderColor:"var(--bg)"}} />
                <p className="font-mono text-[10px]" style={{color:"var(--ac)"}}>{new Date(s.created_at).toLocaleDateString()}</p>
                <p className="text-[14px] font-medium mt-1">Consulted the Sage: {s.decision_category}</p>
                <p className="text-[12px] mt-1" style={{color:"var(--t4)"}}>
                  {(() => { try { const a = typeof s.sage_analysis === "string" ? JSON.parse(s.sage_analysis) : s.sage_analysis; return `${a.blind_spots?.length || 0} patterns found`; } catch { return "Completed"; } })()}
                </p>
              </div>
            ))}
            {recentScenarios.map((s: any, i: number) => (
              <div key={`sc-${i}`} className="relative mb-5">
                <div className="absolute -left-[23px] top-[4px] w-3 h-3 rounded-full border-2" style={{background:"var(--t1)", borderColor:"var(--bg)"}} />
                <p className="font-mono text-[10px]" style={{color:"var(--t3)"}}>{new Date(s.created_at).toLocaleDateString()}</p>
                <p className="text-[14px] font-medium mt-1">Reflected: {s.decision_category || "Strategy"}</p>
                <p className="text-[12px] mt-1" style={{color:"var(--t4)"}}>{s.guest} · {s.calibration_correct ? "Aligned" : "Diverged"}</p>
              </div>
            ))}
            <div className="relative">
              <div className="absolute -left-[23px] top-[4px] w-3 h-3 rounded-full border-2" style={{borderColor:"var(--border)", borderStyle:"dashed", background:"var(--bg)"}} />
              <p className="text-[13px]" style={{color:"var(--t4)"}}>{Math.max(0, 18 - totalSc)} more reflections to discover...</p>
            </div>
          </div>
        </div>

        {/* Pattern */}
        {p?.tendencies && (
          <div className="rounded-xl p-5 mt-6 fade-up-4" style={{background:"var(--ac-bg)", border:"1px solid var(--ac-border)"}}>
            <p className="font-mono text-[10px] tracking-[1px] mb-2" style={{color:"var(--ac)"}}>A PATTERN WORTH NOTICING</p>
            <p className="font-display text-[15px] italic leading-relaxed" style={{color:"var(--t2)"}}>{p.tendencies}</p>
          </div>
        )}
      </>
    )}
  </div></Shell>;
}
