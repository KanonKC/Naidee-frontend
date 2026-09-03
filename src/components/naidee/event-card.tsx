"use client";

import { EventSummary } from "@/lib/types";
import { categoryColorVar, categorySoftVar, categoryLabel } from "@/lib/categories";
import { formatThaiWeekdayDate, formatEventTime } from "@/lib/date-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface EventCardProps {
    event: EventSummary;
    distance?: string | null;
    selected?: boolean;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
}

export function EventCard({ event, distance, selected, onClick, className, style }: EventCardProps) {
    const color = categoryColorVar(event.category);
    const soft = categorySoftVar(event.category);
    const title = event.title ?? "ไม่มีชื่อกิจกรรม";

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "group nd-card block w-full flex-shrink-0 cursor-pointer text-left font-sans transition-transform duration-150 ease-out active:scale-[.97]",
                className
            )}
            style={style}
        >
            <div
                className="relative overflow-hidden rounded-[20px]"
                style={{
                    aspectRatio: "4/5",
                    boxShadow: selected ? "0 0 0 2.5px var(--ring)" : "var(--shadow-card)",
                    background: soft
                }}
            >
                <div
                    className="absolute inset-0 flex items-end p-3"
                    style={{
                        color,
                        backgroundImage: "radial-gradient(currentColor 1.5px,transparent 1.5px)",
                        backgroundSize: "14px 14px"
                    }}
                >
                    <b className="relative text-sm leading-snug opacity-90 line-clamp-3">{title}</b>
                </div>
                <div className="absolute top-2.5 left-2.5">
                    <span
                        className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-bold leading-relaxed"
                        style={{ background: color, color: "#fff" }}
                    >
                        {categoryLabel(event.category)}
                    </span>
                </div>
            </div>
            <div className="pt-2.5">
                <div className="line-clamp-2 text-[15px] leading-snug font-semibold text-foreground">
                    {title}
                </div>
                <div className="mt-0.5 text-[13px] leading-snug tabular-nums">
                    <b className="font-bold" style={{ color: "var(--primary)" }}>
                        {event.start_at ? formatThaiWeekdayDate(event.start_at) : "ไม่ระบุวันที่"}
                    </b>
                    {event.start_at && (
                        <b className="font-bold text-foreground"> • {formatEventTime(event.start_at, event.end_at)}</b>
                    )}
                </div>
                <div className="truncate text-[13px] leading-snug text-muted-foreground">
                    {event.venue?.name ?? "ไม่ระบุสถานที่"}
                    {distance && (
                        <>
                            {" "}
                            • <b className="tabular-nums">{distance}</b>
                        </>
                    )}
                </div>
            </div>
        </button>
    );
}

export function EventCardSkeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <div className={cn("w-full flex-shrink-0", className)} style={style}>
            <Skeleton className="w-full rounded-[20px]" style={{ aspectRatio: "4/5" }} />
            <Skeleton className="mt-2.5 h-4 w-4/5" />
            <Skeleton className="mt-1.5 h-3.5 w-2/5" />
        </div>
    );
}
