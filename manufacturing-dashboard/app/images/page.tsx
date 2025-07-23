"use client"

import { motion } from "framer-motion"
import { ImagesPage } from "@/components/pages/images-page"
import { AuthModal } from "@/components/auth-modal"
import { Layout } from "@/components/layout"

export default function Images() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <AuthModal />
      <Layout>
        <ImagesPage />
      </Layout>
    </motion.div>
  )
}
