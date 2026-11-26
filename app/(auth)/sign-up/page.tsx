"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthForm, type AuthFormData } from "@/components/auth-form"
import { authClient } from "@/lib/auth-client"
import { notify } from "@/components/toast-provider"

export default function SignUpPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  async function submit(data: AuthFormData) {
    setError("")
    const result = await authClient.signUp.email({
      name: data.name!,
      email: data.email,
      password: data.password,
      callbackURL: "/",
      role: data.role ?? "customer",
    })
    if (result.error) {
      setError(result.error.message || "Could not create your account.")
      return
    }
    notify("Your FixMate account is ready.")
    router.replace("/")
    router.refresh()
  }
  return <AuthForm mode="signup" onSubmit={submit} error={error} />
}
