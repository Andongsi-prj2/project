"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { useFactory } from "./factory-context"
import { Factory, ChevronDown, MapPin, Users, Zap, Thermometer } from "lucide-react"

export function FactorySelector() {
  const { selectedFactory, factories, setSelectedFactory } = useFactory()
  const [isOpen, setIsOpen] = useState(false)

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

  const handleFactorySelect = (factory: any) => {
    setSelectedFactory(factory)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="bg-gray-800/50 border-gray-600 hover:border-purple-500 min-w-[200px] justify-between"
        >
          <div className="flex items-center gap-2">
            <Factory className="w-4 h-4 text-purple-400" />
            <span>{selectedFactory?.name || "공장 선택"}</span>
          </div>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 bg-gray-800 border-gray-600" align="start">
        <div className="p-4 border-b border-gray-600">
          <h3 className="text-lg font-semibold text-white">공장 선택</h3>
          <p className="text-sm text-gray-400">데이터를 확인할 공장을 선택하세요</p>
        </div>

        <div className="p-2 max-h-96 overflow-y-auto">
          {factories.map((factory) => (
            <div
              key={factory.id}
              className={`p-4 mb-2 rounded-lg border cursor-pointer transition-all hover:bg-gray-700/50 ${
                selectedFactory?.id === factory.id
                  ? "bg-purple-500/20 border-purple-500/50"
                  : "bg-gray-800/50 border-gray-700/50"
              }`}
              onClick={() => handleFactorySelect(factory)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Factory className="w-6 h-6 text-purple-400" />
                  <div>
                    <h4 className="text-white font-medium">{factory.name}</h4>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <MapPin className="w-3 h-3" />
                      {factory.location}
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(factory.status)}>{factory.status}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400">{factory.workers}명</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-400">{factory.power}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-red-400" />
                  <span className="text-gray-400">{factory.temp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-gray-600 text-center">
          <p className="text-xs text-gray-500">선택한 공장의 데이터가 모든 차트에 반영됩니다</p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
