import { Dashboard } from "@/components/dashboard"
import { notFound } from "next/navigation"

const routes = new Set([
  "profile",
  "customer",
  "customer/bookings",
  "customer/payments",
  "technician",
  "technician/add-service",
  "technician/my-services",
  "technician/requests",
  "admin",
  "admin/users",
  "admin/services",
  "admin/bookings",
  "admin/transactions",
])

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  if (!routes.has(slug.join("/"))) notFound()
  return <Dashboard />
}
