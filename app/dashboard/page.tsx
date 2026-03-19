"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, FileCode2 } from "lucide-react"
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

  return (
    <PageTransition>
      <div className="min-h-screen bg-black px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Welcome back, {user?.name || "Coder"} 
            </h1>
            <p className="text-white/60 mt-2">
              Pick up where you left off or start something new.
            </p>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-40 bg-white/5 rounded-2xl"
                />
              ))}
            </div>
          ) : problems.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <FileCode2 className="w-10 h-10 text-white/40" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                No problems yet
              </h2>
              <p className="text-white/60 mb-6">
                Start your first one!
              </p>
              <Button
                onClick={handleNewProblem}
                className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 font-medium transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5 mr-2" />
                Start Coding
              </Button>
            </div>
          ) : (
            /* Problem Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* New Problem Card */}
              <button
                onClick={handleNewProblem}
                className="h-40 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-3 text-white/60 hover:text-white hover:border-white/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-8 h-8" />
                <span className="font-medium">New Problem</span>
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
