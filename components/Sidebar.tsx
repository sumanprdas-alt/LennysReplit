"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

const NAV = [
  { section: "THINK", items: [
    { href: "/dashboard", label: "Today", icon: "🏠" },
    { href: "/reflections", label: "Reflections", icon: "💭" },
    { href: "/sage", label: "The Sage", icon: "🧭" },
  ]},
  { section: "BUILD", items: [
    { href: "/profile", label: "Founder Profile", icon: "📊" },
  ]},
  { section: "LIBRARY", items: [
    { href: "/library/decisions", label: "Decisions", icon: "⚖️", soon: true },
    { href: "/library/models", label: "Mental Models", icon: "🧠", soon: true },
    { href: "/library/reviews", label: "Product Reviews", icon: "📋", soon: true },
    { href: "/library/patterns", label: "Founder Patterns", icon: "👤", soon: true },
  ]},
];

const WIP_INFO: Record<string, { icon: string; title: string; desc: string }> = {
  "/library/decisions": { icon: "⚖️", title: "Decisions", desc: "Track every strategic call — what you decided, why, and what happened. Review your judgment at 30, 60, and 90 days." },
  "/library/models": { icon: "🧠", title: "Mental Models", desc: "Thinking frameworks from 300+ founder conversations. Apply the right model to the right problem, faster." },
  "/library/reviews": { icon: "📋", title: "Product Reviews", desc: "Structured teardowns of real products by the builders who made them. Learn what worked and why." },
  "/library/patterns": { icon: "👤", title: "Founder Patterns", desc: "Decision archetypes from hundreds of founders. See which patterns match yours and which to avoid." },
};

export default function Sidebar() {
  const pathname = usePathname();
  const [wipModal, setWipModal] = useState<string | null>(null);

  return (
    <div className="w-[160px] border-r flex flex-col h-screen overflow-auto flex-shrink-0" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
      <div className="px-3 py-3.5 flex items-center gap-2">
        <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[12px] font-medium" style={{ borderColor: "var(--ac)", color: "var(--ac)" }}>S</span>
        <span className="font-display text-[13px] font-medium" style={{ color: "var(--t1)" }}>Sage</span>
      </div>
      {NAV.map(section => (
        <div key={section.section} className="mb-3">
          <p className="font-mono text-[12px] tracking-[1.2px] px-3 mb-1" style={{ color: "var(--t5)" }}>{section.section}</p>
          {section.items.map(item => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.soon ? "#" : item.href} onClick={item.soon ? (e: React.MouseEvent) => { e.preventDefault(); setWipModal(item.href); } : undefined} id={item.href === "/profile" ? "sidebar-profile" : undefined}
                className="w-full flex items-center gap-[6px] px-3 py-[5px] text-[12px] transition-all"
                style={{ color: active ? "var(--t1)" : item.soon ? "var(--t5)" : "var(--t4)", background: active ? "var(--bg2)" : "transparent" }}>
                {active && <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "var(--ac)" }} />}
                <span className="text-[13px]">{item.icon}</span>
                <span>{item.label}</span>
                {item.soon && <span className="ml-auto text-[12px] font-mono py-px px-1 rounded" style={{ color: "var(--t5)", background: "var(--bg3)" }}>WIP</span>}
              </Link>
            );
          })}
        </div>
      ))}
      <div className="mt-auto">
        <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-[6px] px-3 py-[5px] text-[12px] cursor-pointer" style={{ color: "var(--t5)", background: "none", border: "none" }}>
          <span className="text-[13px]">↩</span>
          <span>Sign out</span>
        </button>
        <div className="px-3 py-2.5 border-t" style={{ borderColor: "var(--border)" }}>
          <p className="text-[13px] leading-relaxed" style={{ color: "var(--t5)" }}>Wisdom from 300+ Lenny's<br/>Podcast conversations</p>
        </div>
      </div>

      {/* WIP Modal */}
      {wipModal && WIP_INFO[wipModal] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }} onClick={() => setWipModal(null)}>
          <div className="w-full max-w-[360px] mx-4 rounded-xl p-6" style={{ background: "var(--bg2)", border: "1px solid var(--border2)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[20px]">{WIP_INFO[wipModal].icon}</span>
                <span className="font-display text-[16px] font-medium">{WIP_INFO[wipModal].title}</span>
                <span className="font-mono text-[9px] py-[2px] px-[6px] rounded" style={{ color: "var(--gold)", background: "rgba(196,165,106,.1)", border: "1px solid rgba(196,165,106,.15)" }}>WIP</span>
              </div>
              <button onClick={() => setWipModal(null)} className="text-[16px] cursor-pointer" style={{ color: "var(--t4)", background: "none", border: "none" }}>✕</button>
            </div>
            <p className="text-[13px] leading-relaxed mb-4" style={{ color: "var(--t3)" }}>{WIP_INFO[wipModal].desc}</p>
            <p className="text-[12px] mb-4" style={{ color: "var(--t4)" }}>We're building this now. Stay tuned.</p>
            <button onClick={() => setWipModal(null)} className="w-full py-2.5 rounded-lg text-[12px] font-medium cursor-pointer" style={{ background: "var(--ac)", color: "var(--bg)" }}>Got it</button>
          </div>
        </div>
      )}
    </div>
  );
}
