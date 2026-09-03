"use client";

import { useState } from "react";
import { EventSummary } from "@/lib/types";
import { categoryColorVar, categorySoftVar, categoryLabel, primaryCategory } from "@/lib/categories";
import { formatEventDateDisplay } from "@/lib/date-filter";
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
    const [imageBroken, setImageBroken] = useState(false);
    const category = primaryCategory(event.categories);
    const color = categoryColorVar(category);
    const soft = categorySoftVar(category);
    const title = event.title ?? "ไม่มีชื่อกิจกรรม";
    const image = !imageBroken ? event.thumbnail_url : null;
    const dateDisplay = formatEventDateDisplay(
        event.start_at,
        event.end_at,
        event.start_time_known,
        event.end_time_known
    );

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
                {image ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={image}
                            alt=""
                            onError={() => setImageBroken(true)}
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0" style={{ background: "var(--overlay-protect-hero)" }} />
                        <div className="absolute right-3 bottom-3 left-3 text-white">
                            <b className="relative text-sm leading-snug line-clamp-3">{title}</b>
                        </div>
                    </>
                ) : (
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
                )}
                <div className="absolute top-2.5 left-2.5">
                    <span
                        className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-bold leading-relaxed"
                        style={{ background: color, color: "#fff" }}
                    >
                        {categoryLabel(category)}
                    </span>
                </div>
            </div>
            <div className="pt-2.5">
                <div className="line-clamp-2 text-[15px] leading-snug font-semibold text-foreground">
                    {title}
                </div>
                {dateDisplay && (
                    <div className="mt-0.5 text-[13px] leading-snug tabular-nums">
                        <b className="font-bold" style={{ color: "var(--primary)" }}>
                            {dateDisplay}
                        </b>
                    </div>
                )}
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
