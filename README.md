# Certificatory — Certificate Generator & Email Tool

A lightweight web app that lets you upload a certificate template, position the recipient name visually, upload a CSV of recipients, generate personalized certificates in the browser, and (optionally) send them by email via a backend API.

This repository contains:
- `certificate-generator.html` — The full frontend single-file app (drag & drop template, preview, CSV upload, batch generation).
- `backend/` — Minimal Node.js + Express backend that accepts certificate base64 and sends email using SMTP (nodemailer).

Why use this
- Replace manual certificate editing with an automated, visual workflow
- Generate hundreds of certificates quickly
- Optional backend enables automated emailing and integration with real SMTP/email providers

Quickstart
1. Frontend (demo mode)
	- Open `certificate-generator.html` in your browser (double-click or serve via a static server).
	- Upload a template image and either upload a CSV or click "Load Sample Data".
	- Position the name, set font options, and click "Generate All Certificates" (demo: emails are simulated).

2. Backend (for real email sending)
	- Copy `backend/.env.example` to `backend/.env` and set your SMTP credentials.
	- Install deps and run the server:

```bash
cd backend
npm install
node server.js
```

	- In the frontend UI (Step 4), set `Backend API URL` to the backend address, for example `http://localhost:3001`.
	- Now when you generate certificates, the frontend will POST each certificate to `/api/send-certificate` and the backend will send them.

Backend API contract
- Endpoint: POST /api/send-certificate
- Content-Type: application/json
- Body:
```json
{
  "name": "Recipient Name",
  "email": "recipient@example.com",
  "certificateBlob": "<base64 PNG data>",
  "filename": "optional_filename.png",
  "settings": {
	 "subject": "...",
	 "body": "...",
	 "senderName": "...",
	 "senderEmail": "..."
  }
}
```
- Response: JSON { success: true } on success, or { error: "..." } and non-200 on failure.

Security notes
- Do not commit SMTP credentials. Use `.env` and environment variables in production.
- Add authentication (API key or JWT) and rate-limiting before exposing the backend publicly.
- For higher volume, prefer transactional email services (SendGrid, Mailgun, Amazon SES).

Next steps & enhancements
- Add SendGrid integration (API + SDK) instead of raw SMTP for better deliverability.
- Implement queueing (Redis + Bull) for large batches and retry support.
- Add simple auth (Bearer token) and CORS restrictions.
- Add E2E tests and CI for the backend.

If you'd like, I can:
- Wire SendGrid and provide deployment steps to Vercel/Render/Railway.
- Add a simple bearer-token auth middleware and update the frontend to include the token.
- Implement a queuing worker for retries and concurrency control.

Enjoy — tell me which next step you'd like me to implement and I'll do it.

## GitHub Actions + Vercel (CI)

This repo includes a GitHub Actions workflow `.github/workflows/vercel-deploy.yml` that triggers on pushes to `main` and deploys to Vercel using the community action.

To enable it, add these repository secrets under Settings → Secrets:
- `VERCEL_TOKEN` — your personal Vercel token (from your Vercel account settings).
- `VERCEL_ORG_ID` — your Vercel organization ID.
- `VERCEL_PROJECT_ID` — your Vercel project ID.

After adding the secrets, pushes to `main` will automatically trigger a production deploy.