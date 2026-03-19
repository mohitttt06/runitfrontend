"use client"

import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { TestCase } from "@/lib/types"

interface TestCaseManagerProps {
  testCases: TestCase[]
  onUpdate: (testCases: TestCase[]) => void
}

export function TestCaseManager({ testCases, onUpdate }: TestCaseManagerProps) {
  const addTestCase = () => {
    const newTestCase: TestCase = {
      id: "tc_" + Math.random().toString(36).substr(2, 9),
      input: "",
      expectedOutput: "",
    }
    onUpdate([...testCases, newTestCase])
  }

  const removeTestCase = (id: string) => {
    if (testCases.length > 1) {
      onUpdate(testCases.filter((tc) => tc.id !== id))
    }
  }

  const updateTestCase = (id: string, field: "input" | "expectedOutput", value: string) => {
    onUpdate(
      testCases.map((tc) =>
        tc.id === id ? { ...tc, [field]: value } : tc
      )
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider">
        Test Cases
      </h3>

      <div className="flex flex-col gap-4">
        {testCases.map((testCase, index) => (
          <div
            key={testCase.id}
            className="bg-white/5 border border-white/10 rounded-xl p-4 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">
                Test Case {index + 1}
              </span>
              {testCases.length > 1 && (
                <button
                  onClick={() => removeTestCase(testCase.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Input</label>
                <Textarea
                  value={testCase.input}
                  onChange={(e) => updateTestCase(testCase.id, "input", e.target.value)}
                  placeholder="Enter input..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-lg text-sm font-mono min-h-[60px] resize-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Expected Output</label>
                <Textarea
                  value={testCase.expectedOutput}
                  onChange={(e) => updateTestCase(testCase.id, "expectedOutput", e.target.value)}
                  placeholder="Enter expected output..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-lg text-sm font-mono min-h-[60px] resize-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={addTestCase}
        variant="ghost"
        className="border-2 border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 hover:bg-transparent rounded-xl h-12 transition-all"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Test Case
      </Button>
    </div>
  )
}
