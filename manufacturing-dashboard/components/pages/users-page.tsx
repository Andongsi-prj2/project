"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User, Mail, Phone, Plus, Trash2 } from "lucide-react"
import { useUsers } from "../users-context"

export function UsersPage() {
  const { users, addUser, deleteUser } = useUsers()
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    adminCode: "",
    department: "",
    factory: "",
    status: "활성" as "활성" | "비활성"
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">사용자 관리</h1>
          <p className="text-gray-400">시스템 사용자 현황</p>
        </div>
        <Button 
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => setShowAddUser(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          사용자 추가
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.map((user, index) => (
          <Card key={user.id} className="card-gradient border border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">{user.name}</CardTitle>
                    <p className="text-gray-400 text-sm">{user.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                <Badge
                  className={user.status === "활성" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}
                >
                  {user.status}
                </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteUser(user.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">{user.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-xs">관리자 코드:</span>
                <span className="text-gray-300 text-sm font-mono">{user.adminCode}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-xs">소속:</span>
                <span className="text-gray-300 text-sm">{user.department}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-xs">공장:</span>
                <span className="text-gray-300 text-sm">{user.factory}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 사용자 추가 모달 */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="bg-gray-800 border-gray-600 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">새 사용자 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-300">이름</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                className="bg-gray-700 border-gray-500 text-white"
                placeholder="사용자 이름"
              />
            </div>
            
            <div>
              <Label htmlFor="role" className="text-gray-300">역할</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="bg-gray-700 border-gray-500 text-white">
                  <SelectValue placeholder="역할 선택" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-500">
                  <SelectItem value="시스템 관리자">시스템 관리자</SelectItem>
                  <SelectItem value="품질 관리자">품질 관리자</SelectItem>
                  <SelectItem value="검사원">검사원</SelectItem>
                  <SelectItem value="작업자">작업자</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-300">이메일</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                className="bg-gray-700 border-gray-500 text-white"
                placeholder="user@company.com"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-gray-300">전화번호</Label>
              <Input
                id="phone"
                value={newUser.phone}
                onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                className="bg-gray-700 border-gray-500 text-white"
                placeholder="010-0000-0000"
              />
            </div>

            <div>
              <Label htmlFor="adminCode" className="text-gray-300">관리자 코드 (6자리)</Label>
              <Input
                id="adminCode"
                value={newUser.adminCode}
                onChange={(e) => setNewUser(prev => ({ ...prev, adminCode: e.target.value.slice(0, 6) }))}
                className="bg-gray-700 border-gray-500 text-white"
                placeholder="6자리 숫자 입력"
                maxLength={6}
              />
            </div>

            <div>
              <Label htmlFor="department" className="text-gray-300">소속</Label>
              <Select
                value={newUser.department}
                onValueChange={(value) => setNewUser(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger className="bg-gray-700 border-gray-500 text-white">
                  <SelectValue placeholder="소속 선택" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-500">
                  <SelectItem value="IT 관리팀">IT 관리팀</SelectItem>
                  <SelectItem value="품질관리팀">품질관리팀</SelectItem>
                  <SelectItem value="생산관리팀">생산관리팀</SelectItem>
                  <SelectItem value="설비관리팀">설비관리팀</SelectItem>
                  <SelectItem value="안전관리팀">안전관리팀</SelectItem>
                  <SelectItem value="인사팀">인사팀</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="factory" className="text-gray-300">공장</Label>
              <Select
                value={newUser.factory}
                onValueChange={(value) => setNewUser(prev => ({ ...prev, factory: value }))}
              >
                <SelectTrigger className="bg-gray-700 border-gray-500 text-white">
                  <SelectValue placeholder="공장 선택" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-500">
                  <SelectItem value="본사">본사</SelectItem>
                  <SelectItem value="서울 공장">서울 공장</SelectItem>
                  <SelectItem value="부산 공장">부산 공장</SelectItem>
                  <SelectItem value="대구 공장">대구 공장</SelectItem>
                  <SelectItem value="인천 공장">인천 공장</SelectItem>
                  <SelectItem value="광주 공장">광주 공장</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status" className="text-gray-300">상태</Label>
              <Select
                value={newUser.status}
                onValueChange={(value: "활성" | "비활성") => setNewUser(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="bg-gray-700 border-gray-500 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-500">
                  <SelectItem value="활성">활성</SelectItem>
                  <SelectItem value="비활성">비활성</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => {
                  if (newUser.name && newUser.role && newUser.email && newUser.adminCode) {
                    addUser(newUser)
                    setNewUser({
                      name: "",
                      role: "",
                      email: "",
                      phone: "",
                      adminCode: "",
                      department: "",
                      factory: "",
                      status: "활성"
                    })
                    setShowAddUser(false)
                  }
                }}
                disabled={!newUser.name || !newUser.role || !newUser.email || !newUser.adminCode}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                사용자 추가
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddUser(false)}
                className="flex-1 border-gray-500 text-gray-300 hover:bg-gray-700"
              >
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
