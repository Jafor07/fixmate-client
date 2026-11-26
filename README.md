# FixMate Client

FixMate is a responsive repair-service marketplace for smart devices and home appliances. Customers find approved local technicians, send a detailed request, follow the job status, and pay through Stripe only after completion. Technicians manage listings and jobs; admins review services and monitor users, bookings, and payments.

**Live URL:** Not deployed yet. Configure the production URL after deploying the Next.js app.

## Stack

Next.js App Router 16, React 19, TypeScript, Tailwind CSS 4, BetterAuth with its MongoDB adapter, Express API, MongoDB, JWT, ImgBB, and Stripe Checkout.

## Local setup

1. Install Node.js 20.9+ and npm.
2. Copy `.env.example` to `.env.local` and set MongoDB, BetterAuth, API, and shared JWT values. The database name and JWT secret must match the backend. Use a separate random `BETTER_AUTH_SECRET`.
3. From the backend repository, copy its `.env.example` to `.env` and configure the same database, JWT secret, and `CLIENT_URL`.
4. Install and start the API first: `cd ../FixMate-server`, `npm ci`, `npm run dev`.
5. Install and start the client: `npm ci`, `npm run dev`.
6. Visit `http://localhost:3000`.

## Demo data and accounts

Set `SEED_ADMIN_*`, `SEED_TECH_ONE_*`, `SEED_TECH_TWO_*`, and `SEED_CUSTOMER_*` email/password values in the backend `.env`. Start the client and API against the same MongoDB, then run `npm run seed` in the backend. The script creates the BetterAuth accounts, assigns the admin/technician roles, and adds 12 approved services plus bookings in different workflow states. Passwords are supplied by the operator and never printed or committed.

To manually grant admin access, create a user through the sign-up page, then update that user’s BetterAuth `user` document role to `admin` in MongoDB. Admin self-role changes are blocked in the app.

## Environment

See `.env.example`. `NEXT_PUBLIC_API_URL` is the Express server. `BETTER_AUTH_DB_URI` and `BETTER_AUTH_DB_NAME` must point to the same database used by the API. `JWT_SECRET` must match in both repositories. For production, set the live client URL in `BETTER_AUTH_URL`, `BETTER_AUTH_TRUSTED_ORIGINS`, and backend `CLIENT_URL`.

## Features

- Public home, service search, detail, and About pages.
- BetterAuth email sign-up/sign-in with customer and technician roles; admin is assigned out of band.
- Customer dashboard: repair requests, status timeline, cancellation before acceptance, Stripe payments, and receipts/history.
- Technician dashboard: ImgBB service uploads, pending listing review, service CRUD, and guarded job status updates.
- Admin dashboard: user role management, service moderation, booking overview, and payment/revenue reporting.
- Server-side MongoDB search, category and mode filters, sort, and pagination; filters survive refresh.
- Responsive mobile navigation, empty/loading/error states, confirmation prompts, and action feedback.

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

## Deployment

Deploy the Next.js app with its server-only Mongo/BetterAuth/JWT values and public API URL. Deploy the API separately with MongoDB, Stripe, ImgBB, and the same JWT secret. Add the exact client origin to BetterAuth trusted origins and backend CORS `CLIENT_URL`. Configure the Stripe test webhook to `https://<api-host>/api/payments/webhook` and set its signing secret on the API. Never expose server secrets through `NEXT_PUBLIC_` values.

## Repositories

- Client: https://github.com/Jafor07/fixmate-client
- API: https://github.com/Jafor07/fixmate-server
