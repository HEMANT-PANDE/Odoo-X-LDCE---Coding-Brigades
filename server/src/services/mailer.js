const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: config.email.user, pass: config.email.pass },
    });
  }
  return transporter;
}

async function sendPasswordResetEmail(to, resetUrl) {
  await getTransporter().sendMail({
    from: config.email.user,
    to,
    subject: 'Reset your GlobeTrotter password',
    text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
    html: `<p>Someone requested a password reset for this account.</p>
<p><a href="${resetUrl}">Click here to reset your password</a> (expires in 1 hour).</p>
<p>If you didn't request this, ignore this email.</p>`,
  });
}

module.exports = { sendPasswordResetEmail };
