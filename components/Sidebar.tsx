"use client";
import { usePathname } from "next/navigation";
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

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <div className="w-[160px] border-r flex flex-col h-screen overflow-auto flex-shrink-0" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
      <div className="px-3 py-3.5 flex items-center gap-2">
        <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[8px] font-medium" style={{ borderColor: "var(--ac)", color: "var(--ac)" }}>S</span>
        <span className="font-display text-[13px] font-medium" style={{ color: "var(--t1)" }}>Sage</span>
      </div>
      {NAV.map(section => (
        <div key={section.section} className="mb-3">
          <p className="font-mono text-[7px] tracking-[1.2px] px-3 mb-1" style={{ color: "var(--t5)" }}>{section.section}</p>
          {section.items.map(item => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.soon ? "#" : item.href}
                className="w-full flex items-center gap-[6px] px-3 py-[5px] text-[10px] transition-all"
                style={{ color: active ? "var(--t1)" : item.soon ? "var(--t5)" : "var(--t4)", background: active ? "var(--bg2)" : "transparent" }}>
                {active && <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "var(--ac)" }} />}
                <span className="text-[11px]">{item.icon}</span>
                <span>{item.label}</span>
                {item.soon && <span className="ml-auto text-[6px] font-mono py-px px-1 rounded" style={{ color: "var(--t5)", background: "var(--bg3)" }}>SOON</span>}
              </Link>
            );
          })}
        </div>
      ))}
      <div className="mt-auto">
        <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-[6px] px-3 py-[5px] text-[10px] cursor-pointer" style={{ color: "var(--t5)", background: "none", border: "none" }}>
          <span className="text-[11px]">↩</span>
          <span>Sign out</span>
        </button>
        <div className="px-3 py-2.5 border-t" style={{ borderColor: "var(--border)" }}>
          <p className="text-[9px] leading-relaxed" style={{ color: "var(--t5)" }}>Powered with valuable insights<br/>from Lenny's Podcast</p>
        </div>
      </div>
    </div>
  );
}
