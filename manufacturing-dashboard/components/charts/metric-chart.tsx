"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
  ReferenceDot,
} from "recharts"
import { AlertTriangle } from "lucide-react"
import { useFilters } from "../filter-context"
import { useMemo } from "react"
import { format, eachDayOfInterval } from "date-fns"

interface MetricChartProps {
  metricName: string
}

export function MetricChart({ metricName }: MetricChartProps) {
  const { filters } = useFilters()

  // TODO: Replace with actual GraphQL query using filters from FilterCtx
  const data = useMemo(() => {
    const days = eachDayOfInterval({
      start: filters.dateRange.start,
      end: filters.dateRange.end,
    })

    return days.map((day, i) => {
      const temperature = 20 + Math.random() * 15
      const voltage = 220 + Math.random() * 30
      const ph = 6.5 + Math.random() * 2

      // Rule violations: (Temperature↑ AND Voltage↑) OR (Voltage↓ AND pH↑) OR (Temperature↓ AND pH↓)
      const isViolation =
        (temperature > 30 && voltage > 240) || (voltage < 230 && ph > 7.5) || (temperature < 25 && ph < 7)

      return {
        date: format(day, "MM/dd"),
        fullDate: format(day, "yyyy-MM-dd"),
        temperature,
        voltage,
        ph,
        isViolation,
      }
    })
  }, [filters.dateRange])

  const violations = data.filter((d) => d.isViolation)

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          {metricName} 상세 차트
          {violations.length > 0 && (
            <div className="flex items-center gap-1 text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{violations.length}개 위반</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: "#9ca3af" }} interval="preserveStartEnd" />
              <YAxis stroke="#9ca3af" tick={{ fill: "#9ca3af" }} tickFormatter={(value) => value.toFixed(0)} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#374151",
                  border: "1px solid #4b5563",
                  borderRadius: "6px",
                  color: "#fff",
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return `날짜: ${payload[0].payload.fullDate}`
                  }
                  return `날짜: ${label}`
                }}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(2)}${name === "temperature" ? "°C" : name === "voltage" ? "V" : ""}`,
                  name === "temperature" ? "온도" : name === "voltage" ? "전압" : "pH",
                ]}
              />
              <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} dot={false} />
              {violations.map((violation, index) => (
                <ReferenceDot
                  key={index}
                  x={violation.date}
                  y={violation.temperature}
                  r={4}
                  fill="#dc2626"
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
              <Brush dataKey="date" height={30} stroke="#3b82f6" fill="#1f2937" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
