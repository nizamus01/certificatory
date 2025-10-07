# Certificate Backend

This is a minimal Node.js + Express backend to receive generated certificates (base64) and send them via SMTP using Nodemailer.

## Setup

1. Copy the `.env.example` to `.env` and fill SMTP credentials:

```
cp .env.example .env
# edit .env and set EMAIL_USER, EMAIL_PASS, etc.
```

2. Install dependencies:

```
cd backend
npm install
```

3. Run the server:

```
npm start
```

Default port is 3001. The endpoint is POST /api/send-certificate and accepts JSON:

{
  "name": "Recipient Name",
  "email": "recipient@example.com",
  "certificateBlob": "<base64 string>",
  "filename": "optional_filename.png",
  "settings": { "subject": "...", "body": "...", "senderName": "...", "senderEmail": "..." }
}

The backend will attach the base64 as a file and attempt to send the email.

## Notes
- For Gmail, create an app password if 2FA is enabled and use smtp.gmail.com with port 587.
- Consider SendGrid/Mailgun for production sending and use their SMTP/API.
- This minimal server does no rate-limiting or authentication. Add security before public deployment.
