import { PaymentResult } from "@/components/payment-result"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
export default async function PaymentSuccess({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  return (
    <>
      <SiteNavbar />
      <PaymentResult sessionId={params.session_id} />
      <SiteFooter />
    </>
  )
}
