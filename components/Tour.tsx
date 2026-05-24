"use client";
import { useState, useEffect } from "react";

const STEPS = [
  {
    target: "search-bar",
    title: "Your thinking space",
    desc: "Ask the Sage anything about strategy, product, or execution. It searches 3,839 conversations from the world's best product leaders.",
    position: "bottom",
    icon: "🧭",
  },
  {
    target: "reflect-card",
    title: "Daily reflections",
    desc: "Face real decisions that real builders faced. Make your call, then see what actually happened — and what it reveals about your thinking.",
    position: "bottom",
    icon: "💭",
  },
  {
    target: "consult-card",
    title: "Consult the Sage",
    desc: "Paste meeting notes or describe a challenge. The Sage finds patterns you're missing, grounded in insights from 300+ podcast conversations.",
    position: "bottom",
    icon: "🔮",
  },
  {
    target: "sidebar-profile",
    title: "Track your growth",
    desc: "Your Founder Profile builds over time — calibration score, decision landscape, blind spots, and a timeline of your thinking journey.",
    position: "right",
    icon: "📊",
  },
];

export default function Tour({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    const el = document.getElementById(STEPS[step].target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setPos({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [step]);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  // Calculate tooltip position
  const tooltipStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 10002,
    width: 320,
    padding: "20px 24px",
    borderRadius: 12,
    background: "var(--bg2)",
    border: "1px solid var(--ac-border)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  };

  if (current.position === "bottom") {
    tooltipStyle.top = pos.top + pos.height + 12;
    tooltipStyle.left = Math.max(16, Math.min(pos.left, window.innerWidth - 340));
  } else if (current.position === "right") {
    tooltipStyle.top = pos.top;
    tooltipStyle.left = pos.left + pos.width + 12;
  }

  return (
    <>
      {/* Overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(2px)",
      }} />

      {/* Spotlight cutout */}
      <div style={{
        position: "fixed",
        top: pos.top - 6,
        left: pos.left - 6,
        width: pos.width + 12,
        height: pos.height + 12,
        zIndex: 10001,
        borderRadius: 12,
        border: "2px solid var(--ac)",
        boxShadow: "0 0 0 9999px rgba(0,0,0,0.6), 0 0 24px rgba(184,212,90,0.15)",
        pointerEvents: "none",
      }} />

      {/* Tooltip */}
      <div style={tooltipStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 24 }}>{current.icon}</span>
          <div>
            <p style={{ fontSize: 15, fontWeight: 500, color: "var(--t1)" }}>{current.title}</p>
            <p style={{ fontSize: 11, color: "var(--t4)", fontFamily: "var(--font-mono)" }}>Step {step + 1} of {STEPS.length}</p>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "var(--t3)", lineHeight: 1.6, marginBottom: 16 }}>{current.desc}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={onComplete} style={{ fontSize: 12, color: "var(--t4)", background: "none", border: "none", cursor: "pointer" }}>Skip tour</button>
          <div style={{ display: "flex", gap: 8 }}>
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, color: "var(--t3)", background: "none", border: "1px solid var(--border2)", cursor: "pointer" }}>← Back</button>
            )}
            <button onClick={() => isLast ? onComplete() : setStep(step + 1)} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, color: "var(--bg)", background: "var(--ac)", border: "none", cursor: "pointer" }}>
              {isLast ? "Start exploring →" : "Next →"}
            </button>
          </div>
        </div>
        {/* Step dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ width: i === step ? 16 : 6, height: 6, borderRadius: 3, background: i === step ? "var(--ac)" : "var(--border2)", transition: "all 0.3s" }} />
          ))}
        </div>
      </div>
    </>
  );
}
