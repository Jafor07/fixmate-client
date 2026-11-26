import { Suspense } from "react"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import { ServicesBrowser } from "@/components/services-browser"
export default function ServicesPage() {
  return (
    <>
      <SiteNavbar />
      <Suspense
        fallback={
          <main className="content-wrap">
            <h1>Loading local services…</h1>
          </main>
        }
      >
        <ServicesBrowser />
      </Suspense>
      <SiteFooter />
    </>
  )
}
