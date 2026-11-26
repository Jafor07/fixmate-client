"use client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { api, categories } from "@/lib/api"
import { ServiceCard, type Service } from "@/components/service-card"
type Result = { items: Service[]; total: number; page: number; pages: number }
export function ServicesBrowser() {
  const params = useSearchParams()
  const router = useRouter()
  const [search, setSearch] = useState(params.get("search") || "")
  const [category, setCategory] = useState(params.get("category") || "All")
  const [mode, setMode] = useState(params.get("mode") || "All")
  const [sort, setSort] = useState(params.get("sort") || "newest")
  const [page, setPage] = useState(Number(params.get("page") || 1))
  const [result, setResult] = useState<Result>({
    items: [],
    total: 0,
    page: 1,
    pages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reload, setReload] = useState(0)
  useEffect(() => {
    const q = new URLSearchParams()
    if (search) q.set("search", search)
    if (category !== "All") q.set("category", category)
    if (mode !== "All") q.set("mode", mode)
    q.set("sort", sort)
    q.set("page", String(page))
    router.replace(`/services?${q.toString()}`, { scroll: false })
  }, [search, category, mode, sort, page, router])
  useEffect(() => {
    let active = true
    const q = new URLSearchParams({ sort, page: String(page), limit: "9" })
    if (search) q.set("search", search)
    if (category !== "All") q.set("category", category)
    if (mode !== "All") q.set("mode", mode)
    api<Result>(`/api/services?${q}`)
      .then((data) => active && setResult(data))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [search, category, mode, sort, page, reload])
  function change(fn: () => void) {
    setLoading(true)
    setError("")
    setPage(1)
    fn()
  }
  function changePage(nextPage: number) {
    setLoading(true)
    setError("")
    setPage(nextPage)
  }
  return (
    <>
      <div className="page-hero">
        <div className="eyebrow">LOCAL HANDS, GOOD WORK</div>
        <h1>Find your fix.</h1>
        <p>
          Browse trusted technicians across Dhaka. Find the right expertise and
          know the starting price before you book.
        </p>
      </div>
      <main className="content-wrap">
        <div className="filter-bar">
          <label className="filter-search">
            <Search size={16} />
            <input
              className="filter-control"
              placeholder="Search a repair or category"
              value={search}
              onChange={(e) => change(() => setSearch(e.target.value))}
            />
          </label>
          <select
            className="filter-control"
            value={category}
            onChange={(e) => change(() => setCategory(e.target.value))}
          >
            <option>All</option>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            className="filter-control"
            value={mode}
            onChange={(e) => change(() => setMode(e.target.value))}
          >
            <option>All</option>
            <option>Home Visit</option>
            <option>Shop Drop-off</option>
          </select>
          <select
            className="filter-control"
            value={sort}
            onChange={(e) => change(() => setSort(e.target.value))}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
        <p className="muted">{result.total} services available</p>
        {error ? (
          <div className="empty-state">
            <h3>We couldn’t load services</h3>
            <p>{error}</p>
            <button
              className="button button-outline"
              onClick={() => {
                setLoading(true)
                setError("")
                setReload((n) => n + 1)
              }}
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="service-grid">
            {Array.from({ length: 6 }, (_, i) => (
              <div className="service-card" key={i}>
                <div className="skeleton-image" />
                <div className="service-body">
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                </div>
              </div>
            ))}
          </div>
        ) : result.items.length ? (
          <>
            <div className="service-grid">
              {result.items.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => changePage(page - 1)}>
                ← Previous
              </button>
              {Array.from({ length: result.pages }, (_, i) => (
                <button
                  key={i}
                  className={page === i + 1 ? "active-page" : ""}
                  onClick={() => changePage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={page >= result.pages}
                onClick={() => changePage(page + 1)}
              >
                Next →
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <span>🔎</span>
            <h3>No services found</h3>
            <p>
              Try another category or clear your filters to see more local
              experts.
            </p>
            <button
              className="button button-outline"
              onClick={() =>
                change(() => {
                  setSearch("")
                  setCategory("All")
                  setMode("All")
                  setSort("newest")
                })
              }
            >
              Clear filters
            </button>
          </div>
        )}
      </main>
    </>
  )
}
