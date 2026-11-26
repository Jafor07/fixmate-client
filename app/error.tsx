"use client"
import { useEffect } from "react"
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => console.error(error), [error])
  return (
    <main className="not-found">
      <span>🛠️</span>
      <div className="eyebrow">WE HIT A SNAG</div>
      <h1>Let’s try that again.</h1>
      <p>
        The page ran into an unexpected problem. Your account and repair details
        are safe.
      </p>
      <button className="button button-primary" onClick={reset}>
        Try again
      </button>
    </main>
  )
}
