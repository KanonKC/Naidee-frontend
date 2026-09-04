export type DatePreset = "all" | "today" | "tomorrow" | "weekend" | "custom";

const FAR_PAST = new Date(0);
const FAR_FUTURE = new Date(8640000000000000);

export interface DateRange {
    from: Date;
    to: Date;
}

const TH_WEEKDAY = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const TH_MONTH = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

function startOfDay(d: Date): Date {
    const r = new Date(d);
    r.setHours(0, 0, 0, 0);
    return r;
}

function endOfDay(d: Date): Date {
    const r = new Date(d);
    r.setHours(23, 59, 59, 999);
    return r;
}

function addDays(d: Date, days: number): Date {
    const r = new Date(d);
    r.setDate(r.getDate() + days);
    return r;
}

export function computeDateRange(preset: DatePreset, customRange: DateRange | null): DateRange {
    const now = new Date();
    if (preset === "all") return { from: FAR_PAST, to: FAR_FUTURE };
    if (preset === "today") return { from: startOfDay(now), to: endOfDay(now) };
    if (preset === "tomorrow") {
        const t = addDays(now, 1);
        return { from: startOfDay(t), to: endOfDay(t) };
    }
    if (preset === "weekend") {
        const day = now.getDay();
        const toSaturday = (6 - day + 7) % 7;
        const saturday = addDays(now, toSaturday);
        const sunday = addDays(saturday, 1);
        return { from: startOfDay(saturday), to: endOfDay(sunday) };
    }
    if (customRange) return { from: startOfDay(customRange.from), to: endOfDay(customRange.to) };
    return { from: startOfDay(now), to: endOfDay(now) };
}

export function rangesOverlap(aFrom: Date, aTo: Date, bFrom: Date, bTo: Date): boolean {
    return aFrom.getTime() <= bTo.getTime() && bFrom.getTime() <= aTo.getTime();
}

export function formatThaiWeekdayDate(value: string | Date): string {
    const d = typeof value === "string" ? new Date(value) : value;
    return `${TH_WEEKDAY[d.getDay()]} ${d.getDate()} ${TH_MONTH[d.getMonth()]}`;
}

export function formatThaiDayMonth(value: string | Date): string {
    const d = typeof value === "string" ? new Date(value) : value;
    return `${d.getDate()} ${TH_MONTH[d.getMonth()]}`;
}

export function formatEventTime(start: string | null, end: string | null): string {
    if (!start) return "";
    const s = new Date(start);
    const time = (d: Date) => d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });
    if (!end) return time(s);
    const e = new Date(end);
    if (s.toDateString() !== e.toDateString()) return time(s);
    if (time(s) === time(e)) return time(s);
    return `${time(s)}–${time(e)}`;
}

export function formatEventDateDisplay(
    start: string | null,
    end: string | null,
    startTimeKnown = false,
    endTimeKnown = false
): string | null {
    if (!start && !end) return null;

    if (start && end) {
        const sameDay = new Date(start).toDateString() === new Date(end).toDateString();
        if (sameDay) {
            const time = startTimeKnown ? ` ${formatEventTime(start, endTimeKnown ? end : null)}` : "";
            return `${formatThaiWeekdayDate(start)}${time}`;
        }
        const startLabel = `${formatThaiWeekdayDate(start)}${startTimeKnown ? ` ${formatEventTime(start, null)}` : ""}`;
        const endLabel = `${formatThaiWeekdayDate(end)}${endTimeKnown ? ` ${formatEventTime(end, null)}` : ""}`;
        return `${startLabel} - ${endLabel}`;
    }

    if (start) {
        const time = startTimeKnown ? ` ${formatEventTime(start, null)}` : "";
        return `${formatThaiWeekdayDate(start)}${time}`;
    }

    const endValue = end as string;
    const time = endTimeKnown ? ` ${formatEventTime(endValue, null)}` : "";
    return `วันนี้ - ${formatThaiWeekdayDate(endValue)}${time}`;
}

/** Which phase of the event a countdown badge represents — drives its color/icon in the UI. */
export type EventCountdownKind = "starting" | "ongoing" | "ending";

export interface EventCountdownBadge {
    kind: EventCountdownKind;
    text: string;
}

/**
 * "เริ่มในอีก N นาที/ชั่วโมง" for events starting soon; null once it's started or more than 48h out.
 * When the start time isn't known (only the date is), falls back to day-granularity ("เริ่มพรุ่งนี้" /
 * "เริ่มในอีก 2 วัน") instead of guessing an exact hour/minute countdown.
 */
export function formatStartCountdown(start: string | null, startTimeKnown: boolean, now: Date = new Date()): EventCountdownBadge | null {
    if (!start) return null;
    const startDate = new Date(start);

    if (!startTimeKnown) {
        const daysUntil = Math.round((startOfDay(startDate).getTime() - startOfDay(now).getTime()) / 86_400_000);
        if (daysUntil === 1) return { kind: "starting", text: "เริ่มพรุ่งนี้" };
        if (daysUntil === 2) return { kind: "starting", text: "เริ่มในอีก 2 วัน" };
        return null;
    }

    const diffMs = startDate.getTime() - now.getTime();
    if (diffMs <= 0) return null;
    const diffMinutes = Math.round(diffMs / 60000);
    if (diffMinutes < 60) return { kind: "starting", text: `เริ่มในอีก ${Math.max(diffMinutes, 1)} นาที` };
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return { kind: "starting", text: `เริ่มในอีก ${diffHours} ชั่วโมง` };
    if (diffHours < 48) return { kind: "starting", text: "เริ่มพรุ่งนี้" };
    return null;
}

/**
 * Status badge for events already underway: "งานกำลังเกิดขึ้น" while in range but outside
 * the closing window, then a countdown to end_at once inside it. The window's size scales
 * with the event's total duration:
 *  - <=1 day duration  -> closing window starts at 12h left
 *  - <=2 days duration -> closing window starts at 24h left
 *  - >=3 days duration -> closing window starts at 48h left, shown as "2 วัน" then "1 วัน"
 *    before switching to hourly ticks
 *
 * When the end time isn't known (only the date is), falls back to day-granularity countdown
 * ("เหลืออีก 2 วัน" / "เหลืออีก 1 วัน" / "วันนี้วันสุดท้าย") instead of guessing an exact hour.
 */
export function formatEndCountdown(
    start: string | null,
    end: string | null,
    endTimeKnown: boolean,
    now: Date = new Date()
): EventCountdownBadge | null {
    if (!start || !end) return null;

    const startDate = new Date(start);
    const endDate = new Date(end);
    if (now.getTime() < startDate.getTime()) return null;

    if (!endTimeKnown) {
        const today = startOfDay(now);
        const startDay = startOfDay(startDate);
        const endDay = startOfDay(endDate);
        const daysLeft = Math.round((endDay.getTime() - today.getTime()) / 86_400_000);
        if (daysLeft < 0) return null;

        const durationDays = Math.round((endDay.getTime() - startDay.getTime()) / 86_400_000) + 1;
        if (durationDays <= 1) return { kind: "ending", text: "วันนี้วันสุดท้าย" };
        if (durationDays <= 2) {
            return daysLeft === 0
                ? { kind: "ending", text: "วันนี้วันสุดท้าย" }
                : { kind: "ongoing", text: "งานกำลังเกิดขึ้น" };
        }
        if (daysLeft === 0) return { kind: "ending", text: "วันนี้วันสุดท้าย" };
        if (daysLeft === 1) return { kind: "ending", text: "เหลืออีก 1 วัน" };
        if (daysLeft === 2) return { kind: "ending", text: "เหลืออีก 2 วัน" };
        return { kind: "ongoing", text: "งานกำลังเกิดขึ้น" };
    }

    const timeLeftMs = endDate.getTime() - now.getTime();
    if (timeLeftMs <= 0) return null;

    const durationHours = (endDate.getTime() - startDate.getTime()) / 3_600_000;
    const hoursLeft = timeLeftMs / 3_600_000;
    const windowHours = durationHours <= 24 ? 12 : durationHours <= 48 ? 24 : 48;

    if (hoursLeft > windowHours) return { kind: "ongoing", text: "งานกำลังเกิดขึ้น" };

    if (durationHours > 48) {
        if (hoursLeft > 24) return { kind: "ending", text: "เหลืออีก 2 วัน" };
        if (hoursLeft > 23) return { kind: "ending", text: "เหลืออีก 1 วัน" };
    }

    return { kind: "ending", text: `เหลืออีก ${Math.max(1, Math.ceil(hoursLeft))} ชั่วโมง` };
}

export function dateRangeLabel(range: DateRange): string {
    const sameDay = range.from.toDateString() === range.to.toDateString();
    if (sameDay) return formatThaiDayMonth(range.from);
    return `${formatThaiDayMonth(range.from)}–${formatThaiDayMonth(range.to)}`;
}
