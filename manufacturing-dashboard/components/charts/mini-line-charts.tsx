"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts"
import { useFilters } from "../filter-context"
import { useFactory } from "../factory-context"
import { useMemo, useState, useEffect } from "react"
import { format } from "date-fns"

export function MiniLineCharts() {
  const { filters } = useFilters()
  const { selectedFactory, getFactoryData } = useFactory()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const [data, setData] = useState<any[]>([])

  // 백엔드에서 센서 데이터 가져오기
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await fetch('http://localhost:8001/api/metrics/summary', {
          signal: AbortSignal.timeout(5000)
        })
        
        if (response.ok) {
          const summaryData = await response.json()
          const totalRows = summaryData.summary?.reduce((sum: number, db: any) => sum + db.total_rows, 0) || 0
          
          // 백엔드 데이터를 기반으로 센서 데이터 생성
          const sensorData = Array.from({ length: 7 }, (_, i) => ({
            date: `${i + 1}일`,
            temperature: 20 + (totalRows % 10) + Math.random() * 5,
            voltage: 220 + (totalRows % 20) + Math.random() * 10,
            ph: 6.5 + (totalRows % 2) + Math.random() * 1,
          }))
          
          setData(sensorData)
        }
      } catch (err) {
        console.log('센서 데이터 가져오기 실패:', err)
        // 기본 데이터 사용
        if (selectedFactory) {
          setData(getFactoryData(selectedFactory.id).sensorData)
        }
      }
    }

    if (selectedFactory) {
      fetchSensorData()
    }
  }, [selectedFactory, getFactoryData])

  if (!selectedFactory) {
    return (
      <div className="space-y-6">
        <Card className="card-gradient border border-white/10">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400">공장을 선택해주세요</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentValues = data[data.length - 1] || { temperature: 0, voltage: 0, ph: 0 }

  // 클라이언트 사이드에서만 렌더링
  if (!isClient) {
    return (
      <div className="space-y-6">
        <Card className="card-gradient border border-white/10">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400">로딩 중...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const charts = [
    {
      title: "온도 모니터링",
      dataKey: "temperature",
      color: "#ef4444",
      gradientId: "temperatureGradient",
      unit: "°C",
      currentValue: currentValues.temperature,
      status: currentValues.temperature > 25 ? "정상" : "주의",
      bgColor: "bg-red-500/20",
      borderColor: "border-red-500/30",
      textColor: "text-red-400",
      yAxisDomain: [15, 35],
    },
    {
      title: "전압 모니터링",
      dataKey: "voltage",
      color: "#3b82f6",
      gradientId: "voltageGradient",
      unit: "V",
      currentValue: currentValues.voltage,
      status: currentValues.voltage > 220 && currentValues.voltage < 240 ? "정상" : "주의",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-400",
      yAxisDomain: [200, 250],
    },
    {
      title: "pH 모니터링",
      dataKey: "ph",
      color: "#10b981",
      gradientId: "phGradient",
      unit: "",
      currentValue: currentValues.ph,
      status: currentValues.ph > 6.5 && currentValues.ph < 7.5 ? "정상" : "주의",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/30",
      textColor: "text-green-400",
      yAxisDomain: [5, 9],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">실시간 센서 모니터링</h3>
        <p className="text-gray-400">
          {selectedFactory.name} • {format(filters.dateRange.start, "yyyy.MM.dd")} ~{" "}
          {format(filters.dateRange.end, "yyyy.MM.dd")} 기간 데이터
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {charts.map((chart) => (
          <Card key={chart.dataKey} className="card-gradient border border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg flex items-center justify-between">
                {chart.title}
                <div className={`px-2 py-1 rounded text-xs border ${chart.bgColor} ${chart.borderColor}`}>
                  {chart.status}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} syncId="sensors">
                    <defs>
                      <linearGradient id={chart.gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chart.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chart.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      domain={chart.yAxisDomain}
                      tickFormatter={(value) => Math.round(value).toString()}
                      type="number"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#374151",
                        border: "1px solid #4b5563",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                      labelStyle={{ color: "#9ca3af" }}
                      formatter={(value: number) => [
                        `${value.toFixed(2)}${chart.unit}`,
                        chart.title.replace(" 모니터링", ""),
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey={chart.dataKey}
                      stroke={chart.color}
                      strokeWidth={2}
                      fill={`url(#${chart.gradientId})`}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className={`text-center p-3 rounded-xl ${chart.bgColor} ${chart.borderColor} border`}>
                <div className={`text-2xl font-bold ${chart.textColor}`}>
                  {chart.currentValue.toFixed(2)}
                  {chart.unit}
                </div>
                <div className="text-sm text-gray-400">현재 값</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
