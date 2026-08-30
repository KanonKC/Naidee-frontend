const dateFormatter = new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric"
});

export function formatEventDate(value: string | null): string {
    if (!value) return "ไม่ระบุวันที่";
    return dateFormatter.format(new Date(value));
}

export function formatEventDateRange(start: string | null, end: string | null): string {
    if (!start) return "ไม่ระบุวันที่";
    if (!end || end === start) return formatEventDate(start);
    return `${formatEventDate(start)} - ${formatEventDate(end)}`;
}
