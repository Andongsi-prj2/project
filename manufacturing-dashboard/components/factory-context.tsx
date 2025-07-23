"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface Factory {
  id: string
  name: string
  location: string
  status: string
  workers: number
  power: string
  temp: string
}

interface FactoryContextType {
  factories: Factory[]
  selectedFactory: Factory | null
  setSelectedFactory: (factory: Factory) => void
  getFactoryData: (factoryId: string) => any
}

const FactoryContext = createContext<FactoryContextType | undefined>(undefined)

// TODO: Replace with actual API calls
const mockFactories: Factory[] = [
  {
    id: "factory-1",
    name: "서울 제1공장",
    location: "서울",
    status: "운영중",
    workers: 45,
    power: "85%",
    temp: "23°C",
  },
  {
    id: "factory-2",
    name: "부산 제2공장",
    location: "부산",
    status: "운영중",
    workers: 38,
    power: "92%",
    temp: "25°C",
  },
  {
    id: "factory-3",
    name: "대구 제3공장",
    location: "대구",
    status: "점검중",
    workers: 12,
    power: "15%",
    temp: "20°C",
  },
  {
    id: "factory-4",
    name: "광주 제4공장",
    location: "광주",
    status: "운영중",
    workers: 52,
    power: "88%",
    temp: "24°C",
  },
]

export function FactoryProvider({ children }: { children: React.ReactNode }) {
  const [factories] = useState<Factory[]>(mockFactories)
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(factories[0])
  const [factoryData, setFactoryData] = useState<any>({})

  // 8001 포트에서 공장 데이터 가져오기
  const fetchFactoryData = async () => {
    try {
      // 요약 데이터 가져오기
      const summaryResponse = await fetch('http://localhost:8001/api/metrics/summary', {
        signal: AbortSignal.timeout(5000)
      })
      
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json()
        console.log('요약 데이터:', summaryData)
        
        // CROM 데이터 가져오기 (DATA_MART)
        const cromResponse = await fetch('http://localhost:8001/api/data/crom/DATA_MART', {
          signal: AbortSignal.timeout(5000)
        })
        
        if (cromResponse.ok) {
          const cromData = await cromResponse.json()
          console.log('CROM 데이터:', cromData)
          
          // 데이터를 대시보드 형식으로 변환
          const dashboardData = transformBackendData(summaryData, cromData)
          setFactoryData(dashboardData)
        } else {
          console.log('CROM 데이터 응답 실패:', cromResponse.status)
        }
      } else {
        console.log('요약 데이터 응답 실패:', summaryResponse.status)
      }
    } catch (err) {
      console.log('백엔드 데이터 가져오기 실패 (기본 데이터 사용):', err)
      // 실패 시 기본 데이터 사용
    }
  }

  // 백엔드 데이터를 대시보드 형식으로 변환하는 함수
  const transformBackendData = (summaryData: any, cromData: any) => {
    // 요약 데이터에서 전체 통계 추출
    const totalRows = summaryData.summary?.reduce((sum: number, db: any) => sum + db.total_rows, 0) || 0
    const totalSize = summaryData.summary?.reduce((sum: number, db: any) => sum + db.total_size_mb, 0) || 0
    
    // CROM 데이터에서 불량률, 생산량 등 추출 (실제 데이터 구조에 맞게 수정 필요)
    const defectRate = cromData?.defect_rate || 2.3
    const passCount = cromData?.pass_count || 50.8
    const failCount = cromData?.fail_count || 756
    const alerts = cromData?.alerts || 23.6
    
    return {
      'factory-1': {
        kpis: {
          defectRate: defectRate.toFixed(1),
          passCount: passCount.toFixed(1),
          failCount: Math.round(failCount),
          alerts: alerts.toFixed(1),
        },
        defectTypes: [
          {
            name: "과도 도금 + 표면 거칠기",
            value: Math.round(42),
            color: "#8b5cf6",
          },
          {
            name: "박리/미부착",
            value: Math.round(35),
            color: "#3b82f6",
          },
          {
            name: "얼룩/부식 흔적",
            value: Math.round(23),
            color: "#06b6d4",
          },
        ],
        sensorData: Array.from({ length: 7 }, (_, i) => ({
          date: `${i + 1}일`,
          temperature: 20 + Math.random() * 10,
          voltage: 220 + Math.random() * 20,
          ph: 6.5 + Math.random() * 2,
        })),
        notifications: [
          {
            id: "factory-1-1",
            type: "error" as const,
            title: "서울 제1공장 불량률 임계값 초과",
            message: "서울 제1공장에서 불량률이 5.0%를 초과했습니다.",
            time: "5분 전",
            isRead: false,
          },
          {
            id: "factory-1-2",
            type: "warning" as const,
            title: "온도 센서 이상",
            message: "라인 3번의 온도가 35.0°C를 초과하여 주의가 필요합니다.",
            time: "15분 전",
            isRead: false,
          },
        ],
      }
    }
  }

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchFactoryData()
    
    // 30초마다 데이터 새로고침
    const interval = setInterval(fetchFactoryData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // 공장별 데이터 생성 함수 (실제로는 API에서 가져올 데이터)
  const getFactoryData = (factoryId: string) => {
    // 8001 포트에서 받은 데이터가 있으면 사용, 없으면 기본 데이터
    if (factoryData[factoryId]) {
      return factoryData[factoryId]
    }

    // 기본 데이터 (fallback)
    const baseMultiplier =
      factoryId === "factory-1" ? 1.0 : factoryId === "factory-2" ? 1.2 : factoryId === "factory-3" ? 0.6 : 1.1

    return {
      kpis: {
        defectRate: (2.3 * baseMultiplier).toFixed(1),
        passCount: (50.8 * baseMultiplier).toFixed(1),
        failCount: Math.round(756 * baseMultiplier),
        alerts: (23.6 * baseMultiplier).toFixed(1),
      },
      defectTypes: [
        {
          name: "과도 도금 + 표면 거칠기",
          value: Math.round(42 * baseMultiplier),
          color: "#8b5cf6",
        },
        {
          name: "박리/미부착",
          value: Math.round(35 * baseMultiplier),
          color: "#3b82f6",
        },
        {
          name: "얼룩/부식 흔적",
          value: Math.round(23 * baseMultiplier),
          color: "#06b6d4",
        },
      ],
      sensorData: Array.from({ length: 7 }, (_, i) => ({
        date: `${i + 1}일`,
        temperature: 20 + Math.random() * 10 * baseMultiplier,
        voltage: 220 + Math.random() * 20 * baseMultiplier,
        ph: 6.5 + Math.random() * 2 * baseMultiplier,
      })),
      notifications: [
        {
          id: `${factoryId}-1`,
          type: "error" as const,
          title: `${selectedFactory?.name || "공장"} 불량률 임계값 초과`,
          message: `${selectedFactory?.name || "공장"}에서 불량률이 ${(5 * baseMultiplier).toFixed(1)}%를 초과했습니다.`,
          time: "5분 전",
          isRead: false,
        },
        {
          id: `${factoryId}-2`,
          type: "warning" as const,
          title: "온도 센서 이상",
          message: `라인 3번의 온도가 ${(35 * baseMultiplier).toFixed(1)}°C를 초과하여 주의가 필요합니다.`,
          time: "15분 전",
          isRead: false,
        },
      ],
    }
  }

  return (
    <FactoryContext.Provider value={{ factories, selectedFactory, setSelectedFactory, getFactoryData }}>
      {children}
    </FactoryContext.Provider>
  )
}

export function useFactory() {
  const context = useContext(FactoryContext)
  if (context === undefined) {
    throw new Error("useFactory must be used within a FactoryProvider")
  }
  return context
}
