const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

const localLogoPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'logo.jpg');
let embeddedLogoDataUri = null;

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-GH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const toLabel = (value) =>
  String(value || '')
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getEmbeddedLogoDataUri = () => {
  if (embeddedLogoDataUri) {
    return embeddedLogoDataUri;
  }

  if (!fs.existsSync(localLogoPath)) {
    return '';
  }

  const imageBuffer = fs.readFileSync(localLogoPath);
  embeddedLogoDataUri = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
  return embeddedLogoDataUri;
};

const getEmailConfig = () => ({
  apiKey: process.env.RESEND_API_KEY,
  fromEmail: process.env.RESEND_FROM_EMAIL,
  companyName: process.env.COMPANY_NAME || 'THE SUITE',
  companyPhone: process.env.COMPANY_PHONE || 'Not provided',
  companyEmail: process.env.COMPANY_CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL || 'Not provided',
  companyAddress: process.env.COMPANY_ADDRESS || 'Not provided',
  companyLocation: process.env.COMPANY_LOCATION || process.env.COMPANY_ADDRESS || 'Not provided',
  companyWebsiteUrl: process.env.COMPANY_WEBSITE_URL || '',
  companyWhatsAppNumber: process.env.COMPANY_WHATSAPP_NUMBER || '',
  companyWhatsAppMessage: process.env.COMPANY_WHATSAPP_MESSAGE || 'Hello THE SUITE, I need help with my booking.',
});

const buildEmailHtml = ({ booking, room, config }) => {
  const guestName = escapeHtml(booking.guestName || 'Guest');
  const roomName = escapeHtml(room?.name || 'Suite Room');
  const roomCategory = escapeHtml(room?.category || 'Room');
  const roomNumber = escapeHtml(room?.roomNumber || 'Assigned at check-in');
  const companyName = escapeHtml(config.companyName);
  const companyPhone = escapeHtml(config.companyPhone);
  const companyEmail = escapeHtml(config.companyEmail);
  const companyAddress = escapeHtml(config.companyAddress);
  const companyLocation = escapeHtml(config.companyLocation);
  const companyWebsiteUrl = escapeHtml(config.companyWebsiteUrl);
  const companyWhatsAppNumber = String(config.companyWhatsAppNumber || '').replace(/\D/g, '');
  const companyWhatsAppMessage = String(config.companyWhatsAppMessage || '');
  const bookingId = escapeHtml(booking.id);
  const paymentMethod = escapeHtml(toLabel(booking.paymentMethod || 'cash_on_arrival'));
  const paymentStatus = escapeHtml(toLabel(booking.paymentStatus || 'pending'));
  const totalPrice = escapeHtml(formatCurrency(booking.totalPrice));
  const checkIn = escapeHtml(formatDate(booking.checkIn));
  const checkOut = escapeHtml(formatDate(booking.checkOut));
  const guests = escapeHtml(booking.guests || 1);
  const embeddedLogo = getEmbeddedLogoDataUri();
  const logoMarkup = embeddedLogo
    ? `<img src="${embeddedLogo}" alt="${companyName} logo" width="88" height="88" style="display:block;width:88px;height:88px;object-fit:contain;border-radius:18px;border:1px solid rgba(201,166,70,0.28);background:#0f0f0f;padding:10px;" />`
    : `<div style="display:inline-flex;align-items:center;justify-content:center;width:88px;height:88px;border-radius:18px;border:1px solid rgba(201,166,70,0.28);background:#0f0f0f;color:#c9a646;font-size:26px;font-weight:700;letter-spacing:0.18em;">TS</div>`;
  const websiteMarkup = companyWebsiteUrl
    ? `<a href="${companyWebsiteUrl}" style="color:#c9a646;text-decoration:none;">Visit website</a>`
    : '';
  const whatsappLink = companyWhatsAppNumber
    ? `https://wa.me/${companyWhatsAppNumber}?text=${encodeURIComponent(companyWhatsAppMessage)}`
    : '';
  const whatsappMarkup = whatsappLink
    ? `<a href="${whatsappLink}" style="display:inline-block;margin-top:12px;padding:12px 18px;border-radius:999px;background:#25D366;color:#08110c;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Chat on WhatsApp</a>`
    : '';

  return `
    <div style="margin:0;padding:32px 16px;background:#090909;font-family:Arial,Helvetica,sans-serif;color:#f5f5f5;">
      <div style="max-width:720px;margin:0 auto;background:#121212;border:1px solid rgba(201,166,70,0.28);border-radius:28px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.45);">
        <div style="padding:36px 34px;background:radial-gradient(circle at top, rgba(201,166,70,0.16), transparent 34%),linear-gradient(135deg,#171717 0%,#0b0b0b 100%);border-bottom:1px solid rgba(201,166,70,0.18);">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;">
            <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
              ${logoMarkup}
              <div>
                <div style="display:inline-block;padding:8px 14px;border-radius:999px;border:1px solid rgba(201,166,70,0.35);color:#d4b85c;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;">
                  Booking Confirmation
                </div>
                <p style="margin:12px 0 0;color:#9ca3af;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;">Luxury stay details enclosed</p>
              </div>
            </div>
            <div style="padding:12px 14px;border-radius:18px;background:rgba(201,166,70,0.08);border:1px solid rgba(201,166,70,0.18);min-width:170px;">
              <p style="margin:0 0 4px;color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:0.18em;">Booking reference</p>
              <p style="margin:0;color:#ffffff;font-size:14px;font-weight:700;word-break:break-word;">${bookingId}</p>
            </div>
          </div>
          <h1 style="margin:28px 0 10px;font-size:36px;line-height:1.08;font-weight:300;color:#ffffff;">Your stay at <span style="color:#c9a646;font-weight:700;letter-spacing:0.08em;">${companyName}</span> is confirmed</h1>
          <p style="margin:0;color:#d1d5db;font-size:15px;line-height:1.8;max-width:580px;">Hello ${guestName}, thank you for choosing us. We have prepared your booking summary, room details, and the essential contact and location information you may need before arrival.</p>
        </div>
        <div style="padding:30px 34px;">
          <div style="margin-bottom:18px;padding:18px 20px;border-radius:22px;background:linear-gradient(180deg,rgba(201,166,70,0.10),rgba(201,166,70,0.03));border:1px solid rgba(201,166,70,0.18);">
            <p style="margin:0 0 8px;color:#c9a646;font-size:12px;text-transform:uppercase;letter-spacing:0.22em;">Stay overview</p>
            <div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:end;">
              <div>
                <h2 style="margin:0;color:#ffffff;font-size:28px;line-height:1.2;font-weight:600;">${roomName}</h2>
                <p style="margin:6px 0 0;color:#d1d5db;font-size:14px;">${roomCategory} · Room ${roomNumber}</p>
              </div>
              <div style="text-align:right;">
                <p style="margin:0 0 4px;color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:0.18em;">Total</p>
                <p style="margin:0;color:#c9a646;font-size:24px;font-weight:700;">${totalPrice}</p>
              </div>
            </div>
          </div>
          <div style="margin-bottom:24px;padding:22px;border-radius:22px;background:#101010;border:1px solid rgba(255,255,255,0.06);">
            <h2 style="margin:0 0 14px;font-size:18px;color:#c9a646;">Reservation details</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.7;">
              <tr><td style="padding:8px 0;color:#9ca3af;border-bottom:1px solid rgba(255,255,255,0.05);">Check-in</td><td style="padding:8px 0;color:#ffffff;text-align:right;border-bottom:1px solid rgba(255,255,255,0.05);">${checkIn}</td></tr>
              <tr><td style="padding:8px 0;color:#9ca3af;border-bottom:1px solid rgba(255,255,255,0.05);">Check-out</td><td style="padding:8px 0;color:#ffffff;text-align:right;border-bottom:1px solid rgba(255,255,255,0.05);">${checkOut}</td></tr>
              <tr><td style="padding:8px 0;color:#9ca3af;border-bottom:1px solid rgba(255,255,255,0.05);">Guests</td><td style="padding:8px 0;color:#ffffff;text-align:right;border-bottom:1px solid rgba(255,255,255,0.05);">${guests}</td></tr>
              <tr><td style="padding:8px 0;color:#9ca3af;border-bottom:1px solid rgba(255,255,255,0.05);">Payment method</td><td style="padding:8px 0;color:#ffffff;text-align:right;border-bottom:1px solid rgba(255,255,255,0.05);">${paymentMethod}</td></tr>
              <tr><td style="padding:8px 0;color:#9ca3af;">Payment status</td><td style="padding:8px 0;color:#ffffff;text-align:right;">${paymentStatus}</td></tr>
            </table>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;">
            <div style="padding:20px;border-radius:20px;background:#101010;border:1px solid rgba(255,255,255,0.06);">
              <h3 style="margin:0 0 12px;font-size:16px;color:#c9a646;">Need help?</h3>
              <p style="margin:0 0 8px;color:#d1d5db;font-size:14px;">Phone: ${companyPhone}</p>
              <p style="margin:0;color:#d1d5db;font-size:14px;">Email: ${companyEmail}</p>
              ${whatsappMarkup}
            </div>
            <div style="padding:20px;border-radius:20px;background:#101010;border:1px solid rgba(255,255,255,0.06);">
              <h3 style="margin:0 0 12px;font-size:16px;color:#c9a646;">Location</h3>
              <p style="margin:0 0 8px;color:#d1d5db;font-size:14px;">${companyLocation}</p>
              <p style="margin:0;color:#9ca3af;font-size:13px;">Address: ${companyAddress}</p>
            </div>
          </div>
          <div style="margin-top:16px;padding:20px;border-radius:20px;background:#101010;border:1px solid rgba(255,255,255,0.06);">
            <h3 style="margin:0 0 10px;font-size:16px;color:#c9a646;">What to keep handy</h3>
            <p style="margin:0;color:#e5e7eb;font-size:14px;line-height:1.8;">Keep this email and your booking reference ready at check-in. If your plans change or you need support before arrival, contact ${companyName} using the details above.</p>
          </div>
          <div style="margin-top:20px;padding:20px;border-radius:20px;background:rgba(201,166,70,0.08);border:1px solid rgba(201,166,70,0.18);">
            <h3 style="margin:0 0 10px;font-size:16px;color:#c9a646;">Thank you for choosing ${companyName}</h3>
            <p style="margin:0;color:#e5e7eb;font-size:14px;line-height:1.7;">We look forward to welcoming you for a refined and comfortable stay.${websiteMarkup ? ` ${websiteMarkup}` : ''}</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

const buildEmailText = ({ booking, room, config }) => {
  const companyWhatsAppNumber = String(config.companyWhatsAppNumber || '').replace(/\D/g, '');
  const companyWhatsAppMessage = String(config.companyWhatsAppMessage || '');
  const whatsappLink = companyWhatsAppNumber
    ? `https://wa.me/${companyWhatsAppNumber}?text=${encodeURIComponent(companyWhatsAppMessage)}`
    : '';
  const details = [
    `${config.companyName} booking confirmation`,
    '',
    `Hello ${booking.guestName || 'Guest'},`,
    '',
    'Your booking has been confirmed.',
    '',
    `Booking reference: ${booking.id}`,
    `Room: ${room?.name || 'Suite Room'}`,
    `Category: ${room?.category || 'Room'}`,
    `Room number: ${room?.roomNumber || 'Assigned at check-in'}`,
    `Check-in: ${formatDate(booking.checkIn)}`,
    `Check-out: ${formatDate(booking.checkOut)}`,
    `Guests: ${booking.guests || 1}`,
    `Payment method: ${toLabel(booking.paymentMethod || 'cash_on_arrival')}`,
    `Payment status: ${toLabel(booking.paymentStatus || 'pending')}`,
    `Total: ${formatCurrency(booking.totalPrice)}`,
    '',
    `Phone: ${config.companyPhone}`,
    `Email: ${config.companyEmail}`,
    ...(whatsappLink ? [`WhatsApp: ${whatsappLink}`] : []),
    `Location: ${config.companyLocation}`,
    `Address: ${config.companyAddress}`,
    '',
    'Please keep your booking reference handy and contact us if you need any help before arrival.',
  ];

  return details.join('\n');
};

const sendBookingConfirmationEmail = async (booking) => {
  const config = getEmailConfig();

  if (!booking?.guestEmail || !config.apiKey || !config.fromEmail) {
    return { skipped: true };
  }

  const resend = new Resend(config.apiKey);
  const room = booking.room || {};

  await resend.emails.send({
    from: config.fromEmail,
    to: booking.guestEmail,
    subject: `${config.companyName} booking confirmed - ${room.name || 'Your stay'}`,
    html: buildEmailHtml({ booking, room, config }),
    text: buildEmailText({ booking, room, config }),
  });

  return { skipped: false };
};

module.exports = { sendBookingConfirmationEmail };
