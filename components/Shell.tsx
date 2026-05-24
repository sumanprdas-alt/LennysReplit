"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "./Sidebar";

export default function Shell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [theme, setTheme] = useState("dark");
  const [mobileMenu, setMobileMenu] = useState(false);

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
      {/* Desktop sidebar */}
      <div className="sidebar-desktop">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenu && (
        <div className="sidebar-mobile-overlay fixed inset-0 z-50 flex">
          <div className="w-[200px]" style={{ background: "var(--bg)" }}>
            <Sidebar />
          </div>
          <div className="flex-1" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setMobileMenu(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col" style={{ height: "100vh" }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 md:px-6 py-2.5 border-b flex-shrink-0" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button onClick={() => setMobileMenu(true)} className="mobile-menu-btn cursor-pointer" style={{ color: "var(--t3)", background: "none", border: "none", fontSize: 18 }}>☰</button>
            <p className="text-[13px]" style={{ color: "var(--t3)" }}>
              {userName && <>Welcome, <span className="font-medium" style={{ color: "var(--t2)" }}>{userName}</span></>}
            </p>
          </div>
          <button onClick={toggleTheme} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] cursor-pointer" style={{ color: "var(--t3)", background: "var(--bg2)", border: "1px solid var(--border)" }}>
            <span>{theme === "dark" ? "☀️" : "🌙"}</span>
            <span className="hidden md:inline">{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-auto flex">
          {children}
        </div>
      </div>
    </div>
  );
}
