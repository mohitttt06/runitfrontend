"use client"

import { useState, useEffect } from "react"
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TestCase } from "@/lib/types"

interface AIAssistantProps {
  problemDescription: string
  code: string
  existingTestCases: TestCase[]
  onTestCasesGenerated: (testCases: TestCase[]) => void
}

declare global {
  interface Window {
    puter: any
  }
}

export function AIAssistant({
  problemDescription,
  code,
  existingTestCases,
  onTestCasesGenerated
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCountModal, setShowCountModal] = useState(false)
  const [testCaseCount, setTestCaseCount] = useState("5")
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [puterReady, setPuterReady] = useState(false)

  useEffect(() => {
    if (document.querySelector('script[src="https://js.puter.com/v2/"]')) {
      setPuterReady(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://js.puter.com/v2/'
    script.async = true
    script.onload = () => setPuterReady(true)
    document.head.appendChild(script)
  }, [])

  const handleGenerateClick = () => {
    setShowCountModal(true)
    setSuccessMessage("")
    setErrorMessage("")
  }

  const handleGenerate = async () => {
    setShowCountModal(false)
    setIsGenerating(true)
    setSuccessMessage("")
    setErrorMessage("")

    const prompt = `You are a competitive programming assistant.
${problemDescription ? `Problem Statement:\n${problemDescription}` : ''}
${code ? `User Code:\n${code}` : ''}

Generate exactly ${testCaseCount} diverse test cases.
Include simple, edge, and corner cases.

Respond ONLY in this exact JSON format, no extra text:
{
  "testCases": [
    {
      "input": "exact input here",
      "expectedOutput": "exact output here",
      "description": "what this tests"
    }
  ]
}`

    try {
      if (!window.puter) {
        throw new Error("Puter not loaded yet. Try again.")
      }

      const response = await window.puter.ai.chat(prompt, {
        model: 'claude-sonnet-4-5'
      })

      const message = typeof response === 'string'
        ? response
        : response?.message?.content?.[0]?.text
          || response?.content?.[0]?.text
          || ''

      const clean = message.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)

      const newTestCases: TestCase[] = parsed.testCases.map((tc: any, i: number) => ({
        id: `tc_ai_${Date.now()}_${i}`,
        input: tc.input,
        expectedOutput: tc.expectedOutput
      }))

      // Append to existing test cases
      const combined = [...existingTestCases, ...newTestCases]
      onTestCasesGenerated(combined)

      setSuccessMessage(`✨ ${newTestCases.length} test cases added!`)

    } catch (error: any) {
      console.error('AI error:', error)
      setErrorMessage(error.message || "Failed to generate. Try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-white hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="font-medium">AI Test Case Generator</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-white/60" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/60" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 pt-0">
          <p className="text-white/50 text-xs mb-4">
            Paste your problem description above and click generate. AI will create test cases and add them automatically.
          </p>

          <Button
            onClick={handleGenerateClick}
            disabled={isGenerating || !puterReady}
            className="w-full rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 transition-all text-sm font-medium"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse [animation-delay:300ms]" />
                </span>
                Generating...
              </span>
            ) : !puterReady ? (
              "Loading AI..."
            ) : (
              "✨ Generate Test Cases"
            )}
          </Button>

          {successMessage && (
            <p className="text-green-400 text-xs mt-3 text-center">{successMessage}</p>
          )}
          {errorMessage && (
            <p className="text-red-400 text-xs mt-3 text-center">{errorMessage}</p>
          )}
        </div>
      )}

      {showCountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-80 flex flex-col gap-4">
            <h3 className="text-white font-semibold text-lg">Generate Test Cases</h3>
            <p className="text-white/50 text-sm">How many test cases do you want?</p>
            <input
              type="number"
              min="1"
              max="10"
              value={testCaseCount}
              onChange={(e) => setTestCaseCount(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
            />
            <div className="flex gap-3">
              <Button
                onClick={() => setShowCountModal(false)}
                className="flex-1 rounded-full bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                className="flex-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30"
              >
                Generate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
