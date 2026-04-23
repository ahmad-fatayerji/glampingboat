"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import Image from "next/image";
import {
  addMonths,
  format,
  getDay,
  getDaysInMonth,
  isValid,
  parse,
  startOfMonth,
  subMonths,
} from "date-fns";
import { useT } from "@/components/Language/useT";
import {
  calculateNightCount,
  calculateReservationPricingSummary,
  isRangeBookable,
  isSeasonOpen,
} from "@/lib/reservations";

interface BookingCalendarProps {
  serverToday: string;
  signedIn: boolean;
  onContinue: (params: {
    arrival: Date;
    departure: Date;
    adults: number;
    children: number;
  }) => void;
  onContact: () => void;
}

const DATE_FORMAT = "MM/dd/yyyy";

type AvailabilityRange = {
  id: string;
  startDate: string;
  endDate: string;
};

function parseDate(value: string): Date | null {
  const parsed = parse(value, DATE_FORMAT, new Date());
  return isValid(parsed) ? parsed : null;
}

function formatDate(date: Date | null): string {
  return date ? format(date, DATE_FORMAT) : "";
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default function BookingCalendar({
  serverToday,
  signedIn,
  onContinue,
  onContact,
}: BookingCalendarProps) {
  const t = useT();
  const today = useMemo(() => startOfDay(new Date(serverToday)), [serverToday]);

  const [current, setCurrent] = useState(today);
  const [arrival, setArrival] = useState<Date | null>(null);
  const [departure, setDeparture] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [arrivalText, setArrivalText] = useState("");
  const [departureText, setDepartureText] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(2);
  const [reservedRanges, setReservedRanges] = useState<
    Array<{ id: string; start: Date; end: Date }>
  >([]);

  useEffect(() => {
    setArrivalText(formatDate(arrival));
  }, [arrival]);

  useEffect(() => {
    setDepartureText(formatDate(departure));
  }, [departure]);

  useEffect(() => {
    let active = true;

    async function loadAvailability() {
      try {
        const response = await fetch("/api/reservations?availability=1");
        if (!response.ok) return;
        const data = (await response.json()) as AvailabilityRange[];
        if (!active || !Array.isArray(data)) return;

        setReservedRanges(
          data.map((range) => ({
            id: range.id,
            start: startOfDay(new Date(range.startDate)),
            end: startOfDay(new Date(range.endDate)),
          }))
        );
      } catch {
        if (active) {
          setReservedRanges([]);
        }
      }
    }

    loadAvailability();

    return () => {
      active = false;
    };
  }, []);

  const months = [current, addMonths(current, 1)];

  const monthLabel = useCallback(
    (date: Date) => {
      const names = [
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
      return `${names[date.getMonth()]} ${date.getFullYear()}`;
    },
    [t]
  );

  const handleDayClick = (date: Date) => {
    const day = startOfDay(date);
    if (day < today) return;

    if (!arrival || (arrival && departure)) {
      if (!isSeasonOpen(day) || isReservedNight(day)) return;
      setArrival(day);
      setDeparture(null);
      return;
    }

    if (day > arrival) {
      if (!isRangeSelectable(arrival, day)) {
        if (!isSeasonOpen(day) || isReservedNight(day)) return;
        setArrival(day);
        setDeparture(null);
        return;
      }
      setDeparture(day);
      return;
    }

    setArrival(day);
  };

  const isReservedNight = (date: Date) =>
    reservedRanges.some((range) => date >= range.start && date < range.end);

  const overlapsReservedRange = (start: Date, end: Date) =>
    reservedRanges.some((range) => start < range.end && end > range.start);

  const isRangeSelectable = (start: Date, end: Date) =>
    start >= today &&
    end > start &&
    isRangeBookable(start, end) &&
    !overlapsReservedRange(start, end);

  const renderDay = (day: number, monthDate: Date) => {
    const date = startOfDay(
      new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
    );

    const isPast = date < today;
    const isReserved = isReservedNight(date);
    const selectingDeparture = Boolean(arrival && !departure && date > arrival);
    const available =
      !isPast &&
      (selectingDeparture
        ? isRangeSelectable(arrival as Date, date)
        : isSeasonOpen(date) && !isReserved);

    const inSelected =
      arrival && departure && date >= arrival && date <= departure;
    const isStart = arrival?.getTime() === date.getTime();
    const isEnd = departure?.getTime() === date.getTime();
    const inHover =
      arrival &&
      !departure &&
      hoverDate &&
      date > arrival &&
      date <= hoverDate;

    const classes = [
      "h-9 w-9 flex items-center justify-center text-sm transition-colors",
    ];

    if (!available) {
      classes.push("text-[#5d6f7d] cursor-not-allowed");
    } else if (isStart || isEnd) {
      classes.push(
        "bg-[var(--color-beige)] text-[var(--color-blue)] rounded-full font-semibold"
      );
    } else if (inSelected) {
      classes.push("bg-[var(--color-beige)]/40 text-[var(--color-beige)]");
    } else if (inHover) {
      classes.push("bg-[var(--color-beige)]/25 text-[var(--color-beige)]");
    } else {
      classes.push(
        "text-[var(--color-beige)] hover:bg-[var(--color-beige)]/15 cursor-pointer rounded-full"
      );
    }

    const style = !available
      ? {
          backgroundColor: isReserved
            ? "rgba(104, 44, 38, 0.55)"
            : "rgba(15, 36, 56, 0.55)",
          backgroundImage:
            "repeating-linear-gradient(45deg,rgba(255,255,255,0.18) 0 2px,transparent 2px 6px)",
        }
      : undefined;

    return (
      <div
        key={`${monthDate.getMonth()}-${day}`}
        className={classes.join(" ")}
        style={style}
        onClick={() => available && handleDayClick(date)}
        onMouseEnter={() =>
          available && arrival && !departure ? setHoverDate(date) : undefined
        }
        onMouseLeave={() =>
          available && arrival && !departure ? setHoverDate(null) : undefined
        }
      >
        {day}
      </div>
    );
  };

  const nights =
    arrival && departure ? calculateNightCount(arrival, departure) : 0;
  const rangeOk =
    arrival && departure && nights > 0 && isRangeSelectable(arrival, departure);

  const pricing = useMemo(() => {
    if (!rangeOk || !arrival || !departure) return null;
    return calculateReservationPricingSummary({
      arrivalDate: arrival,
      departureDate: departure,
      adults,
      children,
      selectedOptions: [],
    });
  }, [rangeOk, arrival, departure, adults, children]);

  const handleArrivalText = (event: ChangeEvent<HTMLInputElement>) => {
    setArrivalText(event.target.value);
    const parsed = parseDate(event.target.value);
    if (parsed) {
      const day = startOfDay(parsed);
      setArrival(day);
      if (departure && !isRangeSelectable(day, departure)) {
        setDeparture(null);
      }
    }
  };

  const handleDepartureText = (event: ChangeEvent<HTMLInputElement>) => {
    setDepartureText(event.target.value);
    const parsed = parseDate(event.target.value);
    if (parsed) {
      setDeparture(startOfDay(parsed));
    }
  };

  const submit = () => {
    if (!signedIn) {
      window.location.href = "/account";
      return;
    }
    if (!arrival || !departure || !rangeOk) return;
    onContinue({ arrival, departure, adults, children });
  };

  return (
    <div className="flex w-full flex-col gap-6 text-[var(--color-beige)]">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
        <div className="space-y-2">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="text"
              value={arrivalText}
              onChange={handleArrivalText}
              placeholder="MM/DD/YYYY"
              className="h-9 w-32 rounded-md bg-[var(--color-beige)] px-3 text-sm text-[var(--color-blue)] outline-none"
            />
            <span>{t("arrivalDate")}</span>
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="text"
              value={departureText}
              onChange={handleDepartureText}
              placeholder="MM/DD/YYYY"
              className="h-9 w-32 rounded-md bg-[var(--color-beige)] px-3 text-sm text-[var(--color-blue)] outline-none"
            />
            <span>{t("departureDate")}</span>
          </label>
        </div>

        <div className="space-y-2 sm:justify-self-end">
          <Counter
            label={`${t("adults")} 18+`}
            value={adults}
            min={1}
            onChange={setAdults}
          />
          <Counter
            label={`${t("children")} 0-17`}
            value={children}
            min={0}
            onChange={setChildren}
          />
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={!rangeOk}
          className="h-10 rounded-md bg-[var(--color-blue)] px-6 text-sm font-medium text-[var(--color-beige)] transition hover:bg-[#06324d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("book")}
        </button>
      </div>

      <div className="rounded-lg bg-[var(--color-blue)]/40 p-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrent((d) => subMonths(d, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-beige)]/15 text-[var(--color-beige)] transition hover:bg-[var(--color-beige)]/25"
            aria-label={t("previous")}
          >
            &lsaquo;
          </button>
          <div />
          <button
            type="button"
            onClick={() => setCurrent((d) => addMonths(d, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-beige)]/15 text-[var(--color-beige)] transition hover:bg-[var(--color-beige)]/25"
            aria-label={t("next")}
          >
            &rsaquo;
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {months.map((monthDate) => {
            const blanks = (getDay(startOfMonth(monthDate)) + 6) % 7;
            const daysInMonth = getDaysInMonth(monthDate);

            return (
              <div key={`${monthDate.getFullYear()}-${monthDate.getMonth()}`}>
                <h3 className="mb-2 text-center font-serif text-lg italic text-[var(--color-beige)]">
                  {monthLabel(monthDate)}
                </h3>
                <div className="mb-1 grid grid-cols-7 text-[10px] uppercase tracking-wide text-[var(--color-beige)]/70">
                  {[
                    t("dayMonShort"),
                    t("dayTueShort"),
                    t("dayWedShort"),
                    t("dayThuShort"),
                    t("dayFriShort"),
                    t("daySatShort"),
                    t("daySunShort"),
                  ].map((label, index) => (
                    <div
                      key={`${monthDate.getMonth()}-h-${index}`}
                      className="flex items-center justify-center"
                    >
                      {label}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                  {Array.from({ length: blanks }).map((_, idx) => (
                    <div key={`blank-${monthDate.getMonth()}-${idx}`} />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, idx) =>
                    renderDay(idx + 1, monthDate)
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-end gap-2 text-xs text-[var(--color-beige)]/70">
          <span
            className="inline-block h-3 w-6"
            style={{
              backgroundColor: "rgba(15, 36, 56, 0.55)",
              backgroundImage:
                "repeating-linear-gradient(45deg,rgba(255,255,255,0.18) 0 2px,transparent 2px 6px)",
            }}
          />
          <span>{t("notAvailable")}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {pricing ? (
            <>
              <p className="text-sm text-[var(--color-beige)]/85">
                {t("availableForChosenDates")}
              </p>
              <p className="mt-1 font-serif text-3xl text-[var(--color-beige)]">
                &euro;{pricing.total.toFixed(2)}
              </p>
              <p className="text-xs text-[var(--color-beige)]/70">
                {t("priceForNightsExcl").replace(
                  "{nights}",
                  String(pricing.nights)
                )}
              </p>
            </>
          ) : (
            arrival &&
            departure && (
              <p className="text-sm text-[#ffd9d9]">
                {t("notAvailableForChosenDates")}
              </p>
            )
          )}
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!rangeOk}
          className="inline-flex items-center gap-2 rounded-md bg-[var(--color-blue)] px-5 py-2 text-sm font-medium text-[var(--color-beige)] transition hover:bg-[#06324d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>{t("next")}</span>
          <span>&gt;</span>
        </button>
      </div>

      <div className="flex flex-col items-center gap-3 border-t border-[var(--color-beige)]/15 pt-4 text-sm text-[var(--color-beige)]/85 sm:flex-row sm:justify-between">
        <span>{t("disabilityHealthCure")}</span>
        <div className="flex items-center gap-3">
          <Image
            src="/images/book/handi.png"
            alt=""
            width={36}
            height={36}
            className="opacity-90"
          />
          <Image
            src="/images/book/health.png"
            alt=""
            width={36}
            height={36}
            className="opacity-90"
          />
          <button
            type="button"
            onClick={onContact}
            className="rounded-md bg-[var(--color-blue)] px-4 py-2 text-sm text-[var(--color-beige)] transition hover:bg-[#06324d]"
          >
            {t("contactUs")}
          </button>
        </div>
      </div>
    </div>
  );
}

function Counter({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-3 text-sm">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-beige)] text-[var(--color-blue)] transition hover:bg-white"
        aria-label="-"
      >
        &minus;
      </button>
      <span className="w-6 text-center font-medium text-[var(--color-beige)]">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-beige)] text-[var(--color-blue)] transition hover:bg-white"
        aria-label="+"
      >
        +
      </button>
      <span className="min-w-[7rem] text-[var(--color-beige)]">{label}</span>
    </div>
  );
}
