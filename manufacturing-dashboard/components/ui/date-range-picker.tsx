"use client"
import { useState } from "react"
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns"
import { ko } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DateRangePickerProps {
  startDate: Date
  endDate: Date
  onDateChange: (startDate: Date, endDate: Date) => void
}

export function DateRangePicker({ startDate, endDate, onDateChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate)
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate)
  const [leftMonth, setLeftMonth] = useState(startOfMonth(startDate))
  const [rightMonth, setRightMonth] = useState(addMonths(startOfMonth(startDate), 1))
  const [startHour, setStartHour] = useState(0)
  const [startMinute, setStartMinute] = useState(0)
  const [endHour, setEndHour] = useState(12)
  const [endMinute, setEndMinute] = useState(0)

  const dayLabels = ["일", "월", "화", "수", "목", "금", "토"]
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  const handleDateClick = (date: Date) => {
    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      setTempStartDate(date)
      setTempEndDate(null)
    } else if (tempStartDate && !tempEndDate) {
      if (date < tempStartDate) {
        setTempStartDate(date)
        setTempEndDate(tempStartDate)
      } else {
        setTempEndDate(date)
      }
    }
  }

  const handleApply = () => {
    if (tempStartDate && tempEndDate) {
      const finalStartDate = new Date(tempStartDate)
      finalStartDate.setHours(startHour, startMinute)

      const finalEndDate = new Date(tempEndDate)
      finalEndDate.setHours(endHour, endMinute)

      onDateChange(finalStartDate, finalEndDate)
      setIsOpen(false)
    }
  }

  const handleCancel = () => {
    setTempStartDate(startDate)
    setTempEndDate(endDate)
    setIsOpen(false)
  }

  const renderCalendar = (currentMonth: Date, isLeft: boolean) => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Add empty cells for days before month start
    const startDay = monthStart.getDay()
    const emptyCells = Array.from({ length: startDay }, (_, i) => <div key={`empty-${i}`} className="w-8 h-8" />)

    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Select
            value={currentMonth.getFullYear().toString()}
            onValueChange={(year) => {
              const newMonth = new Date(Number.parseInt(year), currentMonth.getMonth())
              if (isLeft) {
                setLeftMonth(newMonth)
              } else {
                setRightMonth(newMonth)
              }
            }}
          >
            <SelectTrigger className="w-20 h-8 bg-gray-800 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={(currentMonth.getMonth() + 1).toString()}
            onValueChange={(month) => {
              const newMonth = new Date(currentMonth.getFullYear(), Number.parseInt(month) - 1)
              if (isLeft) {
                setLeftMonth(newMonth)
              } else {
                setRightMonth(newMonth)
              }
            }}
          >
            <SelectTrigger className="w-16 h-8 bg-gray-800 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {months.map((month) => (
                <SelectItem key={month} value={month.toString()}>
                  {month}월
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayLabels.map((day) => (
            <div key={day} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400 font-medium">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {emptyCells}
          {days.map((day) => {
            const isSelected =
              tempStartDate &&
              tempEndDate &&
              (isSameDay(day, tempStartDate) ||
                isSameDay(day, tempEndDate) ||
                (day > tempStartDate && day < tempEndDate))
            const isStart = tempStartDate && isSameDay(day, tempStartDate)
            const isEnd = tempEndDate && isSameDay(day, tempEndDate)
            const isInRange = tempStartDate && tempEndDate && day > tempStartDate && day < tempEndDate

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "w-8 h-8 flex items-center justify-center text-sm rounded transition-colors",
                  !isSameMonth(day, currentMonth) && "text-gray-600",
                  isSameMonth(day, currentMonth) && "text-white hover:bg-gray-700",
                  isToday(day) && "bg-blue-600 text-white",
                  (isStart || isEnd) && "bg-blue-500 text-white",
                  isInRange && "bg-blue-500/30 text-white",
                )}
              >
                {format(day, "d")}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="bg-gray-800/50 border-gray-600 hover:border-purple-500 w-full justify-start"
        >
          {format(startDate, "yyyy년 MM월 dd일", { locale: ko })} ~{" "}
          {format(endDate, "yyyy년 MM월 dd일", { locale: ko })}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600" align="start">
        <div className="flex">
          {renderCalendar(leftMonth, true)}
          <div className="w-px bg-gray-600" />
          {renderCalendar(rightMonth, false)}
        </div>

        <div className="border-t border-gray-600 p-4">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Select value={startHour.toString()} onValueChange={(value) => setStartHour(Number.parseInt(value))}>
                <SelectTrigger className="w-16 h-8 bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-gray-400">:</span>
              <Select value={startMinute.toString()} onValueChange={(value) => setStartMinute(Number.parseInt(value))}>
                <SelectTrigger className="w-16 h-8 bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {Array.from({ length: 60 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <span className="text-gray-400">~</span>

            <div className="flex items-center gap-2">
              <Select value={endHour.toString()} onValueChange={(value) => setEndHour(Number.parseInt(value))}>
                <SelectTrigger className="w-16 h-8 bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-gray-400">:</span>
              <Select value={endMinute.toString()} onValueChange={(value) => setEndMinute(Number.parseInt(value))}>
                <SelectTrigger className="w-16 h-8 bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {Array.from({ length: 60 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-center text-sm text-gray-400 mb-4">
            {tempStartDate && tempEndDate && (
              <>
                {format(tempStartDate, "yyyy년 MM월 dd일", { locale: ko })} ~{" "}
                {format(tempEndDate, "yyyy년 MM월 dd일", { locale: ko })}
              </>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel} className="bg-gray-700 border-gray-600">
              취소
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              disabled={!tempStartDate || !tempEndDate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              적용
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
