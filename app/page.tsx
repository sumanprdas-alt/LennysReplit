"use client";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [name, setName] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  if (session) { router.push("/dashboard"); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    const result = await signIn("credentials", { email, password, name: isSignUp ? name : undefined, isSignUp: isSignUp ? "true" : "false", redirect: false });
    setLoading(false);
    if (result?.error) setError(result.error); else router.push("/onboarding");
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "var(--bg)", color: "var(--t1)" }}>
      <div className="absolute inset-0" style={{ backgroundImage: "url('/hero-bg.jpg')", backgroundSize: "110%", backgroundPosition: "center 60%", pointerEvents: "none" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(17,17,16,0.85) 0%, rgba(17,17,16,0.7) 40%, rgba(17,17,16,0.92) 100%)", pointerEvents: "none" }} />
      <div className="absolute inset-0 opacity-[.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", pointerEvents: "none" }} />

      {/* Nav — logo only */}
      <div className="flex items-center px-10 py-4 relative z-10 fade-up">
        <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[11px] font-medium" style={{ borderColor: "var(--ac)", color: "var(--ac)" }}>S</span>
        <span className="font-display text-[16px] font-medium ml-2">Sage</span>
      </div>

      {/* Hero — clean, no AI label */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 text-center" style={{ paddingTop: "4vh" }}>
        <h1 className="font-display text-[56px] md:text-[72px] font-normal leading-none tracking-tight fade-up-1" style={{ letterSpacing: "-2px", maxWidth: 700 }}>Strategic clarity<br/>for builders.</h1>
        <p className="text-[16px] md:text-[18px] mt-7 leading-relaxed max-w-[480px] fade-up-2" style={{ color: "var(--t3)" }}>Search, synthesize, and learn from the world's best product leaders.</p>

        {/* Auth buttons */}
        <div className="flex gap-3 mt-10 fade-up-3">
          <button onClick={() => { setIsSignUp(true); setShowAuth(true); }} className="px-8 py-3 rounded-xl text-[14px] font-medium cursor-pointer" style={{ background: "var(--ac)", color: "var(--bg)" }}>Sign up →</button>
          <button onClick={() => { setIsSignUp(false); setShowAuth(true); }} className="px-8 py-3 rounded-xl text-[14px] font-medium cursor-pointer" style={{ border: "1px solid var(--border2)", color: "var(--t2)" }}>Log in</button>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center pb-6 fade-up-4" style={{ paddingTop: "40px" }}>
        <p className="text-[11px]" style={{ color: "var(--t4)" }}>Powered with valuable insights from Lenny's Podcast</p>
      </div>

      {/* Auth modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }} onClick={e => { if (e.target === e.currentTarget) setShowAuth(false); }}>
          <div className="w-full max-w-[380px] mx-4 rounded-xl p-8" style={{ background: "var(--bg2)", border: "1px solid var(--border2)" }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[11px] font-medium" style={{ borderColor: "var(--ac)", color: "var(--ac)" }}>S</span>
                <span className="font-display text-[16px] font-medium">Sage</span>
              </div>
              <button onClick={() => setShowAuth(false)} className="text-lg cursor-pointer" style={{ color: "var(--t4)", background: "none", border: "none" }}>✕</button>
            </div>
            <h2 className="font-display text-[22px] font-normal mb-1">{isSignUp ? "Create your account" : "Welcome back"}</h2>
            <p className="text-[13px] mb-6" style={{ color: "var(--t3)" }}>{isSignUp ? "Start building clarity." : "Continue where you left off."}</p>
            <form onSubmit={handleSubmit} className="space-y-2.5">
              {isSignUp && <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--t1)" }} required />}
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--t1)" }} required />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--t1)" }} required minLength={6} />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-3 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50" style={{ background: "var(--ac)", color: "var(--bg)" }}>{loading ? "..." : isSignUp ? "Create account" : "Sign in"}</button>
            </form>
            <p className="text-center mt-4 text-xs" style={{ color: "var(--t4)" }}>{isSignUp ? "Have an account? " : "New here? "}<span onClick={() => { setIsSignUp(!isSignUp); setError(""); }} className="cursor-pointer font-medium" style={{ color: "var(--ac)" }}>{isSignUp ? "Sign in" : "Create account"}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
