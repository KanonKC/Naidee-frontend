"use client";

import { useEffect, useState } from "react";
import { ChevronLeftIcon, ShareIcon, CalendarIcon, MapPinIcon, TicketIcon, LinkIcon, ExternalLinkIcon } from "lucide-react";
import { getEvent } from "@/lib/api";
import { EventDetail } from "@/lib/types";
import { categoryColorVar, categorySoftVar, categoryLabel } from "@/lib/categories";
import { formatThaiWeekdayDate, formatEventTime } from "@/lib/date-filter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface EventDetailOverlayProps {
    eventId: string;
    distance?: string | null;
    onClose: () => void;
}

type FetchResult =
    | { id: string; status: "ok"; data: EventDetail }
    | { id: string; status: "error" };

export function EventDetailOverlay({ eventId, distance, onClose }: EventDetailOverlayProps) {
    const [result, setResult] = useState<FetchResult | null>(null);
    const [copied, setCopied] = useState(false);
    const [brokenImageId, setBrokenImageId] = useState<string | null>(null);

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

    const current = result?.id === eventId ? result : null;
    const loading = !current;
    const loadError = current?.status === "error";
    const event = current?.status === "ok" ? current.data : null;

    async function handleShare() {
        const url = event?.permalink ?? window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({ title: event?.title ?? "ไหนดี", url });
                return;
            } catch {
                return;
            }
        }
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    }

    const imageBroken = brokenImageId === eventId;
    const image = imageBroken ? null : (event?.media_url ?? event?.thumbnail_url ?? null);
    const color = categoryColorVar(event?.category ?? null);
    const soft = categorySoftVar(event?.category ?? null);

    return (
        <div className="absolute inset-0 z-[70] overflow-y-auto bg-[rgba(28,25,23,.35)]">
            <div className="mx-auto min-h-full max-w-[520px] bg-background">
                <div className="relative overflow-hidden" style={{ aspectRatio: "16/9", background: image ? "var(--muted)" : soft }}>
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
                    <button
                        onClick={onClose}
                        aria-label="กลับ"
                        className="absolute top-3 left-3 flex size-11 items-center justify-center rounded-full bg-white/92 shadow-[var(--shadow-float)]"
                    >
                        <ChevronLeftIcon className="size-5.5" />
                    </button>
                    <button
                        onClick={handleShare}
                        aria-label="แชร์"
                        className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-full bg-white/92 shadow-[var(--shadow-float)]"
                    >
                        <ShareIcon className="size-5" />
                    </button>
                    {copied && (
                        <span className="absolute top-16 right-3 rounded-full bg-[var(--naidee-stone-900)] px-3 py-1 text-xs font-medium text-white">
                            คัดลอกลิงก์แล้ว
                        </span>
                    )}
                    {!loading && event && (
                        <div className="absolute right-4 bottom-3.5 left-4 text-white">
                            <span
                                className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-bold"
                                style={{ background: color }}
                            >
                                {categoryLabel(event.category)}
                            </span>
                            <div className="mt-1.5 text-[22px] leading-snug font-bold">{event.title ?? "ไม่มีชื่อกิจกรรม"}</div>
                        </div>
                    )}
                </div>
                <div className="px-4 pt-3 pb-6">
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
                            <InfoRow icon={<CalendarIcon className="size-5" />}>
                                <b className="font-bold tabular-nums">
                                    {event.start_at ? formatThaiWeekdayDate(event.start_at) : "ไม่ระบุวันที่"}
                                    {event.start_at && ` • ${formatEventTime(event.start_at, event.end_at)}`}
                                </b>
                            </InfoRow>
                            <InfoRow icon={<MapPinIcon className="size-5" />}>
                                {event.venue?.name ?? "ไม่ระบุสถานที่"}
                                {distance && (
                                    <span className="text-muted-foreground">
                                        {" "}
                                        • ห่าง <b className="tabular-nums">{distance}</b>
                                    </span>
                                )}
                            </InfoRow>
                            {event.price_text && (
                                <InfoRow icon={<TicketIcon className="size-5" />}>{event.price_text}</InfoRow>
                            )}
                            <InfoRow icon={<LinkIcon className="size-5" />}>
                                <a href={event.permalink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
                                    ดูโพสต์ต้นทางบน Instagram
                                    <ExternalLinkIcon className="size-3.5" />
                                </a>
                            </InfoRow>
                            <div className="mt-3 flex gap-2.5">
                                {(event.registration_url || event.permalink) && (
                                    <Button
                                        className="h-11 flex-1 rounded-full text-base font-semibold"
                                        onClick={() => window.open(event.registration_url ?? event.permalink, "_blank")}
                                    >
                                        {event.registration_url ? "ลงทะเบียนเลย" : "ดูรายละเอียดเพิ่มเติม"}
                                    </Button>
                                )}
                                <Button variant="secondary" className="h-11 rounded-full px-5" onClick={handleShare}>
                                    แชร์
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3 py-2.5">
            <span className="mt-0.5 shrink-0" style={{ color: "var(--primary)" }}>
                {icon}
            </span>
            <div className="text-[15px] leading-relaxed">{children}</div>
        </div>
    );
}
