# Youdego Backend (Express + Prisma)

A minimal guide for a teammate to install, configure, and test the API with Swagger locally.

## Prerequisites
- Node.js 18+ (global `fetch` is used)
- PostgreSQL (local or remote)
- Git

## 1) Clone and checkout the backend branch
```powershell
git clone https://github.com/Mickael-Agossa/Youdego.git
Set-Location .\Youdego
git checkout backend
```

## 2) Install dependencies
```powershell
Set-Location "H:\\Projets Vaybe\\youdego"  # or the path where you cloned
npm install
```

## 3) Environment variables
Create your `.env` from the example and fill values:
```powershell
Copy-Item .env.example .env
```
Important keys to provide:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: any strong random string
- `GOOGLE_MAPS_API_KEY`: for distance calculations (optional but recommended)
- `ACTIVE_STALENESS_MS`, `TRACKING_REFRESH_MS`, `MAX_DECLINES_PER_DAY`: delivery behavior tuning
- MTN MoMo (Collections): `MTN_MOMO_SUBSCRIPTION_KEY`, `MTN_MOMO_API_USER`, `MTN_MOMO_API_KEY`, `MTN_MOMO_TARGET_ENV`
- WhatsApp (Meta Cloud API):
  - `META_WHATSAPP_TOKEN`
  - `META_WHATSAPP_PHONE_ID`

Note: `.env` is ignored by Git. Do not commit secrets.

## 4) Database and Prisma
Generate the Prisma client and apply migrations:
```powershell
npx prisma generate
npx prisma migrate dev
```
If your shell can’t find the schema automatically, use the explicit path:
```powershell
npx prisma generate --schema "H:\\Projets Vaybe\\youdego\\prisma\\schema.prisma"
npx prisma migrate dev --schema "H:\\Projets Vaybe\\youdego\\prisma\\schema.prisma"
```
(Optional) Open Prisma Studio:
```powershell
npx prisma studio
```

## 5) Run the server
```powershell
npm run dev   # reload on change
# or
npm start
```
Default: the API listens on `http://localhost:5000`.

## 6) Test with Swagger
Open Swagger UI:
- http://localhost:5000/api/docs

Recommended flow to test:
1. `POST /api/auth/register` (or `login`) to receive a session cookie.
2. Use the cookie stored by the browser to call protected endpoints.
3. Deliveries: create and list via `/api/deliveries` routes.
4. Payments (optional):
   - `POST /api/payments/initiate` with `{ amount, currency, payerPhone, deliveryId? }`
   - `GET /api/payments/{id}` to view
   - `POST /api/payments/{id}/status` to refresh status from MoMo

If Swagger doesn’t send cookies in your browser, use Postman with the `Set-Cookie` from the login response.

## Troubleshooting
- Prisma client not up-to-date (e.g., `prisma.payment` undefined):
  ```powershell
  npx prisma generate
  ```
- Prisma can’t find schema:
  ```powershell
  npx prisma generate --schema "H:\\Projets Vaybe\\youdego\\prisma\\schema.prisma"
  ```
- Ports in use: change the port in `server.js` or stop the other process.

## Notes
- This project uses cookies for auth. Keep the same browser tab when using Swagger so cookies persist.
- External services (Google Maps, MTN MoMo, WhatsApp) require valid credentials to work fully.
