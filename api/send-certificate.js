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

    const from = (settings && settings.senderEmail) || process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@certificatory.example';
    const fromName = (settings && settings.senderName) || 'Certificatory';

    const mailOptions = {
      from: `${fromName} <${from}>`,
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

    // Send email (do not call verify to avoid issues in serverless env)
    const info = await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, info });
  } catch (err) {
    console.error('Error in /api/send-certificate:', err && (err.stack || err.message || err));
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
};
