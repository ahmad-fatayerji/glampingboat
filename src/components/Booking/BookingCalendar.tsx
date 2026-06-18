"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react";
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
import { SHOW_BOOKING_GUEST_COUNTS } from "@/lib/booking-features";
import {
  calculateNightCount,
  calculateReservationPricingSummary,
  MINIMUM_NIGHTS,
  PROMO_NIGHTLY_TTC_CENTS,
  isRangeBookable,
  isSeasonOpen,
} from "@/lib/reservations";
import type { BookingPromoRecord } from "@/lib/types";

interface BookingCalendarProps {
  serverToday: string;
  signedIn: boolean;
  onContinue: (params: {
    arrival: Date;
    departure: Date;
    adults: number;
    children: number;
    promos: BookingPromoRecord[];
  }) => void;
  onContact: () => void;
}

const DATE_FORMAT = "MM/dd/yyyy";

const stripedBackground =
  "repeating-linear-gradient(45deg,rgba(255,255,255,0.18) 0 2px,transparent 2px 6px)";

const unavailableStyles = {
  closed: {
    backgroundColor: "rgba(15, 36, 56, 0.55)",
    backgroundImage: stripedBackground,
  },
} satisfies Record<"closed", CSSProperties>;

const promoStyle = {
  backgroundColor: "rgba(215, 184, 111, 0.24)",
  boxShadow: "inset 0 0 0 1px rgba(215, 184, 111, 0.78)",
} satisfies CSSProperties;

type AvailabilityRange = {
  id: string;
  startDate: string;
  endDate: string;
  status?: string;
  title?: string;
  nightlyTtcCents?: number;
  isActive?: boolean;
};

type UnavailableRange = {
  id: string;
  start: Date;
  end: Date;
};

function parseDate(value: string): Date | null {
  const parsed = parse(value, DATE_FORMAT, new Date());
  return isValid(parsed) ? parsed : null;
}

function formatDate(date: Date | null): string {
  return date ? format(date, DATE_FORMAT) : "";
}

function parseDateOnly(value: string) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!parts) return new Date(value);

  return new Date(
    Number.parseInt(parts[1], 10),
    Number.parseInt(parts[2], 10) - 1,
    Number.parseInt(parts[3], 10)
  );
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
  const [children, setChildren] = useState(0);
  const [unavailableRanges, setUnavailableRanges] = useState<
    UnavailableRange[]
  >([]);
  const [promoRanges, setPromoRanges] = useState<BookingPromoRecord[]>([]);

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

        setUnavailableRanges(
          data
            .filter((range) => range.status !== "PROMO")
            .map((range) => ({
              id: range.id,
              start: startOfDay(parseDateOnly(range.startDate)),
              end: startOfDay(parseDateOnly(range.endDate)),
            }))
        );
        setPromoRanges(
          data
            .filter((range) => range.status === "PROMO")
            .map((range) => ({
              id: range.id,
              title: range.title ?? "Promo",
              startDate: range.startDate,
              endDate: range.endDate,
              nightlyTtcCents: range.nightlyTtcCents ?? PROMO_NIGHTLY_TTC_CENTS,
              isActive: range.isActive ?? true,
            }))
        );
      } catch {
        if (active) {
          setUnavailableRanges([]);
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
      if (!isSeasonOpen(day) || isUnavailableNight(day)) return;
      setArrival(day);
      setDeparture(null);
      return;
    }

    if (day > arrival) {
      if (!isRangeSelectable(arrival, day)) {
        if (!isSeasonOpen(day) || isUnavailableNight(day)) return;
        setArrival(day);
        setDeparture(null);
        return;
      }
      setDeparture(day);
      return;
    }

    setArrival(day);
  };

  const isUnavailableNight = (date: Date) =>
    unavailableRanges.some((range) => date >= range.start && date < range.end);

  const getPromoForNight = (date: Date) =>
    promoRanges.find((range) => {
      const start = startOfDay(parseDateOnly(range.startDate));
      const end = startOfDay(parseDateOnly(range.endDate));
      return range.isActive && date >= start && date <= end;
    });

  const overlapsReservedRange = (start: Date, end: Date) =>
    unavailableRanges.some((range) => start < range.end && end > range.start);

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
    const isUnavailable = isUnavailableNight(date);
    const isPromo = !!getPromoForNight(date);
    const selectingDeparture = Boolean(arrival && !departure && date > arrival);
    const available =
      !isPast &&
      (selectingDeparture
        ? isRangeSelectable(arrival as Date, date)
        : isSeasonOpen(date) && !isUnavailable);

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
      "flex h-9 items-center justify-center text-sm transition-colors",
    ];

    if (!available) {
      classes.push("w-9 justify-self-center text-[#5d6f7d] cursor-not-allowed");
    } else if (isStart || isEnd) {
      if (arrival && departure) {
        classes.push(
          "w-full justify-self-stretch bg-[var(--color-beige)] text-[var(--color-blue)] font-semibold",
          isStart ? "rounded-l-full" : "",
          isEnd ? "rounded-r-full" : ""
        );
      } else {
        classes.push(
          "w-9 justify-self-center rounded-full bg-[var(--color-beige)] text-[var(--color-blue)] font-semibold"
        );
      }
    } else if (inSelected) {
      classes.push(
        "w-full justify-self-stretch bg-[var(--color-beige)]/28 text-[var(--color-beige)]"
      );
    } else if (inHover) {
      classes.push(
        "w-full justify-self-stretch bg-[var(--color-beige)]/18 text-[var(--color-beige)]"
      );
    } else if (isPromo) {
      classes.push(
        "w-9 justify-self-center cursor-pointer rounded-full font-semibold text-[#f5df9a] hover:bg-[#d7b86f]/32"
      );
    } else {
      classes.push(
        "w-9 justify-self-center cursor-pointer rounded-full bg-[var(--color-beige)]/10 text-[var(--color-beige)] ring-1 ring-[var(--color-beige)]/35 hover:bg-[var(--color-beige)]/18"
      );
    }

    const style = !available
      ? unavailableStyles.closed
      : isPromo && !isStart && !isEnd && !inSelected && !inHover
        ? promoStyle
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
      promos: promoRanges,
    });
  }, [rangeOk, arrival, departure, adults, children, promoRanges]);

  const selectedPromos = useMemo(() => {
    if (!arrival || !departure) return [];
    return promoRanges.filter((promo) => {
      const promoStart = startOfDay(parseDateOnly(promo.startDate));
      const promoEnd = startOfDay(parseDateOnly(promo.endDate));
      return promo.isActive && arrival < promoEnd && departure > promoStart;
    });
  }, [arrival, departure, promoRanges]);

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
    onContinue({ arrival, departure, adults, children, promos: selectedPromos });
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

        {SHOW_BOOKING_GUEST_COUNTS && (
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
        )}

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

        <div className="mt-4 flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-xs text-[var(--color-beige)]/75">
          <span className="font-medium text-[var(--color-beige)]/85">
            {t("legend")}:
          </span>
          <LegendItem
            label={t("available")}
            swatchClassName="rounded-full bg-[var(--color-beige)]/10 ring-1 ring-[var(--color-beige)]/35"
          />
          <LegendItem
            label={t("bookingCalendarPromo")}
            swatchClassName="rounded-full"
            swatchStyle={promoStyle}
          />
          <LegendItem
            label={t("selectedRange")}
            swatchClassName="rounded-full bg-[var(--color-beige)]"
          />
          <LegendItem
            label={t("notAvailable")}
            swatchStyle={unavailableStyles.closed}
          />
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
              {pricing.appliedPromos.length > 0 && (
                <div className="mt-3 rounded-lg border border-[#d7b86f]/45 bg-[#d7b86f]/12 px-3 py-2 text-xs text-[#f5df9a]">
                  {pricing.appliedPromos.map((promo) => (
                    <p key={promo.id}>
                      {promo.title}: {promo.nights}{" "}
                      {promo.nights === 1 ? t("nightSingular") : t("nightPlural")}{" "}
                      x &euro;{(promo.nightlyTtcCents / 100).toFixed(0)}
                    </p>
                  ))}
                </div>
              )}
            </>
          ) : (
            arrival &&
            departure && (
              <p className="text-sm text-[#ffd9d9]">
                {t("notAvailableForChosenDates")} ({MINIMUM_NIGHTS}{" "}
                {t("nightPlural")} min.)
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

function LegendItem({
  label,
  swatchClassName = "",
  swatchStyle,
}: {
  label: string;
  swatchClassName?: string;
  swatchStyle?: CSSProperties;
}) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span
        className={`inline-block h-3.5 w-6 ${swatchClassName}`}
        style={swatchStyle}
      />
      {label}
    </span>
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
