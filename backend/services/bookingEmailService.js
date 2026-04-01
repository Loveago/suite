const { Resend } = require('resend');

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

const PROPERTY_EMAIL_THEMES = {
  'the-suite-tema': {
    companyName: process.env.THE_SUITE_COMPANY_NAME || process.env.COMPANY_NAME || 'THE SUITE',
    companyPhone: process.env.THE_SUITE_COMPANY_PHONE || process.env.COMPANY_PHONE || 'Not provided',
    companyEmail: process.env.THE_SUITE_COMPANY_CONTACT_EMAIL || process.env.COMPANY_CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL || 'Not provided',
    companyAddress: process.env.THE_SUITE_COMPANY_ADDRESS || process.env.COMPANY_ADDRESS || 'Not provided',
    companyLocation: process.env.THE_SUITE_COMPANY_LOCATION || process.env.COMPANY_LOCATION || process.env.COMPANY_ADDRESS || 'Not provided',
    companyWebsiteUrl: process.env.THE_SUITE_COMPANY_WEBSITE_URL || process.env.COMPANY_WEBSITE_URL || '',
    companyWhatsAppNumber: process.env.THE_SUITE_COMPANY_WHATSAPP_NUMBER || process.env.COMPANY_WHATSAPP_NUMBER || '',
    companyWhatsAppMessage: process.env.THE_SUITE_COMPANY_WHATSAPP_MESSAGE || process.env.COMPANY_WHATSAPP_MESSAGE || 'Hello THE SUITE, I need help with my booking.',
    mapsUrl: process.env.THE_SUITE_GOOGLE_MAPS_URL || '',
    variant: 'suite',
  },
  'kingstel-escape-accra': {
    companyName: process.env.KINGSTEL_ESCAPE_COMPANY_NAME || 'Kingstel Escape',
    companyPhone: process.env.KINGSTEL_ESCAPE_COMPANY_PHONE || process.env.COMPANY_PHONE || 'Not provided',
    companyEmail: process.env.KINGSTEL_ESCAPE_COMPANY_CONTACT_EMAIL || process.env.COMPANY_CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL || 'Not provided',
    companyAddress: process.env.KINGSTEL_ESCAPE_COMPANY_ADDRESS || process.env.COMPANY_ADDRESS || 'Not provided',
    companyLocation: process.env.KINGSTEL_ESCAPE_COMPANY_LOCATION || 'Accra, Ghana',
    companyWebsiteUrl: process.env.KINGSTEL_ESCAPE_COMPANY_WEBSITE_URL || process.env.COMPANY_WEBSITE_URL || '',
    companyWhatsAppNumber: process.env.KINGSTEL_ESCAPE_COMPANY_WHATSAPP_NUMBER || process.env.COMPANY_WHATSAPP_NUMBER || '',
    companyWhatsAppMessage: process.env.KINGSTEL_ESCAPE_COMPANY_WHATSAPP_MESSAGE || 'Hello Kingstel Escape, I need help with my booking.',
    mapsUrl: process.env.KINGSTEL_ESCAPE_GOOGLE_MAPS_URL || '',
    variant: 'kingstel',
  },
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
  mapsUrl: process.env.GOOGLE_MAPS_URL || '',
  variant: 'suite',
});

const getPropertyKey = (room) => {
  const normalizedSlug = room?.property?.slug?.trim().toLowerCase();
  const normalizedName = room?.property?.name?.trim().toLowerCase();

  if (normalizedSlug && PROPERTY_EMAIL_THEMES[normalizedSlug]) {
    return normalizedSlug;
  }

  if (normalizedName === 'kingstel escape' || normalizedName === 'american house') {
    return 'kingstel-escape-accra';
  }

  return 'the-suite-tema';
};

const getEmailBranding = (room) => {
  const baseConfig = getEmailConfig();
  const propertyTheme = PROPERTY_EMAIL_THEMES[getPropertyKey(room)] || PROPERTY_EMAIL_THEMES['the-suite-tema'];

  return {
    ...baseConfig,
    ...propertyTheme,
  };
};

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
  const companyMapsUrl = escapeHtml(config.mapsUrl || '');
  const companyWhatsAppNumber = String(config.companyWhatsAppNumber || '').replace(/\D/g, '');
  const companyWhatsAppMessage = String(config.companyWhatsAppMessage || '');
  const bookingId = escapeHtml(booking.id);
  const paymentMethod = escapeHtml(toLabel(booking.paymentMethod || 'cash_on_arrival'));
  const paymentStatus = escapeHtml(toLabel(booking.paymentStatus || 'pending'));
  const totalPrice = escapeHtml(formatCurrency(booking.totalPrice));
  const checkIn = escapeHtml(formatDate(booking.checkIn));
  const checkOut = escapeHtml(formatDate(booking.checkOut));
  const guests = escapeHtml(booking.guests || 1);
  const websiteMarkup = companyWebsiteUrl
    ? `<a href="${companyWebsiteUrl}" style="color:#c9a646;text-decoration:none;">Visit website</a>`
    : '';
  const whatsappLink = companyWhatsAppNumber
    ? `https://wa.me/${companyWhatsAppNumber}?text=${encodeURIComponent(companyWhatsAppMessage)}`
    : '';
  const whatsappMarkup = whatsappLink
    ? `<a href="${whatsappLink}" style="display:inline-block;margin-top:12px;padding:12px 18px;border-radius:999px;background:#c9a646;color:#111111;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Chat on WhatsApp</a>`
    : '';
  const mapsMarkup = companyMapsUrl
    ? `<a href="${companyMapsUrl}" style="display:inline-block;margin-top:12px;margin-left:${whatsappMarkup ? '10px' : '0'};padding:12px 18px;border-radius:999px;border:1px solid ${config.variant === 'kingstel' ? '#7c3aed' : '#c9a646'};color:${config.variant === 'kingstel' ? '#c4b5fd' : '#d4b85c'};text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Open in Google Maps</a>`
    : '';
  const preheader = `Booking confirmed for ${roomName}. Check-in ${checkIn}, check-out ${checkOut}, total ${totalPrice}.`;

  if (config.variant === 'kingstel') {
    return `
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
        ${preheader}
      </div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0;padding:0;width:100%;background:linear-gradient(180deg,#09090f 0%,#120f1f 100%);font-family:Arial,Helvetica,sans-serif;">
        <tr>
          <td align="center" style="padding:28px 12px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:700px;background:linear-gradient(180deg,#181127 0%,#0f0b18 100%);border:1px solid #31204f;border-radius:28px;overflow:hidden;">
              <tr>
                <td style="padding:32px 28px 24px;background:radial-gradient(circle at top right,#37215f 0%,#181127 45%,#120d1f 100%);border-bottom:1px solid #31204f;">
                  <div style="display:inline-block;padding:10px 14px;border:1px solid #6d47b3;border-radius:999px;color:#d8c4ff;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;">Kingstel Escape Confirmation</div>
                  <div style="margin-top:18px;font-size:30px;line-height:1.2;color:#ffffff;font-weight:500;">Your <span style="color:#c4b5fd;">Kingstel Escape</span> stay is ready</div>
                  <div style="margin-top:12px;color:#ddd6fe;font-size:15px;line-height:1.8;">Hello ${guestName}, welcome to a more elevated city stay. Your reservation details, directions, and support links are below.</div>
                  <div style="margin-top:20px;display:inline-block;padding:14px 18px;background:rgba(20,14,33,0.72);border:1px solid #4b2d7f;border-radius:18px;">
                    <div style="color:#a78bfa;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">Booking reference</div>
                    <div style="margin-top:6px;color:#ffffff;font-size:15px;font-weight:700;word-break:break-word;">${bookingId}</div>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 24px 28px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;background:linear-gradient(135deg,rgba(76,29,149,0.24) 0%,rgba(30,27,75,0.2) 100%);border:1px solid #3b2c61;border-radius:22px;">
                    <tr>
                      <td style="padding:22px;">
                        <div style="color:#c4b5fd;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;">Stay overview</div>
                        <div style="margin-top:14px;color:#ffffff;font-size:30px;font-weight:600;line-height:1.2;">${roomName}</div>
                        <div style="margin-top:8px;color:#ddd6fe;font-size:14px;">${roomCategory} · Room ${roomNumber}</div>
                        <div style="margin-top:18px;display:inline-block;padding:10px 14px;border-radius:999px;background:#221536;border:1px solid #4b2d7f;color:#e9d5ff;font-size:13px;font-weight:700;">Total ${totalPrice}</div>
                      </td>
                    </tr>
                  </table>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;background-color:#120f1d;border:1px solid #2a223a;border-radius:20px;">
                    <tr>
                      <td style="padding:20px 20px 12px;color:#c4b5fd;font-size:18px;font-weight:700;">Reservation details</td>
                    </tr>
                    <tr>
                      <td style="padding:0 20px 20px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;line-height:1.7;">
                          <tr><td style="padding:8px 0;color:#a1a1aa;border-bottom:1px solid #221b30;">Check-in</td><td style="padding:8px 0;color:#ffffff;text-align:right;border-bottom:1px solid #221b30;">${checkIn}</td></tr>
                          <tr><td style="padding:8px 0;color:#a1a1aa;border-bottom:1px solid #221b30;">Check-out</td><td style="padding:8px 0;color:#ffffff;text-align:right;border-bottom:1px solid #221b30;">${checkOut}</td></tr>
                          <tr><td style="padding:8px 0;color:#a1a1aa;border-bottom:1px solid #221b30;">Guests</td><td style="padding:8px 0;color:#ffffff;text-align:right;border-bottom:1px solid #221b30;">${guests}</td></tr>
                          <tr><td style="padding:8px 0;color:#a1a1aa;border-bottom:1px solid #221b30;">Payment method</td><td style="padding:8px 0;color:#ffffff;text-align:right;border-bottom:1px solid #221b30;">${paymentMethod}</td></tr>
                          <tr><td style="padding:8px 0;color:#a1a1aa;">Payment status</td><td style="padding:8px 0;color:#ffffff;text-align:right;">${paymentStatus}</td></tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;background-color:#120f1d;border:1px solid #2a223a;border-radius:20px;">
                    <tr>
                      <td style="padding:20px 20px 12px;color:#c4b5fd;font-size:16px;font-weight:700;">Support & arrival</td>
                    </tr>
                    <tr>
                      <td style="padding:0 20px 20px;color:#ddd6fe;font-size:14px;line-height:1.9;">
                        <div>Phone: ${companyPhone}</div>
                        <div>Email: ${companyEmail}</div>
                        ${whatsappMarkup}
                        ${mapsMarkup}
                      </td>
                    </tr>
                  </table>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;background-color:#120f1d;border:1px solid #2a223a;border-radius:20px;">
                    <tr>
                      <td style="padding:20px 20px 12px;color:#c4b5fd;font-size:16px;font-weight:700;">Find us</td>
                    </tr>
                    <tr>
                      <td style="padding:0 20px 20px;color:#ddd6fe;font-size:14px;line-height:1.8;">
                        <div>${companyLocation}</div>
                        <div style="color:#a1a1aa;">Address: ${companyAddress}</div>
                      </td>
                    </tr>
                  </table>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,rgba(76,29,149,0.18) 0%,rgba(15,11,24,0.3) 100%);border:1px solid #3b2c61;border-radius:20px;">
                    <tr>
                      <td style="padding:20px;color:#ede9fe;font-size:14px;line-height:1.8;">
                        <div style="margin-bottom:10px;color:#c4b5fd;font-size:16px;font-weight:700;">Thank you for choosing ${companyName}</div>
                        <div>Keep this email and your booking reference ready for arrival. If you need help before check-in, reach us using the details above.${websiteMarkup ? ` ${websiteMarkup}` : ''}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  }

  return `
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${preheader}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0;padding:0;width:100%;background-color:#090909;font-family:Arial,Helvetica,sans-serif;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:680px;background-color:#121212;border:1px solid #2d2615;border-radius:24px;overflow:hidden;">
            <tr>
              <td style="padding:28px 24px 20px;background-color:#111111;border-bottom:1px solid #2d2615;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td valign="top">
                      <div style="display:inline-block;padding:10px 14px;border:1px solid #4a3d1d;border-radius:999px;color:#d4b85c;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;">Booking Confirmation</div>
                      <div style="margin-top:16px;font-size:28px;line-height:1.2;color:#ffffff;font-weight:300;">
                        Your stay at <span style="color:#c9a646;font-weight:700;letter-spacing:0.04em;">${companyName}</span> is confirmed
                      </div>
                      <div style="margin-top:12px;color:#d1d5db;font-size:15px;line-height:1.7;">
                        Hello ${guestName}, your booking details are below together with room information and contact support options.
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:18px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:#17130b;border:1px solid #3b3118;border-radius:16px;">
                        <tr>
                          <td style="padding:14px 16px;">
                            <div style="color:#9ca3af;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">Booking reference</div>
                            <div style="margin-top:6px;color:#ffffff;font-size:14px;font-weight:700;word-break:break-word;">${bookingId}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;background-color:#17130b;border:1px solid #3b3118;border-radius:18px;">
                  <tr>
                    <td style="padding:18px 18px 6px;color:#c9a646;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;">Stay overview</td>
                  </tr>
                  <tr>
                    <td style="padding:0 18px 18px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td valign="top" style="padding-right:12px;">
                            <div style="color:#ffffff;font-size:28px;line-height:1.2;font-weight:600;">${roomName}</div>
                            <div style="margin-top:6px;color:#d1d5db;font-size:14px;">${roomCategory} · Room ${roomNumber}</div>
                          </td>
                          <td valign="top" align="right">
                            <div style="color:#9ca3af;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">Total</div>
                            <div style="margin-top:4px;color:#c9a646;font-size:24px;font-weight:700;">${totalPrice}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;background-color:#101010;border:1px solid #232323;border-radius:18px;">
                  <tr>
                    <td style="padding:20px 18px 12px;color:#c9a646;font-size:18px;font-weight:700;">Reservation details</td>
                  </tr>
                  <tr>
                    <td style="padding:0 18px 18px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;line-height:1.7;">
                        <tr><td style="padding:8px 0;color:#9ca3af;border-bottom:1px solid #1c1c1c;">Check-in</td><td style="padding:8px 0;color:#ffffff;text-align:right;border-bottom:1px solid #1c1c1c;">${checkIn}</td></tr>
                        <tr><td style="padding:8px 0;color:#9ca3af;border-bottom:1px solid #1c1c1c;">Check-out</td><td style="padding:8px 0;color:#ffffff;text-align:right;border-bottom:1px solid #1c1c1c;">${checkOut}</td></tr>
                        <tr><td style="padding:8px 0;color:#9ca3af;border-bottom:1px solid #1c1c1c;">Guests</td><td style="padding:8px 0;color:#ffffff;text-align:right;border-bottom:1px solid #1c1c1c;">${guests}</td></tr>
                        <tr><td style="padding:8px 0;color:#9ca3af;border-bottom:1px solid #1c1c1c;">Payment method</td><td style="padding:8px 0;color:#ffffff;text-align:right;border-bottom:1px solid #1c1c1c;">${paymentMethod}</td></tr>
                        <tr><td style="padding:8px 0;color:#9ca3af;">Payment status</td><td style="padding:8px 0;color:#ffffff;text-align:right;">${paymentStatus}</td></tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;background-color:#101010;border:1px solid #232323;border-radius:18px;">
                  <tr>
                    <td style="padding:20px 18px 12px;color:#c9a646;font-size:16px;font-weight:700;">Need help?</td>
                  </tr>
                  <tr>
                    <td style="padding:0 18px 18px;color:#d1d5db;font-size:14px;line-height:1.8;">
                      <div>Phone: ${companyPhone}</div>
                      <div>Email: ${companyEmail}</div>
                      ${whatsappMarkup}
                      ${mapsMarkup}
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;background-color:#101010;border:1px solid #232323;border-radius:18px;">
                  <tr>
                    <td style="padding:20px 18px 12px;color:#c9a646;font-size:16px;font-weight:700;">Location</td>
                  </tr>
                  <tr>
                    <td style="padding:0 18px 18px;color:#d1d5db;font-size:14px;line-height:1.8;">
                      <div>${companyLocation}</div>
                      <div style="color:#9ca3af;">Address: ${companyAddress}</div>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#17130b;border:1px solid #3b3118;border-radius:18px;">
                  <tr>
                    <td style="padding:20px 18px;color:#e5e7eb;font-size:14px;line-height:1.8;">
                      <div style="margin-bottom:10px;color:#c9a646;font-size:16px;font-weight:700;">Thank you for choosing ${companyName}</div>
                      <div>Keep this email and your booking reference ready at check-in. If your plans change or you need support before arrival, contact us using the details above.${websiteMarkup ? ` ${websiteMarkup}` : ''}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

const buildEmailText = ({ booking, room, config }) => {
  const companyWhatsAppNumber = String(config.companyWhatsAppNumber || '').replace(/\D/g, '');
  const companyWhatsAppMessage = String(config.companyWhatsAppMessage || '');
  const whatsappLink = companyWhatsAppNumber
    ? `https://wa.me/${companyWhatsAppNumber}?text=${encodeURIComponent(companyWhatsAppMessage)}`
    : '';
  const mapsLink = config.mapsUrl || '';
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
    ...(mapsLink ? [`Google Maps: ${mapsLink}`] : []),
    `Location: ${config.companyLocation}`,
    `Address: ${config.companyAddress}`,
    '',
    'Please keep your booking reference handy and contact us if you need any help before arrival.',
  ];

  return details.join('\n');
};

const sendBookingConfirmationEmail = async (booking) => {
  const room = booking.room || {};
  const config = getEmailBranding(room);

  if (!booking?.guestEmail || !config.apiKey || !config.fromEmail) {
    return { skipped: true };
  }

  const resend = new Resend(config.apiKey);

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
