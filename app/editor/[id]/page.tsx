"use client"

import { useEffect, useCallback, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Play, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageTransition } from "@/components/page-transition"
import { CodeEditor } from "@/components/editor/code-editor"
import { TestCaseManager } from "@/components/editor/test-case-manager"
import { AIAssistant } from "@/components/editor/ai-assistant"
import { ResultsPanel } from "@/components/editor/results-panel"
import { useProblems } from "@/lib/problems-context"
import { LANGUAGES, type TestCase, type TestResult, type Language } from "@/lib/types"

export default function EditorWithIdPage() {
  const params = useParams()
  const router = useRouter()
  const { currentProblem, loadProblem, updateProblem, saveStatus, isLoading } = useProblems()
  
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [consoleOutput, setConsoleOutput] = useState("")
  const [mobileTab, setMobileTab] = useState<"problem" | "code">("problem")
  const [notFound, setNotFound] = useState(false)

  // Load problem on mount
  useEffect(() => {
    const loadExistingProblem = async () => {
      if (params.id && typeof params.id === "string") {
        const problem = await loadProblem(params.id)
        if (!problem) {
          setNotFound(true)
        }
      }
    }
    loadExistingProblem()
  }, [params.id])

  // Debounced update
  const debouncedUpdate = useCallback(
    debounce((updates: Parameters<typeof updateProblem>[0]) => {
      updateProblem(updates)
    }, 1500),
    [updateProblem]
  )

  const handleTitleChange = (title: string) => {
    if (currentProblem) {
      debouncedUpdate({ title })
    }
  }

  const handleDescriptionChange = (description: string) => {
    if (currentProblem) {
      debouncedUpdate({ description })
    }
  }

  const handleLanguageChange = (language: string) => {
    if (currentProblem) {
      updateProblem({ language: language as Language })
    }
  }

  const handleCodeChange = (code: string) => {
    if (currentProblem) {
      debouncedUpdate({ code })
    }
  }

  const handleTestCasesChange = (testCases: TestCase[]) => {
    if (currentProblem) {
      debouncedUpdate({ testCases })
    }
  }

  const handleRunCode = async () => {
    if (!currentProblem) return
    
    setIsRunning(true)
    setResults([])
    setConsoleOutput("")

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: currentProblem.language,
          code: currentProblem.code,
          testCases: currentProblem.testCases,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Execution failed")
      }

      setResults(data.results)
      setConsoleOutput(
        `Execution complete.\n${data.summary.passed}/${data.summary.total} test cases passed.`
      )
    } catch (error) {
      setConsoleOutput(
        `Error: ${error instanceof Error ? error.message : "Execution failed"}`
      )
    } finally {
      setIsRunning(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner className="w-8 h-8 text-white" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-white">Problem not found</h1>
        <p className="text-white/60">The problem you're looking for doesn't exist.</p>
        <Button
          onClick={() => router.push("/dashboard")}
          className="rounded-full bg-blue-500 hover:bg-blue-600 text-white mt-4"
        >
          Go to Dashboard
        </Button>
      </div>
    )
  }

  if (!currentProblem) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner className="w-8 h-8 text-white" />
      </div>
    )
  }

  const SaveStatusIndicator = () => {
    if (saveStatus === "saving") {
      return <span className="text-white/50 text-sm">Auto-saving...</span>
    }
    if (saveStatus === "saved") {
      return (
        <span className="text-green-400 text-sm flex items-center gap-1">
          <Check className="w-3 h-3" />
          Saved
        </span>
      )
    }
    return null
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-black">
        {/* Top Bar */}
        <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <span className="text-xl font-bold text-white">RunIt</span>
            </div>

            <div className="flex items-center gap-4">
              <SaveStatusIndicator />
              
              <Select
                value={currentProblem.language}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-md border-white/10">
                  {LANGUAGES.map((lang) => (
                    <SelectItem
                      key={lang.value}
                      value={lang.value}
                      className="text-white hover:bg-white/10 focus:bg-white/10"
                    >
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleRunCode}
                disabled={isRunning}
                className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-6 font-medium transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isRunning ? (
                  <Spinner className="w-4 h-4" />
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Code
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden">
          <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as "problem" | "code")}>
            <TabsList className="w-full bg-white/5 border-b border-white/10 rounded-none h-12">
              <TabsTrigger
                value="problem"
                className="flex-1 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 rounded-none"
              >
                Problem
              </TabsTrigger>
              <TabsTrigger
                value="code"
                className="flex-1 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 rounded-none"
              >
                Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="problem" className="p-4 mt-0">
              <ProblemPanel
                title={currentProblem.title}
                description={currentProblem.description}
                testCases={currentProblem.testCases}
                onTitleChange={handleTitleChange}
                onDescriptionChange={handleDescriptionChange}
                onTestCasesChange={handleTestCasesChange}
                code={currentProblem.code}
              />
            </TabsContent>

            <TabsContent value="code" className="p-4 mt-0">
              <CodePanel
                code={currentProblem.code}
                language={currentProblem.language}
                onCodeChange={handleCodeChange}
                results={results}
                consoleOutput={consoleOutput}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop Split View */}
        <div className="hidden md:flex h-[calc(100vh-56px)]">
          {/* Left Panel - Problem */}
          <div className="w-1/2 border-r border-white/10 overflow-y-auto p-6">
            <ProblemPanel
              title={currentProblem.title}
              description={currentProblem.description}
              testCases={currentProblem.testCases}
              onTitleChange={handleTitleChange}
              onDescriptionChange={handleDescriptionChange}
              onTestCasesChange={handleTestCasesChange}
              code={currentProblem.code}
            />
          </div>

          {/* Right Panel - Code */}
          <div className="w-1/2 overflow-y-auto p-6">
            <CodePanel
              code={currentProblem.code}
              language={currentProblem.language}
              onCodeChange={handleCodeChange}
              results={results}
              consoleOutput={consoleOutput}
            />
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

// Problem Panel Component
interface ProblemPanelProps {
  title: string
  description: string
  testCases: TestCase[]
  onTitleChange: (title: string) => void
  onDescriptionChange: (description: string) => void
  onTestCasesChange: (testCases: TestCase[]) => void
  code: string
}

function ProblemPanel({
  title,
  description,
  testCases,
  onTitleChange,
  onDescriptionChange,
  onTestCasesChange,
  code,
}: ProblemPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <Input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Untitled Problem"
        className="bg-transparent border-0 text-2xl font-bold text-white placeholder:text-white/30 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
      />

      {/* Description */}
      <Textarea
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Describe your problem here..."
        className="bg-white/5 border-white/10 text-white/70 placeholder:text-white/30 rounded-xl min-h-[120px] resize-none focus:ring-2 focus:ring-blue-500/50"
      />

      <div className="h-px bg-white/10" />

      {/* Test Cases */}
      <TestCaseManager
        testCases={testCases}
        onUpdate={onTestCasesChange}
      />

      <div className="h-px bg-white/10" />

      {/* AI Assistant */}
      <AIAssistant
  problemDescription={description}
  code={code}
  existingTestCases={testCases}
  onTestCasesGenerated={onTestCasesChange}
/>
    </div>
  )
}

// Code Panel Component
interface CodePanelProps {
  code: string
  language: string
  onCodeChange: (code: string) => void
  results: TestResult[]
  consoleOutput: string
}

function CodePanel({
  code,
  language,
  onCodeChange,
  results,
  consoleOutput,
}: CodePanelProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Code Editor */}
      <CodeEditor
        value={code}
        onChange={onCodeChange}
        language={language}
      />

      {/* Results */}
      {results.length > 0 && (
        <ResultsPanel results={results} consoleOutput={consoleOutput} />
      )}
    </div>
  )
}

// Debounce utility
function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
