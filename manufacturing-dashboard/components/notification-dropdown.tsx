"use client"

import { Bell, AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { useNotifications } from "./notification-context"

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  // unreadCount가 0일 때는 배지를 표시하지 않도록 안정화
  const shouldShowBadge = unreadCount > 0

  const getIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="w-5 h-5 text-red-400" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case "info":
        return <Info className="w-5 h-5 text-blue-400" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      default:
        return <Bell className="w-5 h-5 text-gray-400" />
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



  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {shouldShowBadge && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 bg-gray-800 border-gray-600" align="end">
        <div className="p-4 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">알림</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-purple-400 hover:text-purple-300"
              >
                모두 읽음
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-96">
          <div className="p-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 mb-2 rounded-lg border cursor-pointer transition-all hover:bg-gray-700/50 ${getBgColor(
                  notification.type,
                )} ${!notification.isRead ? "border-l-4 border-l-purple-500" : ""}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  {getIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-sm font-medium ${!notification.isRead ? "text-white" : "text-gray-300"}`}>
                        {notification.title}
                      </h4>
                      {!notification.isRead && <div className="w-2 h-2 bg-purple-500 rounded-full" />}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{notification.message}</p>
                    <span className="text-xs text-gray-500">{notification.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-3 border-t border-gray-600">
          <Link href="/notifications">
            <Button variant="ghost" className="w-full text-purple-400 hover:text-purple-300">
              모든 알림 보기
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
