// Vercel Serverless Function: /api/send-certificate
// Accepts POST JSON: { name, email, certificateBlob (base64), filename, settings }
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, email, certificateBlob, filename, settings } = req.body || {};

    if (!email || !certificateBlob) {
      return res.status(400).json({ error: 'Missing required fields: email and certificateBlob' });
    }

    // Configure transporter from environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: process.env.EMAIL_USER ? {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      } : undefined
    });

    // Prefer an explicit EMAIL_FROM env var, otherwise fall back to the SMTP user
    // Many SMTP providers require the From address to match the authenticated account.
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    const fromName = (settings && settings.senderName) || 'Certificatory';

    const mailOptions = {
      from: `${fromName} <${fromAddress}>`,
      to: email,
      subject: (settings && settings.subject) ? settings.subject.replace('[Name]', name || '') : `Your Certificate`,
      text: (settings && settings.body) ? settings.body.replace('[Name]', name || '') : `Hello ${name || ''},\n\nPlease find your certificate attached.`,
      attachments: [
        {
          filename: filename || `${(name || 'certificate').replace(/[^a-z0-9]/gi, '_')}.png`,
          content: certificateBlob,
          encoding: 'base64'
        }
      ]
    };

    // Helpful debug logs for Vercel function logs - remove or reduce in production
    console.log('send-certificate: mailOptions prepared for', email);

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('send-certificate: sendMail info:', info);
      return res.status(200).json({ success: true, info });
    } catch (sendErr) {
      console.error('send-certificate: sendMail error:', sendErr && (sendErr.stack || sendErr.message || sendErr));
      return res.status(502).json({ success: false, error: sendErr.message || String(sendErr) });
    }
  } catch (err) {
    console.error('Error in /api/send-certificate:', err && (err.stack || err.message || err));
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
};
