import { PaymentResult } from "@/components/payment-result"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
export default function PaymentCancel() {
  return (
    <>
      <SiteNavbar />
      <PaymentResult cancelled />
      <SiteFooter />
    </>
  )
}
