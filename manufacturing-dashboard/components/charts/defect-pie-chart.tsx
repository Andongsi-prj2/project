"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { useFilters } from "../filter-context"
import { useFactory } from "../factory-context"
import { useMemo, useState, useEffect } from "react"
import { format } from "date-fns"

export function DefectPieChart() {
  const { filters } = useFilters()
  const { selectedFactory, getFactoryData } = useFactory()
  const [data, setData] = useState<any[]>([])
  const [totalDefectRate, setTotalDefectRate] = useState("0")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 백엔드에서 불량 데이터 가져오기
  useEffect(() => {
    const fetchDefectData = async () => {
      try {
        const response = await fetch('http://localhost:8001/api/metrics/summary', {
          signal: AbortSignal.timeout(5000)
        })
        
        if (response.ok) {
          const summaryData = await response.json()
          const totalRows = summaryData.summary?.reduce((sum: number, db: any) => sum + db.total_rows, 0) || 0
          
          // 백엔드 데이터를 기반으로 불량 유형 데이터 생성
          const defectTypes = [
            {
              name: "과도 도금 + 표면 거칠기",
              value: Math.round(totalRows * 0.42 / 100),
              color: "#8b5cf6",
            },
            {
              name: "박리/미부착",
              value: Math.round(totalRows * 0.35 / 100),
              color: "#3b82f6",
            },
            {
              name: "얼룩/부식 흔적",
              value: Math.round(totalRows * 0.23 / 100),
              color: "#06b6d4",
            },
          ]
          
          setData(defectTypes)
          setTotalDefectRate(Math.round(totalRows * 0.02).toLocaleString())
        }
      } catch (err) {
        console.log('불량 데이터 가져오기 실패:', err)
        // 기본 데이터 사용
        if (selectedFactory) {
          const factoryData = getFactoryData(selectedFactory.id)
          setData(factoryData.defectTypes)
          setTotalDefectRate(Math.round(factoryData.kpis.failCount * 1.5).toLocaleString())
        }
      }
    }

    if (selectedFactory) {
      fetchDefectData()
    }
  }, [selectedFactory, getFactoryData])

  if (!selectedFactory || !isClient) {
    return (
      <Card className="card-gradient border border-white/10">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">{!isClient ? "로딩 중..." : "공장을 선택해주세요"}</p>
        </CardContent>
      </Card>
    )
  }

  const totalDefects = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="card-gradient border border-white/10">
      <CardHeader>
        <CardTitle className="text-white">불량 유형 분석</CardTitle>
        <p className="text-gray-400">
          {selectedFactory.name} • {format(filters.dateRange.start, "MM.dd")} ~ {format(filters.dateRange.end, "MM.dd")}{" "}
          기간
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{totalDefectRate}</div>
              <div className="text-sm text-gray-400">총 불량 건수</div>
            </div>
          </div>
        </div>

        <div className="space-y-3 mt-6">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 border border-gray-700/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: item.color }} />
                <span className="text-gray-300 text-sm">{item.name}</span>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{item.value}%</div>
                <div className="text-xs text-gray-400">
                  {Math.round((item.value / 100) * Number.parseInt(totalDefectRate.replace(",", "")))} 건
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
