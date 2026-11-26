"use client"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { api, categories, money, roleHome } from "@/lib/api"
import { useSession } from "@/lib/auth-client"
import type { Service } from "@/components/service-card"
import { DashboardMetrics } from "@/components/dashboard-metrics"
import { uploadServiceImage } from "@/lib/upload-image"

type Booking = {
  _id: string
  serviceTitle: string
  serviceImage: string
  category: string
  basePrice: number
  finalAmount: number
  technicianName: string
  technicianEmail: string
  customerName: string
  customerEmail: string
  customerPhone: string
  address: string
  preferredDate: string
  problemDescription: string
  status: string
  paymentStatus: string
  statusHistory?: { status: string; changedAt: string }[]
}
type User = {
  _id: string
  name: string
  email: string
  role: string
  area?: string
}
type Payment = {
  _id: string
  bookingId: string
  serviceTitle: string
  customerName: string
  customerEmail: string
  technicianName: string
  amount: number
  transactionId: string
  paidAt: string
}
type ManagedService = Service & { approvalStatus: string; isAvailable: boolean }
const titles: Record<string, string> = {
  customer: "Your repair desk",
  technician: "Technician workspace",
  admin: "Platform overview",
}
const labels: Record<string, string> = {
  home: "Overview",
  bookings: "My bookings",
  payments: "Payment history",
  "add-service": "Add a service",
  "my-services": "My services",
  requests: "Repair requests",
  users: "Manage users",
  services: "Review services",
  transactions: "Transactions",
  profile: "Update profile",
}
const statusSequence = [
  "requested",
  "accepted",
  "in-progress",
  "completed",
  "paid",
]

export function Dashboard() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [flash, setFlash] = useState("")
  const [busy, setBusy] = useState(false)
  const [services, setServices] = useState<ManagedService[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const parts = pathname.split("/").filter(Boolean)
  const currentRole =
    (session?.user as { role?: string } | undefined)?.role || "customer"
  const role = parts[1] === "profile" ? currentRole : parts[1] || ""
  const page = parts[1] === "profile" ? "profile" : parts[2] || "home"
  const endpoint =
    role === "customer"
      ? "/api/bookings/my"
      : role === "technician"
        ? "/api/bookings/technician"
        : "/api/admin/bookings"
  const needsData = useMemo(
    () => async () => {
      const tasks: Promise<unknown>[] = [
        api<Booking[]>(endpoint).then(setBookings),
      ]
      if (role === "technician")
        tasks.push(
          api<ManagedService[]>("/api/services/mine").then(setServices)
        )
      if (role === "admin")
        tasks.push(
          api<User[]>("/api/admin/users").then(setUsers),
          api<ManagedService[]>("/api/admin/services").then(setServices),
          api<Payment[]>("/api/admin/payments").then(setPayments)
        )
      if (role === "customer" && (page === "payments" || page === "home"))
        tasks.push(api<Payment[]>("/api/payments/my").then(setPayments))
      await Promise.all(tasks)
    },
    [endpoint, page, role]
  )
  useEffect(() => {
    if (isPending) return
    if (!session?.user) {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`)
      return
    }
    if (pathname !== "/dashboard/profile" && role !== currentRole) {
      router.replace(roleHome(currentRole))
      return
    }
    needsData()
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [session, isPending, currentRole, pathname, role, router, needsData])
  const user = session?.user
  async function refresh() {
    try {
      await needsData()
      setError("")
    } catch (e) {
      setError((e as Error).message)
    }
  }
  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true)
    setFlash("")
    setError("")
    try {
      await action()
      await refresh()
      setFlash(success)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  async function updateStatus(item: Booking, status: string) {
    let finalAmount = item.finalAmount
    if (status === "completed") {
      const value = window.prompt(
        "Enter the final amount in USD",
        String(item.basePrice)
      )
      if (value === null) return
      finalAmount = Number(value)
      if (!(finalAmount > 0)) {
        setError("Final amount must be greater than zero.")
        return
      }
    }
    if (
      status === "rejected" &&
      !window.confirm("Reject this repair request? This cannot be undone.")
    )
      return
    await run(
      () =>
        api(`/api/bookings/${item._id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status, finalAmount }),
        }),
      `Request updated to ${status}.`
    )
  }
  async function pay(item: Booking) {
    await run(async () => {
      const { url } = await api<{ url: string }>(
        "/api/payments/create-checkout-session",
        { method: "POST", body: JSON.stringify({ bookingId: item._id }) }
      )
      window.location.assign(url)
    }, "Opening secure checkout…")
  }
  if (isPending || !user || loading)
    return (
      <div className="dashboard-main">
        <p>Loading your FixMate workspace…</p>
      </div>
    )
  const userName = user.name || "FixMate member"
  const sideLinks =
    role === "customer"
      ? [
          ["home", "Overview"],
          ["bookings", "My bookings"],
          ["payments", "Payments"],
        ]
      : role === "technician"
        ? [
            ["home", "Overview"],
            ["add-service", "Add a service"],
            ["my-services", "My services"],
            ["requests", "Repair requests"],
          ]
        : [
            ["home", "Overview"],
            ["users", "Manage users"],
            ["services", "Review services"],
            ["bookings", "All bookings"],
            ["transactions", "Transactions"],
          ]
  async function addService(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setFlash("")
    setError("")
    try {
      const form = event.currentTarget
      const values = new FormData(form)
      const image = await uploadServiceImage(values.get("image") as File)
      const body = Object.fromEntries(
        [...values.entries()].filter(([key]) => key !== "image")
      )
      await api("/api/services", {
        method: "POST",
        body: JSON.stringify({
          ...body,
          image,
          basePrice: Number(body.basePrice),
        }),
      })
      form.reset()
      await refresh()
      setFlash(
        "Service submitted. It’ll appear in search after admin approval."
      )
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  async function updateProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = Object.fromEntries(new FormData(event.currentTarget))
    await run(
      () =>
        api("/api/users/profile", {
          method: "PATCH",
          body: JSON.stringify(fields),
        }),
      "Your profile has been updated."
    )
  }
  const profile = user as typeof user & {
    phone?: string
    area?: string
    bio?: string
  }
  const metrics =
    role === "customer"
      ? [
          { label: "My repair requests", value: bookings.length },
          {
            label: "In progress",
            value: bookings.filter((b) =>
              ["accepted", "in-progress"].includes(b.status)
            ).length,
          },
          {
            label: "Completed",
            value: bookings.filter((b) => b.status === "completed").length,
          },
          { label: "Payments made", value: payments.length },
        ]
      : role === "technician"
        ? [
            { label: "My services", value: services.length },
            {
              label: "Approved listings",
              value: services.filter((s) => s.approvalStatus === "approved")
                .length,
            },
            {
              label: "Pending requests",
              value: bookings.filter((b) => b.status === "requested").length,
            },
            {
              label: "Jobs completed",
              value: bookings.filter(
                (b) => b.status === "completed" || b.paymentStatus === "paid"
              ).length,
            },
          ]
        : [
            { label: "Registered users", value: users.length },
            { label: "Service listings", value: services.length },
            { label: "Repair jobs", value: bookings.length },
            {
              label: "Stripe revenue",
              value: money(
                payments.reduce(
                  (sum, payment) => sum + Number(payment.amount || 0),
                  0
                )
              ),
            },
          ]
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-side">
        <Link
          className="brand"
          href="/"
          style={{ color: "white", padding: "5px 9px 23px" }}
        >
          <span className="brand-mark">
            <span>⌁</span>
          </span>
          fixmate<span style={{ color: "#b4ce7a" }}>.</span>
        </Link>
        <p className="dash-brand">WORKSPACE</p>
        {sideLinks.map(([slug, label]) => (
          <Link
            key={slug}
            className={page === slug ? "active" : ""}
            href={
              slug === "home" ? roleHome(role) : `/dashboard/${role}/${slug}`
            }
          >
            {label}
          </Link>
        ))}
        <p className="dash-brand">ACCOUNT</p>
        <Link
          className={page === "profile" ? "active" : ""}
          href="/dashboard/profile"
        >
          Update profile
        </Link>
        <Link href="/">← Back to FixMate</Link>
      </aside>
      <main className="dashboard-main">
        <p className="eyebrow">{role.toUpperCase()} WORKSPACE</p>
        <h1>
          {page === "profile"
            ? "Update your profile"
            : page === "home"
              ? titles[role]
              : labels[page] || "Dashboard"}
        </h1>
        <p className="muted">
          Welcome back, {userName}. Here’s what’s happening today.
        </p>
        {flash && (
          <div className="toast" role="status">
            {flash}
          </div>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {page === "profile" ? (
          <section className="data-panel">
            <h2>Your details</h2>
            <form
              className="form-grid"
              style={{ padding: 20 }}
              onSubmit={updateProfile}
            >
              <label>
                Name
                <input name="name" defaultValue={user.name} required />
              </label>
              <label>
                Phone
                <input name="phone" defaultValue={profile.phone || ""} />
              </label>
              <label>
                Area
                <input
                  name="area"
                  defaultValue={profile.area || ""}
                  placeholder="e.g. Gulshan, Dhaka"
                />
              </label>
              <label className="span-2">
                Bio
                <textarea
                  name="bio"
                  defaultValue={profile.bio || ""}
                  rows={4}
                />
              </label>
              <button className="button button-primary" disabled={busy}>
                Save profile
              </button>
            </form>
          </section>
        ) : null}
        {page === "add-service" && role === "technician" ? (
          <section className="data-panel">
            <h2>Tell customers what you can help with</h2>
            <form
              className="form-grid"
              style={{ padding: 20 }}
              onSubmit={addService}
            >
              <label>
                Service title
                <input
                  name="title"
                  required
                  minLength={4}
                  placeholder="e.g. Split AC servicing & cleaning"
                />
              </label>
              <label>
                Category
                <select name="category" required>
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                Starting price (USD)
                <input
                  name="basePrice"
                  type="number"
                  min="1"
                  step="0.01"
                  required
                />
              </label>
              <label>
                Estimated duration
                <input
                  name="estimatedDuration"
                  required
                  placeholder="2–3 hours"
                />
              </label>
              <label>
                Service mode
                <select name="serviceMode">
                  <option>Home Visit</option>
                  <option>Shop Drop-off</option>
                </select>
              </label>
              <label>
                Service area
                <input
                  name="serviceArea"
                  required
                  placeholder="Dhanmondi, Dhaka"
                />
              </label>
              <label className="span-2">
                Description
                <textarea name="description" required minLength={20} rows={4} />
              </label>
              <label className="span-2">
                Service photo
                <input name="image" type="file" required accept="image/*" />
              </label>
              <div className="span-2">
                <p className="muted">
                  Your listing will be reviewed before it appears to customers.
                </p>
                <button className="button button-primary" disabled={busy}>
                  {busy ? "Uploading…" : "Submit for approval"}
                </button>
              </div>
            </form>
          </section>
        ) : null}
        {page === "my-services" && role === "technician" ? (
          <section className="data-panel">
            <h2>Your listings</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Price</th>
                  <th>Review status</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((item) => (
                  <tr key={item._id}>
                    <td>{item.title}</td>
                    <td>{money(item.basePrice)}</td>
                    <td>
                      <span className={`badge ${item.approvalStatus}`}>
                        {item.approvalStatus}
                      </span>
                    </td>
                    <td>{item.isAvailable ? "Available" : "Paused"}</td>
                    <td>
                      <div className="action-row">
                        <button
                          className="small-button"
                          onClick={() => {
                            const title = window.prompt(
                              "Edit service title",
                              item.title
                            )
                            if (title === null) return
                            const price = window.prompt(
                              "Edit starting price (USD)",
                              String(item.basePrice)
                            )
                            if (price === null) return
                            const description = window.prompt(
                              "Edit service description",
                              item.description
                            )
                            if (description === null) return
                            run(
                              () =>
                                api(`/api/services/${item._id}`, {
                                  method: "PATCH",
                                  body: JSON.stringify({
                                    title,
                                    basePrice: Number(price),
                                    description,
                                  }),
                                }),
                              "Service updated and sent for admin review."
                            )
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="small-button"
                          onClick={() =>
                            run(
                              () =>
                                api(`/api/services/${item._id}`, {
                                  method: "PATCH",
                                  body: JSON.stringify({
                                    isAvailable: !item.isAvailable,
                                  }),
                                }),
                              "Availability updated."
                            )
                          }
                        >
                          {item.isAvailable ? "Pause" : "Publish"}
                        </button>
                        <button
                          className="small-button"
                          onClick={() =>
                            window.confirm(
                              "Delete this service? This cannot be undone."
                            ) &&
                            run(
                              () =>
                                api(`/api/services/${item._id}`, {
                                  method: "DELETE",
                                }),
                              "Service deleted."
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!services.length && (
              <div className="empty-state">
                <h3>No services yet</h3>
                <Link
                  className="button button-primary"
                  href="/dashboard/technician/add-service"
                >
                  Add your first service
                </Link>
              </div>
            )}
          </section>
        ) : null}
        {page === "services" && role === "admin" ? (
          <section className="data-panel">
            <h2>Service listings · moderation queue</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Listing</th>
                  <th>Technician</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {services.map((item) => (
                  <tr key={item._id}>
                    <td>{item.title}</td>
                    <td>{item.technicianName}</td>
                    <td>{item.category}</td>
                    <td>{money(item.basePrice)}</td>
                    <td>
                      <span className={`badge ${item.approvalStatus}`}>
                        {item.approvalStatus}
                      </span>
                    </td>
                    <td>
                      <div className="action-row">
                        <button
                          className="small-button"
                          onClick={() =>
                            run(
                              () =>
                                api(
                                  `/api/admin/services/${item._id}/approval`,
                                  {
                                    method: "PATCH",
                                    body: JSON.stringify({
                                      approvalStatus: "approved",
                                    }),
                                  }
                                ),
                              "Service approved."
                            )
                          }
                        >
                          Approve
                        </button>
                        <button
                          className="small-button"
                          onClick={() =>
                            run(
                              () =>
                                api(
                                  `/api/admin/services/${item._id}/approval`,
                                  {
                                    method: "PATCH",
                                    body: JSON.stringify({
                                      approvalStatus: "rejected",
                                    }),
                                  }
                                ),
                              "Service rejected."
                            )
                          }
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}
        {page === "users" && role === "admin" ? (
          <section className="data-panel">
            <h2>Registered users</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Area</th>
                  <th>Role</th>
                  <th>Update role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>{item.area || "—"}</td>
                    <td>
                      <span className="badge">{item.role}</span>
                    </td>
                    <td>
                      <select
                        className="filter-control"
                        value={item.role}
                        onChange={(e) =>
                          run(
                            () =>
                              api(`/api/admin/users/${item._id}/role`, {
                                method: "PATCH",
                                body: JSON.stringify({ role: e.target.value }),
                              }),
                            "User role updated."
                          )
                        }
                      >
                        <option>customer</option>
                        <option>technician</option>
                        <option>admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}
        {(page === "home" || page === "bookings" || page === "requests") && (
          <>
            <DashboardMetrics items={metrics} />
            <section className="data-panel">
              <h2>
                {role === "technician"
                  ? "Incoming repair requests"
                  : role === "admin"
                    ? "All repair jobs"
                    : "Your repair requests"}
              </h2>
              {bookings.length ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Service / customer</th>
                      {role !== "customer" && <th>Customer</th>}
                      {role !== "technician" && <th>Technician</th>}
                      <th>Preferred date</th>
                      <th>Status</th>
                      <th>Final amount</th>
                      <th>Next step</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <b>{item.serviceTitle}</b>
                          <br />
                          <small>
                            {role === "customer"
                              ? item.technicianName
                              : item.customerName}
                          </small>
                        </td>
                        {role !== "customer" && (
                          <td>
                            {item.customerName}
                            <br />
                            {item.customerPhone}
                          </td>
                        )}
                        {role !== "technician" && (
                          <td>{item.technicianName}</td>
                        )}
                        <td>
                          {item.preferredDate
                            ? new Date(item.preferredDate).toLocaleDateString()
                            : "—"}
                        </td>
                        <td>
                          <span className={`badge ${item.status}`}>
                            {item.status}
                          </span>
                          {role === "customer" && (
                            <div className="progress-steps">
                              {statusSequence.map((s) => (
                                <span
                                  className="progress-step"
                                  key={s}
                                  style={{
                                    opacity:
                                      item.status === s ||
                                      (s === "paid" &&
                                        item.paymentStatus === "paid") ||
                                      statusSequence.indexOf(item.status) >
                                        statusSequence.indexOf(s)
                                        ? 1
                                        : 0.4,
                                  }}
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td>
                          {money(item.finalAmount || item.basePrice)}{" "}
                          {item.paymentStatus === "paid" && (
                            <span className="badge paid">paid</span>
                          )}
                        </td>
                        <td>
                          <div className="action-row">
                            {role === "technician" &&
                              item.status === "requested" && (
                                <>
                                  <button
                                    className="small-button"
                                    onClick={() =>
                                      updateStatus(item, "accepted")
                                    }
                                  >
                                    Accept
                                  </button>
                                  <button
                                    className="small-button"
                                    onClick={() =>
                                      updateStatus(item, "rejected")
                                    }
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            {role === "technician" &&
                              item.status === "accepted" && (
                                <button
                                  className="small-button"
                                  onClick={() =>
                                    updateStatus(item, "in-progress")
                                  }
                                >
                                  Start job
                                </button>
                              )}
                            {role === "technician" &&
                              item.status === "in-progress" && (
                                <button
                                  className="small-button"
                                  onClick={() =>
                                    updateStatus(item, "completed")
                                  }
                                >
                                  Mark complete
                                </button>
                              )}
                            {role === "customer" &&
                              item.status === "requested" && (
                                <button
                                  className="small-button"
                                  onClick={() =>
                                    window.confirm(
                                      "Cancel this repair request?"
                                    ) &&
                                    run(
                                      () =>
                                        api(
                                          `/api/bookings/${item._id}/cancel`,
                                          { method: "PATCH" }
                                        ),
                                      "Request cancelled."
                                    )
                                  }
                                >
                                  Cancel
                                </button>
                              )}
                            {role === "customer" &&
                              item.status === "completed" &&
                              item.paymentStatus === "unpaid" && (
                                <button
                                  className="small-button"
                                  onClick={() => pay(item)}
                                >
                                  Pay now
                                </button>
                              )}
                            {role === "customer" &&
                              item.paymentStatus === "paid" && (
                                <span>Paid ✓</span>
                              )}
                            {role === "admin" && <span>View only</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <h3>No repair jobs yet</h3>
                  <p>When someone needs a repair, you’ll see it here.</p>
                  {role === "customer" ? (
                    <Link className="button button-primary" href="/services">
                      Browse services
                    </Link>
                  ) : role === "technician" ? (
                    <Link
                      className="button button-primary"
                      href="/dashboard/technician/add-service"
                    >
                      List a service
                    </Link>
                  ) : null}
                </div>
              )}
            </section>
          </>
        )}
        {role === "customer" && page === "payments" && (
          <section className="data-panel">
            <h2>Payment history</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Repair</th>
                  <th>Technician</th>
                  <th>Amount</th>
                  <th>Transaction ID</th>
                  <th>Paid on</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{payment.serviceTitle}</td>
                    <td>{payment.technicianName}</td>
                    <td>{money(payment.amount)}</td>
                    <td>{payment.transactionId}</td>
                    <td>{new Date(payment.paidAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!payments.length && (
              <div className="empty-state">
                <h3>No payments yet</h3>
                <p>
                  Your payment receipts will be listed here once a repair is
                  complete.
                </p>
              </div>
            )}
          </section>
        )}
        {role === "admin" && page === "transactions" && (
          <PaymentsTable payments={payments} />
        )}
        {role === "admin" && page === "bookings" && (
          <BookingsTable bookings={bookings} />
        )}
        {role === "technician" && (page === "home" || page === "requests") && (
          <section className="data-panel">
            <h2>Service performance</h2>
            <div style={{ padding: 20 }}>
              <div className="progress-steps">
                {["Requested", "Accepted", "In progress", "Completed"].map(
                  (step, i) => (
                    <span
                      key={step}
                      className="progress-step"
                      style={{ padding: 16, flex: 1, textAlign: "center" }}
                    >
                      {i + 1}. {step}
                      <br />
                      <b style={{ fontSize: 20 }}>
                        {
                          bookings.filter((b) =>
                            i === 3
                              ? b.status === "completed" ||
                                b.paymentStatus === "paid"
                              : b.status ===
                                ["requested", "accepted", "in-progress"][i]
                          ).length
                        }
                      </b>
                    </span>
                  )
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
function PaymentsTable({ payments }: { payments: Payment[] }) {
  return (
    <section className="data-panel">
      <h2>Stripe transactions</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Customer</th>
            <th>Technician</th>
            <th>Amount</th>
            <th>Transaction</th>
            <th>Paid at</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment._id}>
              <td>{payment.serviceTitle}</td>
              <td>{payment.customerName}</td>
              <td>{payment.technicianName}</td>
              <td>{money(payment.amount)}</td>
              <td>{payment.transactionId}</td>
              <td>{new Date(payment.paidAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!payments.length && (
        <div className="empty-state">
          <h3>No transactions yet</h3>
        </div>
      )}
    </section>
  )
}
function BookingsTable({ bookings }: { bookings: Booking[] }) {
  return (
    <section className="data-panel">
      <h2>Platform repair jobs</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Customer</th>
            <th>Technician</th>
            <th>Status</th>
            <th>Payment</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((item) => (
            <tr key={item._id}>
              <td>{item.serviceTitle}</td>
              <td>{item.customerName}</td>
              <td>{item.technicianName}</td>
              <td>
                <span className={`badge ${item.status}`}>{item.status}</span>
              </td>
              <td>{item.paymentStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!bookings.length && (
        <div className="empty-state">
          <h3>No bookings yet</h3>
        </div>
      )}
    </section>
  )
}
