import type { Metadata } from "next"
import "./globals.css"
import "./dashboard.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ToastProvider } from "@/components/toast-provider"

export const metadata: Metadata = {
  title: "FixMate | Good repair. Good as new.",
  description:
    "Trusted local technicians for smart device and home appliance repair in Dhaka. Clear starting prices and secure payment after your repair.",
}
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
