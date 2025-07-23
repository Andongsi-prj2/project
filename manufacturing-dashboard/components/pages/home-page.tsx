"use client"

import { KPICards } from "../charts/kpi-cards"
import { MiniLineCharts } from "../charts/mini-line-charts"
import { DefectPieChart } from "../charts/defect-pie-chart"
import { MonthlyTrendCharts } from "../charts/monthly-trend-charts"
import { RecentReports } from "../charts/recent-reports"
import RealtimeKafkaData from "../realtime-kafka-data"

export function HomePage() {
  return (
    <div className="space-y-8">
      <KPICards />

      <MiniLineCharts />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <MonthlyTrendCharts />
        </div>
        <div>
          <DefectPieChart />
        </div>
      </div>

      <RecentReports />

      {/* 실시간 Kafka 데이터 */}
      <div className="mt-8">
        <RealtimeKafkaData />
      </div>
    </div>
  )
}
