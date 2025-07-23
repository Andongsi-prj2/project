"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Calendar, Eye } from "lucide-react"
import { useFactory } from "../factory-context"
import Link from "next/link"

export function RecentReports() {
  const { selectedFactory } = useFactory()

  const reports = [
    {
      name: "일일 품질 리포트",
      date: "2024-01-15",
      size: "2.3MB",
      type: "PDF",
      status: "완료",
      factory: selectedFactory?.name || "전체 공장",
    },
    {
      name: "주간 생산 현황",
      date: "2024-01-14",
      size: "1.8MB",
      type: "Excel",
      status: "완료",
      factory: selectedFactory?.name || "전체 공장",
    },
    {
      name: "월간 불량 분석",
      date: "2024-01-10",
      size: "4.1MB",
      type: "PDF",
      status: "생성중",
      factory: selectedFactory?.name || "전체 공장",
    },
    {
      name: "공장별 성과 비교",
      date: "2024-01-08",
      size: "3.2MB",
      type: "PDF",
      status: "완료",
      factory: "전체 공장",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "완료":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "생성중":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "오류":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <Card className="card-gradient border border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">최근 리포트</CardTitle>
            <p className="text-gray-400 mt-1">
              {selectedFactory ? `${selectedFactory.name} 관련 리포트` : "전체 공장 리포트"}
            </p>
          </div>
          <Link href="/reports">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Eye className="w-4 h-4 mr-2" />
              전체 보기
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reports.map((report, index) => (
            <Card key={index} className="bg-gray-800/50 border-gray-700/50 hover:border-purple-500/50 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <FileText className="w-6 h-6 text-purple-400 mt-1" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm mb-1 truncate">{report.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                      <Calendar className="w-3 h-3" />
                      {report.date}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">{report.factory}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                  <div className="text-xs text-gray-400">
                    {report.type} • {report.size}
                  </div>
                </div>

                <Button
                  size="sm"
                  className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30"
                  disabled={report.status !== "완료"}
                >
                  <Download className="w-3 h-3 mr-2" />
                  다운로드
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
