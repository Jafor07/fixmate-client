"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { Menu, Wrench, X } from "lucide-react"
import { signOut, useSession } from "@/lib/auth-client"
import { roleHome } from "@/lib/api"
import { notify } from "@/components/toast-provider"

const links = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "How it works", href: "/about" },
]
export function SiteNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState(false)
  const role = (session?.user as { role?: string } | undefined)?.role
  async function logout() {
    await signOut()
    notify("You’ve been signed out.")
    router.push("/")
    router.refresh()
  }
  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link className="brand" href="/">
          <span className="brand-mark">
            <Wrench size={19} />
          </span>
          <span>
            fixmate<span className="brand-dot">.</span>
          </span>
        </Link>
        <nav className="desktop-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              className={
                pathname === link.href || pathname.startsWith(`${link.href}/`)
                  ? "nav-active"
                  : ""
              }
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          {session?.user ? (
            <div className="profile-wrap">
              <button
                className="avatar-button"
                onClick={() => setProfile(!profile)}
                aria-label="Open profile menu"
              >
                {session.user.image ? (
                  <img src={session.user.image} alt="" />
                ) : (
                  session.user.name.slice(0, 1).toUpperCase()
                )}
                <span>{session.user.name.split(" ")[0]}</span>
                <span>⌄</span>
              </button>
              {profile && (
                <div className="profile-menu">
                  <strong>{session.user.name}</strong>
                  <span className="role-pill">{role || "customer"}</span>
                  <Link href={roleHome(role)}>Dashboard</Link>
                  <Link href="/dashboard/profile">Update profile</Link>
                  <button onClick={logout}>Sign out</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link className="nav-login" href="/sign-in">
                Sign in
              </Link>
              <Link className="button button-primary nav-cta" href="/sign-up">
                Get started <span>↗</span>
              </Link>
            </>
          )}
          <button
            className="menu-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="mobile-nav">
          {links.map((link) => (
            <Link
              onClick={() => setOpen(false)}
              key={link.href}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
          {session?.user ? (
            <>
              <div className="mobile-user">
                <b>{session.user.name}</b>
                <span className="role-pill">{role || "customer"}</span>
              </div>
              <Link href={roleHome(role)}>Dashboard</Link>
              <Link href="/dashboard/profile">Update profile</Link>
              <button onClick={logout}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/sign-in">Sign in</Link>
              <Link href="/sign-up">Create account</Link>
            </>
          )}
        </nav>
      )}
    </header>
  )
}
