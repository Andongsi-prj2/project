"use client"

import { MetricChart } from "../charts/metric-chart"
import { ImageCarousel } from "../image-carousel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MetricDetailPageProps {
  metricName: string
}

export function MetricDetailPage({ metricName }: MetricDetailPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{metricName} 상세 분석</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MetricChart metricName={metricName} />
        </div>
        <div>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">품질 비교 이미지</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageCarousel />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
