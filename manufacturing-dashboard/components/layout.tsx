"use client"

import type React from "react"
import { useAuth } from "./auth-context"
import { Sidebar } from "./sidebar"
import { TopBar } from "./top-bar"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen gradient-bg">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <TopBar />
          <main className={`p-6 ${!isAuthenticated ? "blur-overlay" : ""}`}>{children}</main>
        </div>
      </div>
    </div>
  )
}
