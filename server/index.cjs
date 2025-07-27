const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { Client, LocalAuth } = require('whatsapp-web.js');

require('dotenv').config();

// App setup
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Google Calendar Configuration
const DOCTOR_EMAIL = 'nirmalakadali29@gmail.com'; // Doctor's Gmail
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TIMEZONE = 'Asia/Kolkata'; // Indian Standard Time

// Initialize Google Calendar Auth
let auth;
let calendar;

// Helper function to get current IST date/time
function getCurrentISTDate() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + istOffset);
}

// Helper function to create IST date from date string
function createISTDate(dateString) {
  // Parse the date string as IST
  const [year, month, day] = dateString.split('-').map(Number);
  // Create date in IST (month is 0-indexed)
  const istDate = new Date();
  istDate.setFullYear(year, month - 1, day);
  istDate.setHours(0, 0, 0, 0);
  return istDate;
}

// Helper function to create IST datetime
function createISTDateTime(dateString, timeString) {
  const [year, month, day] = dateString.split('-').map(Number);
  const [hour, minute] = timeString.split(':').map(Number);
  
  // Create date in IST
  const istDate = new Date();
  istDate.setFullYear(year, month - 1, day);
  istDate.setHours(hour, minute || 0, 0, 0);
  
  return istDate;
}

// Helper function to convert IST date to UTC for Google Calendar
function convertISTToUTC(istDate) {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  return new Date(istDate.getTime() - istOffset);
}

async function initializeGoogleAuth() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });
    calendar = google.calendar({ version: 'v3', auth });
    console.log('✅ Google Calendar API initialized successfully for India timezone');
  } catch (error) {
    console.error('❌ Google Calendar initialization failed:', error);
  }
}

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendConfirmationEmail(email, name, date, time, appointmentMode) {
  const mailOptions = {
    from: `"GenepowerX Clinic" <${process.env.EMAIL_USER}>`,
    to: `${email}`,
    subject: 'Your Appointment Confirmation with GenepowerX',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #0f62fe;">Appointment Confirmed ✅</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Thank you for booking your appointment with <strong>GenepowerX Clinic</strong>. We're pleased to confirm the details below:</p>

        <table style="border-collapse: collapse; margin-top: 10px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 12px;"><strong>Date:</strong></td>
            <td style="padding: 8px 12px;">${date}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px;"><strong>Time:</strong></td>
            <td style="padding: 8px 12px;">${time}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px;"><strong>Appointment Mode:</strong></td>
            <td style="padding: 8px 12px;">${appointmentMode}</td>
          </tr>
        </table>

        <p>Please make sure to:</p>
        <ul style="margin-left: 20px;">
          <li>Arrive at least <strong>15 minutes early</strong> for your appointment.</li>
          <li>Bring any <strong>relevant medical documents or reports</strong>.</li>
          <li>Ensure your phone/email is reachable for any updates or reminders.</li>
        </ul>

        <p>If you need to reschedule or cancel, kindly contact us at least <strong>24 hours in advance</strong>.</p>

        <p style="margin-top: 20px;">We look forward to seeing you!</p>

        <p>Warm regards,</p>
        <p><strong>GenepowerX Clinic</strong><br/>
        📍 Suit # 2B, Plot No.240, Nirvana, Road No. 36, Jawahar Colony, Jubilee Hills, Hyderabad, Telangana 50003<br/>
        📞 +91-95022 22300<br/>
        ⛓️‍💥https://genepowerx.com/
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

async function sendWhatsAppConfirmation(waClient, phone, message) {
  const chatId = phone.replace(/\D/g, '') + '@c.us';
  await waClient.sendMessage(chatId, message);
}

// Generate appointment slots (10 AM to 12 PM and 3 PM to 5 PM IST)
function getBusinessHoursSlots(istDate) {
  const slots = [];
  
  // Morning: 10:00 to 12:00 (30 min slots)
  for (let hour = 10; hour < 12; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const startTime = new Date(istDate);
      startTime.setHours(hour, min, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 30);

      // Convert to UTC for Google Calendar API
      const startTimeUTC = convertISTToUTC(startTime);
      const endTimeUTC = convertISTToUTC(endTime);

      slots.push({
        start: startTimeUTC.toISOString(),
        end: endTimeUTC.toISOString(),
        time: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
        label: `${hour}:${min.toString().padStart(2, '0')} AM - ` +
          `${endTime.getHours()}:${endTime.getMinutes().toString().padStart(2, '0')} ${endTime.getHours() < 12 ? 'AM' : 'PM'}`
      });
    }
  }
  
  // Evening: 15:00 to 17:00 (3 PM to 5 PM, 30 min slots)
  for (let hour = 15; hour < 17; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const startTime = new Date(istDate);
      startTime.setHours(hour, min, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 30);

      // Convert to UTC for Google Calendar API
      const startTimeUTC = convertISTToUTC(startTime);
      const endTimeUTC = convertISTToUTC(endTime);

      const displayHour = hour > 12 ? hour - 12 : hour;
      const endDisplayHour = endTime.getHours() > 12 ? endTime.getHours() - 12 : endTime.getHours();

      slots.push({
        start: startTimeUTC.toISOString(),
        end: endTimeUTC.toISOString(),
        time: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
        label: `${displayHour}:${min.toString().padStart(2, '0')} PM - ` +
          `${endDisplayHour}:${endTime.getMinutes().toString().padStart(2, '0')} PM`
      });
    }
  }
  
  return slots;
}

// 📅 Get available slots on selected date (Indian calendar logic)
app.get('/api/available-slots/:date', async (req, res) => {
  try {
    const { date } = req.params;
    console.log('📌 Requested date string:', date);
    
    // Create IST date from the date string
    const selectedDate = createISTDate(date);
    console.log('📌 Selected date in IST:', selectedDate.toISOString());

    // Reject weekends
    const day = selectedDate.getDay();
    if (day === 0 || day === 6) {
      console.log('❌ Weekend date rejected');
      return res.json({ slots: [] });
    }

    // Check if date is in past (IST)
    const todayIST = getCurrentISTDate();
    todayIST.setHours(0, 0, 0, 0);
    
    if (selectedDate < todayIST) {
      console.log('❌ Past date rejected');
      return res.json({ slots: [] });
    }

    // Generate slots for working hours
    const businessSlots = getBusinessHoursSlots(selectedDate);

    if (!calendar) {
      console.log('⚠️ No calendar integration, returning all business slots');
      return res.json({ slots: businessSlots });
    }

    // For Google Calendar API, we need to query in UTC
    const startOfDayUTC = convertISTToUTC(selectedDate);
    const endOfDayIST = new Date(selectedDate);
    endOfDayIST.setDate(endOfDayIST.getDate() + 1);
    endOfDayIST.setMilliseconds(-1);
    const endOfDayUTC = convertISTToUTC(endOfDayIST);

    console.log('📌 Querying Google Calendar from', startOfDayUTC.toISOString(), 'to', endOfDayUTC.toISOString());

    const response = await calendar.events.list({
      calendarId: DOCTOR_EMAIL,
      timeMin: startOfDayUTC.toISOString(),
      timeMax: endOfDayUTC.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      timeZone: TIMEZONE,
    });

    const existingEvents = response.data.items || [];
    console.log('📌 Found existing events:', existingEvents.length);

    const availableSlots = businessSlots.filter(slot => {
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);

      const isAvailable = !existingEvents.some(event => {
        const eventStart = new Date(event.start.dateTime || event.start.date);
        const eventEnd = new Date(event.end.dateTime || event.end.date);

        return slotStart < eventEnd && slotEnd > eventStart;
      });

      return isAvailable;
    });

    console.log('🟢 Available slots:', availableSlots.map(s => s.time).join(', '));
    res.json({ slots: availableSlots });
  } catch (error) {
    console.error('⚠️ Error in /available-slots:', error);
    res.status(500).json({ error: 'Server error while fetching slots' });
  }
});

// 📝 Book Appointment
app.post('/api/book-appointment', async (req, res) => {
  try {
    const { name, phone, email, notes, date, time, mode } = req.body;

    if (!name || !phone || !date || !time || !email || !mode) {
      return res.status(400).json({ error: 'Please fill the required fields' });
    }

    console.log('📌 Booking request:', { date, time, name, mode });

    // Create IST datetime
    const startTimeIST = createISTDateTime(date, time);
    const endTimeIST = new Date(startTimeIST);
    endTimeIST.setMinutes(endTimeIST.getMinutes() + 30);

    // Convert to UTC for Google Calendar
    const startTimeUTC = convertISTToUTC(startTimeIST);
    const endTimeUTC = convertISTToUTC(endTimeIST);

    console.log(`📅 Booking: ${name} from ${startTimeIST.toISOString()} (IST) to ${endTimeIST.toISOString()} (IST)`);
    console.log(`📅 UTC times: ${startTimeUTC.toISOString()} to ${endTimeUTC.toISOString()}`);

    let eventId = null;

    if (calendar) {
      // Check for conflicts using UTC times
      const checkResponse = await calendar.events.list({
        calendarId: DOCTOR_EMAIL,
        timeMin: startTimeUTC.toISOString(),
        timeMax: endTimeUTC.toISOString(),
        singleEvents: true,
        timeZone: TIMEZONE,
      });

      if (checkResponse.data.items?.length > 0) {
        return res.status(409).json({ error: 'This time slot is already booked' });
      }

      const event = {
        summary: `Appointment with ${name}`,
        description: `Patient: ${name}\nPhone: ${phone}\nEmail: ${email}\nAppointment mode: ${mode}\nNotes: ${notes || 'No additional notes'}`,
        start: { 
          dateTime: startTimeUTC.toISOString(), 
          timeZone: TIMEZONE 
        },
        end: { 
          dateTime: endTimeUTC.toISOString(), 
          timeZone: TIMEZONE 
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 1440 }, // 24 hrs
            { method: 'popup', minutes: 30 },
          ],
        },
      };

      const response = await calendar.events.insert({
        calendarId: DOCTOR_EMAIL,
        resource: event,
      });

      eventId = response.data.id;
      console.log('📆 Event created:', eventId);
    }

    // Format time for display (IST)
    const displayHour = startTimeIST.getHours();
    const displayMinute = startTimeIST.getMinutes();
    const timeDisplay = `${displayHour > 12 ? displayHour - 12 : displayHour}:${displayMinute.toString().padStart(2, '0')} ${displayHour < 12 ? 'AM' : 'PM'}`;
    const displayDate = startTimeIST.toLocaleDateString('en-IN');
    
    const message = `✅ Appointment Confirmed!\n👤 ${name}\n📅 ${displayDate}\n🕘 ${timeDisplay}\n📞 ${phone}\nMode: ${mode}`;

    await sendConfirmationEmail(email, name, displayDate, timeDisplay, mode);
    
    // Simulated WhatsApp/SMS confirmation
    const smsMessage = `✅ Appointment confirmed!
📅 Date: ${displayDate}
🕘 Time: ${timeDisplay}
👩‍⚕️ Doctor: Dr. Hima
📍 Location: Please arrive 15 minutes early at the clinic.`;

    console.log(`📲 SMS/WhatsApp to ${phone}:\n${smsMessage}`);

    res.json({
      success: true,
      message: 'Appointment successfully booked',
      eventId,
      smsMessage,
      appointment: {
        name,
        phone,
        email,
        notes,
        date: startTimeIST.toISOString(),
        time,
        startTime: startTimeIST.toISOString(),
        endTime: endTimeIST.toISOString(),
        mode,
      }
    });
  } catch (error) {
    console.error('❌ Error booking appointment:', error);
    res.status(500).json({ error: 'Could not complete appointment booking' });
  }
});

// ✅ Health check endpoint
app.get('/api/health', (req, res) => {
  const currentIST = getCurrentISTDate();
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    istTime: currentIST.toISOString(),
    googleCalendar: !!calendar,
  });
});

// 🚀 Start server with calendar initialized
const path = require("path");

// ✅ Serve React build
app.use(express.static(path.join(__dirname, "../dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// ✅ Start server on correct port
async function startServer() {
  await initializeGoogleAuth();
  app.listen(process.env.PORT || 3001, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${process.env.PORT || 3001}`);
    console.log(`🕐 Current IST time: ${getCurrentISTDate().toISOString()}`);
  });
}

startServer();
