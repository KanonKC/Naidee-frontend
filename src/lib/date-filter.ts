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

export function dateRangeLabel(range: DateRange): string {
    const sameDay = range.from.toDateString() === range.to.toDateString();
    if (sameDay) return formatThaiDayMonth(range.from);
    return `${formatThaiDayMonth(range.from)}–${formatThaiDayMonth(range.to)}`;
}
