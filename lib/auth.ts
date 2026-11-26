import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { APIError, createAuthMiddleware } from "better-auth/api"

// Defer the connection until the first auth request so a production build does
// not need access to a live MongoDB instance.
const client = new MongoClient(
  process.env.BETTER_AUTH_DB_URI || "mongodb://127.0.0.1:27017"
)
const db = client.db(process.env.BETTER_AUTH_DB_NAME || "fixmate")

export const auth = betterAuth({
  appName: "FixMate",
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: (
    process.env.BETTER_AUTH_TRUSTED_ORIGINS ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000"
  )
    .split(",")
    .map((origin) => origin.trim()),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 72,
  },
  user: {
    additionalFields: {
      role: {
        type: ["customer", "technician"],
        input: true,
        defaultValue: "customer",
      },
      phone: { type: "string", input: true, required: false },
      area: { type: "string", input: true, required: false },
      bio: { type: "string", input: true, required: false },
    },
  },
  database: mongodbAdapter(db, {
    client,
  }),
  hooks: {
    before: createAuthMiddleware(async (context) => {
      if (context.path !== "/sign-up/email") return
      const password = context.body.password
      if (
        typeof password !== "string" ||
        !/[a-z]/.test(password) ||
        !/[A-Z]/.test(password)
      ) {
        throw APIError.from("BAD_REQUEST", {
          code: "INVALID_PASSWORD",
          message:
            "Password must include at least one uppercase and one lowercase letter.",
        })
      }
      if (
        context.body.role !== "customer" &&
        context.body.role !== "technician"
      )
        context.body.role = "customer"
    }),
  },
})
