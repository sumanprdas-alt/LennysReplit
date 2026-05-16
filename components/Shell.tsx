"use client";
import Sidebar from "./Sidebar";
export default function Shell({ children, rightPanel }: { children: React.ReactNode; rightPanel?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)", color: "var(--t1)" }}>
      <Sidebar />
      <div className="flex-1 overflow-auto flex" style={{ height: "100vh" }}>
        {children}
        {rightPanel && <div className="w-[280px] border-l p-5 overflow-auto flex-shrink-0" style={{ borderColor: "var(--border)" }}>{rightPanel}</div>}
      </div>
    </div>
  );
}
