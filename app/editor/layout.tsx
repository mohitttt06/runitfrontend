"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Spinner } from "@/components/ui/spinner"

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isLoggedIn, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/auth")
    }
  }, [isLoggedIn, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner className="w-8 h-8 text-white" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return null
  }

  return <>{children}</>
}
