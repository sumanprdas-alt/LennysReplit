"use client";
import { useState, useEffect } from "react";
import Shell from "@/components/Shell";

const CATS: Record<string, [string, string]> = { growth:["📈","Growth"], positioning:["🎯","Positioning"], product:["🔨","Product"], pricing:["💰","Pricing"], hiring:["👥","Hiring"], gtm:["🚀","GTM"], retention:["🔄","Retention"], fundraising:["💎","Fundraising"] };

export default function ProfilePage() {
  const [data, setData] = useState<any>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/profile").then(r=>r.json()).then(d => { setData(d); setLoading(false); }); }, []);
  if (loading) return <Shell><div className="flex-1 flex items-center justify-center"><p style={{ color:"var(--t3)" }}>Loading...</p></div></Shell>;

  const p = data?.profile;
  const cal = p?.calibration_score||0;
  const cats = Object.entries(p?.category_scores||{}).sort((a:any,b:any) => b[1]-a[1]);
  const bls = p?.blind_spots||[];

  return <Shell><div className="flex-1 p-7 max-w-[640px]">
    <p className="font-mono text-[10px] tracking-wide fade-up" style={{ color:"var(--t4)" }}>FOUNDER PROFILE</p>
    <h2 className="font-display text-[22px] font-normal mt-2 leading-snug fade-up-1">Here's what <span className="italic" style={{ color:"var(--ac)" }}>the Sage notices.</span></h2>

    {/* Stats */}
    <div className="flex gap-2.5 mt-5 fade-up-2">
      {[{n:Math.round(cal)+"%",l:"Calibration"},{n:p?.total_scenarios||0,l:"Reflections"},{n:p?.total_sage_sessions||0,l:"Sage sessions"},{n:"7",l:"Day streak"}].map((s,i) => (
        <div key={i} className="flex-1 rounded-lg p-3.5 text-center" style={{ background:"var(--bg2)", border:"0.5px solid var(--border)" }}>
          <div className="font-display text-[22px] font-normal" style={{ color:"var(--t1)" }}>{s.n}</div>
          <p className="font-mono text-[9px] mt-1 tracking-wide" style={{ color:"var(--t4)" }}>{s.l}</p>
        </div>
      ))}
    </div>

    {/* Landscape */}
    <div className="mt-5 fade-up-3">
      <p className="font-mono text-[10px] tracking-wide mb-3" style={{ color:"var(--t4)" }}>DECISION LANDSCAPE</p>
      {cats.map(([k, v]: any) => {
        const bl = bls.includes(k);
        const [ico] = CATS[k]||["📊","Other"];
        return <div key={k} className="flex items-center gap-2 mb-2">
          <span className="text-[11px] w-4 text-center">{ico}</span>
          <span className="text-[11px] w-[82px] font-medium capitalize" style={{ color:bl?"var(--sand)":"var(--t2)" }}>{k}{bl?" ⚠":""}</span>
          <div className="flex-1 h-1 rounded overflow-hidden" style={{ background:"var(--bg3)" }}>
            <div className="h-full rounded transition-all duration-[1500ms]" style={{ width:`${v}%`, background:bl?"var(--sand)":"var(--ac)" }} />
          </div>
          <span className="font-mono text-[9px] w-6 text-right" style={{ color:"var(--t4)" }}>{v}%</span>
        </div>;
      })}
    </div>

    {/* Sage observation */}
    {p?.tendencies && <div className="rounded-lg p-[18px] mt-5 fade-up-4" style={{ background:"var(--ac-bg)", border:"0.5px solid var(--ac-border)" }}>
      <p className="font-mono text-[9px] tracking-wide mb-1.5" style={{ color:"var(--ac)" }}>A PATTERN WORTH NOTICING</p>
      <p className="font-display text-[14px] italic leading-relaxed" style={{ color:"var(--t1)" }}>{p.tendencies}</p>
    </div>}
  </div></Shell>;
}
