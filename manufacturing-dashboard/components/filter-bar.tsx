"use client"

import { useFilters } from "./filter-context"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Calendar } from "lucide-react"

export function FilterBar() {
  const { filters, updateFilters } = useFilters()

  const handleDateChange = (startDate: Date, endDate: Date) => {
    updateFilters({ dateRange: { start: startDate, end: endDate } })
  }

  return (
    <div className="card-gradient rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">기간 설정</h3>
      </div>

      <div className="max-w-md">
        <label className="block text-sm font-medium text-gray-300 mb-2">조회 기간</label>
        <DateRangePicker
          startDate={filters.dateRange.start}
          endDate={filters.dateRange.end}
          onDateChange={handleDateChange}
        />
      </div>
    </div>
  )
}
