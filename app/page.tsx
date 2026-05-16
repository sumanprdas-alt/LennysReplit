"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

function Mark({ s = 22 }: { s?: number }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 3L4 9v6l8 6 8-6V9l-8-6z" stroke="#8B9A6B" strokeWidth="1.2" fill="rgba(139,154,107,0.08)"/><circle cx="12" cy="12" r="2" fill="#8B9A6B" opacity=".6"/></svg>;
}

export default function LandingPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [name, setName] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    const result = await signIn("credentials", { email, password, name: isSignUp ? name : undefined, isSignUp: isSignUp ? "true" : "false", redirect: false });
    setLoading(false);
    if (result?.error) setError(result.error);
    else router.push("/onboarding");
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "var(--bg)", color: "var(--t1)" }}>
      {/* Background image */}
      <div className="absolute inset-0" style={{ backgroundImage: "url('/hero-bg.jpg')", backgroundSize: "cover", backgroundPosition: "center 40%", pointerEvents: "none" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(28,28,26,0.78) 0%, rgba(28,28,26,0.65) 40%, rgba(28,28,26,0.85) 100%)", pointerEvents: "none" }} />
      <div className="absolute inset-0 opacity-[.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", pointerEvents: "none" }} />

      {/* Nav */}
      <div className="flex items-center px-10 py-3.5 border-b relative z-10 fade-up" style={{ borderColor: "var(--border)" }}>
        <Mark /><span className="font-display text-[16px] font-medium ml-2" style={{ color: "var(--t1)" }}>Sage</span>
        <div className="flex gap-5 ml-8">
          {["Product","Reflections","About","Pricing"].map(l => <span key={l} className="text-[13px] cursor-pointer" style={{ color: "var(--t3)" }}>{l}</span>)}
        </div>
        <button onClick={() => setIsSignUp(!isSignUp)} className="ml-auto px-[18px] py-1.5 rounded-md text-xs font-medium cursor-pointer" style={{ color: "var(--t1)", background: "transparent", border: "0.5px solid var(--border)" }}>Sign in</button>
      </div>

      {/* Content — centered lower */}
      <div className="flex-1 flex items-center relative z-10 px-12 max-w-[1100px] mx-auto w-full" style={{ paddingTop: "16vh" }}>
        <div>
          <p className="font-mono text-[10px] tracking-[1.5px] mb-4 fade-up" style={{ color: "var(--t3)" }}>AI STRATEGIC ADVISOR FOR BUILDERS</p>
          <h1 className="font-display text-[72px] font-normal leading-none tracking-tight fade-up-1" style={{ color: "var(--t1)", letterSpacing: "-2px", maxWidth: 600 }}>Strategic clarity<br/>for builders.</h1>
          <p className="text-[16px] mt-7 leading-relaxed max-w-[440px] fade-up-2" style={{ color: "var(--t2)" }}>Sage combines timeless wisdom with modern patterns to help founders and product leaders make better decisions and build enduring companies.</p>
          <form onSubmit={handleSubmit} className="mt-8 fade-up-3">
            <div className="flex gap-3 items-start">
              <div className="flex flex-col gap-2 w-[240px]">
                {isSignUp && <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="px-3.5 py-2.5 rounded-md text-[13px] outline-none" style={{ background: "var(--bg2)", border: "0.5px solid var(--border)", color: "var(--t1)" }} />}
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="px-3.5 py-2.5 rounded-md text-[13px] outline-none" style={{ background: "var(--bg2)", border: "0.5px solid var(--border)", color: "var(--t1)" }} required />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="px-3.5 py-2.5 rounded-md text-[13px] outline-none" style={{ background: "var(--bg2)", border: "0.5px solid var(--border)", color: "var(--t1)" }} required />
              </div>
              <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-md text-[13px] font-medium cursor-pointer disabled:opacity-50" style={{ background: "var(--ac)", color: "var(--bg)" }}>{loading ? "..." : isSignUp ? "Create account" : "Sign in"}</button>
            </div>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            <p className="text-xs mt-3" style={{ color: "var(--t4)" }}>{isSignUp ? "Have an account? " : "New? "}<span onClick={() => { setIsSignUp(!isSignUp); setError(""); }} className="cursor-pointer font-medium" style={{ color: "var(--ac)" }}>{isSignUp ? "Sign in" : "Create account"}</span></p>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center fade-up-4" style={{ padding: "40px 48px 24px" }}>
        <p className="text-[10px]" style={{ color: "var(--t4)" }}>Powered with valuable insights from Lenny's Podcast</p>
      </div>
    </div>
  );
}
