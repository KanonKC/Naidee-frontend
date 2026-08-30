"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { MapPinIcon } from "lucide-react";
import { DateRangeFilter } from "@/components/date-range-filter";
import { EventList } from "@/components/event-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { listEvents } from "@/lib/api";
import { EventSummary } from "@/lib/types";

const EventMap = dynamic(() => import("@/components/event-map"), {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-lg" />
});

function toDateOnly(date: Date): string {
    return date.toISOString().slice(0, 10);
}

export default function Home() {
    const [range, setRange] = useState<DateRange | undefined>(undefined);
    const [events, setEvents] = useState<EventSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);

    const filters = useMemo(
        () => ({
            from: range?.from ? toDateOnly(range.from) : undefined,
            to: range?.to ? toDateOnly(range.to) : undefined
        }),
        [range]
    );

    useEffect(() => {
        let cancelled = false;

        async function run() {
            setLoading(true);
            setError(null);
            setSelectedVenueId(null);
            try {
                const data = await listEvents(filters);
                if (!cancelled) setEvents(data);
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        run();
        return () => {
            cancelled = true;
        };
    }, [filters]);

    const visibleEvents = selectedVenueId
        ? events.filter((event) => event.venue?.id === selectedVenueId)
        : events;
    const selectedVenueName = selectedVenueId
        ? events.find((event) => event.venue?.id === selectedVenueId)?.venue?.name
        : undefined;

    return (
        <div className="flex h-dvh flex-col">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
                <div>
                    <h1 className="text-lg font-semibold">Event Bangkok</h1>
                    <p className="text-sm text-muted-foreground">
                        แผนที่กิจกรรมในกรุงเทพฯ — กรองตามช่วงวันที่แล้วดูรายละเอียดได้ทันที
                    </p>
                </div>
                <DateRangeFilter range={range} onChange={setRange} />
            </header>

            <main className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[380px_1fr]">
                <aside className="flex min-h-0 flex-col border-r">
                    {selectedVenueId && (
                        <div className="flex items-center justify-between gap-2 border-b bg-muted/50 px-3 py-2 text-sm">
                            <span className="flex min-w-0 items-center gap-1">
                                <MapPinIcon className="size-3.5 shrink-0" />
                                <span className="truncate">{selectedVenueName ?? "สถานที่ที่เลือก"}</span>
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedVenueId(null)}>
                                ล้าง
                            </Button>
                        </div>
                    )}
                    <div className="min-h-0 flex-1">
                        {loading ? (
                            <div className="flex flex-col gap-3 p-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-24 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : error ? (
                            <p className="p-4 text-sm text-destructive">{error}</p>
                        ) : (
                            <EventList events={visibleEvents} />
                        )}
                    </div>
                </aside>
                <div className="isolate min-h-0 p-3">
                    <EventMap
                        events={events}
                        selectedVenueId={selectedVenueId}
                        onSelectVenue={setSelectedVenueId}
                    />
                </div>
            </main>
        </div>
    );
}
