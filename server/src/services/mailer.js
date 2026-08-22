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
    from: `GlobeTrotter <${config.email.user}>`,
    to,
    subject: 'Reset your GlobeTrotter password',
    text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
    html: `
<div style="background-color:#FBF6ED;padding:40px 16px;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(22,48,43,0.12);">
    <tr>
      <td style="background-color:#16302B;padding:28px 32px;">
        <span style="font-size:20px;font-weight:bold;color:#FBF6ED;letter-spacing:0.02em;">🌍 GlobeTrotter</span>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <h1 style="margin:0 0 16px;font-size:20px;color:#16302B;">Reset your password</h1>
        <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#16302B99;">
          Someone requested a password reset for this account. Click the button below to choose a new one.
          This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background-color:#E15B4F;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 28px;border-radius:999px;">
          Reset Password
        </a>
        <p style="margin:28px 0 0;font-size:12px;line-height:1.6;color:#16302B66;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color:#E15B4F;word-break:break-all;">${resetUrl}</a>
        </p>
        <p style="margin:20px 0 0;font-size:12px;color:#16302B66;">
          Didn't request this? You can safely ignore this email.
        </p>
      </td>
    </tr>
  </table>
</div>`,
  });
}

module.exports = { sendPasswordResetEmail };
