"use client"

import { motion } from "framer-motion"
import { HomePage } from "@/components/pages/home-page"
import { AuthModal } from "@/components/auth-modal"
import { Layout } from "@/components/layout"

export default function Home() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <AuthModal />
      <Layout>
        <HomePage />
      </Layout>
    </motion.div>
  )
}
