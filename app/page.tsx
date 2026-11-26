import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  ShieldCheck,
  Star,
  Wrench,
  Zap,
} from "lucide-react"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"

const categories = [
  ["Smartphone", "📱", "Screen, battery & water damage"],
  ["Laptop & PC", "💻", "Repairs, tune-ups & data"],
  ["AC", "❄️", "Cooling, cleaning & gas refill"],
  ["Refrigerator", "🧊", "Cooling and compressor repair"],
  ["TV", "📺", "Display, sound & setup"],
  ["Washing Machine", "🫧", "Drainage, spin & installation"],
  ["Electrical", "⚡", "Wiring, switches & safety"],
]
const popular = [
  [
    "AC tune-up, done right",
    "Stay cool with a seasonal clean and performance check.",
    "$28",
    "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=900&q=85",
    "AC",
  ],
  [
    "Phone screen, made new",
    "Careful screen replacement with parts you can trust.",
    "$45",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85",
    "Smartphone",
  ],
  [
    "Give your laptop a refresh",
    "A thorough service to get your everyday machine moving.",
    "$32",
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&q=85",
    "Laptop & PC",
  ],
]
export default function HomePage() {
  return (
    <>
      <SiteNavbar />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" /> DHAKA’S LOCAL REPAIR NETWORK
            </div>
            <h1>
              Good repair.
              <br />
              <em>Good as new.</em>
            </h1>
            <p>
              Trusted hands for the devices and appliances you count on every
              day. Clear pricing, real local pros, and payment after the work is
              done.
            </p>
            <div className="hero-buttons">
              <Link className="button button-primary" href="/services">
                Find a technician <ArrowUpRight size={17} />
              </Link>
              <Link className="text-link" href="/about">
                How FixMate works <ArrowRight size={16} />
              </Link>
            </div>
            <div className="hero-proof">
              <div className="proof-avatars">
                <span>A</span>
                <span>R</span>
                <span>S</span>
                <span>+</span>
              </div>
              <div>
                <div className="stars">
                  ★★★★★ <b>4.9/5</b>
                </div>
                <small>Loved by homes across Dhaka</small>
              </div>
            </div>
          </div>
          <div className="hero-art">
            <div
              className="hero-photo"
              role="img"
              aria-label="Technician repairing a home appliance"
            />
            <div className="photo-shade" />
            <div className="hero-stamp">
              <Wrench size={18} />
              <span>
                FIXED
                <br />
                WITH CARE
              </span>
            </div>
            <div className="floating-note">
              <span className="note-check">
                <Check size={15} />
              </span>
              <div>
                <b>Payment after the repair</b>
                <small>Always in your control</small>
              </div>
            </div>
            <div className="hero-caption">
              <span>01 / 03</span>
              <span>Repairs that feel easy</span>
              <span>↗</span>
            </div>
          </div>
        </section>
        <section className="trust-strip">
          <div>
            <ShieldCheck />
            <span>
              <b>Vetted local technicians</b>
              <small>People who know their craft</small>
            </span>
          </div>
          <div>
            <Clock3 />
            <span>
              <b>At a time that works</b>
              <small>Flexible home visits</small>
            </span>
          </div>
          <div>
            <Zap />
            <span>
              <b>No payment up front</b>
              <small>Pay only when it’s fixed</small>
            </span>
          </div>
          <div>
            <Star />
            <span>
              <b>Clear, honest pricing</b>
              <small>No surprise costs</small>
            </span>
          </div>
        </section>
        <section className="section-wrap category-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">THE RIGHT HELP, RIGHT HERE</div>
              <h2>What needs a little care?</h2>
            </div>
            <Link href="/services" className="text-link">
              Browse all services <ArrowRight size={16} />
            </Link>
          </div>
          <div className="category-grid">
            {categories.map(([name, icon, line]) => (
              <Link
                className="category-tile"
                href={`/services?category=${encodeURIComponent(name)}`}
                key={name}
              >
                <span className="category-icon">{icon}</span>
                <span>
                  <b>{name}</b>
                  <small>{line}</small>
                </span>
                <ArrowUpRight className="tile-arrow" size={18} />
              </Link>
            ))}
          </div>
        </section>
        <section className="section-wrap popular-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">A GOOD PLACE TO START</div>
              <h2>Neighbourhood favourites</h2>
              <p>
                Thoughtful repairs, from technicians your neighbours recommend.
              </p>
            </div>
            <Link href="/services" className="button button-outline">
              Explore services <ArrowRight size={16} />
            </Link>
          </div>
          <div className="featured-grid">
            {popular.map(([title, desc, price, img, category], i) => (
              <Link
                href={`/services?category=${encodeURIComponent(category)}`}
                key={title}
                className={`featured-card featured-${i}`}
              >
                <img src={img} alt="" />
                <div className="featured-content">
                  <span className="eyebrow">
                    {category} · FROM {price}
                  </span>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                  <span className="featured-link">
                    See available services <ArrowUpRight size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
        <section className="how-band">
          <div className="how-image" />
          <div className="how-copy">
            <div className="eyebrow">REPAIRS, WITHOUT THE RUNAROUND</div>
            <h2>One small fix can make a big difference.</h2>
            <p>
              Tell us what’s wrong. We’ll help you find a verified local
              technician who can take it from here.
            </p>
            <Link className="button button-light" href="/about">
              See how it works <ArrowRight size={16} />
            </Link>
          </div>
          <div className="how-count">
            <span>3</span>
            <small>
              simple steps
              <br />
              to sorted
            </small>
          </div>
        </section>
        <section className="cta-section">
          <div className="eyebrow">GOOD WITH YOUR HANDS?</div>
          <h2>
            Make your craft
            <br />
            work for you.
          </h2>
          <p>
            Join a growing community of local technicians. Choose the work you
            take on and grow your business, one good job at a time.
          </p>
          <Link href="/sign-up" className="button button-primary">
            Join as a technician <ArrowUpRight size={17} />
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
