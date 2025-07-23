"use client"

import { motion } from "framer-motion"
import { FactoryPage } from "@/components/pages/factory-page"
import { AuthModal } from "@/components/auth-modal"
import { Layout } from "@/components/layout"

export default function Factory() {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <AuthModal />
      <Layout>
        <FactoryPage />
      </Layout>
    </motion.div>
  )
}
