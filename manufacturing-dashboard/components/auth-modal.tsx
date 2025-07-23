"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "./auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertCircle } from "lucide-react"

export function AuthModal() {
  const { isAuthenticated, authenticate } = useAuth()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError("6자리 코드를 입력해주세요")
      return
    }

    setIsLoading(true)
    setError("")

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (authenticate(code)) {
      setCode("")
    } else {
      setError("잘못된 관리자 코드입니다")
    }
    setIsLoading(false)
  }

  // 마운트 전에는 아무것도 렌더링하지 않음
  if (!mounted) {
    return null
  }

  return (
    <AnimatePresence>
      {!isAuthenticated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <Card className="w-96 bg-gray-800 border-gray-700">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-white">보안 인증</CardTitle>
                <CardDescription className="text-gray-400">
                  관리자 코드를 입력하여 대시보드에 접근하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="password"
                      placeholder="6자리 관리자 코드"
                      value={code}
                      onChange={(e) => setCode(e.target.value.slice(0, 6))}
                      className="text-center text-lg tracking-widest bg-gray-700 border-gray-600 text-white"
                      maxLength={6}
                    />
                  </div>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-red-400 text-sm"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </motion.div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading || code.length !== 6}
                  >
                    {isLoading ? "인증 중..." : "접근 허가"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
