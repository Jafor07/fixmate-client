import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import { ServiceDetail } from "@/components/service-detail"
export default function ServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <>
      <SiteNavbar />
      <ServiceDetail idPromise={params} />
      <SiteFooter />
    </>
  )
}
