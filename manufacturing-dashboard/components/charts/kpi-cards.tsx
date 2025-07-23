"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingDown, TrendingUp, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import { useFilters } from "../filter-context"
import { useFactory } from "../factory-context"
import { useMemo, useState, useEffect } from "react"
import { differenceInDays } from "date-fns"

export function KPICards() {
  const { filters } = useFilters()
  const { selectedFactory, getFactoryData } = useFactory()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const kpis = useMemo(() => {
    if (!selectedFactory) return []

    const factoryData = getFactoryData(selectedFactory.id)
    const daysDiff = differenceInDays(filters.dateRange.end, filters.dateRange.start)
    const dateMultiplier = Math.max(0.5, Math.min(2, daysDiff / 7))

    return [
      {
        title: "불량률",
        value: factoryData.kpis.defectRate,
        unit: "%",
        change: -0.5 * dateMultiplier,
        icon: TrendingDown,
        color: "text-red-400",
        bgGradient: "from-red-500/20 to-pink-500/20",
        href: "/metric/defect-rate",
      },
      {
        title: "합격 수량",
        value: factoryData.kpis.passCount,
        unit: "K",
        change: 12 * dateMultiplier,
        icon: CheckCircle,
        color: "text-green-400",
        bgGradient: "from-green-500/20 to-emerald-500/20",
        href: "/metric/pass-count",
      },
      {
        title: "불합격 수량",
        value: factoryData.kpis.failCount.toString(),
        unit: "",
        change: -3 * dateMultiplier,
        icon: XCircle,
        color: "text-red-400",
        bgGradient: "from-red-500/20 to-orange-500/20",
        href: "/metric/fail-count",
      },
      {
        title: "실시간 알림",
        value: factoryData.kpis.alerts,
        unit: "K",
        change: 1 * dateMultiplier,
        icon: AlertTriangle,
        color: "text-purple-400",
        bgGradient: "from-purple-500/20 to-blue-500/20",
        href: "/metric/alerts",
      },
    ]
  }, [selectedFactory, filters.dateRange, getFactoryData])

  if (!selectedFactory || !isClient) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-800/50 border border-gray-700">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400">{!isClient ? "로딩 중..." : "공장을 선택해주세요"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        return (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={kpi.href}>
              <Card
                className={`bg-gradient-to-br ${kpi.bgGradient} border border-white/10 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group hover:glow-effect`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.bgGradient} border border-white/20`}>
                      <Icon className={`h-6 w-6 ${kpi.color}`} />
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-xs text-gray-400 mb-1">
                        {kpi.change > 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-400 mr-1" />
                        )}
                        <span className={kpi.change > 0 ? "text-green-400" : "text-red-400"}>
                          {Math.abs(kpi.change).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-gray-400 font-medium">{kpi.title}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white group-hover:text-gradient transition-all">
                        {kpi.value}
                      </span>
                      {kpi.unit && <span className="text-lg text-gray-400 font-medium">{kpi.unit}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
