import { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  id?: string;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function DatePicker({
  value,
  onChange,
  placeholder = '选择日期',
  minDate,
  maxDate,
  disabled = false,
  className,
  inputClassName,
  id,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const today = new Date();
  const initialDate = value ? new Date(value) : today;
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedDate = value ? new Date(value) : null;

  const isDateDisabled = (date: Date): boolean => {
    const dateStr = formatDate(date);
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const isSameDay = (date1: Date | null, date2: Date): boolean => {
    if (!date1) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = (date: Date): boolean => isSameDay(today, date);

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    onChange?.(formatDate(date));
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('');
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const days: React.ReactNode[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewYear, viewMonth, day);
      const dateDisabled = isDateDisabled(date);
      const dateSelected = isSameDay(selectedDate, date);
      const dateIsToday = isToday(date);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(date)}
          disabled={dateDisabled}
          className={cn(
            'aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all',
            dateDisabled
              ? 'text-gray-300 cursor-not-allowed'
              : dateSelected
              ? 'bg-primary-600 text-white shadow-sm'
              : dateIsToday
              ? 'bg-primary-50 text-primary-600 ring-1 ring-primary-200 hover:bg-primary-100'
              : 'text-gray-700 hover:bg-gray-100'
          )}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div
        className={cn(
          'relative flex items-center rounded-xl border bg-white transition-all',
          disabled
            ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
            : 'border-gray-200 hover:border-primary-300 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100',
          inputClassName
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <Calendar className="w-4 h-4 ml-3.5 text-gray-400 flex-shrink-0 pointer-events-none" />
        <input
          ref={inputRef}
          id={id}
          type="text"
          readOnly
          value={value || ''}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'flex-1 w-full bg-transparent py-2.5 pl-3 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none cursor-pointer',
            disabled && 'cursor-not-allowed'
          )}
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-10 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="清除日期"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-floating border border-gray-100 p-4 z-50 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="上个月"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="text-sm font-semibold text-gray-900">
              {viewYear} 年 {viewMonth + 1} 月
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="下个月"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((weekday) => (
              <div
                key={weekday}
                className="aspect-square flex items-center justify-center text-xs font-medium text-gray-400"
              >
                {weekday}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={() => {
                const todayStr = formatDate(today);
                if (!isDateDisabled(today)) {
                  onChange?.(todayStr);
                }
                setViewYear(today.getFullYear());
                setViewMonth(today.getMonth());
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors"
            >
              今天
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
