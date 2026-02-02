const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // or 'outlook', 'yahoo', etc.
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Welcome Email Template
const getWelcomeEmailTemplate = (userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f8f9fa;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
        }
        .content h2 {
          color: #2C3E50;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .content p {
          color: #5A5A5A;
          line-height: 1.6;
          font-size: 16px;
          margin-bottom: 20px;
        }
        .features {
          background: #F8F9FA;
          border-radius: 8px;
          padding: 20px;
          margin: 30px 0;
        }
        .feature {
          display: flex;
          align-items: start;
          margin-bottom: 15px;
        }
        .feature-icon {
          font-size: 24px;
          margin-right: 15px;
        }
        .feature-text {
          color: #2C3E50;
          font-size: 15px;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          padding: 15px 40px;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          background: #F8F9FA;
          padding: 30px;
          text-align: center;
          color: #8B8B8B;
          font-size: 14px;
        }
        .social-links {
          margin-top: 20px;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          color: #667eea;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏔️ Welcome to EverestMart</h1>
        </div>
        
        <div class="content">
          <h2>Hello ${userName}! 👋</h2>
          <p>
            Thank you for joining EverestMart! We're thrilled to have you as part of our community.
            Your account has been successfully created, and you're all set to start shopping.
          </p>
          
          <div class="features">
            <div class="feature">
              <span class="feature-icon">⚡</span>
              <span class="feature-text"><strong>10-Minute Delivery</strong> - Lightning-fast delivery to your doorstep</span>
            </div>
            <div class="feature">
              <span class="feature-icon">✨</span>
              <span class="feature-text"><strong>Premium Quality</strong> - Handpicked products from trusted sources</span>
            </div>
            <div class="feature">
              <span class="feature-icon">💰</span>
              <span class="feature-text"><strong>Best Prices</strong> - Competitive pricing without compromise</span>
            </div>
            <div class="feature">
              <span class="feature-icon">📦</span>
              <span class="feature-text"><strong>Live Tracking</strong> - Monitor your delivery in real-time</span>
            </div>
          </div>
          
          <center>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="cta-button">
              Start Shopping Now
            </a>
          </center>
          
          <p style="margin-top: 30px; font-size: 14px; color: #8B8B8B;">
            Need help? Contact our support team at 
            <a href="mailto:support@everestmart.com" style="color: #667eea;">support@everestmart.com</a>
          </p>
        </div>
        
        <div class="footer">
          <p>© 2025 EverestMart. All rights reserved.</p>
          <p>Premium groceries delivered in 10 minutes</p>
          <div class="social-links">
            <a href="#">Facebook</a> • 
            <a href="#">Twitter</a> • 
            <a href="#">Instagram</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Login Notification Email Template
const getLoginNotificationTemplate = (userName, loginTime, ipAddress) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f8f9fa;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header {
          background: #2C3E50;
          padding: 30px 20px;
          text-align: center;
          color: white;
        }
        .content {
          padding: 40px 30px;
        }
        .info-box {
          background: #F8F9FA;
          border-left: 4px solid #667eea;
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .info-item {
          margin: 10px 0;
          color: #2C3E50;
        }
        .alert {
          background: #FFF3CD;
          border-left: 4px solid #FFC107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          color: #856404;
        }
        .footer {
          background: #F8F9FA;
          padding: 20px;
          text-align: center;
          color: #8B8B8B;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Account Login Notification</h1>
        </div>
        
        <div class="content">
          <h2>Hello ${userName},</h2>
          <p>We detected a new login to your EverestMart account.</p>
          
          <div class="info-box">
            <div class="info-item"><strong>Time:</strong> ${loginTime}</div>
            <div class="info-item"><strong>Location:</strong> ${ipAddress || 'Unknown'}</div>
            <div class="info-item"><strong>Device:</strong> Web Browser</div>
          </div>
          
          <div class="alert">
            <strong>⚠️ Not you?</strong> If you didn't log in, please secure your account immediately by changing your password.
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #8B8B8B;">
            Need help? Contact us at 
            <a href="mailto:support@everestmart.com" style="color: #667eea;">support@everestmart.com</a>
          </p>
        </div>
        
        <div class="footer">
          <p>© 2025 EverestMart. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Order Confirmation Email Template
const getOrderConfirmationTemplate = (userName, orderId, orderTotal, items) => {
  const itemsHTML = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #E8ECEF;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E8ECEF; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E8ECEF; text-align: right;">₹${item.price}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f8f9fa;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
          padding: 40px 20px;
          text-align: center;
          color: white;
        }
        .content {
          padding: 40px 30px;
        }
        .order-id {
          background: #F8F9FA;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
          font-size: 18px;
          font-weight: 600;
          color: #2C3E50;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th {
          background: #F8F9FA;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #2C3E50;
        }
        .total {
          background: #F8F9FA;
          padding: 15px;
          margin-top: 20px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 20px;
          font-weight: 600;
          color: #2C3E50;
        }
        .footer {
          background: #F8F9FA;
          padding: 30px;
          text-align: center;
          color: #8B8B8B;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Order Confirmed!</h1>
        </div>
        
        <div class="content">
          <h2>Thank you, ${userName}!</h2>
          <p>Your order has been confirmed and is being prepared for delivery.</p>
          
          <div class="order-id">
            Order ID: #${orderId}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <div class="total">
            <span>Total Amount:</span>
            <span>₹${orderTotal}</span>
          </div>
          
          <p style="margin-top: 30px;">
            🚴 Your order will be delivered within 10 minutes. Track your order in real-time from your dashboard.
          </p>
        </div>
        
        <div class="footer">
          <p>© 2025 EverestMart. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send Welcome Email
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"EverestMart" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '🎉 Welcome to EverestMart - Your Premium Grocery Delivery',
      html: getWelcomeEmailTemplate(userName)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Send Login Notification
const sendLoginNotification = async (userEmail, userName, ipAddress) => {
  try {
    const transporter = createTransporter();
    const loginTime = new Date().toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'long'
    });
    
    const mailOptions = {
      from: `"EverestMart Security" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '🔐 New Login to Your EverestMart Account',
      html: getLoginNotificationTemplate(userName, loginTime, ipAddress)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Login notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending login notification:', error);
    return { success: false, error: error.message };
  }
};

// Send Order Confirmation
const sendOrderConfirmation = async (userEmail, userName, orderId, orderTotal, items) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"EverestMart Orders" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `✅ Order Confirmed - #${orderId}`,
      html: getOrderConfirmationTemplate(userName, orderId, orderTotal, items)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending order confirmation:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendLoginNotification,
  sendOrderConfirmation
};
