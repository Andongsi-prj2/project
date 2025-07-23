"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react"

export function QualityPage() {
  const qualityChecks = [
    { id: "QC-001", product: "제품A", status: "합격", inspector: "김철수", time: "09:30" },
    { id: "QC-002", product: "제품B", status: "불합격", inspector: "이영희", time: "10:15" },
    { id: "QC-003", product: "제품C", status: "검사중", inspector: "박민수", time: "11:00" },
    { id: "QC-004", product: "제품D", status: "대기", inspector: "-", time: "-" },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "합격":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "불합격":
        return <XCircle className="w-5 h-5 text-red-400" />
      case "검사중":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "합격":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "불합격":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "검사중":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">품질 관리</h1>
        <p className="text-gray-400">실시간 품질 검사 현황</p>
      </div>

      <Card className="card-gradient border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">품질 검사 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qualityChecks.map((check) => (
              <div
                key={check.id}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700/50"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(check.status)}
                  <div>
                    <div className="text-white font-medium">{check.id}</div>
                    <div className="text-gray-400 text-sm">{check.product}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-white text-sm">{check.inspector}</div>
                    <div className="text-gray-400 text-xs">{check.time}</div>
                  </div>
                  <Badge className={getStatusColor(check.status)}>{check.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
