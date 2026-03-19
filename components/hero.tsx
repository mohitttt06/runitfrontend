"use client"

import { useRouter } from "next/navigation"
import { WebGLShader } from "@/components/ui/web-gl-shader"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

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
    <div className="min-h-screen overflow-hidden bg-black flex items-center justify-center">
      <WebGLShader />
      
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white">
          Stop Guessing. Start Testing.
        </h1>
        
        <p className="mt-6 text-lg sm:text-xl md:text-2xl text-white/60 max-w-xl mx-auto">
          Write code and validate it with your own test cases — instantly.
        </p>
        
        <Button
          onClick={handleStartCoding}
          disabled={isLoading}
          className="mt-10 px-8 py-6 text-lg rounded-full text-white border border-white/20 bg-white/10 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-transform duration-300 ease-out disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Start Coding"}
        </Button>
      </div>
    </div>
  )
}
