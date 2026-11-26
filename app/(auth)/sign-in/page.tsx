"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthForm, type AuthFormData } from "@/components/auth-form"
import { authClient } from "@/lib/auth-client"
import { notify } from "@/components/toast-provider"

export default function SignInPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  async function submit(data: AuthFormData) {
    setError("")
    const requestedDestination =
      new URLSearchParams(window.location.search).get("next") || "/"
    const destination =
      requestedDestination.startsWith("/") &&
      !requestedDestination.startsWith("//")
        ? requestedDestination
        : "/"
    const result = await authClient.signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: destination,
    })
    if (result.error) {
      setError(result.error.message || "Email or password is incorrect.")
      return
    }
    notify("You’re signed in. Welcome back.")
    router.replace(destination)
    router.refresh()
  }
  return <AuthForm mode="signin" onSubmit={submit} error={error} />
}
