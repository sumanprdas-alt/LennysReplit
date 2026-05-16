"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

function Mark({ s = 18 }: { s?: number }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 3L4 9v6l8 6 8-6V9l-8-6z" stroke="#8B9A6B" strokeWidth="1.2" fill="rgba(139,154,107,0.08)"/><circle cx="12" cy="12" r="2" fill="#8B9A6B" opacity=".6"/></svg>;
}

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
    <div className="w-[200px] border-r flex flex-col h-[calc(100vh)] overflow-auto flex-shrink-0" style={{ borderColor: "var(--border)" }}>
      {/* Logo */}
      <div className="px-4 py-4 flex items-center gap-2">
        <Mark /><span className="font-display text-sm font-medium" style={{ color: "var(--t1)" }}>Sage</span>
      </div>
      {/* Nav sections */}
      {NAV.map(section => (
        <div key={section.section} className="mb-4">
          <p className="font-mono text-[9px] tracking-[1.5px] px-4 mb-1.5" style={{ color: "var(--t5)" }}>{section.section}</p>
          {section.items.map(item => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.soon ? "#" : item.href}
                className="w-full flex items-center gap-2 px-4 py-[7px] text-[13px] transition-all"
                style={{ fontWeight: active ? 500 : 400, color: active ? "var(--t1)" : item.soon ? "var(--t5)" : "var(--t3)", background: active ? "var(--bg3)" : "transparent" }}>
                <span className="text-[13px] w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
                {item.soon && <span className="ml-auto text-[7px] font-mono py-[1px] px-[5px] rounded" style={{ color: "var(--t5)", background: "var(--bg4)" }}>SOON</span>}
              </Link>
            );
          })}
        </div>
      ))}
      {/* Footer */}
      <div className="mt-auto px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
        <p className="text-[8px] leading-relaxed" style={{ color: "var(--t5)" }}>Powered with valuable insights<br/>from Lenny's Podcast</p>
      </div>
    </div>
  );
}
