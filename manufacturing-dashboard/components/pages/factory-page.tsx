"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Factory, Users, Zap, Thermometer } from "lucide-react"
import { useFactory } from "../factory-context"

export function FactoryPage() {
  const { factories, selectedFactory, setSelectedFactory } = useFactory()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "운영중":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "점검중":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "정지":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const handleFactoryClick = (factory: any) => {
    setSelectedFactory(factory)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">공장 관리</h1>
        <p className="text-gray-400">전체 공장 운영 현황 • 현재 선택: {selectedFactory?.name || "없음"}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {factories.map((factory, index) => (
          <Card
            key={index}
            className={`card-gradient border transition-all cursor-pointer hover:border-purple-500/50 ${
              selectedFactory?.id === factory.id ? "border-purple-500/70 bg-purple-500/10" : "border-white/10"
            }`}
            onClick={() => handleFactoryClick(factory)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Factory className="w-8 h-8 text-purple-400" />
                  <CardTitle className="text-white">{factory.name}</CardTitle>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={getStatusColor(factory.status)}>{factory.status}</Badge>
                  {selectedFactory?.id === factory.id && (
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">선택됨</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-400">작업자</span>
                </div>
                <span className="text-white font-medium">{factory.workers}명</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-400">전력 사용률</span>
                </div>
                <span className="text-white font-medium">{factory.power}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-red-400" />
                  <span className="text-gray-400">온도</span>
                </div>
                <span className="text-white font-medium">{factory.temp}</span>
              </div>

              <div className="pt-2 border-t border-gray-700">
                <p className="text-xs text-gray-500 text-center">클릭하여 이 공장의 데이터로 전환</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
