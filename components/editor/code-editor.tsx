"use client"

import { useRef, useEffect, useState } from "react"
import { Textarea } from "@/components/ui/textarea"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
}

export function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [lineCount, setLineCount] = useState(1)

  useEffect(() => {
    const lines = value.split("\n").length
    setLineCount(Math.max(lines, 20))
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const target = e.target as HTMLTextAreaElement
      const start = target.selectionStart
      const end = target.selectionEnd
      
      const newValue = value.substring(0, start) + "  " + value.substring(end)
      onChange(newValue)
      
      // Set cursor position after the inserted tab
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2
      }, 0)
    }
  }

  const placeholder = `// Write your ${language} solution here...`

  return (
    <div className="relative bg-white/5 border border-white/10 rounded-xl overflow-hidden flex">
      {/* Line Numbers */}
      <div className="flex-shrink-0 bg-white/[0.02] border-r border-white/10 px-3 py-4 select-none">
        <div className="flex flex-col items-end">
          {Array.from({ length: lineCount }, (_, i) => (
            <span
              key={i}
              className="text-white/30 text-sm font-mono leading-6"
            >
              {i + 1}
            </span>
          ))}
        </div>
      </div>

      {/* Editor */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-0 text-white/90 placeholder:text-white/30 font-mono text-sm leading-6 p-4 resize-none min-h-[400px] focus-visible:ring-0 focus-visible:ring-offset-0"
        spellCheck={false}
      />
    </div>
  )
}
