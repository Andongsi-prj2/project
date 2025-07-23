"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Calendar } from "lucide-react"

export function ReportsPage() {
  const reports = [
    { name: "일일 품질 리포트", date: "2024-01-15", size: "2.3MB", type: "PDF" },
    { name: "주간 생산 현황", date: "2024-01-14", size: "1.8MB", type: "Excel" },
    { name: "월간 불량 분석", date: "2024-01-10", size: "4.1MB", type: "PDF" },
    { name: "공장별 성과 비교", date: "2024-01-08", size: "3.2MB", type: "PDF" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">리포트 관리</h1>
        <p className="text-gray-400">생성된 리포트를 확인하고 다운로드하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, index) => (
          <Card key={index} className="card-gradient border border-white/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-purple-400" />
                <div>
                  <CardTitle className="text-white text-lg">{report.name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {report.date}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  <span className="font-medium">{report.type}</span> • {report.size}
                </div>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Download className="w-4 h-4 mr-2" />
                  다운로드
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
