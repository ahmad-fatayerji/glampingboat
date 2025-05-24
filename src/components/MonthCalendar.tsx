// src/components/MonthCalendar.tsx
"use client";

import React, { useState, useMemo } from "react";
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
  /** Callback for range mode */
  onSelectRange?: (start: Date, end: Date) => void;
  /** ISO string of server’s “today” (Paris-normalized) */
  serverToday: string;
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({
  availableDates,
  onSelectRange,
  serverToday,
}) => {
  // Parse serverToday once
  const today = useMemo(() => {
    const d = new Date(serverToday);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [serverToday]);

  // State
  const [current, setCurrent] = useState<Date>(today);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Helpers for month navigation
  const prevMonth = () => setCurrent((d) => subMonths(d, 1));
  const nextMonth = () => setCurrent((d) => addMonths(d, 1));

  // Prepare two‐month display
  const nextMonthDate = addMonths(current, 1);
  const months = [current, nextMonthDate];

  // Picker dropdown data
  const monthNames = Array.from({ length: 12 }, (_, i) =>
    format(new Date(2000, i, 1), "LLLL")
  );
  const thisYear = current.getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => thisYear - 5 + i);

  const selectMonth = (m: number) =>
    setCurrent((d) => new Date(d.getFullYear(), m, 1));
  const selectYear = (y: number) =>
    setCurrent((d) => new Date(y, d.getMonth(), 1));

  // User clicks a day
  const handleDayClick = (date: Date) => {
    date.setHours(0, 0, 0, 0);
    if (date < today) return;
    if (!onSelectRange) return;

    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(date);
      setRangeEnd(null);
    } else {
      if (date >= rangeStart) {
        setRangeEnd(date);
        onSelectRange(rangeStart, date);
      } else {
        setRangeStart(date);
      }
    }
  };

  // Render one day cell
  const renderDay = (day: number, monthDate: Date) => {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    date.setHours(0, 0, 0, 0);

    const isPast = date < today;
    const isAvailable = availableDates.includes(day) && !isPast;

    const inSelected =
      rangeStart && rangeEnd && date >= rangeStart && date <= rangeEnd;
    const isStart = rangeStart?.getTime() === date.getTime();
    const isEnd = rangeEnd?.getTime() === date.getTime();

    const inHover =
      rangeStart &&
      !rangeEnd &&
      hoverDate &&
      date >= rangeStart &&
      date <= hoverDate;
    const isHoverEnd = hoverDate?.getTime() === date.getTime();

    // Build classes for pill/circle effect
    let classes = ["w-8 h-8 flex items-center justify-center text-sm"];

    // Disabled days
    if (!isAvailable) {
      classes.push("text-gray-400");
    } else {
      // Confirmed range endpoints
      if (isStart || isEnd) {
        classes.push("bg-indigo-600 text-white", "rounded-full");
      }
      // Confirmed in-between
      else if (inSelected) {
        classes.push(
          "bg-indigo-600 text-white",
          // flat pill: full width of cell but no rounding
          "rounded-none"
        );
      }
      // Hover preview endpoints
      else if (isHoverEnd) {
        classes.push("bg-indigo-300 text-white", "rounded-full");
      }
      // Hover preview in-between
      else if (inHover) {
        classes.push("bg-indigo-300 text-white", "rounded-none");
      }
      // Normal available
      else {
        classes.push("hover:bg-indigo-200", "cursor-pointer", "rounded-full");
      }
    }

    // Hatching for past/unavailable
    const style = !isAvailable
      ? {
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(0,0,0,0.05) 0, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 8px)",
        }
      : {};

    return (
      <div
        key={`${monthDate.getMonth()}-${day}`}
        className={classes.join(" ")}
        style={style}
        onClick={() => isAvailable && handleDayClick(date)}
        onMouseEnter={() =>
          isAvailable && rangeStart && !rangeEnd
            ? setHoverDate(date)
            : undefined
        }
        onMouseLeave={() =>
          isAvailable && rangeStart && !rangeEnd
            ? setHoverDate(null)
            : undefined
        }
      >
        {day}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with month controls */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-1 rounded hover:bg-gray-200">
          ‹
        </button>
        <h2 className="text-lg font-semibold">
          {format(current, "LLLL yyyy")} – {format(nextMonthDate, "LLLL yyyy")}
        </h2>
        <button onClick={nextMonth} className="p-1 rounded hover:bg-gray-200">
          ›
        </button>
      </div>

      {/* Two months side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {months.map((mDate) => {
          const blanks = getDay(startOfMonth(mDate));
          const dim = getDaysInMonth(mDate);
          return (
            <div key={mDate.getMonth()}>
              <div className="grid grid-cols-7 text-xs font-medium text-gray-500 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d} className="flex items-center justify-center">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: blanks }).map((_, i) => (
                  <div key={`b-${i}`} />
                ))}
                {Array.from({ length: dim }, (_, i) => renderDay(i + 1, mDate))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthCalendar;
