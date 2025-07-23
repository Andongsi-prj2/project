"use client"

import { motion } from "framer-motion"
import { SettingsPage } from "@/components/pages/settings-page"
import { AuthModal } from "@/components/auth-modal"
import { Layout } from "@/components/layout"

export default function Settings() {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <AuthModal />
      <Layout>
        <SettingsPage />
      </Layout>
    </motion.div>
  )
}
