import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logging directory exists
const logDir = path.join(__dirname, 'data');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const logFilePath = path.join(logDir, 'emails.log');

// Global cache for transporter
let transporter = null;
let isEthereal = false;

// Create SMTP Transporter
async function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    console.log(`[Mail] Initializing production SMTP transporter for ${host}...`);
    transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass }
    });
    isEthereal = false;
  } else {
    console.log('[Mail] SMTP configuration missing. Dynamically generating Ethereal Email test account...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      isEthereal = true;
      console.log(`[Mail] Ethereal test account created: User=${testAccount.user}`);
    } catch (err) {
      console.error('[Mail] Failed to create Ethereal test account. Falling back to log-only mode.', err.message);
      transporter = {
        sendMail: async (mailOptions) => {
          console.log('[Mail Mock] sendMail called (No transporter configured)');
          return { messageId: 'mock-id-' + Date.now() };
        }
      };
      isEthereal = true;
    }
  }

  return transporter;
}

// Log email helper
function logEmailToFile(to, subject, htmlBody, previewUrl = null) {
  const timestamp = new Date().toISOString();
  const entry = `
========================================================================
[TIMESTAMP] ${timestamp}
[TO]        ${to}
[SUBJECT]   ${subject}
${previewUrl ? `[PREVIEW]   ${previewUrl}\n` : ''}[BODY]
${htmlBody.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
========================================================================
`;
  fs.appendFileSync(logFilePath, entry, 'utf-8');
}

// Send transactional email helper
export async function sendOrderStatusEmail(order, stage) {
  try {
    const client = await getTransporter();

    let subject = '';
    let stageTitle = '';
    let messageText = '';
    let emailContentHtml = '';

    const itemsHtml = (order.items || []).map(item => `
      <tr style="border-bottom: 1px solid #eeeeee;">
        <td style="padding: 10px 0; font-family: sans-serif; font-size: 14px; color: #2e2522;">
          ${item.name} ${item.size ? `(${item.size})` : ''}
        </td>
        <td style="padding: 10px 0; text-align: center; font-family: sans-serif; font-size: 14px; color: #2e2522;">
          x${item.quantity}
        </td>
        <td style="padding: 10px 0; text-align: right; font-family: sans-serif; font-size: 14px; font-weight: bold; color: #0d5c75;">
          ₹${item.price * item.quantity}
        </td>
      </tr>
    `).join('');

    if (stage === 'Placed') {
      subject = `Order Confirmed: ${order.orderId} - Guramrit Dine-In`;
      stageTitle = 'Order Confirmed! 🍽️';
      messageText = `Thank you! Your order has been received. Our chefs are firing up the kitchen now. We'll have it served hot at your table shortly.`;
    } else if (stage === 'cooking' || stage === 'Preparing') {
      subject = `Order ${order.orderId} is being prepared! 👨‍🍳`;
      stageTitle = 'Preparing Your Feast 👨‍🍳';
      messageText = `Your chef is now preparing your delicious dishes fresh. Estimated ready time: 10-15 minutes.`;
    } else if (stage === 'ready' || stage === 'Ready') {
      subject = `Your order ${order.orderId} is READY! 🍽️`;
      stageTitle = 'Ready & Serving! 🍽️';
      messageText = `Great news! Your order is ready and is being served at your table right now. Enjoy your meal!`;
    } else {
      // Ignore other stages
      return;
    }

    emailContentHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f8f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-text-size-adjust: none;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f8f9; padding: 40px 10px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(13, 92, 117, 0.08); overflow: hidden; border-top: 6px solid #0d5c75;">
                
                <!-- Header Banner -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #0d5c75; text-align: center;">
                    <h1 style="margin: 0; color: #c5a059; font-size: 28px; font-weight: normal; font-family: Georgia, serif; letter-spacing: 1px;">Guramrit</h1>
                    <p style="margin: 5px 0 0 0; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Resto & Cafe</p>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 40px 40px 30px 40px;">
                    <h2 style="margin: 0 0 15px 0; color: #0d5c75; font-family: Georgia, serif; font-size: 22px; border-bottom: 2px solid #f3f8f9; padding-bottom: 10px;">${stageTitle}</h2>
                    <p style="margin: 0 0 25px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                      Hi ${order.customerName || 'Valued Guest'},
                    </p>
                    <p style="margin: 0 0 25px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                      ${messageText}
                    </p>

                    <!-- Order Details Box -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fcfbf9; border: 1px solid #c5a059; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                      <tr>
                        <td style="font-family: sans-serif; font-size: 14px; color: #555555; padding-bottom: 5px;"><strong>Order ID:</strong></td>
                        <td style="font-family: sans-serif; font-size: 14px; color: #0d5c75; padding-bottom: 5px; text-align: right;"><strong>${order.orderId}</strong></td>
                      </tr>
                      <tr>
                        <td style="font-family: sans-serif; font-size: 14px; color: #555555; padding-bottom: 5px;"><strong>Table Number:</strong></td>
                        <td style="font-family: sans-serif; font-size: 14px; color: #2e2522; padding-bottom: 5px; text-align: right;">${order.tableNumber}</td>
                      </tr>
                      ${order.partySize ? `
                      <tr>
                        <td style="font-family: sans-serif; font-size: 14px; color: #555555; padding-bottom: 5px;"><strong>Guests:</strong></td>
                        <td style="font-family: sans-serif; font-size: 14px; color: #2e2522; padding-bottom: 5px; text-align: right;">${order.partySize}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="font-family: sans-serif; font-size: 14px; color: #555555;"><strong>Status:</strong></td>
                        <td style="font-family: sans-serif; font-size: 14px; color: #c5a059; font-weight: bold; text-align: right; text-transform: uppercase;">${stage}</td>
                      </tr>
                    </table>

                    <!-- Items Table -->
                    <h3 style="margin: 0 0 10px 0; color: #0d5c75; font-family: Georgia, serif; font-size: 16px;">Order Details</h3>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                      ${itemsHtml}
                      <tr>
                        <td colspan="2" style="padding: 15px 0 0 0; font-family: sans-serif; font-size: 16px; font-weight: bold; color: #2e2522;">Total Amount</td>
                        <td style="padding: 15px 0 0 0; text-align: right; font-family: sans-serif; font-size: 18px; font-weight: bold; color: #0d5c75;">₹${order.totalAmount}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #fcfbf9; text-align: center; border-top: 1px solid #f3f8f9;">
                    <p style="margin: 0; color: #888888; font-size: 12px;">This email was sent regarding your active table order at Guramrit Resto & Cafe.</p>
                    <p style="margin: 5px 0 0 0; color: #888888; font-size: 12px;">Cooperative Building, JKPM Road, JK Pur, Rayagada</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Guramrit Resto" <${client.options?.auth?.user || 'dinein@guramrit.com'}>`,
      to: order.customerEmail,
      subject: subject,
      html: emailContentHtml
    };

    console.log(`[Mail] Sending '${stage}' email to ${order.customerEmail}...`);
    const info = await client.sendMail(mailOptions);

    let previewUrl = null;
    if (isEthereal) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`===============================================`);
      console.log(`[Mail] Ethereal Test Email Sent!`);
      console.log(`[Mail] Preview URL: ${previewUrl}`);
      console.log(`===============================================`);

      try {
        order.emailPreviewUrl = previewUrl;
        if (typeof order.save === 'function') {
          await order.save();
        } else {
          const mongoose = (await import('mongoose')).default;
          const OrderModel = mongoose.model('Order');
          await OrderModel.updateOne({ orderId: order.orderId }, { emailPreviewUrl: previewUrl });
        }
        console.log(`[Mail] Saved emailPreviewUrl to database for order: ${order.orderId}`);
      } catch (dbErr) {
        console.error('[Mail] Failed to save emailPreviewUrl to database:', dbErr.message);
      }
    } else {
      console.log(`[Mail] Email sent successfully. MessageID: ${info.messageId}`);
    }

    logEmailToFile(order.customerEmail, subject, emailContentHtml, previewUrl);
  } catch (err) {
    console.error('[Mail Error] Failed to dispatch order status email:', err);
  }
}
