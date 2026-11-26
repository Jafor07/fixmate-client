import Link from "next/link"
import { ArrowUpRight, MapPin } from "lucide-react"
import { money } from "@/lib/api"
export type Service = {
  _id: string
  title: string
  category: string
  description: string
  image: string
  basePrice: number
  estimatedDuration: string
  serviceMode: string
  serviceArea: string
  technicianName: string
  technicianEmail?: string
  technician?: {
    name?: string
    image?: string
    area?: string
    bio?: string
  } | null
}
export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link className="service-card" href={`/services/${service._id}`}>
      <img src={service.image} alt={service.title} />
      <div className="service-body">
        <span className="eyebrow">
          {service.category} · {service.serviceMode}
        </span>
        <h3>{service.title}</h3>
        <p>{service.description}</p>
        <div className="service-meta">
          <span>By {service.technicianName}</span>
          <span className="service-price">From {money(service.basePrice)}</span>
        </div>
        <div className="service-meta">
          <span>
            <MapPin
              size={12}
              style={{ display: "inline", verticalAlign: "middle" }}
            />{" "}
            {service.serviceArea}
          </span>
          <span>{service.estimatedDuration}</span>
        </div>
        <div className="featured-link">
          View details <ArrowUpRight size={14} />
        </div>
      </div>
    </Link>
  )
}
