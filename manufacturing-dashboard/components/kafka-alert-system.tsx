"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Settings, Bell, X, Plus, Trash2 } from "lucide-react"

interface AlertRule {
  id: string
  name: string
  field: string
  operator: ">" | "<" | "==" | ">=" | "<=" | "!=" | "contains"
  value: string | number
  severity: "error" | "warning" | "info"
  isActive: boolean
  description: string
  groupId?: string // 같은 불량 유형끼리 그룹화
}

interface AlertNotification {
  id: string
  ruleId: string
  ruleName: string
  message: string
  timestamp: string
  severity: "error" | "warning" | "info"
  data: any
  isRead: boolean
}

export function KafkaAlertSystem() {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: "1",
      name: "과도도금 + 거칠기 (온도)",
      field: "temperature",
      operator: ">=",
      value: 52.46,
      severity: "error",
      isActive: true,
      description: "온도가 52.46°C 이상일 때 과도도금 + 거칠기 불량 위험",
      groupId: "overplating_roughness"
    },
    {
      id: "2",
      name: "과도도금 + 거칠기 (전압)",
      field: "voltage",
      operator: ">=",
      value: 27.44,
      severity: "error",
      isActive: true,
      description: "전압이 27.44V 이상일 때 과도도금 + 거칠기 불량 위험",
      groupId: "overplating_roughness"
    },
    {
      id: "3",
      name: "박리 / 미부착 (전압)",
      field: "voltage",
      operator: "<=",
      value: 7.44,
      severity: "error",
      isActive: true,
      description: "전압이 7.44V 이하일 때 박리/미부착 불량 위험",
      groupId: "peeling_adhesion"
    },
    {
      id: "4",
      name: "박리 / 미부착 (pH)",
      field: "ph_level",
      operator: ">=",
      value: 3,
      severity: "error",
      isActive: true,
      description: "pH가 3 이상일 때 박리/미부착 불량 위험",
      groupId: "peeling_adhesion"
    },
    {
      id: "5",
      name: "얼룩 / 부식 (온도)",
      field: "temperature",
      operator: "<=",
      value: 32.46,
      severity: "warning",
      isActive: true,
      description: "온도가 32.46°C 이하일 때 얼룩/부식 불량 위험",
      groupId: "stain_corrosion"
    },
    {
      id: "6",
      name: "얼룩 / 부식 (pH)",
      field: "ph_level",
      operator: "<=",
      value: 1,
      severity: "warning",
      isActive: true,
      description: "pH가 1 이하일 때 얼룩/부식 불량 위험",
      groupId: "stain_corrosion"
    }
  ])

  const [notifications, setNotifications] = useState<AlertNotification[]>([])
  const [kafkaData, setKafkaData] = useState<any>(null)
  const [showAddRule, setShowAddRule] = useState(false)
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({
    name: "",
    field: "",
    operator: ">",
    value: "",
    severity: "warning",
    isActive: true,
    description: ""
  })

  // Kafka 데이터 가져오기
  const fetchKafkaData = async () => {
    try {
      const response = await fetch('http://localhost:9000/api/metrics/realtime', {
        signal: AbortSignal.timeout(3000)
      })
      
      if (response.ok) {
        const data = await response.json()
        setKafkaData(data.data?.[0] || null)
        checkAlertRules(data.data?.[0])
      }
    } catch (err) {
      // Kafka 서버 연결 실패 시 데이터 없음
      console.log('Kafka 서버 연결 실패:', err)
      setKafkaData(null)
    }
  }

  // 알림 규칙 체크
  const checkAlertRules = (data: any) => {
    if (!data) return

    // 그룹별로 규칙들을 분류
    const groupedRules = alertRules.reduce((groups, rule) => {
      if (!rule.isActive) return groups
      
      const groupId = rule.groupId || rule.id
      if (!groups[groupId]) {
        groups[groupId] = []
      }
      groups[groupId].push(rule)
      return groups
    }, {} as Record<string, AlertRule[]>)

    // 각 그룹별로 AND 조건 체크
    Object.entries(groupedRules).forEach(([groupId, rules]) => {
      if (rules.length === 0) return

      // 그룹 내 모든 규칙이 만족되는지 체크 (AND 조건)
      const allConditionsMet = rules.every(rule => {
        let fieldValue = data[rule.field]
        if (fieldValue === undefined) return false

        // 문자열에서 숫자 추출 (예: "TEMP_55.0C" -> 55.0, "VOLTAGE_30.0V" -> 30.0, "PH_4.0" -> 4.0)
        if (typeof fieldValue === 'string') {
          const tempMatch = fieldValue.match(/TEMP_([\d.]+)/)
          const voltageMatch = fieldValue.match(/VOLTAGE_([\d.]+)/)
          const phMatch = fieldValue.match(/PH_([\d.]+)/)
          
          if (tempMatch) fieldValue = parseFloat(tempMatch[1])
          else if (voltageMatch) fieldValue = parseFloat(voltageMatch[1])
          else if (phMatch) fieldValue = parseFloat(phMatch[1])
          else fieldValue = parseFloat(fieldValue) || fieldValue
        }

        switch (rule.operator) {
          case ">":
            return Number(fieldValue) > Number(rule.value)
          case "<":
            return Number(fieldValue) < Number(rule.value)
          case ">=":
            return Number(fieldValue) >= Number(rule.value)
          case "<=":
            return Number(fieldValue) <= Number(rule.value)
          case "==":
            return fieldValue == rule.value
          case "!=":
            return fieldValue != rule.value
          case "contains":
            return String(fieldValue).includes(String(rule.value))
          default:
            return false
        }
      })

      // 모든 조건이 만족되면 알림 생성
      if (allConditionsMet && rules.length > 0) {
        const mainRule = rules[0] // 첫 번째 규칙을 메인으로 사용
        const groupNames = {
          "overplating_roughness": "과도도금 + 거칠기",
          "peeling_adhesion": "박리 / 미부착",
          "stain_corrosion": "얼룩 / 부식"
        }
        
        const notification: AlertNotification = {
          id: Date.now().toString() + "_" + groupId,
          ruleId: groupId,
          ruleName: groupNames[groupId as keyof typeof groupNames] || mainRule.name,
          message: `${groupNames[groupId as keyof typeof groupNames] || mainRule.name} 불량 위험 - 모든 조건 만족`,
          timestamp: new Date().toISOString(),
          severity: mainRule.severity,
          data: data,
          isRead: false
        }

        setNotifications(prev => {
          // 중복 알림 방지 (같은 그룹의 최근 알림이 있으면 추가하지 않음)
          const recentNotification = prev.find(n => 
            n.ruleId === groupId && 
            Date.now() - new Date(n.timestamp).getTime() < 60000 // 1분 내
          )
          
          if (recentNotification) return prev
          return [notification, ...prev]
        })
      }
    })
  }

  // 알림 규칙 추가
  const addAlertRule = () => {
    if (!newRule.name || !newRule.field || !newRule.value) return

    const rule: AlertRule = {
      id: Date.now().toString(),
      name: newRule.name!,
      field: newRule.field!,
      operator: newRule.operator!,
      value: newRule.value!,
      severity: newRule.severity!,
      isActive: newRule.isActive!,
      description: newRule.description!
    }

    setAlertRules(prev => [...prev, rule])
    setNewRule({
      name: "",
      field: "",
      operator: ">",
      value: "",
      severity: "warning",
      isActive: true,
      description: ""
    })
    setShowAddRule(false)
  }

  // 알림 규칙 삭제
  const deleteAlertRule = (id: string) => {
    setAlertRules(prev => prev.filter(rule => rule.id !== id))
  }

  // 알림 읽음 처리
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
  }

  // 알림 삭제
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // 알림 규칙 활성화/비활성화
  const toggleRule = (id: string) => {
    setAlertRules(prev => 
      prev.map(rule => 
        rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
      )
    )
  }

  useEffect(() => {
    fetchKafkaData()
    const interval = setInterval(fetchKafkaData, 10000) // 10초마다 체크
    return () => clearInterval(interval)
  }, [alertRules])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error": return "bg-red-100 text-red-800 border-red-200"
      case "warning": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "info": return "bg-blue-100 text-blue-800 border-blue-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="space-y-6">
      {/* 알림 규칙 설정 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            알림 규칙 설정
          </CardTitle>
          <Button onClick={() => setShowAddRule(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            규칙 추가
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alertRules.map(rule => (
              <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{rule.name}</h3>
                    <Badge 
                      variant={rule.isActive ? "default" : "secondary"}
                      onClick={() => toggleRule(rule.id)}
                      className="cursor-pointer"
                    >
                      {rule.isActive ? "활성" : "비활성"}
                    </Badge>
                    <Badge className={getSeverityColor(rule.severity)}>
                      {rule.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{rule.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    조건: {rule.field} {rule.operator} {rule.value}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteAlertRule(rule.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 새 규칙 추가 모달 */}
      {showAddRule && (
        <Card>
          <CardHeader>
            <CardTitle>새 알림 규칙 추가</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">규칙 이름</label>
                <Input
                  value={newRule.name}
                  onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="예: 품질 점수 임계값"
                />
              </div>
              <div>
                <label className="text-sm font-medium">필드명</label>
                <Input
                  value={newRule.field}
                  onChange={(e) => setNewRule(prev => ({ ...prev, field: e.target.value }))}
                  placeholder="예: avg_quality"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">연산자</label>
                <Select
                  value={newRule.operator}
                  onValueChange={(value) => setNewRule(prev => ({ ...prev, operator: value as any }))}
                >
                  <SelectTrigger className="bg-gray-800/50 border-gray-600">
                    <SelectValue placeholder="연산자 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-400 mb-2 px-2">비교 연산자</div>
                      <SelectItem value=">" className="py-3 px-4 hover:bg-gray-700 cursor-pointer text-white">
                        <div className="flex items-center gap-3 pl-6">
                          <span className="text-lg font-mono">&gt;</span>
                          <span>보다 큼</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="<" className="py-3 px-4 hover:bg-gray-700 cursor-pointer text-white">
                        <div className="flex items-center gap-3 pl-6">
                          <span className="text-lg font-mono">&lt;</span>
                          <span>보다 작음</span>
                        </div>
                      </SelectItem>
                      <SelectItem value=">=" className="py-3 px-4 hover:bg-gray-700 cursor-pointer text-white">
                        <div className="flex items-center gap-3 pl-6">
                          <span className="text-lg font-mono">≥</span>
                          <span>이상</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="<=" className="py-3 px-4 hover:bg-gray-700 cursor-pointer text-white">
                        <div className="flex items-center gap-3 pl-6">
                          <span className="text-lg font-mono">≤</span>
                          <span>이하</span>
                        </div>
                      </SelectItem>
                      <div className="border-t border-gray-600 my-2"></div>
                      <div className="text-xs font-medium text-gray-400 mb-2 px-2">일치 연산자</div>
                      <SelectItem value="==" className="py-3 px-4 hover:bg-gray-700 cursor-pointer text-white">
                        <div className="flex items-center gap-3 pl-6">
                          <span className="text-lg font-mono">=</span>
                          <span>같음</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="!=" className="py-3 px-4 hover:bg-gray-700 cursor-pointer text-white">
                        <div className="flex items-center gap-3 pl-6">
                          <span className="text-lg font-mono">≠</span>
                          <span>다름</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="contains" className="py-3 px-4 hover:bg-gray-700 cursor-pointer text-white">
                        <div className="flex items-center gap-3 pl-6">
                          <span className="text-lg font-mono">⊃</span>
                          <span>포함</span>
                        </div>
                      </SelectItem>
                    </div>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">값</label>
                <Input
                  value={newRule.value}
                  onChange={(e) => setNewRule(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="임계값 입력"
                />
              </div>
              <div>
                <label className="text-sm font-medium">심각도</label>
                <Select
                  value={newRule.severity}
                  onValueChange={(value) => setNewRule(prev => ({ ...prev, severity: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="error">오류</SelectItem>
                    <SelectItem value="warning">경고</SelectItem>
                    <SelectItem value="info">정보</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">설명</label>
              <Input
                value={newRule.description}
                onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                placeholder="알림 규칙에 대한 설명"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addAlertRule}>규칙 추가</Button>
              <Button variant="outline" onClick={() => setShowAddRule(false)}>취소</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 실시간 알림 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            실시간 알림
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center py-8">알림이 없습니다</p>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg ${notification.isRead ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{notification.ruleName}</h3>
                        <Badge className={getSeverityColor(notification.severity)}>
                          {notification.severity}
                        </Badge>
                        {!notification.isRead && (
                          <Badge variant="default">새 알림</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.timestamp).toLocaleString('ko-KR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          읽음
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 현재 Kafka 데이터 상태 */}
      <Card>
        <CardHeader>
          <CardTitle>현재 Kafka 데이터 상태</CardTitle>
        </CardHeader>
        <CardContent>
          {kafkaData ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(kafkaData).map(([key, value]) => (
                <div key={key} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-700">{key}</p>
                  <p className="text-lg font-semibold text-gray-900">{String(value)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-2">Kafka 서버에 연결할 수 없습니다</p>
              <p className="text-sm text-gray-500">백엔드 서버가 실행 중인지 확인해주세요</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 