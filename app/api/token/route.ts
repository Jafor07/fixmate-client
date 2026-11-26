import { createHmac } from "node:crypto"
import { auth } from "@/lib/auth"

const encode = (value: unknown) =>
  Buffer.from(JSON.stringify(value)).toString("base64url")

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user)
    return Response.json({ message: "Sign in required" }, { status: 401 })
  const secret = process.env.JWT_SECRET
  if (!secret)
    return Response.json(
      { message: "JWT_SECRET is not configured" },
      { status: 503 }
    )
  const role = ["customer", "technician", "admin"].includes(
    String(session.user.role)
  )
    ? session.user.role
    : "customer"
  const head = encode({ alg: "HS256", typ: "JWT" })
  const body = encode({
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    role,
    exp: Math.floor(Date.now() / 1000) + 3600,
  })
  const input = `${head}.${body}`
  const signature = createHmac("sha256", secret)
    .update(input)
    .digest("base64url")
  return Response.json(
    { token: `${input}.${signature}` },
    { headers: { "Cache-Control": "no-store" } }
  )
}
