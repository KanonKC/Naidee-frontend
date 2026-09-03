"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { DateRange as DayPickerRange } from "react-day-picker";
import { listEvents } from "@/lib/api";
import { EventSummary } from "@/lib/types";
import { FilterBar } from "@/components/naidee/filter-bar";
import { EventCard, EventCardSkeleton } from "@/components/naidee/event-card";
import { EmptyState } from "@/components/naidee/empty-state";
import { EventDetailOverlay } from "@/components/event-detail-overlay";
import { DateRangeSheet } from "@/components/date-range-sheet";
import {
    computeDateRange,
    dateRangeLabel,
    rangesOverlap,
    type DatePreset,
    type DateRange
} from "@/lib/date-filter";
import { haversineMeters, formatDistance, type LatLng } from "@/lib/geo";
import { Button } from "@/components/ui/button";

const EventMap = dynamic(() => import("@/components/event-map"), { ssr: false });

const FETCH_HORIZON_DAYS = 90;
const FETCH_LOOKBACK_DAYS = 14;

function fetchHorizon(): DateRange {
    const from = new Date();
    from.setDate(from.getDate() - FETCH_LOOKBACK_DAYS);
    from.setHours(0, 0, 0, 0);
    const to = new Date();
    to.setDate(to.getDate() + FETCH_HORIZON_DAYS);
    to.setHours(23, 59, 59, 999);
    return { from, to };
}

export default function Home() {
    const [events, setEvents] = useState<EventSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    const [datePreset, setDatePreset] = useState<DatePreset>("all");
    const [customRange, setCustomRange] = useState<DateRange | null>(null);
    const [draftRange, setDraftRange] = useState<DayPickerRange | undefined>(undefined);
    const [dateSheetOpen, setDateSheetOpen] = useState(false);

    const [categories, setCategories] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState("");

    const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
    const [detailEventId, setDetailEventId] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<LatLng | null>(null);

    const carouselRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    const horizon = useMemo(() => fetchHorizon(), []);

    useEffect(() => {
        let cancelled = false;
        listEvents({ from: horizon.from.toISOString(), to: horizon.to.toISOString() })
            .then((data) => {
                if (!cancelled) setEvents(data);
            })
            .catch((err) => {
                if (!cancelled) setError(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reloadToken]);

    function retryLoad() {
        setLoading(true);
        setError(null);
        setReloadToken((n) => n + 1);
    }

    const appliedRange = useMemo(() => computeDateRange(datePreset, customRange), [datePreset, customRange]);

    function filterEvents(range: DateRange, cats: Set<string>, query: string) {
        const q = query.trim().toLowerCase();
        return events
            .filter((e) => {
                if (!e.start_at) return false;
                const start = new Date(e.start_at);
                const end = e.end_at ? new Date(e.end_at) : start;
                if (!rangesOverlap(range.from, range.to, start, end)) return false;
                if (cats.size > 0 && (!e.category || !cats.has(e.category))) return false;
                if (q && !`${e.title ?? ""} ${e.venue?.name ?? ""}`.toLowerCase().includes(q)) return false;
                return true;
            })
            .sort((a, b) => (a.start_at ?? "").localeCompare(b.start_at ?? ""));
    }

    const filteredEvents = useMemo(
        () => filterEvents(appliedRange, categories, search),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [events, appliedRange, categories, search]
    );

    const pendingCount = useMemo(() => {
        const range = draftRange?.from
            ? computeDateRange("custom", { from: draftRange.from, to: draftRange.to ?? draftRange.from })
            : appliedRange;
        return filterEvents(range, categories, search).length;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draftRange, appliedRange, categories, search, events]);

    function eventDistance(event: EventSummary): string | null {
        if (!userLocation || event.venue?.lat == null || event.venue?.lng == null) return null;
        return formatDistance(haversineMeters(userLocation, { lat: event.venue.lat, lng: event.venue.lng }));
    }

    function scrollToVenue(venueId: string) {
        const target = filteredEvents.find((e) => e.venue?.id === venueId);
        if (!target) return;
        for (const ref of [carouselRef, gridRef]) {
            const el = ref.current?.querySelector<HTMLElement>(`[data-event-id="${target.id}"]`);
            el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
        }
    }

    function handleSelectVenue(venueId: string) {
        setSelectedVenueId(venueId);
        requestAnimationFrame(() => scrollToVenue(venueId));
    }

    function handleToggleCategory(id: string) {
        setCategories((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
        setSelectedVenueId(null);
    }

    function handleDateSelect(preset: DatePreset) {
        setDatePreset(preset);
        setCustomRange(null);
        setSelectedVenueId(null);
    }

    function openDatePicker() {
        setDraftRange(customRange ? { from: customRange.from, to: customRange.to } : undefined);
        setDateSheetOpen(true);
    }

    function applyDateRange() {
        if (!draftRange?.from) return;
        setCustomRange({ from: draftRange.from, to: draftRange.to ?? draftRange.from });
        setDatePreset("custom");
        setSelectedVenueId(null);
        setDateSheetOpen(false);
    }

    function clearAllFilters() {
        setDatePreset("all");
        setCustomRange(null);
        setCategories(new Set());
        setSearch("");
        setSelectedVenueId(null);
    }

    const countSuffix =
        datePreset === "all"
            ? ""
            : datePreset === "today"
              ? "ในวันนี้"
              : datePreset === "tomorrow"
                ? "ในวันพรุ่งนี้"
                : datePreset === "weekend"
                  ? "ในสุดสัปดาห์นี้"
                  : `ช่วง ${dateRangeLabel(appliedRange)}`;

    const customLabel = customRange ? dateRangeLabel(appliedRange) : null;

    const filterBarProps = {
        search,
        onSearchChange: setSearch,
        datePreset,
        customLabel,
        onDateSelect: handleDateSelect,
        onDatePick: openDatePicker,
        categories,
        onToggleCategory: handleToggleCategory,
        onSelectAll: () => {
            setCategories(new Set());
            setSelectedVenueId(null);
        }
    };

    const detailEvent = detailEventId ? (events.find((e) => e.id === detailEventId) ?? null) : null;

    const countLine = (
        <div className="px-4 pt-3.5 pb-2.5 text-[13px] text-muted-foreground">
            เจอ <b className="font-bold text-foreground tabular-nums">{filteredEvents.length}</b> งาน{countSuffix}
        </div>
    );

    const cardsBody = (variant: "carousel" | "grid") => {
        if (error) {
            return (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <Button variant="secondary" className="rounded-full" onClick={retryLoad}>
                        ลองใหม่
                    </Button>
                </div>
            );
        }
        if (loading) {
            return (
                <div
                    className={
                        variant === "carousel"
                            ? "flex gap-3 overflow-hidden px-3 pb-4"
                            : "grid grid-cols-2 gap-4 px-4 pb-5"
                    }
                >
                    {(variant === "carousel" ? [0, 1, 2] : [0, 1, 2, 3]).map((i) => (
                        <EventCardSkeleton key={i} style={variant === "carousel" ? { width: 154 } : undefined} />
                    ))}
                </div>
            );
        }
        if (filteredEvents.length === 0) {
            return (
                <div className="flex flex-1 items-center justify-center">
                    <EmptyState actionLabel="ล้างตัวกรอง" onAction={clearAllFilters} />
                </div>
            );
        }
        if (variant === "carousel") {
            return (
                <div
                    ref={carouselRef}
                    className="no-scrollbar flex flex-1 items-start gap-3 overflow-x-auto px-3 pb-4"
                    style={{ scrollSnapType: "x mandatory", scrollPaddingLeft: 12 }}
                >
                    {filteredEvents.map((event) => (
                        <div
                            key={event.id}
                            data-event-id={event.id}
                            style={{ scrollSnapAlign: "start", width: 154, flexShrink: 0 }}
                        >
                            <EventCard
                                event={event}
                                distance={eventDistance(event)}
                                selected={!!selectedVenueId && event.venue?.id === selectedVenueId}
                                onClick={() => setDetailEventId(event.id)}
                            />
                        </div>
                    ))}
                </div>
            );
        }
        return (
            <div ref={gridRef} className="grid flex-1 auto-rows-min grid-cols-2 gap-4 overflow-y-auto px-4 pb-5">
                {filteredEvents.map((event) => (
                    <div key={event.id} data-event-id={event.id}>
                        <EventCard
                            event={event}
                            distance={eventDistance(event)}
                            selected={!!selectedVenueId && event.venue?.id === selectedVenueId}
                            onClick={() => setDetailEventId(event.id)}
                        />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <main className="relative h-dvh w-full overflow-hidden bg-background">
            <div className="absolute inset-0 z-0">
                <EventMap
                    events={filteredEvents}
                    selectedVenueId={selectedVenueId}
                    onSelectVenue={handleSelectVenue}
                    userLocation={userLocation}
                    onLocated={setUserLocation}
                    locateClassName="absolute right-3 z-20 bottom-[calc(47%+14px)] lg:bottom-4"
                />
            </div>

            <div
                className="pointer-events-none absolute top-4 left-4 z-20 hidden text-[26px] font-bold lg:block"
                style={{ color: "var(--primary)", textShadow: "0 1px 0 #fff" }}
            >
                ไหนดี
            </div>

            <div className="absolute top-3 right-3 left-3 z-30 lg:hidden">
                <FilterBar {...filterBarProps} variant="floating" />
            </div>

            <div
                className="absolute right-0 bottom-0 left-0 z-10 flex flex-col overflow-hidden rounded-t-[24px] bg-background shadow-[var(--shadow-sheet)] lg:hidden"
                style={{ top: "53%" }}
            >
                {countLine}
                {cardsBody("carousel")}
            </div>

            <div
                className="absolute inset-y-0 right-0 z-30 hidden w-[400px] flex-col bg-background lg:flex"
                style={{ boxShadow: "-8px 0 24px rgba(154,52,18,.08)" }}
            >
                <div className="flex flex-col gap-2.5 p-4 pb-1.5">
                    <FilterBar {...filterBarProps} variant="sidebar" />
                </div>
                {countLine}
                {cardsBody("grid")}
            </div>

            <DateRangeSheet
                open={dateSheetOpen}
                onOpenChange={setDateSheetOpen}
                range={draftRange}
                onRangeChange={setDraftRange}
                pendingCount={pendingCount}
                onApply={applyDateRange}
                onClear={() => setDraftRange(undefined)}
                maxDate={horizon.to}
            />

            {detailEventId && (
                <EventDetailOverlay
                    eventId={detailEventId}
                    distance={detailEvent ? eventDistance(detailEvent) : null}
                    onClose={() => setDetailEventId(null)}
                />
            )}
        </main>
    );
}
