"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Bell, Shield } from "lucide-react"

export function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">시스템 설정</h1>
        <p className="text-gray-400">시스템 환경 설정 및 관리</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="card-gradient border border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-purple-400" />
              <CardTitle className="text-white">알림 설정</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">불량 발생 알림</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">시스템 점검 알림</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">이메일 알림</span>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient border border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-purple-400" />
              <CardTitle className="text-white">보안 설정</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">관리자 코드 변경</label>
              <Input type="password" placeholder="새 관리자 코드" className="bg-gray-800/50 border-gray-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">자동 로그아웃</span>
              <Switch defaultChecked />
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">설정 저장</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
