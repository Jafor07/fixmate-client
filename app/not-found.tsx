import Link from "next/link"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
export default function NotFound() {
  return (
    <>
      <SiteNavbar />
      <main className="not-found">
        <span>🔧</span>
        <div className="eyebrow">404 · A LOOSE SCREW IN THE ROUTE</div>
        <h1>Looks like this page needs a fix.</h1>
        <p>We couldn’t find what you were looking for.</p>
        <Link className="button button-primary" href="/">
          Back to home
        </Link>
      </main>
      <SiteFooter />
    </>
  )
}
