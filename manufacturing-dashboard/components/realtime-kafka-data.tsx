'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Database, Activity } from 'lucide-react';

interface KafkaData {
  timestamp?: string;
  value?: any;
  [key: string]: any;
}

interface RealtimeMetricsResponse {
  data?: KafkaData[];
  message?: string;
  status?: string;
}

export default function RealtimeKafkaData() {
  const [kafkaData, setKafkaData] = useState<KafkaData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchKafkaData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 서버 연결 시도
      const response = await fetch('http://localhost:8000/api/metrics/realtime', {
        signal: AbortSignal.timeout(10000) // 10초 타임아웃
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: RealtimeMetricsResponse = await response.json();
      
      console.log('Kafka 데이터 응답:', data);
      console.log('데이터 구조 분석:', {
        hasData: !!data.data,
        dataType: typeof data.data,
        isArray: Array.isArray(data.data),
        dataLength: data.data?.length,
        firstItem: data.data?.[0],
        allKeys: data.data?.[0] ? Object.keys(data.data[0]) : []
      });
      
      if (data.data && Array.isArray(data.data)) {
        setKafkaData(prevData => {
          console.log('데이터 축적 중:', {
            기존데이터개수: prevData.length,
            새데이터개수: data.data!.length
          });
          
          // 새로운 데이터에 고유 ID 추가
          const newDataWithIds = data.data!.map((item, index) => ({
            ...item,
            _id: `${Date.now()}_${index}`,
            _timestamp: new Date().toISOString()
          }));
          
          // 기존 데이터와 새로운 데이터 합치기 (최대 50개 유지)
          const combinedData = [...prevData, ...newDataWithIds];
          const result = combinedData.slice(-50); // 최근 50개만 유지
          
          console.log('축적 완료:', {
            최종데이터개수: result.length,
            새로추가된데이터: newDataWithIds.length
          });
          
          return result;
        });
      } else {
        setKafkaData(prevData => {
          console.log('단일 데이터 축적 중:', {
            기존데이터개수: prevData.length
          });
          
          const newItem = {
            ...data,
            _id: `${Date.now()}_0`,
            _timestamp: new Date().toISOString()
          };
          
          const combinedData = [...prevData, newItem];
          const result = combinedData.slice(-50); // 최근 50개만 유지
          
          console.log('단일 데이터 축적 완료:', {
            최종데이터개수: result.length
          });
          
          return result;
        });
      }
      
      setLastUpdate(new Date());
    } catch (err) {
      // 서버 연결 실패 시 기존 데이터 유지
      console.error('서버 연결 실패:', err);
      setError('서버 연결 실패 - 기존 데이터 유지 중');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchKafkaData();
    
    // 5초마다 자동 새로고침 (서버 부하 감소)
    const interval = setInterval(fetchKafkaData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  const renderDataValue = (value: any) => {
    if (typeof value === 'object') {
      return (
        <pre className="text-sm bg-gray-50 p-3 rounded-lg overflow-auto max-h-32 border border-gray-200 text-gray-800 font-mono">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
    
    // 특별한 값들에 대한 스타일링
    const strValue = String(value);
    
    // Base64 인코딩된 이미지 감지 및 렌더링
    const isBase64Image = strValue.startsWith('data:image/') || 
        (strValue.startsWith('/9j/') && strValue.length > 100) || // JPEG
        (strValue.startsWith('iVBORw0KGgo') && strValue.length > 100) || // PNG
        (strValue.startsWith('R0lGODlh') && strValue.length > 100) || // GIF
        (strValue.startsWith('UklGR') && strValue.length > 100) || // WebP
        (strValue.length > 1000 && /^[A-Za-z0-9+/=]+$/.test(strValue)); // 일반 Base64 (길이가 길고 Base64 문자만 포함)
    
    if (isBase64Image) {
      // Base64 데이터 URL 형식으로 변환
      let imageSrc = strValue;
      if (!strValue.startsWith('data:')) {
        // 일반 Base64 문자열인 경우 data URL로 변환
        imageSrc = `data:image/jpeg;base64,${strValue}`;
      }
      
      console.log('이미지 감지됨:', {
        originalLength: strValue.length,
        isDataUrl: strValue.startsWith('data:'),
        imageSrc: imageSrc.substring(0, 100) + '...'
      });
      
      return (
        <div className="space-y-2">
          <img 
            src={imageSrc} 
            alt="실시간 제조 이미지" 
            className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedImage(imageSrc)}
            onError={(e) => {
              console.error('이미지 로드 실패:', e);
              console.error('실패한 이미지 소스:', imageSrc.substring(0, 200));
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => {
              console.log('이미지 로드 성공:', imageSrc.substring(0, 100) + '...');
            }}
          />
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded flex-1">
              <strong>이미지 데이터:</strong> {strValue.substring(0, 50)}... (길이: {strValue.length})
            </div>
            <button 
              onClick={() => setSelectedImage(imageSrc)}
              className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              확대보기
            </button>
          </div>
        </div>
      );
    }
    
    if (strValue.includes('.png')) {
      return <span className="font-mono text-purple-700 bg-purple-100 px-2 py-1 rounded">{strValue}</span>;
    }
    
    if (strValue.includes('TEMP') || strValue.includes('VOLTAGE') || strValue.includes('PH')) {
      return <span className="font-mono text-green-700 bg-green-100 px-2 py-1 rounded font-bold">{strValue}</span>;
    }
    
    if (strValue === '0' || strValue === '1') {
      return <span className="font-mono text-orange-700 bg-orange-100 px-2 py-1 rounded font-bold">{strValue}</span>;
    }
    
    return <span className="font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">{strValue}</span>;
  };

  return (
    <Card className="w-full bg-white border-2 border-blue-200 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
          <Activity className="h-5 w-5 text-blue-600" />
          실시간 Kafka 데이터
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-bold ${error ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
            {error ? "오류" : "연결됨"}
          </span>
          <span className="px-2 py-1 bg-gray-600 text-white rounded text-xs">
            {kafkaData.length}개
          </span>
          <a 
            href="/" 
            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
          >
            🏠
          </a>
          <button
            onClick={fetchKafkaData}
            disabled={loading}
            className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs disabled:opacity-50"
          >
            {loading ? '⏳' : '🔄'}
          </button>
          <button
            onClick={() => setKafkaData([])}
            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
            title="모든 데이터 지우기"
          >
            🗑️
          </button>
        </div>
      </CardHeader>
      <CardContent className="bg-white p-6">
        {error && (
          <div className="text-red-700 text-sm mb-4 p-3 bg-red-100 rounded-lg border border-red-200">
            <strong>오류:</strong> {error}
          </div>
        )}
        
        {lastUpdate && (
          <div className="text-sm text-blue-600 mb-4 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <strong>마지막 업데이트:</strong> {lastUpdate.toLocaleString('ko-KR')}
          </div>
        )}
        
        {kafkaData.length === 0 && !loading && !error && (
          <div className="text-center text-gray-600 py-8">
            <Database className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-medium">데이터가 없습니다</p>
          </div>
        )}
        
        <div className="space-y-4">
          {kafkaData.map((item, index) => {
            const isNewData = item._timestamp && 
              (new Date().getTime() - new Date(item._timestamp).getTime()) < 1000; // 1초 이내 데이터
            
            return (
              <div key={item._id || index} className={`border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 ${
                isNewData 
                  ? 'border-green-300 bg-gradient-to-br from-green-50 to-white animate-pulse' 
                  : 'border-gray-200 bg-gradient-to-br from-gray-50 to-white'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-800 bg-blue-100 px-3 py-1 rounded-full">
                      데이터 #{index + 1}
                    </span>
                    {isNewData && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full animate-bounce">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {item._timestamp && (
                      <span className="text-xs text-gray-500">
                        수신: {new Date(item._timestamp).toLocaleTimeString('ko-KR')}
                      </span>
                    )}
                    {item.timestamp && (
                      <span className="text-sm text-blue-600 font-medium">
                        {formatTimestamp(item.timestamp)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {Object.entries(item).map(([key, value]) => (
                    <div key={key} className={`p-2 bg-white rounded-lg border border-gray-100 ${
                      // 이미지 필드인 경우 전체 너비 사용
                      (key.toLowerCase().includes('image') || key.toLowerCase().includes('img') || 
                       key.toLowerCase().includes('photo') || key.toLowerCase().includes('picture') ||
                       String(value).startsWith('data:image/') || 
                       (String(value).startsWith('/9j/') && String(value).length > 100) ||
                       (String(value).startsWith('iVBORw0KGgo') && String(value).length > 100) ||
                       (String(value).startsWith('R0lGODlh') && String(value).length > 100) ||
                       (String(value).startsWith('UklGR') && String(value).length > 100) ||
                       (String(value).length > 1000 && /^[A-Za-z0-9+/=]+$/.test(String(value)))) 
                        ? 'col-span-full' : ''
                    }`}>
                      <div className="flex items-start gap-3">
                        <span className="text-sm font-bold text-gray-700 min-w-24 bg-gray-100 px-2 py-1 rounded">
                          {key}:
                        </span>
                        <div className="flex-1">
                          {renderDataValue(value)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {loading && (
          <div className="text-center py-6">
            <div className="h-8 w-8 mx-auto animate-spin text-blue-600 text-2xl">⏳</div>
            <p className="text-lg text-blue-600 mt-3 font-medium">데이터 로딩 중...</p>
          </div>
        )}
      </CardContent>
      
      {/* 이미지 확대 모달 */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 z-10"
            >
              ✕
            </button>
            <img 
              src={selectedImage} 
              alt="확대된 제조 이미지" 
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </Card>
  );
} 