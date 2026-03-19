"use client"

import { useState, useEffect, useRef } from "react"
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AIAssistantProps {
  problemDescription: string
  code: string
}

interface TestCase {
  input: string
  expectedOutput: string
  description: string
}

declare global {
  interface Window {
    puter: any
  }
}

export function AIAssistant({ problemDescription, code }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCountModal, setShowCountModal] = useState(false)
  const [testCaseCount, setTestCaseCount] = useState("5")
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [generatedCases, setGeneratedCases] = useState<TestCase[]>([])

  // Load Puter script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://js.puter.com/v2/'
    script.async = true
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
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
${code ? `User's Code:\n${code}` : ''}

Generate exactly ${testCaseCount} diverse test cases for this problem.
Include simple cases, edge cases, and corner cases.

Respond ONLY in this exact JSON format with no extra text:
{
  "testCases": [
    {
      "input": "exact input here",
      "expectedOutput": "exact expected output here",
      "description": "what this case tests"
    }
  ]
}`

    try {
      const response = await window.puter.ai.chat(prompt, {
        model: 'claude-sonnet-4-5'
      })

      const message = typeof response === 'string' 
        ? response 
        : response?.message?.content?.[0]?.text || ''

      const clean = message.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)

      setGeneratedCases(parsed.testCases || [])
      setSuccessMessage(`✨ ${parsed.testCases?.length || 0} test cases generated!`)

    } catch (error) {
      console.error('Puter error:', error)
      setErrorMessage("Failed to generate. Try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
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

      {/* Content */}
      {isOpen && (
        <div className="p-4 pt-0">
          <p className="text-white/50 text-xs mb-4">
            Paste your problem description above and click generate. AI will create test cases automatically.
          </p>

          <Button
            onClick={handleGenerateClick}
            disabled={isGenerating}
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

          {generatedCases.length > 0 && (
            <div className="mt-4 flex flex-col gap-3">
              <p className="text-white/60 text-xs font-medium">Generated Test Cases:</p>
              {generatedCases.map((tc, index) => (
                <div key={index} className="bg-black/30 rounded-lg p-3 border border-white/5">
                  <p className="text-yellow-400 text-xs font-medium mb-1">
                    Test Case {index + 1} — {tc.description}
                  </p>
                  <p className="text-white/50 text-xs">Input: {tc.input}</p>
                  <p className="text-white/50 text-xs">Expected: {tc.expectedOutput}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Count Modal */}
      {showCountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-80 flex flex-col gap-4">
            <h3 className="text-white font-semibold text-lg">Generate Test Cases</h3>
            <p className="text-white/50 text-sm">How many test cases do you want to generate?</p>
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
