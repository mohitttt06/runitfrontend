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

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    const start = target.selectionStart
    const end = target.selectionEnd

    if (e.key === "Tab") {
      e.preventDefault()
      const newValue = value.substring(0, start) + "  " + value.substring(end)
      onChange(newValue)
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2
      }, 0)
    }

    if (e.key === "Enter") {
      e.preventDefault()
      const lines = value.substring(0, start).split("\n")
      const currentLine = lines[lines.length - 1]
      const indentMatch = currentLine.match(/^(\s+)/)
      const indent = indentMatch ? indentMatch[1] : ""
      const lastChar = value.substring(0, start).trim().slice(-1)
      const extraIndent = ["{", "(", "["].includes(lastChar) ? "  " : ""
      const newValue = value.substring(0, start) + "\n" + indent + extraIndent + value.substring(end)
      onChange(newValue)
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 1 + indent.length + extraIndent.length
      }, 0)
    }

    const pairs: Record<string, string> = { "{": "}", "(": ")", "[": "]" }
    if (pairs[e.key] && start === end) {
      e.preventDefault()
      const newValue = value.substring(0, start) + e.key + pairs[e.key] + value.substring(end)
      onChange(newValue)
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 1
      }, 0)
    }
  }

  const getLanguageColor = () => {
    const colors: Record<string, string> = {
      cpp: "#f97316",
      c: "#94a3b8",
      python: "#60a5fa",
      javascript: "#fbbf24",
      typescript: "#60a5fa",
      java: "#f87171",
      go: "#34d399",
      rust: "#fb923c",
      kotlin: "#a78bfa",
      swift: "#f472b6",
    }
    return colors[language] || "#94a3b8"
  }

  const getFileExtension = () => {
    const exts: Record<string, string> = {
      cpp: "cpp", c: "c", python: "py", javascript: "js",
      typescript: "ts", java: "java", go: "go", rust: "rs",
      kotlin: "kt", swift: "swift", php: "php", ruby: "rb"
    }
    return exts[language] || "txt"
  }

  // Simple syntax highlighting
  const highlightCode = (code: string) => {
    if (!code) return ""

    const keywords: Record<string, string[]> = {
      cpp: ["int", "void", "return", "if", "else", "for", "while", "do", "break", "continue", "include", "using", "namespace", "std", "cout", "cin", "endl", "auto", "const", "class", "struct", "bool", "true", "false", "nullptr", "new", "delete", "public", "private", "string", "vector", "map", "unordered_map", "pair", "long", "char", "double", "float", "main"],
      c: ["int", "void", "return", "if", "else", "for", "while", "do", "break", "continue", "include", "printf", "scanf", "char", "float", "double", "long", "struct", "typedef", "const", "NULL", "malloc", "free", "sizeof"],
      python: ["def", "return", "if", "elif", "else", "for", "while", "in", "not", "and", "or", "import", "from", "class", "True", "False", "None", "print", "range", "len", "break", "continue", "pass", "lambda", "with", "as", "try", "except", "finally", "raise", "global", "self"],
      javascript: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "break", "continue", "class", "new", "this", "import", "export", "default", "true", "false", "null", "undefined", "typeof", "instanceof", "console", "log", "async", "await", "try", "catch"],
      java: ["int", "void", "return", "if", "else", "for", "while", "break", "continue", "class", "public", "private", "static", "new", "this", "true", "false", "null", "import", "package", "String", "boolean", "long", "double", "float", "char", "System", "out", "println"],
    }

    const langKeywords = keywords[language] || keywords.cpp

    let escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")

    // Comments
    escaped = escaped.replace(/(\/\/[^\n]*)/g, '<span style="color:#6b7280;font-style:italic">$1</span>')
    escaped = escaped.replace(/(#[^\n]*)/g, '<span style="color:#6b7280;font-style:italic">$1</span>')

    // Strings
    escaped = escaped.replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color:#86efac">$1</span>')
    escaped = escaped.replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color:#86efac">$1</span>')

    // Numbers
    escaped = escaped.replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#fb923c">$1</span>')

    // Keywords
    langKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'g')
      escaped = escaped.replace(regex, '<span style="color:#c084fc">$1</span>')
    })

    // Function calls
    escaped = escaped.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, '<span style="color:#60a5fa">$1</span>')

    // Types/Classes (PascalCase)
    escaped = escaped.replace(/\b([A-Z][a-zA-Z0-9_]*)\b/g, '<span style="color:#34d399">$1</span>')

    return escaped
  }

  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.08]" style={{ background: "#0d0d0f" }}>

      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]" style={{ background: "#111114" }}>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
        </div>
        <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
          solution.{getFileExtension()}
        </span>
        <span
          className="text-xs font-mono px-2 py-0.5 rounded-full border"
          style={{
            color: getLanguageColor(),
            borderColor: getLanguageColor() + "30",
            background: getLanguageColor() + "10"
          }}
        >
          {language}
        </span>
      </div>

      {/* Editor Body */}
      <div className="relative flex" style={{ minHeight: "450px" }}>

        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className="flex-shrink-0 overflow-hidden select-none py-4 px-3"
          style={{
            width: "52px",
            background: "#0d0d0f",
            borderRight: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i}
              className="text-right font-mono text-xs leading-6"
              style={{ color: "rgba(255,255,255,0.12)" }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Syntax Highlighted Display */}
        <div
          className="absolute left-[52px] top-0 right-0 bottom-0 py-4 px-4 font-mono text-sm leading-6 pointer-events-none overflow-hidden whitespace-pre"
          style={{ color: "rgba(255,255,255,0.85)" }}
          dangerouslySetInnerHTML={{
            __html: highlightCode(value) || `<span style="color:rgba(255,255,255,0.15)">// Write your ${language} solution here...</span>`
          }}
        />

        {/* Actual Textarea (transparent, on top) */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          className="flex-1 bg-transparent outline-none font-mono text-sm leading-6 py-4 px-4 resize-none w-full"
          style={{
            minHeight: "450px",
            caretColor: "#60a5fa",
            color: "transparent",
            tabSize: 2,
          }}
        />
      </div>
    </div>
  )
}
