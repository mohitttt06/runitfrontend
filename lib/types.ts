export interface User {
  id: string
  name: string
  email: string
}

export interface TestCase {
  id: string
  input: string
  expectedOutput: string
}

export interface TestResult {
  id: string
  passed: boolean
  input: string
  expectedOutput: string
  actualOutput: string
}

export interface Problem {
  id: string
  title: string
  description: string
  language: string
  code: string
  testCases: TestCase[]
  lastEdited: Date
  userId: string
}

export type Language = 'python' | 'javascript' | 'cpp' | 'c' | 'java' | 'go' | 'rust'

export const LANGUAGES: { value: Language; label: string; color: string }[] = [
  { value: 'python', label: 'Python', color: 'bg-blue-500' },
  { value: 'javascript', label: 'JavaScript', color: 'bg-yellow-500' },
  { value: 'cpp', label: 'C++', color: 'bg-orange-500' },
  { value: 'c', label: 'C', color: 'bg-gray-500' },
  { value: 'java', label: 'Java', color: 'bg-red-500' },
  { value: 'go', label: 'Go', color: 'bg-cyan-500' },
  { value: 'rust', label: 'Rust', color: 'bg-orange-600' },
]
