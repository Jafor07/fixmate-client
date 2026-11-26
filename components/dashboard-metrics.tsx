type Metric = { label: string; value: number | string }

export function DashboardMetrics({ items }: { items: Metric[] }) {
  const numericValues = items
    .map((item) => Number(item.value))
    .filter(Number.isFinite)
  const maxValue = Math.max(1, ...numericValues)
  return (
    <section
      className="dashboard-metrics"
      aria-label="Workspace overview metrics"
    >
      <div className="stat-grid">
        {items.map(({ label, value }) => (
          <article className="stat-card" key={label}>
            <span>{label}</span>
            <b>{value}</b>
            {typeof value === "number" && (
              <span className="metric-track" aria-hidden="true">
                <span
                  style={{ width: `${Math.max(4, (value / maxValue) * 100)}%` }}
                />
              </span>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
