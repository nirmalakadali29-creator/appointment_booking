import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

export default function Calendar({ selectedDate, onDateSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const isDateDisabled = (date: Date) => {
    return date < today || date.getDay() === 0 || date.getDay() === 6; // Disable weekends and past dates
  };

  const isDateSelected = (date: Date) => {
    return selectedDate && 
           date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day);
    if (!isDateDisabled(date)) {
      onDateSelect(date);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          {monthNames[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }, (_, i) => (
          <div key={`empty-${i}`} className="p-2"></div>
        ))}
        
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          const disabled = isDateDisabled(date);
          const selected = isDateSelected(date);

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={disabled}
              className={`
                p-2 text-sm rounded-lg transition-all duration-200 hover:scale-105
                ${disabled 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer'
                }
                ${selected 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : ''
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        * Weekends are not available for appointments
      </div>
    </div>
  );
}