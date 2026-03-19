"use client"

import { useRef, useEffect, useState } from "react"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
}

export function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const [lineCount, setLineCount] = useState(1)

  useEffect(() => {
    const lines = value.split("\n").length
    setLineCount(Math.max(lines, 25))
  }, [value])

  // Sync scroll between line numbers and textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const target = e.target as HTMLTextAreaElement
      const start = target.selectionStart
      const end = target.selectionEnd
      const newValue = value.substring(0, start) + "  " + value.substring(end)
      onChange(newValue)
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2
      }, 0)
    }

    // Auto close brackets
    const pairs: Record<string, string> = {
      "(": ")",
      "{": "}",
      "[": "]",
      '"': '"',
      "'": "'",
    }
    if (pairs[e.key]) {
      e.preventDefault()
      const target = e.target as HTMLTextAreaElement
      const start = target.selectionStart
      const end = target.selectionEnd
      const newValue =
        value.substring(0, start) +
        e.key +
        pairs[e.key] +
        value.substring(end)
      onChange(newValue)
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 1
      }, 0)
    }
  }

  const placeholder = `// Write your ${language} solution here...`

  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#0d0d0d]">

      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/40 border border-red-500/20" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/40 border border-yellow-500/20" />
          <div className="w-3 h-3 rounded-full bg-green-500/40 border border-green-500/20" />
        </div>
        <span className="text-white/20 text-xs font-mono">
          solution.{language === "cpp" ? "cpp" : language === "python" ? "py" : language === "java" ? "java" : language === "javascript" ? "js" : language === "typescript" ? "ts" : language === "go" ? "go" : language === "rust" ? "rs" : language === "c" ? "c" : "txt"}
        </span>
        <div className="w-16" />
      </div>

      {/* Editor Body */}
      <div className="flex overflow-hidden" style={{ minHeight: "420px" }}>

        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className="flex-shrink-0 overflow-hidden select-none"
          style={{
            width: "48px",
            background: "#0d0d0d",
            borderRight: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div className="py-4 px-2">
            {Array.from({ length: lineCount }, (_, i) => (
              <div
                key={i}
                className="text-right font-mono text-xs leading-6"
                style={{ color: "rgba(255,255,255,0.15)" }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          className="flex-1 bg-transparent text-white/85 placeholder:text-white/15 font-mono text-sm leading-6 p-4 resize-none outline-none w-full"
          style={{
            minHeight: "420px",
            caretColor: "#60a5fa",
            tabSize: 2,
          }}
        />
      </div>
    </div>
  )
}
