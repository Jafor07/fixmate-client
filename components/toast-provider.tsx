"use client"
import { useEffect, useState } from "react"
type ToastMessage = { id: number; text: string; kind: "success" | "error" }
export function notify(text: string, kind: ToastMessage["kind"] = "success") {
  if (typeof window !== "undefined")
    window.dispatchEvent(
      new CustomEvent("fixmate:toast", { detail: { text, kind } })
    )
}
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null)
  useEffect(() => {
    const onToast = (event: Event) => {
      const detail = (
        event as CustomEvent<{ text: string; kind: ToastMessage["kind"] }>
      ).detail
      setToast({ ...detail, id: Date.now() })
    }
    window.addEventListener("fixmate:toast", onToast)
    return () => window.removeEventListener("fixmate:toast", onToast)
  }, [])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])
  return (
    <>
      {children}
      {toast && (
        <div className={`global-toast ${toast.kind}`} role="status">
          {toast.kind === "success" ? "✓" : "!"} {toast.text}
        </div>
      )}
    </>
  )
}
