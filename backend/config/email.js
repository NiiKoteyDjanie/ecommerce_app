const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"ShopHub" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    // Don't crash the app if email fails — just log it
    console.error('❌ Email error:', error.message);
  }
};

// Email Templates
exports.sendOrderConfirmation = (buyerEmail, order) => sendEmail({
  to: buyerEmail,
  subject: `✅ Order Confirmed — ShopHub #${order._id.toString().slice(-8)}`,
  html: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0f1729; padding: 24px; text-align: center;">
        <h1 style="color: #f59e0b; margin: 0; font-size: 24px;">ShopHub</h1>
      </div>
      <div style="padding: 32px; background: #f8fafc;">
        <h2 style="color: #0f1729;">Order Confirmed! 🎉</h2>
        <p style="color: #475569;">Thank you for your order. Here's your summary:</p>
        <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Total:</strong> GH₵${order.totalAmount?.toFixed(2)}</p>
          <p><strong>Payment:</strong> ${order.paymentMethod}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <h3 style="color: #0f1729;">Items:</h3>
          ${order.items.map(item => `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
              <span>${item.name} × ${item.quantity}</span>
              <span><strong>GH₵${(item.price * item.quantity).toFixed(2)}</strong></span>
            </div>
          `).join('')}
        </div>
        <p style="color: #475569;">We'll notify you when your order ships!</p>
      </div>
      <div style="background: #0f1729; padding: 16px; text-align: center;">
        <p style="color: #94a3b8; font-size: 13px; margin: 0;">© ${new Date().getFullYear()} ShopHub. All rights reserved.</p>
      </div>
    </div>
  `,
});

exports.sendShippingUpdate = (buyerEmail, order) => sendEmail({
  to: buyerEmail,
  subject: `🚚 Your Order Has Been ${order.status} — ShopHub`,
  html: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0f1729; padding: 24px; text-align: center;">
        <h1 style="color: #f59e0b; margin: 0;">ShopHub</h1>
      </div>
      <div style="padding: 32px; background: #f8fafc;">
        <h2 style="color: #0f1729;">
          ${order.status === 'Shipped' ? '🚚 Your order is on the way!' : '📦 Your order has been delivered!'}
        </h2>
        <p style="color: #475569;">Order <strong>#${order._id.toString().slice(-8)}</strong> is now <strong>${order.status}</strong>.</p>
        <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p><strong>Total Paid:</strong> GH₵${order.totalAmount?.toFixed(2)}</p>
          <p><strong>Shipping To:</strong> ${order.shippingAddress?.street}, ${order.shippingAddress?.city}</p>
        </div>
      </div>
    </div>
  `,
});

module.exports = { sendOrderConfirmation: exports.sendOrderConfirmation, sendShippingUpdate: exports.sendShippingUpdate };