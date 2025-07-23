"use client"
import { useState, useEffect } from "react"
import { User, Settings, LogOut, Shield, Clock, MapPin, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "./auth-context"
import { useUser } from "./user-context"
import { Separator } from "@/components/ui/separator"
import { AccountSettingsModal } from "./account-settings-modal"

export function ProfileDropdown() {
  const { logout } = useAuth()
  const { userProfile, updateLastLogin } = useUser()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // 실제 로그인 시간을 가져오는 함수
  const getLastLoginTime = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  useEffect(() => {
    // localStorage에서 저장된 로그인 시간을 가져오거나 현재 시간으로 설정
    const savedLoginTime = localStorage.getItem("lastLoginTime")
    if (savedLoginTime) {
      updateLastLogin(savedLoginTime)
    } else {
      const currentTime = getLastLoginTime()
      updateLastLogin(currentTime)
      localStorage.setItem("lastLoginTime", currentTime)
    }
  }, [updateLastLogin]) // 이제 updateLastLogin이 안정화되었으므로 의존성에 포함

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 bg-gray-800 border-gray-600" align="end">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{userProfile.name}</h3>
                <p className="text-sm text-gray-400">{userProfile.role}</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">관리자 코드:</span>
                <span className="text-white font-mono">{userProfile.adminCode}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">공장:</span>
                <span className="text-white">{userProfile.factory}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">소속:</span>
                <span className="text-white">{userProfile.department}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">이메일:</span>
                <span className="text-white">{userProfile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">전화번호:</span>
                <span className="text-white">{userProfile.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">마지막 로그인:</span>
                <span className="text-white">{userProfile.lastLogin}</span>
              </div>
            </div>

            <Separator className="bg-gray-600 mb-4" />

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">권한</h4>
              <div className="flex flex-wrap gap-1">
                {userProfile.permissions.map((permission, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded border border-purple-500/30"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>

            <Separator className="bg-gray-600 mb-4" />

            <div className="space-y-2">
              <Button 
                variant="ghost" 
                onClick={() => setIsSettingsOpen(true)}
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <Settings className="w-4 h-4 mr-3" />
                계정 설정
              </Button>
              <Button
                variant="ghost"
                onClick={logout}
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 mr-3" />
                로그아웃
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <AccountSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  )
}
