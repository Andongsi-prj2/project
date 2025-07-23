import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { FilterProvider } from "@/components/filter-context"
import { AuthProvider } from "@/components/auth-context"
import { FactoryProvider } from "@/components/factory-context"
import { NotificationProvider } from "@/components/notification-context"
import { UserProvider } from "@/components/user-context"
import { UsersProvider } from "@/components/users-context"

export const metadata: Metadata = {
  title: "제조 품질 대시보드",
  description: "제조 품질 관리 시스템",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="dark">
      <body className="bg-gray-900 text-white">
        <AuthProvider>
          <FactoryProvider>
            <FilterProvider>
              <NotificationProvider>
                <UserProvider>
                  <UsersProvider>{children}</UsersProvider>
                </UserProvider>
              </NotificationProvider>
            </FilterProvider>
          </FactoryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
