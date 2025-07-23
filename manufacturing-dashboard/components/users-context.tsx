"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { useAuth } from "./auth-context"

interface User {
  id: string
  name: string
  role: string
  email: string
  phone: string
  adminCode: string
  status: "활성" | "비활성"
  department: string
  factory: string
}

interface UsersContextType {
  users: User[]
  addUser: (user: Omit<User, "id">) => void
  deleteUser: (id: string) => void
  updateUser: (id: string, updates: Partial<User>) => void
}

const UsersContext = createContext<UsersContextType | undefined>(undefined)

const initialUsers: User[] = [
  {
    id: "1",
    name: "관리자",
    role: "시스템 관리자",
    email: "admin@manufacturing.com",
    phone: "010-0000-0000",
    adminCode: "123456",
    status: "활성",
    department: "IT 관리팀",
    factory: "본사",
  },
]

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [isMounted, setIsMounted] = useState(false)
  const [pendingAuthDeletions, setPendingAuthDeletions] = useState<string[]>([])

  const { deleteUser: deleteAuthUser, addUser: addAuthUser } = useAuth()

  // 클라이언트 마운트 후에만 localStorage 읽기
  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== "undefined") {
      // localStorage 초기화 - 기존 사용자 데이터 삭제
      localStorage.removeItem("manufacturing-users")
      console.log("사용자 데이터 초기화 완료")
      // 기본 관리자 계정만 설정
      setUsers(initialUsers)
    }
  }, [])

  // 사용자 목록이 변경될 때마다 localStorage에 저장 (마운트 후에만)
  useEffect(() => {
    if (isMounted && typeof window !== "undefined") {
      localStorage.setItem("manufacturing-users", JSON.stringify(users))
    }
  }, [users, isMounted])

  // AuthContext에서 사용자 삭제를 다음 렌더링 사이클로 지연
  useEffect(() => {
    if (pendingAuthDeletions.length > 0) {
      pendingAuthDeletions.forEach(adminCode => {
        deleteAuthUser(adminCode)
      })
      setPendingAuthDeletions([])
    }
  }, [pendingAuthDeletions, deleteAuthUser])

  const addUser = useCallback((userData: Omit<User, "id">) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(), // 간단한 ID 생성
    }
    
    setUsers(prev => [...prev, newUser])
    
    // AuthContext에도 사용자 추가
    const authUser = {
      name: newUser.name,
      role: newUser.role,
      adminCode: newUser.adminCode,
      email: newUser.email,
      department: newUser.department,
      factory: newUser.factory,
    }
    
    // AuthContext의 addUser 함수 직접 호출
    addAuthUser(authUser)
  }, [addAuthUser])

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => {
      const userToDelete = prev.find(user => user.id === id)
      if (userToDelete) {
        // AuthContext에서 사용자 삭제를 다음 렌더링 사이클로 지연
        setPendingAuthDeletions(prev => [...prev, userToDelete.adminCode])
        return prev.filter(user => user.id !== id)
      }
      return prev
    })
  }, [])

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...updates } : user
    ))
  }, [])

  return (
    <UsersContext.Provider value={{ users, addUser, deleteUser, updateUser }}>
      {children}
    </UsersContext.Provider>
  )
}

export function useUsers() {
  const context = useContext(UsersContext)
  if (context === undefined) {
    throw new Error("useUsers must be used within a UsersProvider")
  }
  return context
} 