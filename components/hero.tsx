"use client"

import { useRouter } from "next/navigation"
import { WebGLShader } from "@/components/ui/web-gl-shader"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { Code2, Zap, Trophy, Github, Twitter, Layers, CheckCircle, Terminal } from "lucide-react"

export function Hero() {
  const router = useRouter()
  const { isLoggedIn, isLoading } = useAuth()

  const handleStartCoding = () => {
    if (isLoggedIn) {
      router.push("/dashboard")
    } else {
      router.push("/auth")
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-black/40 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">RunIt</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How It Works</a>
          <a href="#languages" className="hover:text-white transition-colors">Languages</a>
        </div>

        <Button
          onClick={handleStartCoding}
          disabled={isLoading}
          className="px-5 py-2 text-sm rounded-full text-white border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/15 hover:scale-105 active:scale-95 transition-all duration-300"
        >
          {isLoading ? "Loading..." : isLoggedIn ? "Dashboard" : "Get Started"}
        </Button>
      </nav>

      {/* HERO SECTION */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <WebGLShader />

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/50 text-xs mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Free to use · No setup required
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-none mb-6">
            Stop Guessing.<br />Start Testing.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/50 max-w-lg mx-auto mb-10">
            Write code, define your own test cases, and instantly see what passes and what fails.
          </p>

          <div className="flex items-center gap-4">
            <Button
              onClick={handleStartCoding}
              disabled={isLoading}
              className="px-8 py-6 text-base rounded-full text-white border border-white/20 bg-white/10 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:scale-105 hover:bg-white/15 active:scale-95 transition-all duration-300 ease-out disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Start Coding →"}
            </Button>
          </div>

          <p className="mt-6 text-white/25 text-xs">
            No account needed to explore · Sign up to save your work
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20 z-10">
          <span className="text-xs">Scroll to explore</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div id="features" className="relative z-10 bg-black py-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <p className="text-white/30 text-xs uppercase tracking-widest text-center mb-4">Why RunIt</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            Built for students who practice<br />outside of platforms
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Code2 className="w-5 h-5 text-white/70" />,
                title: "Write Your Own Problems",
                desc: "Paste any problem from YouTube, books, or PDFs and define it as your own coding challenge."
              },
              {
                icon: <Zap className="w-5 h-5 text-white/70" />,
                title: "AI Test Case Generator",
                desc: "Paste the problem statement and let AI generate diverse test cases — simple, edge, and corner cases automatically."
              },
              {
                icon: <Trophy className="w-5 h-5 text-white/70" />,
                title: "Instant Pass / Fail Results",
                desc: "Run your code against all test cases at once and see exactly which ones pass and which ones fail."
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:bg-white/[0.05] transition-all duration-300 hover:border-white/10"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS SECTION */}
      <div id="how" className="relative z-10 bg-black py-24 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <p className="text-white/30 text-xs uppercase tracking-widest text-center mb-4">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            From problem to solution<br />in four steps
          </h2>

          <div className="flex flex-col gap-6">
            {[
              { step: "01", title: "Paste your problem", desc: "Write or paste any coding problem description into the editor." },
              { step: "02", title: "Generate or add test cases", desc: "Use AI to auto-generate test cases or add them manually with inputs and expected outputs." },
              { step: "03", title: "Write your solution", desc: "Code your solution in any supported language inside the built-in editor." },
              { step: "04", title: "Run and see results", desc: "Click Run Code and instantly see which test cases pass ✅ or fail ❌ with detailed output." },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.04] transition-all duration-300"
              >
                <span className="text-4xl font-black text-white/10 leading-none mt-1">{item.step}</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LANGUAGES SECTION */}
      <div id="languages" className="relative z-10 bg-black py-24 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-4">Supported Languages</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">
            Code in your language
          </h2>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: "Python", color: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
              { name: "C++", color: "bg-orange-500/10 border-orange-500/20 text-orange-400" },
              { name: "C", color: "bg-zinc-500/10 border-zinc-500/20 text-zinc-400" },
              { name: "Java", color: "bg-red-500/10 border-red-500/20 text-red-400" },
              { name: "JavaScript", color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" },
              { name: "Go", color: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" },
              { name: "Rust", color: "bg-orange-600/10 border-orange-600/20 text-orange-500" },
              { name: "TypeScript", color: "bg-blue-400/10 border-blue-400/20 text-blue-300" },
              { name: "Kotlin", color: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
              { name: "Swift", color: "bg-pink-500/10 border-pink-500/20 text-pink-400" },
              { name: "PHP", color: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" },
              { name: "Ruby", color: "bg-red-600/10 border-red-600/20 text-red-500" },
            ].map((lang, i) => (
              <span
                key={i}
                className={`px-4 py-2 rounded-full border text-sm font-medium ${lang.color}`}
              >
                {lang.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA SECTION */}
      <div className="relative z-10 bg-black py-24 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to test your code?
          </h2>
          <p className="text-white/40 mb-10">
            Stop submitting solutions you're not confident about. Start testing properly.
          </p>
          <Button
            onClick={handleStartCoding}
            disabled={isLoading}
            className="px-10 py-6 text-base rounded-full text-white border border-white/20 bg-white/10 backdrop-blur-md hover:scale-105 hover:bg-white/15 active:scale-95 transition-all duration-300"
          >
            {isLoading ? "Loading..." : "Start Coding for Free →"}
          </Button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 bg-black border-t border-white/5 py-10 px-6 md:px-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-white/10 border border-white/20 flex items-center justify-center">
              <Terminal className="w-3 h-3 text-white" />
            </div>
            <span className="text-white/60 text-sm font-medium">RunIt</span>
          </div>

          <p className="text-white/25 text-xs text-center">
            Built for students who practice coding problems outside of platforms.
          </p>

          <div className="flex items-center gap-4 text-white/30 text-xs">
            <span>Free to use</span>
            <span>·</span>
            <span>No ads</span>
            <span>·</span>
            <span>Open source</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
