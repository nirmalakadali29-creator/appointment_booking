import React from 'react';
import { Clock } from 'lucide-react';
import { api, TimeSlot } from '../services/api';

interface TimeSlotsProps {
  selectedDate: Date;
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
}

export default function TimeSlots({ selectedDate, selectedTime, onTimeSelect }: TimeSlotsProps) {
  const [timeSlots, setTimeSlots] = React.useState<TimeSlot[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Helper function to format date for API (YYYY-MM-DD)
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  React.useEffect(() => {
    const fetchAvailableSlots = async () => {
      setLoading(true);
      setError(null);
      try {
        const dateString = formatDateForAPI(selectedDate);
        console.log('Fetching slots for date:', dateString, 'Original date:', selectedDate);
        
        const slots = await api.getAvailableSlots(dateString);
        console.log('Received slots:', slots);
        setTimeSlots(slots);
      } catch (err) {
        setError('Failed to load available time slots');
        console.error('Error fetching slots:', err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Available Time Slots</h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        Select a time slot for <span className="font-medium text-gray-800">{formatDate(selectedDate)}</span>
        <br />
        <span className="text-sm text-blue-600">All times are in Indian Standard Time (IST)</span>
      </p>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading available slots...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
          <p className="text-red-600 text-xs mt-1">Please try refreshing or select a different date.</p>
        </div>
      )}

      {!loading && timeSlots.length === 0 && !error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">No available time slots for this date.</p>
          <p className="text-yellow-600 text-sm mt-1">Please select a different date.</p>
        </div>
      )}

      <div className="space-y-3">
        {timeSlots.map((slot) => (
          <button
            key={slot.time}
            onClick={() => onTimeSelect(slot.time)}
            className={`
              w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
              hover:scale-[1.02] hover:shadow-md
              ${selectedTime === slot.time
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{slot.label}</span>
              <div className={`
                w-4 h-4 rounded-full border-2 transition-colors
                ${selectedTime === slot.time
                  ? 'border-blue-600 bg-blue-600'
                  : 'border-gray-300'
                }
              `}>
                {selectedTime === slot.time && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {timeSlots.length > 0 && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>• Each appointment slot is 30 minutes</p>
          <p>• Morning slots: 10:00 AM - 12:00 PM</p>
          <p>• Evening slots: 3:00 PM - 5:00 PM</p>
        </div>
      )}
    </div>
  );
}

