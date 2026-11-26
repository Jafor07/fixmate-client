const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const tokenResponse = await fetch("/api/token", { cache: "no-store" })
  const tokenData = tokenResponse.ok ? await tokenResponse.json() : null
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(tokenData?.token
        ? { Authorization: `Bearer ${tokenData.token}` }
        : {}),
      ...options.headers,
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok)
    throw new Error(data.message || "Request failed. Please try again.")
  return data
}

export const money = (amount: number) =>
  `$${Number(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
export const categories = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
]
export const roleHome = (role?: string) =>
  `/dashboard/${role === "admin" ? "admin" : role === "technician" ? "technician" : "customer"}`
