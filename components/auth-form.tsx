"use client"

import { useState } from "react"
import Link from "next/link"

export type AuthMode = "signin" | "signup"
export type AuthFormData = {
  name?: string
  email: string
  password: string
  role?: "customer" | "technician"
}

export function AuthForm({
  mode,
  onSubmit,
  error,
}: {
  mode: AuthMode
  onSubmit: (data: AuthFormData) => void
  error?: string | null
}) {
  const [role, setRole] = useState<"customer" | "technician">("customer")
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const signup = mode === "signup"
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (
      signup &&
      (!/[a-z]/.test(password) ||
        !/[A-Z]/.test(password) ||
        password.length < 6)
    ) {
      setPasswordError(
        "Use at least 6 characters with one uppercase and one lowercase letter."
      )
      return
    }
    setPasswordError("")
    const values = new FormData(event.currentTarget)
    onSubmit({
      name: String(values.get("name") || ""),
      email: String(values.get("email") || ""),
      password,
      role,
    })
  }
  return (
    <section className="auth-card">
      <p className="eyebrow">
        {signup ? "YOUR HOME, IN GOOD HANDS" : "WELCOME BACK"}
      </p>
      <h1>{signup ? "Let’s get things fixed." : "Good to see you again."}</h1>
      <p className="muted">
        {signup
          ? "Create your free FixMate account and find a trusted local technician."
          : "Sign in to keep your repair moving."}
      </p>
      <form onSubmit={submit} className="form-stack">
        {signup && (
          <>
            <label>
              Full name
              <input
                name="name"
                required
                minLength={2}
                placeholder="e.g. Samira Rahman"
              />
            </label>
            <fieldset className="role-select">
              <legend>I’m joining as</legend>
              <label>
                <input
                  type="radio"
                  checked={role === "customer"}
                  onChange={() => setRole("customer")}
                />{" "}
                Customer
              </label>
              <label>
                <input
                  type="radio"
                  checked={role === "technician"}
                  onChange={() => setRole("technician")}
                />{" "}
                Technician
              </label>
            </fieldset>
          </>
        )}
        <label>
          Email address
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            required
            minLength={signup ? 6 : 1}
            autoComplete={signup ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
        </label>
        {passwordError && <p className="form-error">{passwordError}</p>}
        {error && <p className="form-error">{error}</p>}
        <button className="button button-primary button-wide">
          {signup ? "Create account" : "Sign in"}
          <span>↗</span>
        </button>
      </form>
      <p className="form-foot">
        {signup ? "Already have an account?" : "New to FixMate?"}{" "}
        <Link href={signup ? "/sign-in" : "/sign-up"}>
          {signup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </section>
  )
}
