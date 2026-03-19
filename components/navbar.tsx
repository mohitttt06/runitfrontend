"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Menu, X, LogOut, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"

export function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleNewProblem = () => {
    router.push("/editor")
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-white tracking-tight">
              RunIt
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              onClick={handleNewProblem}
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Problem
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-sm font-medium hover:bg-white/20 transition-colors">
                  {initials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-black/90 backdrop-blur-md border-white/10 text-white"
              >
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer hover:bg-white/10 focus:bg-white/10 text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  handleNewProblem()
                  setMobileMenuOpen(false)
                }}
                className="rounded-full bg-blue-500 hover:bg-blue-600 text-white w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Problem
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10 w-full justify-start"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
