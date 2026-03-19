"use client"

import { useState } from "react"
import { Check, X, ChevronDown, ChevronUp } from "lucide-react"
import type { TestResult } from "@/lib/types"

interface ResultsPanelProps {
  results: TestResult[]
  consoleOutput: string
}

export function ResultsPanel({ results, consoleOutput }: ResultsPanelProps) {
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set())

  const passedCount = results.filter((r) => r.passed).length
  const totalCount = results.length
  const allPassed = passedCount === totalCount

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedResults)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedResults(newExpanded)
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="font-medium text-white">Results</h3>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            allPassed
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {passedCount} / {totalCount} Passed
        </span>
      </div>

      {/* Test Results */}
      <div className="divide-y divide-white/5">
        {results.map((result, index) => (
          <div
            key={result.id}
            className="animate-in fade-in slide-in-from-left-2"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <button
              onClick={() => toggleExpanded(result.id)}
              className={`w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors ${
                result.passed ? "text-green-400" : "text-red-400"
              }`}
            >
              <div className="flex items-center gap-3">
                {result.passed ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <X className="w-5 h-5" />
                )}
                <span className="font-medium">
                  Test Case {index + 1}
                </span>
                <span className="text-white/50">
                  — {result.passed ? "Passed" : "Failed"}
                </span>
              </div>
              {!result.passed && (
                expandedResults.has(result.id) ? (
                  <ChevronUp className="w-4 h-4 text-white/50" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/50" />
                )
              )}
            </button>

            {/* Expanded Details */}
            {!result.passed && expandedResults.has(result.id) && (
              <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-black/30 rounded-lg p-4 font-mono text-sm">
                  <div className="mb-3">
                    <span className="text-white/50">Input:</span>
                    <pre className="text-white/80 mt-1">{result.input || "(empty)"}</pre>
                  </div>
                  <div className="mb-3">
                    <span className="text-green-400/70">Expected:</span>
                    <pre className="text-green-400 mt-1">{result.expectedOutput || "(empty)"}</pre>
                  </div>
                  <div>
                    <span className="text-red-400/70">Got:</span>
                    <pre className="text-red-400 mt-1">{result.actualOutput || "(empty)"}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Console Output */}
      {consoleOutput && (
        <div className="border-t border-white/10 p-4">
          <h4 className="text-sm font-medium text-white/70 mb-2">Console Output</h4>
          <pre className="bg-black/30 rounded-lg p-4 text-sm font-mono text-white/70 overflow-x-auto">
            {consoleOutput}
          </pre>
        </div>
      )}
    </div>
  )
}
