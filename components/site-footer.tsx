import Link from "next/link"
import { Wrench } from "lucide-react"
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link className="brand" href="/">
            <span className="brand-mark">
              <Wrench size={19} />
            </span>
            <span>
              fixmate<span className="brand-dot">.</span>
            </span>
          </Link>
          <p>
            Good repair starts with
            <br />
            the right person.
          </p>
          <div className="social-links">
            <a href="https://www.facebook.com/" aria-label="Facebook">
              f
            </a>
            <a href="https://www.instagram.com/" aria-label="Instagram">
              ◎
            </a>
            <a href="https://x.com/" aria-label="X">
              𝕏
            </a>
          </div>
        </div>
        <div>
          <b>Explore</b>
          <Link href="/">Home</Link>
          <Link href="/services">Find a service</Link>
          <Link href="/about">How it works</Link>
        </div>
        <div>
          <b>Popular categories</b>
          <Link href="/services?category=AC">AC repair</Link>
          <Link href="/services?category=Smartphone">Phone repair</Link>
          <Link href="/services?category=Laptop%20%26%20PC">
            Laptop service
          </Link>
        </div>
        <div>
          <b>Here to help</b>
          <a href="mailto:hello@fixmate.bd">hello@fixmate.bd</a>
          <a href="tel:+8801700000000">+880 1700 000 000</a>
          <span>Gulshan, Dhaka, Bangladesh</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} FixMate. Made for a home that works.
        </span>
        <span>Carefully fixed, locally trusted.</span>
      </div>
    </footer>
  )
}
