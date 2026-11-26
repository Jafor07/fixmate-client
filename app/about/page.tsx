import Link from "next/link"
import { CheckCircle2, Search, Wrench, CreditCard } from "lucide-react"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
const steps = [
  [
    Search,
    "Tell us what needs fixing",
    "Browse trusted services by device, appliance, area and price. Choose the repair that fits your home.",
  ],
  [
    Wrench,
    "Meet your local technician",
    "Send a repair request with your address, preferred date and a description. Your technician confirms and keeps you updated.",
  ],
  [
    CreditCard,
    "Pay once it’s working",
    "Track every step in your dashboard. When the repair is complete, pay securely through Stripe.",
  ],
]
export default function AboutPage() {
  return (
    <>
      <SiteNavbar />
      <main>
        <section className="page-hero">
          <div className="eyebrow">A BETTER WAY TO GET IT FIXED</div>
          <h1>Repair, with a little more peace of mind.</h1>
          <p>
            FixMate brings local technicians and the people who need them
            together—with clear steps, honest prices, and no payment before the
            work is done.
          </p>
        </section>
        <section className="content-wrap">
          <div className="about-steps">
            {steps.map(([Icon, title, description], i) => (
              <article className="about-step" key={String(title)}>
                <span>0{i + 1}</span>
                <h3>
                  <Icon
                    size={17}
                    style={{
                      display: "inline",
                      verticalAlign: "middle",
                      marginRight: 7,
                    }}
                  />
                  {String(title)}
                </h3>
                <p>{String(description)}</p>
              </article>
            ))}
          </div>
          <div className="data-panel" style={{ padding: 25, marginTop: 30 }}>
            <h2>Good work should be easy to trust.</h2>
            <p className="muted">
              Every service listing is reviewed before customers can book. You
              see the starting price up front and stay in control of the repair
              request. Technicians update the job as they work, and your payment
              stays between you and Stripe until the job is complete.
            </p>
            <ul className="about-list">
              <li>
                <CheckCircle2 /> Verified repair professionals
              </li>
              <li>
                <CheckCircle2 /> Clear job status from request to completion
              </li>
              <li>
                <CheckCircle2 /> Secure payment only after repair
              </li>
            </ul>
            <Link className="button button-primary" href="/services">
              Find a service <span>↗</span>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
