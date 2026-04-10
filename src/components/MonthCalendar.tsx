"use client";

import React, { useMemo, useState } from "react";
import {
  addMonths,
  getDay,
  getDaysInMonth,
  startOfMonth,
  subMonths,
} from "date-fns";
import { useT } from "@/components/Language/useT";

interface MonthCalendarProps {
  availableDates: number[];
  onSelectRange?: (start: Date, end: Date) => void;
  serverToday: string;
}

export default function MonthCalendar({
  availableDates,
  onSelectRange,
  serverToday,
}: MonthCalendarProps) {
  const today = useMemo(() => {
    const date = new Date(serverToday);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [serverToday]);

  const [current, setCurrent] = useState(today);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const t = useT();

  const nextMonthDate = addMonths(current, 1);
  const months = [current, nextMonthDate];
  const monthNames = [
    t("monthJan"),
    t("monthFeb"),
    t("monthMar"),
    t("monthApr"),
    t("monthMay"),
    t("monthJun"),
    t("monthJul"),
    t("monthAug"),
    t("monthSep"),
    t("monthOct"),
    t("monthNov"),
    t("monthDec"),
  ];

  const handleDayClick = (date: Date) => {
    date.setHours(0, 0, 0, 0);
    if (date < today || !onSelectRange) return;

    if (!rangeStart || rangeEnd) {
      setRangeStart(date);
      setRangeEnd(null);
      return;
    }

    if (date >= rangeStart) {
      setRangeEnd(date);
      onSelectRange(rangeStart, date);
      return;
    }

    setRangeStart(date);
  };

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
      rangeStart && !rangeEnd && hoverDate && date >= rangeStart && date <= hoverDate;
    const isHoverEnd = hoverDate?.getTime() === date.getTime();

    const classes = [
      "w-8 h-8 flex items-center justify-center text-sm transition-colors duration-150",
    ];

    if (!isAvailable) {
      classes.push(
        "text-[#8d8478] rounded-full cursor-not-allowed relative overflow-hidden"
      );
    } else if (isStart || isEnd) {
      classes.push("bg-purple-500 text-white", "rounded-full");
    } else if (inSelected) {
      classes.push("bg-purple-500 text-white", "rounded-none");
    } else if (isHoverEnd) {
      classes.push("bg-purple-300 text-white", "rounded-full");
    } else if (inHover) {
      classes.push("bg-purple-300 text-white", "rounded-none");
    } else {
      classes.push(
        "bg-indigo-600 text-white hover:bg-indigo-500",
        "cursor-pointer",
        "rounded-full"
      );
    }

    const style: React.CSSProperties = !isAvailable
      ? {
          backgroundColor: "#E4DBCE",
          backgroundImage:
            "repeating-linear-gradient(45deg,#cbbfae 0 2px,transparent 2px 6px)",
        }
      : {};

    return (
      <div
        key={`${monthDate.getMonth()}-${day}`}
        className={classes.join(" ")}
        style={style}
        onClick={() => isAvailable && handleDayClick(date)}
        onMouseEnter={() =>
          isAvailable && rangeStart && !rangeEnd ? setHoverDate(date) : undefined
        }
        onMouseLeave={() =>
          isAvailable && rangeStart && !rangeEnd ? setHoverDate(null) : undefined
        }
      >
        {day}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrent((date) => subMonths(date, 1))}
          className="p-1 rounded hover:bg-gray-200"
        >
          &lsaquo;
        </button>
        <h2 className="text-lg font-semibold">
          {monthNames[current.getMonth()]} {current.getFullYear()} &ndash;{" "}
          {monthNames[nextMonthDate.getMonth()]} {nextMonthDate.getFullYear()}
        </h2>
        <button
          onClick={() => setCurrent((date) => addMonths(date, 1))}
          className="p-1 rounded hover:bg-gray-200"
        >
          &rsaquo;
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {months.map((monthDate) => {
          const blanks = getDay(startOfMonth(monthDate));
          const daysInMonth = getDaysInMonth(monthDate);

          return (
            <div key={monthDate.getMonth()}>
              <div className="grid grid-cols-7 text-xs font-medium text-gray-500 mb-2">
                {[
                  t("daySunShort"),
                  t("dayMonShort"),
                  t("dayTueShort"),
                  t("dayWedShort"),
                  t("dayThuShort"),
                  t("dayFriShort"),
                  t("daySatShort"),
                ].map((label, index) => (
                  <div key={index} className="flex items-center justify-center">
                    {label}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: blanks }).map((_, index) => (
                  <div key={`blank-${index}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, index) =>
                  renderDay(index + 1, monthDate)
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-6 text-xs text-gray-300">
        <span className="font-medium text-gray-200">{t("legend")}:</span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-4 h-4 rounded-full bg-indigo-600" />
          {t("available")}
        </span>
        <span className="inline-flex items-center gap-1">
          <span
            className="inline-block w-4 h-4 rounded-full"
            style={{
              backgroundColor: "#E4DBCE",
              backgroundImage:
                "repeating-linear-gradient(45deg,#cbbfae 0 2px,transparent 2px 6px)",
            }}
          />
          {t("unavailable")}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-4 h-4 rounded-full bg-purple-500" />
          {t("selectedRange")}
        </span>
      </div>
    </div>
  );
}
