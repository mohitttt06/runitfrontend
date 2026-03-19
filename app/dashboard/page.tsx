"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, FileCode2, Clock, Layers } from "lucide-react"
import { PageTransition } from "@/components/page-transition"
import { ProblemCard } from "@/components/problem-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth-context"
import { useProblems } from "@/lib/problems-context"

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { problems, isLoading, loadProblems } = useProblems()

  useEffect(() => {
    loadProblems()
  }, [])

  const handleNewProblem = () => {
    router.push("/editor")
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-black px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <p className="text-white/30 text-sm mb-1">{getGreeting()}</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              {user?.name || "Coder"}
            </h1>
            <p className="text-white/40 mt-2 text-sm">
              {problems.length > 0
                ? `You have ${problems.length} saved problem${problems.length > 1 ? "s" : ""}. Keep going.`
                : "Start your first problem and test your code properly."}
            </p>
          </div>

          {/* Stats Row */}
          {problems.length > 0 && (
            <div className="flex gap-4 mb-10">
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl px-5 py-3 flex items-center gap-3">
                <Layers className="w-4 h-4 text-white/40" />
                <div>
                  <p className="text-white font-semibold text-lg leading-none">{problems.length}</p>
                  <p className="text-white/30 text-xs mt-0.5">Problems</p>
                </div>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl px-5 py-3 flex items-center gap-3">
                <Clock className="w-4 h-4 text-white/40" />
                <div>
                  <p className="text-white font-semibold text-lg leading-none">
                    {problems.reduce((acc, p) => acc + (p.testCases?.length || 0), 0)}
                  </p>
                  <p className="text-white/30 text-xs mt-0.5">Test Cases</p>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-40 bg-white/5 rounded-2xl" />
              ))}
            </div>
          ) : problems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mb-6">
                <FileCode2 className="w-7 h-7 text-white/20" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">No problems yet</h2>
              <p className="text-white/30 text-sm mb-8 max-w-xs">
                Paste a problem from anywhere — YouTube, books, PDFs — and start testing your solution.
              </p>
              <Button
                onClick={handleNewProblem}
                className="rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20 px-6 py-3 font-medium transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start Coding
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* New Problem Card */}
              <button
                onClick={handleNewProblem}
                className="h-44 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 text-white/30 hover:text-white/60 hover:border-white/20 hover:bg-white/[0.02] transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl border border-dashed border-white/10 group-hover:border-white/20 flex items-center justify-center transition-all duration-300">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">New Problem</span>
              </button>

              {/* Problem Cards */}
              {problems.map((problem) => (
                <ProblemCard key={problem.id} problem={problem} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
