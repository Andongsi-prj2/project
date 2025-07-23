"use client"

import { motion } from "framer-motion"
import { NotificationsPage } from "@/components/pages/notifications-page"
import { AuthModal } from "@/components/auth-modal"
import { Layout } from "@/components/layout"

export default function Notifications() {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <AuthModal />
      <Layout>
        <NotificationsPage />
      </Layout>
    </motion.div>
  )
}
