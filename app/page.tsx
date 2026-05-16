"use client";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function Mark({ s = 28 }: { s?: number }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#8B9A6B" strokeWidth="1" fill="rgba(139,154,107,0.06)"/><text x="12" y="16" textAnchor="middle" fill="#8B9A6B" fontSize="12" fontWeight="500">S</text></svg>;
}

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // If already logged in, go to dashboard
  if (session) { router.push("/dashboard"); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    const result = await signIn("credentials", { email, password, name: isSignUp ? name : undefined, isSignUp: isSignUp ? "true" : "false", redirect: false });
    setLoading(false);
    if (result?.error) setError(result.error);
    else router.push("/onboarding");
  };

  const triggerAuth = () => setShowAuth(true);

  const prompts = [
    "How do great PMs prioritize?",
    "What makes a product truly sticky?",
    "How do founders build focus?",
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "var(--bg)", color: "var(--t1)" }}>
      {/* Background image */}
      <div className="absolute inset-0" style={{ backgroundImage: "url('/hero-bg.jpg')", backgroundSize: "110%", backgroundPosition: "center 60%", pointerEvents: "none" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(28,28,26,0.75) 0%, rgba(28,28,26,0.55) 40%, rgba(28,28,26,0.82) 100%)", pointerEvents: "none" }} />
      <div className="absolute inset-0 opacity-[.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", pointerEvents: "none" }} />

      {/* Nav */}
      <div className="flex items-center justify-between px-10 py-4 relative z-10 fade-up">
        <div className="flex items-center gap-2">
          <Mark /><span className="font-display text-lg font-medium">Sage</span>
        </div>
        <div className="hidden md:flex gap-8">
          {["Product", "Reflections", "About", "Pricing"].map(l => <span key={l} className="text-[14px] cursor-pointer" style={{ color: "var(--t3)" }}>{l}</span>)}
        </div>
        <button onClick={triggerAuth} className="px-5 py-2 rounded-lg text-sm font-medium cursor-pointer" style={{ color: "var(--t1)", border: "1px solid var(--border)" }}>Sign in</button>
      </div>

      {/* Hero — center aligned */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 text-center" style={{ paddingTop: "4vh" }}>
        <p className="font-mono text-[11px] tracking-[2px] mb-6 fade-up" style={{ color: "var(--ac)" }}>AI STRATEGIC ADVISOR FOR BUILDERS</p>
        <h1 className="font-display text-[56px] md:text-[72px] font-normal leading-[1] tracking-tight fade-up-1" style={{ letterSpacing: "-2px", maxWidth: 700 }}>
          Strategic clarity<br/>for builders.
        </h1>
        <p className="text-[16px] md:text-[18px] mt-7 leading-relaxed max-w-[500px] fade-up-2" style={{ color: "var(--t3)" }}>
          Search, synthesize, and learn from the world's best startup conversations.
        </p>

        {/* Search bar — triggers auth */}
        <div className="w-full max-w-[600px] mt-10 fade-up-3">
          <div onClick={triggerAuth} className="flex items-center rounded-2xl px-6 py-4 cursor-pointer transition-all hover:border-[var(--border2)]" style={{ background: "rgba(35,35,32,0.8)", border: "1px solid var(--border)", backdropFilter: "blur(12px)" }}>
            <span className="flex-1 text-[15px] text-left" style={{ color: "var(--t4)" }}>Ask Sage anything...</span>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--ac)" }}>
              <span className="text-[16px]" style={{ color: "var(--bg)" }}>↑</span>
            </div>
          </div>
        </div>

        {/* Prompt suggestions */}
        <div className="flex flex-wrap justify-center gap-4 mt-6 fade-up-4">
          {prompts.map(p => (
            <button key={p} onClick={triggerAuth} className="flex items-center gap-2 text-[13px] cursor-pointer transition-all hover:opacity-80" style={{ color: "var(--t3)" }}>
              {p} <span style={{ color: "var(--t4)" }}>→</span>
            </button>
          ))}
        </div>
      </div>

      {/* Social proof */}
      <div className="relative z-10 text-center pb-4 fade-up-4">
        <p className="font-mono text-[10px] tracking-[2px] mb-3" style={{ color: "var(--t4)" }}>BUILT FOR BUILDERS. INSPIRED BY LENNY'S PODCAST.</p>
        <p className="text-[13px]" style={{ color: "var(--t3)" }}>Powered with valuable insights from Lenny's Podcast</p>
      </div>

      {/* Auth modal overlay */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-[380px] mx-4 rounded-xl p-8" style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Mark s={22} /><span className="font-display text-[16px] font-medium">Sage</span>
              </div>
              <button onClick={() => setShowAuth(false)} className="text-[18px] cursor-pointer" style={{ color: "var(--t4)", background: "none", border: "none" }}>✕</button>
            </div>
            <h2 className="font-display text-[22px] font-normal mb-1">{isSignUp ? "Create your account" : "Welcome back"}</h2>
            <p className="text-[13px] mb-6" style={{ color: "var(--t3)" }}>{isSignUp ? "Start building clarity." : "Continue where you left off."}</p>
            <form onSubmit={handleSubmit} className="space-y-2.5">
              {isSignUp && <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full px-4 py-3 rounded-lg text-[14px] outline-none" style={{ background: "var(--bg3)", border: "0.5px solid var(--border)", color: "var(--t1)" }} required />}
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 rounded-lg text-[14px] outline-none" style={{ background: "var(--bg3)", border: "0.5px solid var(--border)", color: "var(--t1)" }} required />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 rounded-lg text-[14px] outline-none" style={{ background: "var(--bg3)", border: "0.5px solid var(--border)", color: "var(--t1)" }} required minLength={6} />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-3 rounded-lg text-[14px] font-medium cursor-pointer disabled:opacity-50" style={{ background: "var(--ac)", color: "var(--bg)" }}>
                {loading ? "..." : isSignUp ? "Create account" : "Sign in"}
              </button>
            </form>
            <p className="text-center mt-4 text-[12px]" style={{ color: "var(--t4)" }}>
              {isSignUp ? "Have an account? " : "New here? "}
              <span onClick={() => { setIsSignUp(!isSignUp); setError(""); }} className="cursor-pointer font-medium" style={{ color: "var(--ac)" }}>{isSignUp ? "Sign in" : "Create account"}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
