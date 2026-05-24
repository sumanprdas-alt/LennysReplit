"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "./Sidebar";

export default function Shell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("sage_theme") || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("sage_theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "";

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)", color: "var(--t1)" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col" style={{ height: "100vh" }}>
        {/* Top bar — welcome + theme toggle */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b flex-shrink-0" style={{ borderColor: "var(--border)" }}>
          <p className="text-[12px]" style={{ color: "var(--t3)" }}>
            {userName && <>Welcome, <span className="font-medium" style={{ color: "var(--t2)" }}>{userName}</span></>}
          </p>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] cursor-pointer transition-all"
            style={{ color: "var(--t3)", background: "var(--bg2)", border: "1px solid var(--border)" }}
          >
            <span>{theme === "dark" ? "☀️" : "🌙"}</span>
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
        </div>
        {/* Page content */}
        <div className="flex-1 overflow-auto flex">
          {children}
        </div>
      </div>
    </div>
  );
}
