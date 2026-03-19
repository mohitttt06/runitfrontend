"use client"

import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import type { Problem } from "@/lib/types"
import { LANGUAGES } from "@/lib/types"

interface ProblemCardProps {
  problem: Problem
}

export function ProblemCard({ problem }: ProblemCardProps) {
  const router = useRouter()
  
  const language = LANGUAGES.find((l) => l.value === problem.language)
  const testCaseCount = problem.testCases.length

  const handleClick = () => {
    router.push(`/editor/${problem.id}`)
  }

  return (
    <button
      onClick={handleClick}
      className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07] w-full"
    >
      {/* Title */}
      <h3 className="text-lg font-semibold text-white truncate pr-4">
        {problem.title || "Untitled Problem"}
      </h3>

      {/* Language Badge */}
      <div className="mt-3 flex items-center gap-2">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
            language?.color || "bg-gray-500"
          }`}
        >
          {language?.label || "Unknown"}
        </span>
      </div>

      {/* Meta Info */}
      <div className="mt-4 flex items-center gap-4 text-sm text-white/50">
        <span>
          {formatDistanceToNow(new Date(problem.lastEdited), { addSuffix: true })}
        </span>
        <span>{testCaseCount} test case{testCaseCount !== 1 ? "s" : ""}</span>
      </div>

      {/* Continue Button - appears on hover */}
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <div className="bg-blue-500 text-white text-center py-2 rounded-xl text-sm font-medium">
          Continue
        </div>
      </div>
    </button>
  )
}
