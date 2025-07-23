"use client"

import { FilterBar } from "./filter-bar"
import { Clock, Calendar } from "lucide-react"
import { NotificationDropdown } from "./notification-dropdown"
import { ProfileDropdown } from "./profile-dropdown"
import { FactorySelector } from "./factory-selector"
import { useUser } from "./user-context"
import { useFactory } from "./factory-context"
import { useState, useEffect } from "react"

export function TopBar() {
  const { userProfile } = useUser()
  const { selectedFactory } = useFactory()
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDate = (date: Date) => {
    return date
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\./g, " - ")
      .replace(/ - $/, "")
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border-b border-purple-500/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {selectedFactory?.name || "공장 선택"} • {mounted ? (userProfile?.name || "관리자") : "관리자"}(
              {mounted ? (userProfile?.role || "시스템 관리자") : "시스템 관리자"})
            </h2>
            <p className="text-gray-400">오늘의 제조 품질 현황을 확인해보세요</p>
          </div>
          <FactorySelector />
        </div>

        <div className="flex items-center gap-6">
          {mounted && currentTime && (
            <div className="flex items-center gap-4 bg-gray-800/50 rounded-xl px-4 py-3 border border-gray-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">{formatDate(currentTime)}</span>
              </div>
              <div className="w-px h-6 bg-gray-600" />
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-white font-mono text-lg font-bold">{formatTime(currentTime)}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <NotificationDropdown />
            <ProfileDropdown />
          </div>
        </div>
      </div>

      <FilterBar />
    </div>
  )
}
