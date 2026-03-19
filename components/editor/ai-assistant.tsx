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

Generate exactly ${testCaseCount} diverse test cases for this problem.
Include simple, edge, and corner cases.

VERY IMPORTANT RULES FOR INPUT FORMAT:
- Input must be in standard competitive programming stdin format
- NOT in Python or LeetCode format like "nums = [1,2,3], target = 9"
- Use raw stdin format only
- For arrays: first line is size, second line is space separated elements
- For single values: just the value on one line
- Output must be in raw stdout format only
- Example correct input for two sum: "4\n2 7 11 15\n9"
- Example correct output for two sum: "0 1"
- All inputs and outputs must work directly with stdin and stdout in C++, Java, or Python

Respond ONLY in this exact JSON format with no extra text outside the JSON:
{
  "testCases": [
    {
      "input": "exact stdin input here",
      "expectedOutput": "exact stdout output here",
      "description": "what this tests"
    }
  ]
}`

    try {
      if (!window.puter) {
        throw new Error("AI not loaded yet. Please wait and try again.")
      }

      const response = await window.puter.ai.chat(prompt, {
        model: 'claude-sonnet-4-5'
      })

      console.log('Raw puter response:', JSON.stringify(response))

      const message = typeof response === 'string'
        ? response
        : response?.message?.content?.[0]?.text
          || response?.content?.[0]?.text
          || response?.text
          || JSON.stringify(response)
          || ''

      console.log('Extracted message:', message)

      const clean = message.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)

      const testCasesArray = parsed.testCases
        || parsed.test_cases
        || parsed
        || []

      const newTestCases: TestCase[] = Array.isArray(testCasesArray)
        ? testCasesArray.map((tc: any, i: number) => ({
            id: `tc_ai_${Date.now()}_${i}`,
            input: String(tc.input || ''),
            expectedOutput: String(
              tc.expectedOutput
              || tc.expected_output
              || tc.output
              || ''
            )
          }))
        : []

      if (newTestCases.length === 0) {
        throw new Error("No test cases generated. Try again.")
      }

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
