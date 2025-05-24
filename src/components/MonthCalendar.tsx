// components/MonthCalendar.tsx
"use client";

import { useState, useMemo } from "react";
import {
  subMonths,
  addMonths,
  startOfMonth,
  getDay,
  getDaysInMonth,
  format,
} from "date-fns";

interface MonthCalendarProps {
  /** Days (1–31) in the current month that are available */
  availableDates: number[];
  /** Callback for single-date mode */
  onSelectDate?: (date: Date) => void;
  /** Callback for range mode */
  onSelectRange?: (start: Date, end: Date) => void;
  /** ISO string of server’s “today” (Paris-normalized) */
  serverToday: string;
}

export default function MonthCalendar({
  availableDates,
  onSelectDate,
  onSelectRange,
  serverToday,
}: MonthCalendarProps) {
  // Parse serverToday once
  const today = useMemo(() => {
    const d = new Date(serverToday);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [serverToday]);

  // Current calendar month
  const [current, setCurrent] = useState<Date>(() => new Date(serverToday));
  const [showPicker, setShowPicker] = useState(false);

  // Range selection state
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);

  // Helpers
  const start = startOfMonth(current);
  const daysInMonth = getDaysInMonth(current);
  const leadingBlanks = getDay(start); // 0=Sun…6=Sat

  const prevMonth = () => setCurrent((d) => subMonths(d, 1));
  const nextMonth = () => setCurrent((d) => addMonths(d, 1));

  const monthNames = Array.from({ length: 12 }, (_, i) =>
    format(new Date(2000, i, 1), "LLLL")
  );
  const currentYear = current.getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const selectMonth = (m: number) =>
    setCurrent((d) => new Date(d.getFullYear(), m, 1));
  const selectYear = (y: number) =>
    setCurrent((d) => new Date(y, d.getMonth(), 1));

  // Handle clicking a day
  const handleDayClick = (day: number) => {
    const clicked = new Date(current.getFullYear(), current.getMonth(), day);
    clicked.setHours(0, 0, 0, 0);
    const isPast = clicked < today;
    const available = availableDates.includes(day) && !isPast;
    if (!available) return;

    if (onSelectRange) {
      // range mode
      if (!rangeStart || (rangeStart && rangeEnd)) {
        setRangeStart(clicked);
        setRangeEnd(null);
      } else {
        if (clicked >= rangeStart) {
          setRangeEnd(clicked);
          onSelectRange(rangeStart, clicked);
        } else {
          setRangeStart(clicked);
        }
      }
    } else if (onSelectDate) {
      onSelectDate(clicked);
    }
  };

  // Render a single day cell
  const renderDay = (day: number) => {
    const date = new Date(current.getFullYear(), current.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    const isPast = date < today;
    const available = availableDates.includes(day) && !isPast;
    const inRange =
      rangeStart && rangeEnd && date >= rangeStart && date <= rangeEnd;
    const isStart = rangeStart?.getTime() === date.getTime();
    const isEnd = rangeEnd?.getTime() === date.getTime();

    let classes = "w-8 h-8 flex items-center justify-center rounded-md text-sm";
    if (isPast || !available) {
      classes += " text-gray-400";
    } else if (isStart || isEnd) {
      classes += " bg-green-700 text-white";
    } else if (inRange) {
      classes += " bg-green-400 text-white";
    } else {
      classes += " bg-green-500 text-white hover:bg-green-600 cursor-pointer";
    }

    const style =
      isPast || !available
        ? {
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(0,0,0,0.05) 0, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 8px)",
          }
        : {};

    return (
      <div
        key={day}
        className={classes}
        style={style}
        onClick={() => handleDayClick(day)}
      >
        {day}
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      {/* Month header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1 rounded hover:bg-gray-200">
          ‹
        </button>

        {!showPicker ? (
          <h2
            className="text-lg font-semibold cursor-pointer"
            onClick={() => setShowPicker(true)}
          >
            {format(current, "LLLL yyyy")}
          </h2>
        ) : (
          <div className="flex space-x-2">
            <select
              value={current.getMonth()}
              onChange={(e) => selectMonth(parseInt(e.target.value))}
              className="p-1 border rounded"
            >
              {monthNames.map((m, i) => (
                <option key={i} value={i}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={current.getFullYear()}
              onChange={(e) => selectYear(parseInt(e.target.value))}
              className="p-1 border rounded"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowPicker(false)}
              className="px-2 bg-blue-500 text-white rounded"
            >
              OK
            </button>
          </div>
        )}

        <button onClick={nextMonth} className="p-1 rounded hover:bg-gray-200">
          ›
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-xs font-medium text-gray-500 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="flex items-center justify-center">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => renderDay(i + 1))}
      </div>
    </div>
  );
}
