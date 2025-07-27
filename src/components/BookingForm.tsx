import React from 'react';
import { User, Phone, MessageSquare, Calendar, Clock, Mail } from 'lucide-react';
import { api } from '../services/api';

interface BookingFormProps {
  selectedDate: Date;
  selectedTime: string;
  onSubmit: (formData: { name: string; phone: string; email: string; notes: string; appointmentMode: string; smsMessage: string }) => void;
}

export default function BookingForm({ selectedDate, selectedTime, onSubmit }: BookingFormProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    appointmentMode: 'offline'
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Helper function to format date for API (YYYY-MM-DD format)
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitBooking();
  };

  const submitBooking = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const bookingData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        notes: formData.notes,
        date: formatDateForAPI(selectedDate), // Use proper date formatting instead of ISO string
        time: selectedTime,
        mode: formData.appointmentMode.toLowerCase(), // Map appointmentMode to mode
      };

      console.log('Booking data being sent:', bookingData);

      const response = await api.bookAppointment(bookingData);

      if (response.success) {
        onSubmit({
          ...formData,
          smsMessage: response.smsMessage,
        });
      } else {
        setError('Failed to book appointment. Please try again.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to book appointment. Please try again.';
      setError(errorMessage);
      console.error('Booking error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
  };

  const formatTime = (time: string): string => {
    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr, 10);
    let minute = parseInt(minuteStr || '0', 10);

    const format = (h: number, m: number): string => {
      const period = h < 12 ? 'AM' : 'PM';
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const minuteStr = m.toString().padStart(2, '0');
      return `${hour12}:${minuteStr} ${period}`;
    };

    // Calculate end time (30 minutes later)
    let endHour = hour;
    let endMinute = minute + 30;
    if (endMinute >= 60) {
      endMinute -= 60;
      endHour += 1;
    }

    return `${format(hour, minute)} - ${format(endHour, endMinute)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Booking Details</h3>

      {/* Selected Date and Time Display */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Selected Date</span>
        </div>
        <p className="text-blue-800 font-semibold">{formatDate(selectedDate)}</p>

        <div className="flex items-center gap-2 mt-3 mb-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Selected Time (IST)</span>
        </div>
        <p className="text-blue-800 font-semibold">{formatTime(selectedTime)}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4" />
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4" />
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Enter your phone number (e.g., +91 9876543210)"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4" />
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Enter your email address"
          />
        </div>

        {/* Appointment Mode Dropdown */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4" />
            Appointment Mode *
          </label>
          <select
            name="appointmentMode"
            value={formData.appointmentMode}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="offline">In-Person Visit</option>
            <option value="online">Online Consultation</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4" />
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            placeholder="Any additional information or special requests..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Booking...
            </div>
          ) : (
            'Book Appointment'
          )}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>* All appointments are scheduled in Indian Standard Time (IST)</p>
        <p>* You will receive a confirmation email and SMS</p>
      </div>
    </div>
  );
}
