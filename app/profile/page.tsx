"use client";
import { useState, useEffect } from "react";
import Shell from "@/components/Shell";

const CATS: Record<string, [string, string]> = { growth:["📈","Growth"], positioning:["🎯","Positioning"], product:["🔨","Product"], pricing:["💰","Pricing"], hiring:["👥","Hiring"], gtm:["🚀","GTM"], retention:["🔄","Retention"], fundraising:["💎","Fundraising"] };

export default function ProfilePage() {
  const [data, setData] = useState<any>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/profile").then(r => r.json()).then(d => { setData(d); setLoading(false); }); }, []);
  if (loading) return <Shell><div className="flex-1 flex items-center justify-center"><p style={{ color: "var(--t4)" }}>Loading...</p></div></Shell>;

  const p = data?.profile;
  const cal = Math.round(p?.calibration_score || 0);
  const totalSc = p?.total_scenarios || 0;
  const totalSg = p?.total_sage_sessions || 0;
  const cats = Object.entries(p?.category_scores || {}).sort((a: any, b: any) => b[1] - a[1]);
  const bls = p?.blind_spots || [];
  const recentScenarios = data?.recent_scenarios || [];
  const recentSage = data?.recent_sage_sessions || [];

  return <Shell><div className="flex-1 p-6 max-w-[640px]">
    <p className="font-mono text-[7px] tracking-[1px] fade-up" style={{ color: "var(--t5)" }}>FOUNDER PROFILE</p>
    <h2 className="font-display text-[20px] font-normal mt-2 fade-up-1">Here's what <span className="italic" style={{ color: "var(--ac)" }}>the Sage notices.</span></h2>

    {/* Stats + mini landscape */}
    <div className="flex gap-3 mt-5 fade-up-2">
      <div className="flex gap-2 flex-1">
        <div className="flex-1 rounded-[8px] p-3 text-center" style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}>
          <div className="font-display text-[20px] font-medium" style={{ color: "var(--ac)" }}>{cal}%</div>
          <p className="font-mono text-[6px] mt-0.5 tracking-[.5px]" style={{ color: "var(--t5)" }}>CALIBRATION</p>
        </div>
        <div className="flex-1 rounded-[8px] p-3 text-center" style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}>
          <div className="font-display text-[20px] font-medium">{totalSc}</div>
          <p className="font-mono text-[6px] mt-0.5 tracking-[.5px]" style={{ color: "var(--t5)" }}>REFLECTIONS</p>
        </div>
        <div className="flex-1 rounded-[8px] p-3 text-center" style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}>
          <div className="font-display text-[20px] font-medium">{totalSg}</div>
          <p className="font-mono text-[6px] mt-0.5 tracking-[.5px]" style={{ color: "var(--t5)" }}>SAGE</p>
        </div>
      </div>
      {/* Mini decision landscape */}
      <div className="w-[140px] rounded-[8px] p-2.5 flex-shrink-0" style={{ background: "var(--bg3)", border: "1px solid var(--border)" }}>
        {cats.slice(0, 4).map(([k, v]: any) => {
          const bl = bls.includes(k);
          return <div key={k} className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[7px] w-[50px] truncate" style={{ color: bl ? "var(--red)" : "var(--t4)" }}>{k}{bl ? " ⚠" : ""}</span>
            <div className="flex-1 h-[3px] rounded" style={{ background: "var(--border)" }}>
              <div className="h-full rounded transition-all duration-1000" style={{ width: `${v}%`, background: bl ? "var(--red)" : "var(--ac)" }} />
            </div>
          </div>;
        })}
      </div>
    </div>

    {/* Journey timeline */}
    <div className="mt-6 fade-up-3">
      <p className="font-mono text-[7px] tracking-[1px] mb-3" style={{ color: "var(--t5)" }}>YOUR THINKING JOURNEY</p>
      <div className="pl-4 border-l ml-1.5" style={{ borderColor: "var(--border)" }}>
        {/* Recent sage sessions */}
        {recentSage.map((s: any, i: number) => (
          <div key={`sage-${i}`} className="relative mb-4">
            <div className="absolute -left-[19px] top-[3px] w-2 h-2 rounded-full border-2" style={{ background: "var(--ac)", borderColor: "var(--bg)" }} />
            <p className="font-mono text-[7px]" style={{ color: "var(--ac)" }}>{new Date(s.created_at).toLocaleDateString()}</p>
            <p className="text-[11px] font-medium mt-0.5">Consulted the Sage: {s.decision_category}</p>
            <p className="text-[8px] mt-0.5" style={{ color: "var(--t5)" }}>
              {(() => { try { const a = typeof s.sage_analysis === "string" ? JSON.parse(s.sage_analysis) : s.sage_analysis; return `${a.blind_spots?.length || 0} patterns found`; } catch { return "Analysis completed"; } })()}
            </p>
          </div>
        ))}

        {/* Recent reflections */}
        {recentScenarios.map((s: any, i: number) => (
          <div key={`sc-${i}`} className="relative mb-4">
            <div className="absolute -left-[19px] top-[3px] w-2 h-2 rounded-full border-2" style={{ background: "var(--t1)", borderColor: "var(--bg)" }} />
            <p className="font-mono text-[7px]" style={{ color: "var(--t4)" }}>{new Date(s.created_at).toLocaleDateString()}</p>
            <p className="text-[11px] font-medium mt-0.5">Reflected: {s.decision_category || "Strategy"}</p>
            <p className="text-[8px] mt-0.5" style={{ color: "var(--t5)" }}>{s.guest} · {s.calibration_correct ? "Aligned" : "Diverged"}</p>
          </div>
        ))}

        {/* Empty state / future */}
        {(recentSage.length + recentScenarios.length) === 0 && (
          <div className="relative mb-4">
            <div className="absolute -left-[19px] top-[3px] w-2 h-2 rounded-full border" style={{ borderColor: "var(--border2)", borderStyle: "dashed", background: "var(--bg)" }} />
            <p className="text-[11px]" style={{ color: "var(--t5)" }}>Complete a reflection or consult the Sage to begin your journey.</p>
          </div>
        )}

        {/* Locked future */}
        <div className="relative">
          <div className="absolute -left-[19px] top-[3px] w-2 h-2 rounded-full border" style={{ borderColor: "var(--border)", borderStyle: "dashed", background: "var(--bg)" }} />
          <p className="text-[10px]" style={{ color: "var(--t5)" }}>{Math.max(0, 18 - totalSc)} more reflections to discover...</p>
        </div>
      </div>
    </div>

    {/* Pattern */}
    {p?.tendencies && (
      <div className="rounded-[8px] p-3.5 mt-5 fade-up-4" style={{ background: "var(--ac-bg)", border: "1px solid var(--ac-border)" }}>
        <p className="font-mono text-[7px] tracking-[1px] mb-1" style={{ color: "var(--ac)" }}>A PATTERN WORTH NOTICING</p>
        <p className="font-display text-[11px] italic leading-relaxed" style={{ color: "var(--t2)" }}>{p.tendencies}</p>
      </div>
    )}
  </div></Shell>;
}
