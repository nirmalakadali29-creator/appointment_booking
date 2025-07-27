# Appointment Booking System with Google Calendar Integration

A modern appointment booking system that integrates with Google Calendar to show real-time availability and automatically creates calendar events.

## Features

- **Interactive Calendar**: Select available dates with weekend and past date restrictions
- **Real-time Availability**: Fetches available time slots from Google Calendar
- **Google Calendar Integration**: Automatically creates calendar events for booked appointments
- **SMS Notifications**: Simulated SMS confirmations (ready for SMS service integration)
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Professional UI**: Modern design with smooth animations and transitions

## Setup Instructions

### 1. Google Calendar API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Create a Service Account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Fill in the details and create
   - Click on the created service account
   - Go to "Keys" tab and create a new JSON key
   - Download the JSON file

### 2. Google Calendar Permissions

1. Open Google Calendar
2. Go to Settings > "Add calendar" > "Create new calendar" or use existing
3. In calendar settings, go to "Share with specific people"
4. Add your service account email (from the JSON file) with "Make changes to events" permission

### 3. Environment Setup

1. Copy the contents of your downloaded JSON credentials file
2. Replace the placeholder in `.env` file with your actual credentials:

```env
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"your-actual-project-id",...}
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Application

```bash
# Run both frontend and backend
npm run dev:full

# Or run separately:
# Backend only
npm run server

# Frontend only (in another terminal)
npm run dev
```

## API Endpoints

- `GET /api/available-slots/:date` - Get available time slots for a specific date
- `POST /api/book-appointment` - Book a new appointment
- `GET /api/health` - Health check and Google Calendar connection status

## Configuration

- **Doctor Email**: Update `DOCTOR_EMAIL` in `server/index.js` to match your calendar
- **Business Hours**: Currently set to 9 AM - 12 PM, modify in `getBusinessHoursSlots()`
- **Timezone**: Update timezone in the calendar event creation
- **SMS Integration**: Replace console.log with actual SMS service (Twilio, etc.)

## Production Deployment

1. Set up environment variables on your hosting platform
2. Ensure Google Calendar API credentials are properly configured
3. Update CORS settings for your domain
4. Integrate with a real SMS service for notifications

## Troubleshooting

- Check the health endpoint: `http://localhost:3001/api/health`
- Verify Google Calendar API credentials are valid
- Ensure the service account has proper calendar permissions
- Check browser console and server logs for detailed error messages