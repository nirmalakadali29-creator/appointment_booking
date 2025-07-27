const API_BASE_URL = 'https://appointment-booking-tk2o.onrender.com/api';

export interface TimeSlot {
  start: string;
  end: string;
  time: string;
  label: string;
}

export type AppointmentMode = 'online' | 'offline';

export interface BookingData {
  name: string;
  phone: string;
  email: string;
  notes: string;
  date: string;
  time: string;
  mode: AppointmentMode; // Added mode
}

export interface BookingResponse {
  success: boolean;
  message: string;
  eventId?: string;
  smsMessage: string;
  appointment: {
    name: string;
    phone: string;
    email: string;
    notes: string;
    date: string;
    time: string;
    startTime: string;
    endTime: string;
    mode: AppointmentMode; // Added mode
  };
}

export const api = {
  async getAvailableSlots(date: string): Promise<TimeSlot[]> {
    try {
      console.log(`Fetching available slots for date api: ${date}`);
      const response = await fetch(`${API_BASE_URL}/available-slots/${date}`);
      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }
      const data = await response.json();
      return data.slots || [];
    } catch (error) {
      console.error('Error fetching available slots:', error);
      // Return default slots as fallback
      // Return 10:00-12:00 and 15:00-17:00 slots, 30 min each
      return [
        { time: '10:00', label: '10:00 AM - 10:30 AM', start: '', end: '' },
        { time: '10:30', label: '10:30 AM - 11:00 AM', start: '', end: '' },
        { time: '11:00', label: '11:00 AM - 11:30 AM', start: '', end: '' },
        { time: '11:30', label: '11:30 AM - 12:00 PM', start: '', end: '' },
        { time: '15:00', label: '3:00 PM - 3:30 PM', start: '', end: '' },
        { time: '15:30', label: '3:30 PM - 4:00 PM', start: '', end: '' },
        { time: '16:00', label: '4:00 PM - 4:30 PM', start: '', end: '' },
        { time: '16:30', label: '4:30 PM - 5:00 PM', start: '', end: '' },
      ];
    }
  },

  async bookAppointment(bookingData: BookingData): Promise<BookingResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/book-appointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      console.log('📌 Booking response:', response);
      if (!response.ok) {
        throw new Error('Failed to book appointment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
    }
  },

  async checkHealth(): Promise<{ status: string; googleCalendar: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error('Health check failed');
      }
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'ERROR', googleCalendar: false };
    }
  },
  async appointmentModes(): Promise<{ modes: AppointmentMode[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointment-modes`);
      if (!response.ok) {
        throw new Error('Failed to fetch appointment modes');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching appointment modes:', error);
      return { modes: ['online', 'offline'] }; // Default modes
    }
  }
};
