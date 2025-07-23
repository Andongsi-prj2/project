"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "./auth-context"
import { Button } from "@/components/ui/button"
import { Home, Images, BarChart3, Settings, Users, FileText, LogOut, Factory, TrendingUp, Bell, Activity } from "lucide-react"
import { useMemo } from "react"

export function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  // navItems를 useMemo로 안정화
  const navItems = useMemo(() => [
    { href: "/", label: "대시보드", icon: Home },
    { href: "/analytics", label: "분석", icon: BarChart3 },
    { href: "/realtime", label: "실시간 데이터", icon: Activity },
    { href: "/images", label: "이미지", icon: Images },
    { href: "/reports", label: "리포트", icon: FileText },
    { href: "/quality", label: "품질관리", icon: TrendingUp },
    { href: "/factory", label: "공장관리", icon: Factory },
    { href: "/notifications", label: "알림", icon: Bell },
    { href: "/users", label: "사용자", icon: Users },
    { href: "/settings", label: "설정", icon: Settings },
  ], [])

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900/95 backdrop-blur-xl border-r border-purple-500/20">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Factory className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gradient">제조 품질 시스템</h1>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30 glow-effect"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <Button
          onClick={logout}
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800/50"
        >
          <LogOut className="w-5 h-5 mr-3" />
          로그아웃
        </Button>
      </div>
    </div>
  )
}
