import { NextRequest, NextResponse } from "next/server"

const LANGUAGE_IDS: Record<string, number> = {
  c: 50,
  cpp: 54,
  java: 62,
  javascript: 63,
  python: 71,
  go: 60,
  rust: 73,
  typescript: 74,
  kotlin: 78,
  swift: 83,
  csharp: 51,
  php: 68,
  ruby: 72,
}

interface TestCase {
  id: string
  input: string
  expectedOutput: string
}

interface Judge0Response {
  stdout: string | null
  stderr: string | null
  status: {
    id: number
    description: string
  }
  compile_output: string | null
  time: string | null
  memory: number | null
}

export async function POST(request: NextRequest) {
  try {
    const { language, code, testCases } = await request.json()

    if (!code || !testCases || testCases.length === 0) {
      return NextResponse.json(
        { error: "Missing code or test cases" },
        { status: 400 }
      )
    }

    const languageId = LANGUAGE_IDS[language] || 71 // Default to Python

    const results = await Promise.all(
      testCases.map(async (testCase: TestCase) => {
        try {
          const submitRes = await fetch(
            "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                source_code: code,
                language_id: languageId,
                stdin: testCase.input,
              }),
            }
          )

          if (!submitRes.ok) {
            throw new Error(`Judge0 API error: ${submitRes.status}`)
          }

          const data: Judge0Response = await submitRes.json()

          const output = data.stdout?.trim() || ""
          const expected = testCase.expectedOutput?.trim() || ""
          const error = data.stderr || data.compile_output || null

          return {
            id: testCase.id,
            input: testCase.input,
            expectedOutput: expected,
            actualOutput: output || error || "No output",
            passed: output === expected && !error,
            error,
            status: data.status?.description || "Unknown",
            time: data.time,
            memory: data.memory,
          }
        } catch (err) {
          return {
            id: testCase.id,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: "Execution error",
            passed: false,
            error: err instanceof Error ? err.message : "Unknown error",
            status: "Error",
          }
        }
      })
    )

    const passed = results.filter((r) => r.passed).length
    const failed = results.filter((r) => !r.passed).length

    return NextResponse.json({
      results,
      summary: {
        total: results.length,
        passed,
        failed,
      },
    })
  } catch (error) {
    console.error("Execution error:", error)
    return NextResponse.json(
      {
        error: "Execution failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
