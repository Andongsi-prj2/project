"use client"

import { motion } from "framer-motion"
import { use } from "react"
import { MetricDetailPage } from "@/components/pages/metric-detail-page"
import { AuthModal } from "@/components/auth-modal"
import { Layout } from "@/components/layout"

export default function MetricDetail({ params }: { params: Promise<{ name: string }> }) {
  const resolvedParams = use(params)
  
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <AuthModal />
      <Layout>
        <MetricDetailPage metricName={resolvedParams.name} />
      </Layout>
    </motion.div>
  )
}
