import type { ReactNode } from "react"
import Link from "next/link"
import { Wrench } from "lucide-react"
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-shell">
      <aside className="auth-visual">
        <Link className="brand" href="/">
          <span className="brand-mark">
            <Wrench size={19} />
          </span>
          fixmate.
        </Link>
        <blockquote>
          “The repair was quick, the price was clear, and I knew exactly what
          was happening.”<span>— Farhana, FixMate customer in Dhaka</span>
        </blockquote>
      </aside>
      <section className="auth-form-side">{children}</section>
    </main>
  )
}
