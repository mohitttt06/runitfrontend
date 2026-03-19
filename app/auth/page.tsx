"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { WebGLShader } from "@/components/ui/web-gl-shader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageTransition } from "@/components/page-transition"
import { useAuth } from "@/lib/auth-context"
import { Spinner } from "@/components/ui/spinner"

type AuthMode = "login" | "signup"

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export default function AuthPage() {
  const router = useRouter()
  const { login, signup, isLoggedIn, isLoading: authLoading } = useAuth()
  
  const [mode, setMode] = useState<AuthMode>("login")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showConfirmation, setShowConfirmation] = useState(false)
  
  // Form fields
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn && !authLoading) {
      router.push("/dashboard")
    }
  }, [isLoggedIn, authLoading, router])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (mode === "signup" && !name.trim()) {
      newErrors.name = "Name is required"
    }
    
    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format"
    }
    
    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    
    if (mode === "signup") {
      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password"
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    setErrors({})
    
    if (mode === "login") {
      const result = await login(email, password)
      setIsSubmitting(false)
      
      if (result.success) {
        router.push("/dashboard")
      } else {
        setErrors({ general: result.error || "Authentication failed. Please try again." })
      }
    } else {
      const result = await signup(name, email, password)
      setIsSubmitting(false)
      
      if (result.success) {
        if (result.needsConfirmation) {
          setShowConfirmation(true)
        } else {
          router.push("/dashboard")
        }
      } else {
        setErrors({ general: result.error || "Signup failed. Please try again." })
      }
    }
  }

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login")
    setErrors({})
    setShowConfirmation(false)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner className="w-8 h-8 text-white" />
      </div>
    )
  }

  if (showConfirmation) {
    return (
      <PageTransition>
        <div className="min-h-screen overflow-hidden bg-black flex items-center justify-center p-4">
          <WebGLShader />
          
          <div className="relative z-10 w-full max-w-md">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-white/60 mb-6">
                We sent a confirmation link to <span className="text-white">{email}</span>. 
                Click the link to verify your account.
              </p>
              <Button
                onClick={() => {
                  setShowConfirmation(false)
                  setMode("login")
                }}
                className="w-full h-12 rounded-full text-white border border-white/20 bg-white/10 backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen overflow-hidden bg-black flex items-center justify-center p-4">
        <WebGLShader />
        
        <div className="relative z-10 w-full max-w-md">
          {/* Card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white tracking-tight">RunIt</h1>
              <p className="text-white/60 mt-2">
                {mode === "login" ? "Welcome back!" : "Create your account"}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-white/5 rounded-full p-1 mb-6">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 ${
                  mode === "login"
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 ${
                  mode === "signup"
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
                <p className="text-red-400 text-sm text-center">{errors.general}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === "signup" && (
                <div>
                  <Input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl h-12 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
              )}

              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl h-12 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl h-12 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {mode === "signup" && (
                <div>
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl h-12 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 h-12 rounded-full text-white border border-white/20 bg-white/10 backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <Spinner className="w-5 h-5" />
                ) : (
                  "Start Coding"
                )}
              </Button>
            </form>

            {/* Toggle Link */}
            <p className="text-center text-white/60 text-sm mt-6">
              {mode === "login" ? (
                <>
                  New here?{" "}
                  <button
                    onClick={switchMode}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={switchMode}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Log in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
