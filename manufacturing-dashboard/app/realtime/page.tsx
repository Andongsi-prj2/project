"use client"

import { motion } from "framer-motion"
import RealtimeKafkaData from "../../components/realtime-kafka-data"
import { AuthModal } from "../../components/auth-modal"
import { Layout } from "../../components/layout"

export default function RealtimePage() {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <AuthModal />
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">실시간 제조 데이터</h1>
            <p className="text-gray-400">Kafka에서 실시간으로 수집되는 제조 데이터를 확인하세요</p>
        </div>
        
          <RealtimeKafkaData />
        </div>
      </Layout>
    </motion.div>
  )
} 