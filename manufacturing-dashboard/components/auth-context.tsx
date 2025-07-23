"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface UserProfile {
  name: string
  role: string
  adminCode: string
  email: string
  department: string
  factory: string
}

interface AuthContextType {
  isAuthenticated: boolean
  userProfile: UserProfile | null
  authenticate: (code: string) => boolean
  logout: () => void
  updateAdminCode: (newCode: string) => void
  deleteUser: (adminCode: string) => void
  addUser: (user: UserProfile) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 초기 관리자 코드별 사용자 프로필 매핑
const initialUserProfiles: Record<string, UserProfile> = {
  "123456": {
    name: "관리자",
    role: "시스템 관리자",
    adminCode: "123456",
    email: "admin@manufacturing.com",
    department: "IT 관리팀",
    factory: "본사",
  },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>(initialUserProfiles)
  const [isMounted, setIsMounted] = useState(false)

  // 클라이언트 마운트 후에만 localStorage 읽기
  useEffect(() => {
    setIsMounted(true)
    // localStorage 초기화는 한 번만 실행 (개발 중에만 필요시 주석 해제)
    if (typeof window !== "undefined") {
      localStorage.clear() // 개발 중에만 필요시 주석 해제
      console.log("Auth context 마운트 완료 - localStorage 초기화됨")
    }
  }, [])

  // localStorage에서 사용자 목록 복원 (마운트 후에만)
  useEffect(() => {
    if (isMounted) {
      const storedProfiles = localStorage.getItem("manufacturing-user-profiles")
      if (storedProfiles) {
        try {
          const parsed = JSON.parse(storedProfiles)
          setUserProfiles(parsed)
        } catch (error) {
          console.error("Failed to parse stored user profiles:", error)
        }
      }
    }
  }, [isMounted])

  // 사용자 목록이 변경될 때마다 localStorage에 저장 (마운트 후에만)
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("manufacturing-user-profiles", JSON.stringify(userProfiles))
    }
  }, [userProfiles, isMounted])

  // 인증 상태 복원 (마운트 후에만)
  useEffect(() => {
    if (isMounted) {
      const stored = localStorage.getItem("manufacturing-auth")
      const storedCode = localStorage.getItem("manufacturing-admin-code")
      if (stored === "authenticated" && storedCode && userProfiles[storedCode]) {
        setIsAuthenticated(true)
        setUserProfile(userProfiles[storedCode])
      }
    }
  }, [userProfiles, isMounted])

  const authenticate = (code: string) => {
    if (userProfiles[code]) {
      setIsAuthenticated(true)
      setUserProfile(userProfiles[code])
      if (isMounted) {
        localStorage.setItem("manufacturing-auth", "authenticated")
        localStorage.setItem("manufacturing-admin-code", code)
      }
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUserProfile(null)
    if (isMounted) {
      localStorage.removeItem("manufacturing-auth")
      localStorage.removeItem("manufacturing-admin-code")
    }
  }

  const updateAdminCode = (newCode: string) => {
    if (userProfile) {
      // 현재 사용자 프로필을 새 코드로 업데이트
      const updatedProfile = { ...userProfile, adminCode: newCode }
      
      // userProfiles 객체에 새 코드로 사용자 추가
      setUserProfiles(prev => ({
        ...prev,
        [newCode]: updatedProfile
      }))
      
      // 기존 코드 제거 (보안상)
      setUserProfiles(prev => {
        const newProfiles = { ...prev }
        delete newProfiles[userProfile.adminCode]
        return newProfiles
      })
      
      // 현재 사용자 프로필 업데이트
      setUserProfile(updatedProfile)
      
      // localStorage 업데이트
      if (isMounted) {
        localStorage.setItem("manufacturing-admin-code", newCode)
      }
    }
  }

  const deleteUser = (adminCode: string) => {
    setUserProfiles(prev => {
      const newProfiles = { ...prev }
      delete newProfiles[adminCode]
      return newProfiles
    })
    
    // 삭제된 사용자가 현재 로그인한 사용자인 경우 로그아웃
    if (userProfile?.adminCode === adminCode) {
      logout()
    }
  }

  // 사용자 추가 함수 (UsersContext에서 호출)
  const addUser = (user: UserProfile) => {
    setUserProfiles(prev => ({
      ...prev,
      [user.adminCode]: user
    }))
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userProfile, 
      authenticate, 
      logout, 
      updateAdminCode, 
      deleteUser,
      addUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
