export default function Loading() {
  return (
    <main className="content-wrap">
      <p className="eyebrow">FIXMATE</p>
      <h1>Getting things ready…</h1>
      <div className="service-grid">
        {Array.from({ length: 3 }, (_, i) => (
          <div className="service-card" key={i}>
            <div className="skeleton-image" />
            <div className="service-body">
              <div className="skeleton-line" />
              <div className="skeleton-line short" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
