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

  return <Shell><div className="flex-1 p-6 max-w-[640px]">
    <p className="font-mono text-[7px] tracking-[1px] fade-up" style={{color:"var(--t5)"}}>FOUNDER PROFILE</p>
    <h2 className="font-display text-[22px] font-normal mt-2 fade-up-1">Here's what <span className="italic" style={{color:"var(--ac)"}}>the Sage notices.</span></h2>

    {/* Empty state */}
    {isEmpty ? (
      <div className="mt-6 rounded-xl p-8 text-center fade-up-2" style={{background:"var(--bg2)", border:"1px solid var(--border)"}}>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{background:"var(--ac-bg)", border:"1px solid var(--ac-border)"}}>
          <span className="text-2xl">📊</span>
        </div>
        <h3 className="font-display text-[17px] font-normal mb-2">Your journey starts here.</h3>
        <p className="text-[12px] leading-relaxed max-w-[340px] mx-auto mb-5" style={{color:"var(--t3)"}}>Complete reflections and consult the Sage to build your founder profile. The more you think, the clearer your patterns become.</p>
        <div className="flex gap-3 justify-center">
          <a href="/reflections" className="px-5 py-2.5 rounded-lg text-[12px] font-medium cursor-pointer no-underline" style={{background:"var(--ac)", color:"var(--bg)"}}>Start your first reflection →</a>
          <a href="/sage" className="px-5 py-2.5 rounded-lg text-[12px] font-medium cursor-pointer no-underline" style={{border:"1px solid var(--border2)", color:"var(--t4)"}}>Consult the Sage</a>
        </div>
      </div>
    ) : (
      <>
        {/* Stats + mini landscape */}
        <div className="flex gap-3 mt-5 fade-up-2">
          <div className="flex gap-2 flex-1">
            <div className="flex-1 rounded-lg p-3 text-center" style={{background:"var(--bg2)", border:"1px solid var(--border)"}}>
              <div className="font-display text-[22px] font-medium" style={{color:"var(--ac)"}}>{cal}%</div>
              <p className="font-mono text-[7px] mt-0.5 tracking-[.5px]" style={{color:"var(--t5)"}}>CALIBRATION</p>
            </div>
            <div className="flex-1 rounded-lg p-3 text-center" style={{background:"var(--bg2)", border:"1px solid var(--border)"}}>
              <div className="font-display text-[22px] font-medium">{totalSc}</div>
              <p className="font-mono text-[7px] mt-0.5 tracking-[.5px]" style={{color:"var(--t5)"}}>REFLECTIONS</p>
            </div>
            <div className="flex-1 rounded-lg p-3 text-center" style={{background:"var(--bg2)", border:"1px solid var(--border)"}}>
              <div className="font-display text-[22px] font-medium">{totalSg}</div>
              <p className="font-mono text-[7px] mt-0.5 tracking-[.5px]" style={{color:"var(--t5)"}}>SAGE</p>
            </div>
          </div>
          {cats.length > 0 && (
            <div className="w-[140px] rounded-lg p-2.5 flex-shrink-0" style={{background:"var(--bg3)", border:"1px solid var(--border)"}}>
              {cats.slice(0, 4).map(([k, v]: any) => {
                const bl = bls.includes(k);
                return <div key={k} className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[7px] w-[50px] truncate" style={{color: bl ? "var(--red)" : "var(--t4)"}}>{k}{bl ? " ⚠" : ""}</span>
                  <div className="flex-1 h-[3px] rounded" style={{background:"var(--border)"}}>
                    <div className="h-full rounded transition-all duration-1000" style={{width:`${v}%`, background: bl ? "var(--red)" : "var(--ac)"}} />
                  </div>
                </div>;
              })}
            </div>
          )}
        </div>

        {/* Journey timeline */}
        <div className="mt-6 fade-up-3">
          <p className="font-mono text-[7px] tracking-[1px] mb-3" style={{color:"var(--t5)"}}>YOUR THINKING JOURNEY</p>
          <div className="pl-4 border-l ml-1.5" style={{borderColor:"var(--border)"}}>
            {recentSage.map((s: any, i: number) => (
              <div key={`sg-${i}`} className="relative mb-4">
                <div className="absolute -left-[19px] top-[3px] w-2 h-2 rounded-full border-2" style={{background:"var(--ac)", borderColor:"var(--bg)"}} />
                <p className="font-mono text-[7px]" style={{color:"var(--ac)"}}>{new Date(s.created_at).toLocaleDateString()}</p>
                <p className="text-[11px] font-medium mt-0.5">Consulted the Sage: {s.decision_category}</p>
                <p className="text-[8px] mt-0.5" style={{color:"var(--t5)"}}>
                  {(() => { try { const a = typeof s.sage_analysis === "string" ? JSON.parse(s.sage_analysis) : s.sage_analysis; return `${a.blind_spots?.length || 0} patterns found`; } catch { return "Completed"; } })()}
                </p>
              </div>
            ))}
            {recentScenarios.map((s: any, i: number) => (
              <div key={`sc-${i}`} className="relative mb-4">
                <div className="absolute -left-[19px] top-[3px] w-2 h-2 rounded-full border-2" style={{background:"var(--t1)", borderColor:"var(--bg)"}} />
                <p className="font-mono text-[7px]" style={{color:"var(--t4)"}}>{new Date(s.created_at).toLocaleDateString()}</p>
                <p className="text-[11px] font-medium mt-0.5">Reflected: {s.decision_category || "Strategy"}</p>
                <p className="text-[8px] mt-0.5" style={{color:"var(--t5)"}}>{s.guest} · {s.calibration_correct ? "Aligned" : "Diverged"}</p>
              </div>
            ))}
            <div className="relative">
              <div className="absolute -left-[19px] top-[3px] w-2 h-2 rounded-full border" style={{borderColor:"var(--border)", borderStyle:"dashed", background:"var(--bg)"}} />
              <p className="text-[10px]" style={{color:"var(--t5)"}}>{Math.max(0, 18 - totalSc)} more reflections to discover...</p>
            </div>
          </div>
        </div>

        {/* Pattern */}
        {p?.tendencies && (
          <div className="rounded-xl p-4 mt-5 fade-up-4" style={{background:"var(--ac-bg)", border:"1px solid var(--ac-border)"}}>
            <p className="font-mono text-[7px] tracking-[1px] mb-1" style={{color:"var(--ac)"}}>A PATTERN WORTH NOTICING</p>
            <p className="font-display text-[12px] italic leading-relaxed" style={{color:"var(--t2)"}}>{p.tendencies}</p>
          </div>
        )}
      </>
    )}
  </div></Shell>;
}
