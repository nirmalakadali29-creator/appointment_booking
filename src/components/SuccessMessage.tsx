import React from 'react';
import { CheckCircle, Calendar, Clock, User, Phone, MessageSquare } from 'lucide-react';

interface SuccessMessageProps {
  bookingData: {
    name: string;
    phone: string;
    notes: string;
    date: Date;
    time: string;
    smsMessage: string;
  };
  onNewBooking: () => void;
}

export default function SuccessMessage({ bookingData, onNewBooking }: SuccessMessageProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

 const formatTime = (time: string): string => {
  const [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr, 10);
  let minute = parseInt(minuteStr, 10);

  const format = (h: number, m: number): string => {
    const period = h < 12 || h === 24 ? 'AM' : 'PM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-8">
          Your appointment has been successfully booked. A confirmation message will be sent to your phone number.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Details</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <span className="text-sm text-gray-500">Name:</span>
                <p className="font-medium text-gray-800">{bookingData.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-500" />
              <div>
                <span className="text-sm text-gray-500">Phone:</span>
                <p className="font-medium text-gray-800">{bookingData.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <span className="text-sm text-gray-500">Date:</span>
                <p className="font-medium text-gray-800">{formatDate(bookingData.date)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <div>
                <span className="text-sm text-gray-500">Time:</span>
                <p className="font-medium text-gray-800">{formatTime(bookingData.time)}</p>
              </div>
            </div>

            {bookingData.notes && (
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <span className="text-sm text-gray-500">Notes:</span>
                  <p className="font-medium text-gray-800">{bookingData.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
          <h4 className="font-semibold text-green-800 mb-2">SMS Confirmation Sent:</h4>
          <div className="bg-white rounded p-3 border border-green-200">
            <p className="text-sm text-gray-700 whitespace-pre-line">{bookingData.smsMessage}</p>
          </div>
          <p className="text-green-700 text-xs mt-2">Sent to: registered email</p>
        </div>

        <button
          onClick={onNewBooking}
          className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Book Another Appointment
        </button>
      </div>
    </div>
  );
}