"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface Notification {
  id: string
  type: "error" | "warning" | "info" | "success"
  title: string
  message: string
  time: string
  isRead: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (notification: Omit<Notification, "id">) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "error",
    title: "불량률 임계값 초과",
    message: "공장A에서 불량률이 5%를 초과했습니다. 즉시 확인이 필요합니다.",
    time: "5분 전",
    isRead: true,
  },
  {
    id: "2",
    type: "warning",
    title: "온도 센서 이상",
    message: "라인 3번의 온도가 35°C를 초과하여 주의가 필요합니다.",
    time: "15분 전",
    isRead: true,
  },
  {
    id: "3",
    type: "info",
    title: "정기 점검 알림",
    message: "내일 오전 9시에 장비 정기 점검이 예정되어 있습니다.",
    time: "1시간 전",
    isRead: true,
  },
  {
    id: "4",
    type: "success",
    title: "품질 검사 완료",
    message: "배치 QC-2024-001의 품질 검사가 성공적으로 완료되었습니다.",
    time: "2시간 전",
    isRead: true,
  },
  {
    id: "5",
    type: "warning",
    title: "전압 불안정",
    message: "공장B의 전압이 불안정합니다. 전력 공급 상태를 확인해주세요.",
    time: "3시간 전",
    isRead: true,
  },
]

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    // localStorage에서 저장된 알림 상태를 불러오거나 초기값 사용
    if (typeof window !== "undefined") {
      // 기존 알림 상태를 초기화하고 모든 알림을 읽음 상태로 설정
      localStorage.removeItem("notifications")
      return initialNotifications
    }
    return initialNotifications
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  // 알림 상태가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (typeof window !== "undefined" && notifications.length > 0) {
      localStorage.setItem("notifications", JSON.stringify(notifications))
    }
  }, [notifications])

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const addNotification = (notification: Omit<Notification, "id">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
} 