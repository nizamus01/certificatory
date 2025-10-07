require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3001;

// Create transporter from env
function createTransporter() {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  const secure = (process.env.EMAIL_SECURE === 'true');

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  return transporter;
}

app.post('/api/send-certificate', async (req, res) => {
  try {
    const { name, email, certificateBlob, filename, settings } = req.body;
    if (!email || !certificateBlob) return res.status(400).json({ error: 'Missing email or certificateBlob' });

    const transporter = createTransporter();

    // verify transporter
    try {
      await transporter.verify();
    } catch (verifyErr) {
      console.error('Transporter verification failed:', verifyErr.message || verifyErr);
      return res.status(500).json({ error: 'Email transporter verification failed. Check SMTP settings.' });
    }

    const mailOptions = {
      from: (settings && settings.senderEmail) ? `${settings.senderName || ''} <${settings.senderEmail}>` : process.env.EMAIL_USER,
      to: email,
      subject: (settings && settings.subject) || `Your Certificate`,
      text: (settings && settings.body) ? (settings.body.replace('[Name]', name)) : `Dear ${name},\n\nPlease find your certificate attached.\n\nRegards`,
      attachments: [
        {
          filename: filename || `${name.replace(/[^a-zA-Z0-9]/g, '_')}_certificate.png`,
          content: certificateBlob,
          encoding: 'base64'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    return res.json({ success: true, info });

  } catch (err) {
    console.error('Error sending certificate:', err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.get('/', (req, res) => res.send('Certificate backend running'));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
