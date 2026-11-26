"use client"
import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, money } from "@/lib/api"
import { useSession } from "@/lib/auth-client"
import type { Service } from "@/components/service-card"

export function ServiceDetail({
  idPromise,
}: {
  idPromise: Promise<{ id: string }>
}) {
  const { id } = use(idPromise)
  const router = useRouter()
  const { data: session } = useSession()
  const role = (session?.user as { role?: string } | undefined)?.role
  const [service, setService] = useState<Service | null>(null)
  const [error, setError] = useState("")
  const [requesting, setRequesting] = useState(false)
  const [notice, setNotice] = useState("")
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    api<Service>(`/api/services/${id}`)
      .then(setService)
      .catch((e) => setError(e.message))
  }, [id])
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!service) return
    setBusy(true)
    setNotice("")
    const body = Object.fromEntries(new FormData(event.currentTarget))
    try {
      await api("/api/bookings", {
        method: "POST",
        body: JSON.stringify({ ...body, serviceId: service._id }),
      })
      setNotice(
        "Your repair request is on its way. You can follow updates in your dashboard."
      )
      setRequesting(false)
    } catch (e) {
      setNotice((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  if (error)
    return (
      <main className="content-wrap">
        <div className="empty-state">
          <h1>Service not found</h1>
          <p>This listing may have been removed or is waiting for approval.</p>
          <button
            className="button button-primary"
            onClick={() => router.push("/services")}
          >
            Back to services
          </button>
        </div>
      </main>
    )
  if (!service)
    return (
      <main className="content-wrap">
        <div className="skeleton-image" />
      </main>
    )
  return (
    <>
      <div className="page-hero">
        <div className="eyebrow">
          {service.category} · {service.serviceMode}
        </div>
        <h1>{service.title}</h1>
        <p>
          Listed by {service.technicianName} · serving {service.serviceArea}
        </p>
      </div>
      <main className="content-wrap">
        <div className="detail-grid">
          <img
            className="detail-image"
            src={service.image}
            alt={service.title}
          />
          <section className="detail-panel">
            <span className="eyebrow">SERVICE DETAILS</span>
            <h1>{service.title}</h1>
            <div className="detail-price">From {money(service.basePrice)}</div>
            <p>{service.description}</p>
            <p>
              <b>Estimated time:</b> {service.estimatedDuration}
              <br />
              <b>Service type:</b> {service.serviceMode}
              <br />
              <b>Area:</b> {service.serviceArea}
            </p>
            <div className="technician-card">
              {service.technician?.image ? (
                <img
                  className="technician-avatar"
                  src={service.technician.image}
                  alt={service.technicianName}
                />
              ) : (
                <span className="technician-avatar-fallback">
                  {service.technicianName.slice(0, 1)}
                </span>
              )}
              <div>
                <b>{service.technician?.name || service.technicianName}</b>
                <p>
                  {service.technician?.area || service.serviceArea} · Verified
                  local technician
                </p>
                {service.technician?.bio && <p>{service.technician.bio}</p>}
              </div>
            </div>
            {!session?.user ? (
              <button
                className="button button-primary button-wide"
                onClick={() =>
                  router.push(
                    `/sign-in?next=${encodeURIComponent(`/services/${id}`)}`
                  )
                }
              >
                Sign in to request a repair ↗
              </button>
            ) : role !== "customer" ? (
              <div className="notice">Only customers can request a repair.</div>
            ) : !requesting ? (
              <button
                className="button button-primary button-wide"
                onClick={() => setRequesting(true)}
              >
                Request this repair <span>↗</span>
              </button>
            ) : (
              <form className="request-form" onSubmit={submit}>
                <label>
                  Your name
                  <input value={session.user.name} readOnly />
                </label>
                <label>
                  Phone number
                  <input
                    name="customerPhone"
                    required
                    placeholder="01XXXXXXXXX"
                  />
                </label>
                <label>
                  Service address
                  <input
                    name="address"
                    required
                    placeholder="House, road, area, Dhaka"
                  />
                </label>
                <label>
                  Preferred date
                  <input
                    name="preferredDate"
                    type="date"
                    required
                    min={new Date().toISOString().slice(0, 10)}
                  />
                </label>
                <label>
                  What needs fixing?
                  <textarea
                    name="problemDescription"
                    rows={3}
                    required
                    minLength={10}
                    placeholder="Tell the technician what you’re experiencing…"
                  />
                </label>
                <p className="notice">
                  No payment is due now. You’ll pay securely after your repair
                  is complete.
                </p>
                <button
                  disabled={busy}
                  className="button button-primary button-wide"
                >
                  {busy ? "Sending request…" : "Send repair request"}
                </button>
                <button
                  type="button"
                  className="small-button"
                  onClick={() => setRequesting(false)}
                >
                  Cancel
                </button>
              </form>
            )}
            {notice && <p className="notice">{notice}</p>}
          </section>
        </div>
      </main>
    </>
  )
}
