"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Info, CheckCircle, XCircle, Search, Filter, Bell } from "lucide-react"
import { KafkaAlertSystem } from "@/components/kafka-alert-system"

interface Notification {
  id: string
  type: "error" | "warning" | "info" | "success"
  title: string
  message: string
  time: string
  isRead: boolean
  category: string
  priority: "high" | "medium" | "low"
}

export function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [activeTab, setActiveTab] = useState<"general" | "kafka">("general")

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "error",
      title: "불량률 임계값 초과",
      message: "공장A에서 불량률이 5%를 초과했습니다. 즉시 확인이 필요합니다.",
      time: "2024-01-15 14:25:00",
      isRead: false,
      category: "품질관리",
      priority: "high",
    },
    {
      id: "2",
      type: "warning",
      title: "온도 센서 이상",
      message: "라인 3번의 온도가 35°C를 초과하여 주의가 필요합니다.",
      time: "2024-01-15 14:15:00",
      isRead: false,
      category: "센서",
      priority: "medium",
    },
    {
      id: "3",
      type: "info",
      title: "정기 점검 알림",
      message: "내일 오전 9시에 장비 정기 점검이 예정되어 있습니다.",
      time: "2024-01-15 13:30:00",
      isRead: true,
      category: "유지보수",
      priority: "low",
    },
    {
      id: "4",
      type: "success",
      title: "품질 검사 완료",
      message: "배치 QC-2024-001의 품질 검사가 성공적으로 완료되었습니다.",
      time: "2024-01-15 12:45:00",
      isRead: true,
      category: "품질관리",
      priority: "medium",
    },
    {
      id: "5",
      type: "warning",
      title: "전압 불안정",
      message: "공장B의 전압이 불안정합니다. 전력 공급 상태를 확인해주세요.",
      time: "2024-01-15 11:20:00",
      isRead: false,
      category: "전력",
      priority: "high",
    },
    {
      id: "6",
      type: "info",
      title: "생산 목표 달성",
      message: "오늘 생산 목표 1000개를 달성했습니다.",
      time: "2024-01-15 10:00:00",
      isRead: true,
      category: "생산",
      priority: "low",
    },
    {
      id: "7",
      type: "error",
      title: "장비 고장",
      message: "라인 2번 장비에서 오류가 발생했습니다. 즉시 점검이 필요합니다.",
      time: "2024-01-15 09:15:00",
      isRead: false,
      category: "장비",
      priority: "high",
    },
    {
      id: "8",
      type: "warning",
      title: "pH 수치 이상",
      message: "pH 센서에서 7.8을 기록했습니다. 정상 범위를 벗어났습니다.",
      time: "2024-01-15 08:30:00",
      isRead: true,
      category: "센서",
      priority: "medium",
    },
  ])

  const getIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="w-6 h-6 text-red-400" />
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />
      case "info":
        return <Info className="w-6 h-6 text-blue-400" />
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-400" />
      default:
        return <Bell className="w-6 h-6 text-gray-400" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-500/10 border-red-500/20"
      case "warning":
        return "bg-yellow-500/10 border-yellow-500/20"
      case "info":
        return "bg-blue-500/10 border-blue-500/20"
      case "success":
        return "bg-green-500/10 border-green-500/20"
      default:
        return "bg-gray-500/10 border-gray-500/20"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "error":
        return "오류"
      case "warning":
        return "경고"
      case "info":
        return "정보"
      case "success":
        return "성공"
      default:
        return "알림"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "높음"
      case "medium":
        return "보통"
      case "low":
        return "낮음"
      default:
        return "보통"
    }
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || notification.type === filterType
    const matchesStatus =
      filterStatus === "all" || (filterStatus === "unread" ? !notification.isRead : notification.isRead)

    return matchesSearch && matchesType && matchesStatus
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">알림 관리</h1>
          <p className="text-gray-400">
            전체 {notifications.length}개 알림 • 읽지 않음 {unreadCount}개
          </p>
        </div>
        <Button onClick={markAllAsRead} className="bg-purple-600 hover:bg-purple-700">
          모두 읽음 처리
        </Button>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "general"
              ? "bg-purple-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-700/50"
          }`}
        >
          일반 알림
        </button>
        <button
          onClick={() => setActiveTab("kafka")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "kafka"
              ? "bg-purple-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-700/50"
          }`}
        >
          Kafka 알림 시스템
        </button>
      </div>

      {activeTab === "general" ? (
        <>
          <Card className="card-gradient border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Filter className="w-5 h-5" />
                필터 및 검색
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="알림 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800/50 border-gray-600"
                  />
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600">
                    <SelectValue placeholder="유형 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">모든 유형</SelectItem>
                    <SelectItem value="error">오류</SelectItem>
                    <SelectItem value="warning">경고</SelectItem>
                    <SelectItem value="info">정보</SelectItem>
                    <SelectItem value="success">성공</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600">
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">모든 상태</SelectItem>
                    <SelectItem value="unread">읽지 않음</SelectItem>
                    <SelectItem value="read">읽음</SelectItem>
                  </SelectContent>
                </Select>

                <div className="text-sm text-gray-400 flex items-center">{filteredNotifications.length}개 알림 표시</div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border transition-all hover:border-purple-500/50 ${getBgColor(notification.type)} ${
                  !notification.isRead ? "border-l-4 border-l-purple-500" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-lg font-semibold ${!notification.isRead ? "text-white" : "text-gray-300"}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(notification.priority)}>
                            {getPriorityLabel(notification.priority)}
                          </Badge>
                          <Badge variant="outline" className="text-gray-400 border-gray-600">
                            {getTypeLabel(notification.type)}
                          </Badge>
                          {!notification.isRead && <div className="w-3 h-3 bg-purple-500 rounded-full" />}
                        </div>
                      </div>

                      <p className="text-gray-400 mb-3">{notification.message}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>카테고리: {notification.category}</span>
                          <span>시간: {notification.time}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-purple-400 hover:text-purple-300"
                            >
                              읽음 처리
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            삭제
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredNotifications.length === 0 && (
            <Card className="card-gradient border border-white/10">
              <CardContent className="p-12 text-center">
                <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">알림이 없습니다</h3>
                <p className="text-gray-500">검색 조건에 맞는 알림을 찾을 수 없습니다.</p>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <KafkaAlertSystem />
      )}
    </div>
  )
}
