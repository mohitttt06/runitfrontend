"use client"

import { useState, useEffect, useRef } from "react"
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

type AIMode = "explain" | "hint" | "review" | "debug"

interface AIAssistantProps {
  problemDescription: string
  code: string
}

const AI_RESPONSES: Record<AIMode, string[]> = {
  explain: [
    "This problem asks you to process input data and produce a specific output based on certain rules or algorithms.",
    "Key concepts to consider: data structures, algorithmic complexity, and edge cases.",
    "Start by understanding what inputs you'll receive and what output format is expected.",
  ],
  hint: [
    "Consider breaking the problem into smaller subproblems.",
    "Think about what data structure would be most efficient for this task.",
    "Have you considered edge cases like empty input or very large numbers?",
  ],
  review: [
    "Your code structure looks good. Here are some observations:",
    "Consider adding input validation to handle edge cases.",
    "The time complexity appears to be O(n). For large inputs, this should perform well.",
    "You might want to add comments to improve readability.",
  ],
  debug: [
    "Let me analyze your code for potential issues...",
    "Check your loop boundaries - off-by-one errors are common.",
    "Verify that all variables are properly initialized before use.",
    "Make sure you're handling the output format correctly.",
  ],
}

export function AIAssistant({ problemDescription, code }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMode, setSelectedMode] = useState<AIMode | null>(null)
  const [response, setResponse] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const responseRef = useRef<HTMLDivElement>(null)

  const modes: { value: AIMode; label: string }[] = [
    { value: "explain", label: "Explain Problem" },
    { value: "hint", label: "Give Hint" },
    { value: "review", label: "Review Code" },
    { value: "debug", label: "Debug Error" },
  ]

  const handleModeSelect = async (mode: AIMode) => {
    setSelectedMode(mode)
    setResponse("")
    setIsTyping(true)

    // Get response for this mode
    const responses = AI_RESPONSES[mode]
    const fullResponse = responses.join("\n\n")

    // Typewriter effect
    let currentIndex = 0
    const typeInterval = setInterval(() => {
      if (currentIndex <= fullResponse.length) {
        setResponse(fullResponse.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typeInterval)
        setIsTyping(false)
      }
    }, 20)

    return () => clearInterval(typeInterval)
  }

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight
    }
  }, [response])

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-white hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="font-medium">AI Assistant</span>
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
          {/* Mode Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {modes.map((mode) => (
              <Button
                key={mode.value}
                onClick={() => handleModeSelect(mode.value)}
                variant="ghost"
                size="sm"
                className={`rounded-full text-xs ${
                  selectedMode === mode.value
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                    : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                } border transition-all`}
              >
                {mode.label}
              </Button>
            ))}
          </div>

          {/* Response Area */}
          {selectedMode && (
            <div
              ref={responseRef}
              className="bg-black/30 rounded-lg p-4 max-h-48 overflow-y-auto"
            >
              <p className="text-white/70 text-sm whitespace-pre-wrap">
                {response}
                {isTyping && (
                  <span className="inline-flex gap-1 ml-1">
                    <span className="w-1 h-1 bg-white/60 rounded-full animate-pulse" />
                    <span className="w-1 h-1 bg-white/60 rounded-full animate-pulse [animation-delay:150ms]" />
                    <span className="w-1 h-1 bg-white/60 rounded-full animate-pulse [animation-delay:300ms]" />
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
