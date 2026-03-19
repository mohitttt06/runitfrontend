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
  const [highlighted, setHighlighted] = useState("")

  useEffect(() => {
    const lines = value.split("\n").length
    setLineCount(Math.max(lines, 25))
    setHighlighted(highlightCode(value))
  }, [value, language])

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
      cpp: "#f97316", c: "#94a3b8", python: "#60a5fa",
      javascript: "#fbbf24", typescript: "#60a5fa",
      java: "#f87171", go: "#34d399", rust: "#fb923c",
      kotlin: "#a78bfa", swift: "#f472b6",
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

  const highlightCode = (code: string): string => {
    if (!code) return ""

    const keywords: Record<string, string[]> = {
      cpp: ["int", "void", "return", "if", "else", "for", "while", "do", "break", "continue", "using", "namespace", "std", "cout", "cin", "endl", "auto", "const", "class", "struct", "bool", "true", "false", "nullptr", "new", "delete", "public", "private", "protected", "long", "char", "double", "float", "short", "unsigned", "signed", "static", "inline", "virtual", "override", "template", "typename"],
      c: ["int", "void", "return", "if", "else", "for", "while", "do", "break", "continue", "printf", "scanf", "char", "float", "double", "long", "short", "unsigned", "signed", "struct", "typedef", "const", "static", "NULL", "malloc", "free", "sizeof", "enum"],
      python: ["def", "return", "if", "elif", "else", "for", "while", "in", "not", "and", "or", "import", "from", "class", "True", "False", "None", "print", "range", "len", "break", "continue", "pass", "lambda", "with", "as", "try", "except", "finally", "raise", "global", "self", "yield"],
      javascript: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "break", "continue", "class", "new", "this", "import", "export", "default", "true", "false", "null", "undefined", "typeof", "instanceof", "async", "await", "try", "catch", "finally", "throw", "switch", "case"],
      java: ["int", "void", "return", "if", "else", "for", "while", "break", "continue", "class", "public", "private", "protected", "static", "new", "this", "true", "false", "null", "import", "package", "String", "boolean", "long", "double", "float", "char", "final", "abstract", "interface", "extends", "implements", "try", "catch", "finally", "throw"],
      go: ["func", "return", "if", "else", "for", "break", "continue", "var", "const", "type", "struct", "import", "package", "true", "false", "nil", "new", "make", "len", "cap", "append", "range", "map", "go", "defer", "select", "switch", "case", "default", "interface"],
      rust: ["fn", "return", "if", "else", "for", "while", "break", "continue", "let", "mut", "const", "struct", "enum", "impl", "use", "mod", "pub", "true", "false", "None", "Some", "Ok", "Err", "match", "loop", "move", "ref", "self", "trait", "type", "async", "await"],
    }

    const langKeywords = keywords[language] || keywords.cpp

    // Process line by line to avoid cross-line issues
    const lines = code.split("\n")
    const processedLines = lines.map(line => {
      // Escape HTML first
      let processed = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")

      // Check for preprocessor (#include, #define) for C/C++
      if ((language === "cpp" || language === "c") && processed.trim().startsWith("#")) {
        return `<span style="color:#e06c75">${processed}</span>`
      }

      // Check for Python comments
      if (language === "python") {
        const commentIdx = processed.indexOf("#")
        if (commentIdx !== -1) {
          const before = processed.substring(0, commentIdx)
          const comment = processed.substring(commentIdx)
          processed = before + `<span style="color:#5c6370;font-style:italic">${comment}</span>`
          return applyNonCommentHighlighting(before, langKeywords) + `<span style="color:#5c6370;font-style:italic">${comment}</span>`
        }
      }

      // Check for C++ single line comment
      const commentIdx = processed.indexOf("//")
      if (commentIdx !== -1) {
        const before = processed.substring(0, commentIdx)
        const comment = processed.substring(commentIdx)
        return applyNonCommentHighlighting(before, langKeywords) + `<span style="color:#5c6370;font-style:italic">${comment}</span>`
      }

      return applyNonCommentHighlighting(processed, langKeywords)
    })

    return processedLines.join("\n")
  }

  const applyNonCommentHighlighting = (text: string, langKeywords: string[]): string => {
    let result = text

    // Strings double quotes
    result = result.replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color:#98c379">$1</span>')

    // Strings single quotes
    result = result.replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color:#98c379">$1</span>')

    // Numbers
    result = result.replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#d19a66">$1</span>')

    // Keywords
    langKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'g')
      result = result.replace(regex, '<span style="color:#cc99cd">$1</span>')
    })

    // Function calls
    result = result.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, '<span style="color:#61afef">$1</span>')

    // PascalCase types
    result = result.replace(/\b([A-Z][a-zA-Z0-9_]*)\b/g, '<span style="color:#56b6c2">$1</span>')

    return result
  }

  return (
    <div
      className="rounded-xl overflow-hidden border border-white/[0.06]"
      style={{ background: "#282c34" }}
    >
      {/* Editor Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]"
        style={{ background: "#21252b" }}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
        </div>
        <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.20)" }}>
          solution.{getFileExtension()}
        </span>
        <span
          className="text-xs font-mono px-2 py-0.5 rounded-full border"
          style={{
            color: getLanguageColor(),
            borderColor: getLanguageColor() + "40",
            background: getLanguageColor() + "15"
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
            background: "#282c34",
            borderRight: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i}
              className="text-right font-mono text-xs leading-6"
              style={{ color: "#4b5263" }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Syntax Highlighted Display */}
        <div
          className="absolute left-[52px] top-0 right-0 bottom-0 py-4 px-4 font-mono text-sm leading-6 pointer-events-none overflow-hidden whitespace-pre"
          style={{ color: "#abb2bf" }}
          dangerouslySetInnerHTML={{
            __html: highlighted || `<span style="color:#4b5263">// Write your ${language} solution here...</span>`
          }}
        />

        {/* Actual Textarea */}
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
            caretColor: "#528bff",
            color: "transparent",
            tabSize: 2,
          }}
        />
      </div>
    </div>
  )
}
