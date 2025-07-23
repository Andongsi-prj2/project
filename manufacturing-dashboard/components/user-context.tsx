"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { useAuth } from "./auth-context"

interface UserProfile {
  name: string
  role: string
  adminCode: string
  email: string
  phone: string
  department: string
  lastLogin: string
  location: string
  permissions: string[]
  factory: string
  isActive: boolean
}

interface UserContextType {
  userProfile: UserProfile
  updateEmail: (email: string) => void
  updatePhone: (phone: string) => void
  updateAdminCode: (adminCode: string) => void
  updateLastLogin: (lastLogin: string) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const initialUserProfile: UserProfile = {
  name: "김철수",
  role: "시스템 관리자",
  adminCode: "123456",
  email: "admin@manufacturing.com",
  phone: "010-1234-5678",
  department: "품질관리팀",
  lastLogin: "",
  location: "서울 공장",
  permissions: ["시스템 관리", "데이터 조회", "리포트 생성", "사용자 관리"],
  factory: "서울 공장",
  isActive: true,
}

export function UserProvider({ children }: { children: ReactNode }) {
  const { userProfile: authUserProfile } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile)
  const [isMounted, setIsMounted] = useState(false)

  // 클라이언트 마운트 후에만 AuthContext와 동기화
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // AuthContext의 사용자 정보가 변경될 때 UserContext도 동기화 (마운트 후에만)
  useEffect(() => {
    if (isMounted && authUserProfile) {
      // AuthContext의 정보를 기반으로 UserContext 업데이트
      const updatedProfile: UserProfile = {
        name: authUserProfile.name,
        role: authUserProfile.role,
        adminCode: authUserProfile.adminCode,
        email: authUserProfile.email,
        phone: "010-1234-5678", // 기본값
        department: authUserProfile.department,
        lastLogin: new Date().toLocaleString("ko-KR"),
        location: authUserProfile.factory,
        permissions: ["시스템 관리", "데이터 조회", "리포트 생성", "사용자 관리"],
        factory: authUserProfile.factory,
        isActive: true,
      }
      
      // localStorage에서 저장된 추가 정보가 있으면 병합
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("userProfile")
        if (saved) {
          const savedProfile = JSON.parse(saved)
          updatedProfile.phone = savedProfile.phone || updatedProfile.phone
          updatedProfile.lastLogin = savedProfile.lastLogin || updatedProfile.lastLogin
        }
      }
      
      setUserProfile(updatedProfile)
    }
  }, [authUserProfile, isMounted])

  // 사용자 정보가 변경될 때마다 localStorage에 저장 (마운트 후에만)
  useEffect(() => {
    if (isMounted && typeof window !== "undefined" && userProfile.name) {
      localStorage.setItem("userProfile", JSON.stringify(userProfile))
    }
  }, [userProfile, isMounted])

  const updateEmail = useCallback((email: string) => {
    setUserProfile((prev) => ({ ...prev, email }))
  }, [])

  const updatePhone = useCallback((phone: string) => {
    setUserProfile((prev) => ({ ...prev, phone }))
  }, [])

  const updateAdminCode = useCallback((adminCode: string) => {
    setUserProfile((prev) => ({ ...prev, adminCode }))
  }, [])

  const updateLastLogin = useCallback((lastLogin: string) => {
    setUserProfile((prev) => ({ ...prev, lastLogin }))
  }, [])

  return (
    <UserContext.Provider
      value={{
        userProfile,
        updateEmail,
        updatePhone,
        updateAdminCode,
        updateLastLogin,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
} 