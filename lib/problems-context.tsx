"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Problem, TestCase, Language } from "./types"
import { useAuth } from "./auth-context"

interface ProblemsContextType {
  problems: Problem[]
  currentProblem: Problem | null
  isLoading: boolean
  isSaving: boolean
  saveStatus: "idle" | "saving" | "saved" | "error"
  loadProblems: () => Promise<void>
  loadProblem: (id: string) => Promise<Problem | null>
  createProblem: () => Problem
  updateProblem: (updates: Partial<Problem>) => void
  deleteProblem: (id: string) => Promise<void>
  setCurrentProblem: (problem: Problem | null) => void
}

const ProblemsContext = createContext<ProblemsContextType | undefined>(undefined)

export function ProblemsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const supabase = createClient()
  const [problems, setProblems] = useState<Problem[]>([])
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingUpdateRef = useRef<Partial<Problem> | null>(null)

  const loadProblems = async () => {
    if (!user) {
      setProblems([])
      return
    }

    setIsLoading(true)
    const { data, error } = await supabase
      .from("problems")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching problems:", error)
      setProblems([])
    } else {
      const mappedProblems: Problem[] = (data || []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        description: row.description || "",
        language: row.language as Language,
        code: row.code,
        testCases: row.test_cases as TestCase[],
        lastEdited: new Date(row.updated_at),
      }))
      setProblems(mappedProblems)
    }
    setIsLoading(false)
  }

  const loadProblem = async (id: string): Promise<Problem | null> => {
    if (!user) return null

    setIsLoading(true)
    const { data, error } = await supabase
      .from("problems")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error || !data) {
      console.error("Error loading problem:", error)
      setIsLoading(false)
      return null
    }

    const problem: Problem = {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description || "",
      language: data.language as Language,
      code: data.code,
      testCases: data.test_cases as TestCase[],
      lastEdited: new Date(data.updated_at),
    }

    setCurrentProblem(problem)
    setIsLoading(false)
    return problem
  }

  const createProblem = (): Problem => {
    const newProblem: Problem = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      language: "python" as Language,
      code: "",
      testCases: [{ id: "tc_1", input: "", expectedOutput: "" }],
      lastEdited: new Date(),
      userId: user?.id || "",
    }
    setCurrentProblem(newProblem)
    return newProblem
  }

  const saveProblemToDb = async (problem: Problem) => {
    if (!user) return false

    setSaveStatus("saving")
    setIsSaving(true)

    const dbData = {
      id: problem.id,
      user_id: user.id,
      title: problem.title || "Untitled",
      description: problem.description,
      language: problem.language,
      code: problem.code,
      test_cases: problem.testCases,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from("problems")
      .upsert(dbData, { onConflict: "id" })

    setIsSaving(false)

    if (error) {
      console.error("Error saving problem:", error)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
      return false
    }

    setSaveStatus("saved")
    setTimeout(() => setSaveStatus("idle"), 2000)

    // Update problems list
    setProblems((prev) => {
      const idx = prev.findIndex((p) => p.id === problem.id)
      if (idx >= 0) {
        const newProblems = [...prev]
        newProblems[idx] = problem
        return newProblems
      }
      return [problem, ...prev]
    })

    return true
  }

  const updateProblem = (updates: Partial<Problem>) => {
    if (!currentProblem) return

    const updated = {
      ...currentProblem,
      ...updates,
      lastEdited: new Date(),
    }
    setCurrentProblem(updated)
    pendingUpdateRef.current = updated

    // Debounced save to database
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    setSaveStatus("saving")
    saveTimeoutRef.current = setTimeout(() => {
      if (pendingUpdateRef.current) {
        saveProblemToDb(pendingUpdateRef.current as Problem)
        pendingUpdateRef.current = null
      }
    }, 1000)
  }

  const deleteProblem = async (id: string) => {
    if (!user) return

    const { error } = await supabase
      .from("problems")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error deleting problem:", error)
      return
    }

    setProblems((prev) => prev.filter((p) => p.id !== id))
    if (currentProblem?.id === id) {
      setCurrentProblem(null)
    }
  }

  useEffect(() => {
    if (user) {
      loadProblems()
    } else {
      setProblems([])
      setCurrentProblem(null)
    }
  }, [user])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  return (
    <ProblemsContext.Provider
      value={{
        problems,
        currentProblem,
        isLoading,
        isSaving,
        saveStatus,
        loadProblems,
        loadProblem,
        createProblem,
        updateProblem,
        deleteProblem,
        setCurrentProblem,
      }}
    >
      {children}
    </ProblemsContext.Provider>
  )
}

export function useProblems() {
  const context = useContext(ProblemsContext)
  if (context === undefined) {
    throw new Error("useProblems must be used within a ProblemsProvider")
  }
  return context
}
