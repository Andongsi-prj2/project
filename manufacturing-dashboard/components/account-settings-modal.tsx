"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, Shield, Eye, EyeOff, CheckCircle, Trash2 } from "lucide-react"
import { useUser } from "./user-context"
import { useAuth } from "./auth-context"
import { useUsers } from "./users-context"

interface AccountSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AccountSettingsModal({ isOpen, onClose }: AccountSettingsModalProps) {
  const { userProfile, updateEmail, updatePhone, updateAdminCode } = useUser()
  const { updateAdminCode: updateAuthAdminCode, deleteUser: deleteAuthUser, logout } = useAuth()
  const { users, deleteUser } = useUsers()
  const [newEmail, setNewEmail] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newAdminCode, setNewAdminCode] = useState("")
  const [confirmAdminCode, setConfirmAdminCode] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleEmailUpdate = async () => {
    if (!newEmail || newEmail === userProfile.email) return
    
    setIsUpdating(true)
    // TODO: 실제 API 호출로 변경
    await new Promise(resolve => setTimeout(resolve, 1000))
    updateEmail(newEmail)
    setNewEmail("")
    setUpdateSuccess("이메일이 성공적으로 변경되었습니다.")
    setIsUpdating(false)
    
    setTimeout(() => setUpdateSuccess(null), 3000)
  }

  const handlePhoneUpdate = async () => {
    if (!newPhone || newPhone === userProfile.phone) return
    
    setIsUpdating(true)
    // TODO: 실제 API 호출로 변경
    await new Promise(resolve => setTimeout(resolve, 1000))
    updatePhone(newPhone)
    setNewPhone("")
    setUpdateSuccess("전화번호가 성공적으로 변경되었습니다.")
    setIsUpdating(false)
    
    setTimeout(() => setUpdateSuccess(null), 3000)
  }

  const handleAdminCodeUpdate = async () => {
    if (!newAdminCode || newAdminCode !== confirmAdminCode) return
    if (newAdminCode.length !== 6) return
    
    setIsUpdating(true)
    // TODO: 실제 API 호출로 변경
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // UserContext와 AuthContext 모두 업데이트
    updateAdminCode(newAdminCode)
    updateAuthAdminCode(newAdminCode)
    
    setNewAdminCode("")
    setConfirmAdminCode("")
    setUpdateSuccess("관리자 코드가 성공적으로 변경되었습니다.")
    setIsUpdating(false)
    
    setTimeout(() => setUpdateSuccess(null), 3000)
  }

  const handleDeleteAccount = async () => {
    setIsUpdating(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 현재 사용자를 관리자 코드로 찾기
    const currentUser = users.find(user => user.adminCode === userProfile.adminCode)
    
    if (currentUser) {
      // UsersContext에서 사용자 삭제 (이것이 AuthContext도 함께 처리함)
      deleteUser(currentUser.id)
      
      // 명시적으로 로그아웃 처리
      setTimeout(() => {
        logout()
      }, 100)
    } else {
      // 사용자를 찾지 못한 경우에도 AuthContext에서 삭제 시도
      deleteAuthUser(userProfile.adminCode)
      setTimeout(() => {
        logout()
      }, 100)
    }
    
    setUpdateSuccess("계정이 삭제되었습니다.")
    setIsUpdating(false)
    setShowDeleteConfirm(false)
    
    // 모달 닫기만 하고 페이지 리로드는 하지 않음
    setTimeout(() => {
      setUpdateSuccess(null)
      onClose()
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-gray-800 border-gray-600 flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-white">계정 설정</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          {updateSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 mb-4">
              <CheckCircle className="w-4 h-4" />
              {updateSuccess}
            </div>
          )}

          <div className="space-y-6">
          {/* 이메일 변경 */}
          <Card className="bg-gray-700/50 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                이메일 변경
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current-email" className="text-gray-300">현재 이메일</Label>
                <Input
                  id="current-email"
                  value={userProfile.email}
                  disabled
                  className="bg-gray-600 border-gray-500 text-gray-300"
                />
              </div>
              <div>
                <Label htmlFor="new-email" className="text-gray-300">새 이메일</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="새 이메일 주소를 입력하세요"
                  className="bg-gray-700 border-gray-500 text-white"
                />
              </div>
              <Button
                onClick={handleEmailUpdate}
                disabled={!newEmail || newEmail === userProfile.email || isUpdating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUpdating ? "변경 중..." : "이메일 변경"}
              </Button>
            </CardContent>
          </Card>

          <Separator className="bg-gray-600" />

          {/* 전화번호 변경 */}
          <Card className="bg-gray-700/50 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-400" />
                전화번호 변경
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current-phone" className="text-gray-300">현재 전화번호</Label>
                <Input
                  id="current-phone"
                  value={userProfile.phone}
                  disabled
                  className="bg-gray-600 border-gray-500 text-gray-300"
                />
              </div>
              <div>
                <Label htmlFor="new-phone" className="text-gray-300">새 전화번호</Label>
                <Input
                  id="new-phone"
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="새 전화번호를 입력하세요 (예: 010-1234-5678)"
                  className="bg-gray-700 border-gray-500 text-white"
                />
              </div>
              <Button
                onClick={handlePhoneUpdate}
                disabled={!newPhone || newPhone === userProfile.phone || isUpdating}
                className="bg-green-600 hover:bg-green-700"
              >
                {isUpdating ? "변경 중..." : "전화번호 변경"}
              </Button>
            </CardContent>
          </Card>

          <Separator className="bg-gray-600" />

          {/* 관리자 코드 변경 */}
          <Card className="bg-gray-700/50 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                관리자 코드 변경 (6자리)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current-admin-code" className="text-gray-300">현재 관리자 코드</Label>
                <div className="relative">
                  <Input
                    id="current-admin-code"
                    type={showCurrentPassword ? "text" : "password"}
                    value={userProfile.adminCode}
                    disabled
                    className="bg-gray-600 border-gray-500 text-gray-300 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-gray-500"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="new-admin-code" className="text-gray-300">새 관리자 코드</Label>
                <div className="relative">
                  <Input
                    id="new-admin-code"
                    type={showNewPassword ? "text" : "password"}
                    value={newAdminCode}
                    onChange={(e) => setNewAdminCode(e.target.value)}
                    placeholder="6자리 숫자를 입력하세요"
                    maxLength={6}
                    className="bg-gray-700 border-gray-500 text-white pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-gray-500"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirm-admin-code" className="text-gray-300">새 관리자 코드 확인</Label>
                <div className="relative">
                  <Input
                    id="confirm-admin-code"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmAdminCode}
                    onChange={(e) => setConfirmAdminCode(e.target.value)}
                    placeholder="6자리 숫자를 다시 입력하세요"
                    maxLength={6}
                    className="bg-gray-700 border-gray-500 text-white pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleAdminCodeUpdate}
                disabled={
                  !newAdminCode || 
                  newAdminCode !== confirmAdminCode || 
                  newAdminCode.length !== 6 || 
                  isUpdating
                }
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isUpdating ? "변경 중..." : "관리자 코드 변경"}
              </Button>
            </CardContent>
          </Card>

          <Separator className="bg-gray-600" />

          {/* 계정 삭제 */}
          <Card className="bg-gray-700/50 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-400" />
                계정 삭제
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-sm">
                계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
              </p>
              {!showDeleteConfirm ? (
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  계정 삭제
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-red-400 text-sm font-medium">
                    정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDeleteAccount}
                      variant="destructive"
                      disabled={isUpdating}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isUpdating ? "삭제 중..." : "확인 - 계정 삭제"}
                    </Button>
                    <Button
                      onClick={() => setShowDeleteConfirm(false)}
                      variant="outline"
                      className="border-gray-500 text-gray-300 hover:bg-gray-600"
                    >
                      취소
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 