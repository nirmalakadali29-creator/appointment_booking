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
  mode: AppointmentMode;
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
    mode: AppointmentMode;
  };
}

// Helper function to format date for API (YYYY-MM-DD format)
function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const api = {
  async getAvailableSlots(date: string | Date): Promise<TimeSlot[]> {
    try {
      // If date is a Date object, format it properly
      const dateString = typeof date === 'string' ? date : formatDateForAPI(date);
      
      console.log(`Fetching available slots for date: ${dateString}`);
      const response = await fetch(`${API_BASE_URL}/available-slots/${dateString}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch available slots: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Available slots response:', data);
      return data.slots || [];
    } catch (error) {
      console.error('Error fetching available slots:', error);
      // Return default slots as fallback (IST times)
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
      console.log('Booking appointment with data:', bookingData);
      
      const response = await fetch(`${API_BASE_URL}/book-appointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      console.log('Booking response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Booking failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('Booking successful:', result);
      return result;
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
    }
  },

  async checkHealth(): Promise<{ status: string; googleCalendar: boolean; istTime?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error('Health check failed');
      }
      const result = await response.json();
      console.log('Health check result:', result);
      return result;
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
