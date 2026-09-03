"use client";

import { useEffect, useState } from "react";
import { CalendarIcon, ClockIcon, MapPinIcon, TicketIcon } from "lucide-react";
import { getEvent } from "@/lib/api";
import { EventDetail } from "@/lib/types";
import { categoryColorVar, categorySoftVar, categoryLabel, primaryCategory } from "@/lib/categories";
import { formatEventDateDisplay, formatStartCountdown } from "@/lib/date-filter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface EventDetailContentProps {
    eventId: string;
    distance?: string | null;
    topLeftAction?: React.ReactNode;
    topRightAction?: React.ReactNode;
    dragHandle?: React.ReactNode;
    heroAspectRatio?: string;
}

type FetchResult = { id: string; status: "ok"; data: EventDetail } | { id: string; status: "error" };

export function EventDetailContent({
    eventId,
    distance,
    topLeftAction,
    topRightAction,
    dragHandle,
    heroAspectRatio = "16/9"
}: EventDetailContentProps) {
    const [result, setResult] = useState<FetchResult | null>(null);
    const [brokenImageId, setBrokenImageId] = useState<string | null>(null);
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        let cancelled = false;
        getEvent(eventId)
            .then((data) => {
                if (!cancelled) setResult({ id: eventId, status: "ok", data });
            })
            .catch(() => {
                if (!cancelled) setResult({ id: eventId, status: "error" });
            });
        return () => {
            cancelled = true;
        };
    }, [eventId]);

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 30_000);
        return () => clearInterval(id);
    }, []);

    const current = result?.id === eventId ? result : null;
    const loading = !current;
    const loadError = current?.status === "error";
    const event = current?.status === "ok" ? current.data : null;

    const imageBroken = brokenImageId === eventId;
    const image = imageBroken ? null : (event?.media_url ?? event?.thumbnail_url ?? null);
    const category = primaryCategory(event?.categories ?? []);
    const color = categoryColorVar(category);
    const soft = categorySoftVar(category);
    const dateDisplay = event
        ? formatEventDateDisplay(event.start_at, event.end_at, event.start_time_known, event.end_time_known)
        : null;
    const countdown = event ? formatStartCountdown(event.start_at, event.start_time_known, now) : null;
    const isInstagramLink = !event?.registration_url && !!event?.permalink;

    return (
        <div>
            <div
                className="relative overflow-hidden"
                style={{
                    aspectRatio: heroAspectRatio,
                    background: image ? "var(--muted)" : soft
                }}
            >
                {loading ? (
                    <Skeleton className="absolute inset-0 rounded-none" />
                ) : image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={image}
                        alt=""
                        onError={() => setBrokenImageId(eventId)}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                ) : (
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{ color, backgroundImage: "radial-gradient(currentColor 1.5px,transparent 1.5px)", backgroundSize: "14px 14px" }}
                    />
                )}
                <div className="absolute inset-0" style={{ background: "var(--overlay-protect-hero)" }} />
                {dragHandle}
                {topLeftAction && <div className="absolute top-3 left-3">{topLeftAction}</div>}
                {topRightAction && <div className="absolute top-3 right-3">{topRightAction}</div>}
                {countdown && (
                    <span
                        className={`absolute top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-[var(--naidee-stone-900)] shadow-[var(--shadow-float)] ${topLeftAction ? "right-3" : "left-3"}`}
                        style={{ background: "var(--naidee-yellow-400)" }}
                    >
                        <ClockIcon className="size-3.5" />
                        {countdown}
                    </span>
                )}
                {!loading && event && (
                    <div className="absolute right-4 bottom-3.5 left-4 text-white">
                        <span
                            className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-bold"
                            style={{ background: color }}
                        >
                            {categoryLabel(category)}
                        </span>
                        <div className="mt-1.5 text-[22px] leading-snug font-bold">{event.title ?? "ไม่มีชื่อกิจกรรม"}</div>
                    </div>
                )}
            </div>
            <div className="px-4 pt-3.5 pb-6">
                {loadError ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">โหลดรายละเอียดงานไม่สำเร็จ</p>
                ) : loading || !event ? (
                    <div className="flex flex-col gap-4 py-2.5">
                        <Skeleton className="h-4 w-3/5" />
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-2/5" />
                    </div>
                ) : (
                    <>
                        {event.price_text && (
                            <div className="flex gap-2 pb-3">
                                <span
                                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-0.5 text-xs font-bold tabular-nums text-secondary-foreground"
                                >
                                    <TicketIcon className="size-3.5" />
                                    {event.price_text}
                                </span>
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            {dateDisplay && (
                                <InfoRow icon={<CalendarIcon className="size-5" />}>
                                    <b className="font-bold tabular-nums">{dateDisplay}</b>
                                </InfoRow>
                            )}
                            <InfoRow icon={<MapPinIcon className="size-5" />}>
                                {event.venue?.name ?? "ไม่ระบุสถานที่"}
                                {distance && (
                                    <span className="text-muted-foreground">
                                        {" "}
                                        • ห่าง <b className="tabular-nums">{distance}</b>
                                    </span>
                                )}
                            </InfoRow>
                        </div>
                        {(event.registration_url || event.permalink) && (
                            <Button
                                className="mt-3 h-12 w-full gap-2 rounded-full text-base font-semibold"
                                onClick={() => window.open(event.registration_url ?? event.permalink, "_blank")}
                            >
                                {isInstagramLink ? <InstagramIcon className="size-5" /> : <TicketIcon className="size-5" />}
                                {event.registration_url ? "ลงทะเบียนเลย" : "ดูโพสต์ต้นทางบน Instagram"}
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3 py-1">
            <span className="mt-0.5 shrink-0" style={{ color: "var(--primary)" }}>
                {icon}
            </span>
            <div className="text-[15px] leading-relaxed">{children}</div>
        </div>
    );
}

// lucide-react doesn't ship an Instagram glyph — inlined to match its icon conventions (stroke, size-*).
function InstagramIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="20" x="2" y="2" rx="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
    );
}
