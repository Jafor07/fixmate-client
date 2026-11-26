"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
export function PaymentResult({
  sessionId,
  cancelled = false,
}: {
  sessionId?: string
  cancelled?: boolean
}) {
  const [message, setMessage] = useState(
    cancelled
      ? "Your repair is still complete. You can pay from your dashboard when you’re ready."
      : "Confirming your payment securely…"
  )
  const [error, setError] = useState(false)
  useEffect(() => {
    if (cancelled || !sessionId) return
    api("/api/payments/verify", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    })
      .then(() =>
        setMessage("Payment received. Your repair is all paid up — thank you!")
      )
      .catch((e) => {
        setError(true)
        setMessage((e as Error).message)
      })
  }, [sessionId, cancelled])
  return (
    <main className="not-found">
      <span>{cancelled ? "↩" : error ? "!" : "✓"}</span>
      <p className="eyebrow">
        {cancelled
          ? "CHECKOUT CANCELLED"
          : error
            ? "PAYMENT CHECK"
            : "PAYMENT COMPLETE"}
      </p>
      <h1>
        {cancelled
          ? "No worries."
          : error
            ? "We couldn’t confirm that yet."
            : "That’s all sorted."}
      </h1>
      <p>{message}</p>
      <Link
        className="button button-primary"
        href="/dashboard/customer/bookings"
      >
        Back to my repairs
      </Link>
    </main>
  )
}
