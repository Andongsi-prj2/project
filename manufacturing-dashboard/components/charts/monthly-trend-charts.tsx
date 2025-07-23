"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { useFactory } from "../factory-context"
import { useMemo, useState, useEffect } from "react"

export function MonthlyTrendCharts() {
  const { selectedFactory, getFactoryData } = useFactory()
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 백엔드에서 월별 데이터 가져오기
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const response = await fetch('http://localhost:8001/api/metrics/summary', {
          signal: AbortSignal.timeout(5000)
        })
        
        if (response.ok) {
          const data = await response.json()
          // 요약 데이터를 기반으로 월별 데이터 생성
          const totalRows = data.summary?.reduce((sum: number, db: any) => sum + db.total_rows, 0) || 0
          const baseMultiplier = selectedFactory?.id === "factory-1" ? 1.0 : 
                                selectedFactory?.id === "factory-2" ? 1.2 : 
                                selectedFactory?.id === "factory-3" ? 0.6 : 1.1
          
          const generatedData = Array.from({ length: 12 }, (_, i) => ({
            month: `${i + 1}월`,
            defects: Math.floor((totalRows * 0.02 * baseMultiplier) / 12) + Math.floor(Math.random() * 100),
            production: Math.floor((totalRows * 0.8 * baseMultiplier) / 12) + Math.floor(Math.random() * 500),
          }))
          
          setMonthlyData(generatedData)
        }
      } catch (err) {
        console.log('월별 데이터 가져오기 실패:', err)
        // 기본 데이터 사용
        const baseMultiplier = selectedFactory?.id === "factory-1" ? 1.0 : 
                              selectedFactory?.id === "factory-2" ? 1.2 : 
                              selectedFactory?.id === "factory-3" ? 0.6 : 1.1
        
        const defaultData = Array.from({ length: 12 }, (_, i) => ({
          month: `${i + 1}월`,
          defects: Math.floor(Math.random() * 1000 * baseMultiplier) + 500,
          production: Math.floor(Math.random() * 5000 * baseMultiplier) + 3000,
        }))
        setMonthlyData(defaultData)
      }
    }

    if (selectedFactory) {
      fetchMonthlyData()
    }
  }, [selectedFactory])

  if (!selectedFactory || !isClient) {
    return (
      <div className="space-y-6">
        <Card className="card-gradient border border-white/10">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400">{!isClient ? "로딩 중..." : "공장을 선택해주세요"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">월별 생산 현황</h3>
        <p className="text-gray-400">{selectedFactory.name} 연간 추이 분석</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="card-gradient border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">월별 불량률 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12, fill: "#9ca3af" }} />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    tickFormatter={(value) => Math.round(value).toString()}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#374151",
                      border: "1px solid #4b5563",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: number) => [`${value.toFixed(0)}건`, "불량 건수"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="defects"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#ef4444", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">월별 생산량</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12, fill: "#9ca3af" }} />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    tickFormatter={(value) => Math.round(value).toString()}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#374151",
                      border: "1px solid #4b5563",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: number) => [`${value.toFixed(0)}개`, "생산량"]}
                  />
                  <Bar dataKey="production" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
