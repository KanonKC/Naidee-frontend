"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { XIcon } from "lucide-react";
import { EventSummary } from "@/lib/types";
import { EventDetailContent } from "@/components/event-detail-content";

const HALF_TOP = 40;
const FULL_TOP = 0;
const HIDDEN_TOP = 100;
const CLOSE_THRESHOLD = HALF_TOP + 14;

interface PinEventSheetProps {
    venueId: string;
    venueName: string;
    events: EventSummary[];
    initialEventId?: string | null;
    distanceFor: (event: EventSummary) => string | null;
    onClose: () => void;
}

export interface PinEventSheetHandle {
    requestClose: () => void;
}

export const PinEventSheet = forwardRef<PinEventSheetHandle, PinEventSheetProps>(function PinEventSheet(
    { venueId, venueName, events, initialEventId, distanceFor, onClose },
    ref
) {
    const [expanded, setExpanded] = useState(false);
    const [dragTop, setDragTop] = useState<number | null>(null);
    const [entered, setEntered] = useState(false);
    const [closing, setClosing] = useState(false);
    const [activeEventId, setActiveEventId] = useState(initialEventId ?? events[0]?.id ?? null);
    const [renderedVenueId, setRenderedVenueId] = useState(venueId);
    const dragState = useRef<{ startY: number; startTop: number } | null>(null);

    if (venueId !== renderedVenueId) {
        setRenderedVenueId(venueId);
        setActiveEventId(initialEventId ?? events[0]?.id ?? null);
        setExpanded(false);
        setClosing(false);
    }

    useEffect(() => {
        const id = requestAnimationFrame(() => setEntered(true));
        return () => cancelAnimationFrame(id);
    }, []);

    const restTop = closing ? HIDDEN_TOP : entered ? (expanded ? FULL_TOP : HALF_TOP) : HIDDEN_TOP;
    const top = dragTop ?? restTop;
    const dragging = dragTop != null;
    const activeEvent = events.find((e) => e.id === activeEventId) ?? events[0];

    function requestClose() {
        setDragTop(null);
        setClosing(true);
        window.setTimeout(onClose, 300);
    }

    useImperativeHandle(ref, () => ({ requestClose }));

    function onPointerDown(e: React.PointerEvent) {
        (e.currentTarget as Element).setPointerCapture(e.pointerId);
        dragState.current = { startY: e.clientY, startTop: expanded ? FULL_TOP : HALF_TOP };
    }

    function onPointerMove(e: React.PointerEvent) {
        if (!dragState.current) return;
        const vh = window.innerHeight;
        const deltaPercent = ((e.clientY - dragState.current.startY) / vh) * 100;
        const next = Math.min(100, Math.max(FULL_TOP, dragState.current.startTop + deltaPercent));
        setDragTop(next);
    }

    function onPointerUp() {
        if (!dragState.current) return;
        const current = dragTop ?? restTop;
        dragState.current = null;
        setDragTop(null);
        if (current >= CLOSE_THRESHOLD) {
            setClosing(true);
            window.setTimeout(onClose, 300);
        } else if (current < HALF_TOP / 2) {
            setExpanded(true);
        } else {
            setExpanded(false);
        }
    }

    if (!activeEvent) return null;

    return (
        <div
            role="dialog"
            aria-label={venueName}
            className="absolute right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden rounded-t-[24px] bg-background shadow-[var(--shadow-sheet)] lg:hidden"
            style={{
                top: `${top}%`,
                transition: dragging ? "none" : "top 280ms cubic-bezier(0.32,0.72,0,1)"
            }}
            onTransitionEnd={(e) => {
                if (e.propertyName === "top" && closing) onClose();
            }}
        >
            {events.length > 1 && (
                <div className="no-scrollbar flex shrink-0 gap-1.5 overflow-x-auto px-4 pt-2 pb-1">
                    {events.map((event, i) => {
                        const selected = event.id === activeEvent.id;
                        return (
                            <button
                                key={event.id}
                                type="button"
                                onClick={() => setActiveEventId(event.id)}
                                className="inline-flex flex-shrink-0 items-center rounded-full px-3 font-sans text-[12px] font-semibold transition-colors duration-150 ease-out"
                                style={{
                                    minHeight: 28,
                                    border: selected ? "1.5px solid transparent" : "1.5px solid var(--border)",
                                    background: selected ? "var(--primary)" : "var(--card)",
                                    color: selected ? "var(--primary-foreground)" : "var(--naidee-stone-700)"
                                }}
                            >
                                {`งานที่ ${i + 1}`}
                            </button>
                        );
                    })}
                </div>
            )}
            <div className="flex-1 overflow-y-auto">
                <EventDetailContent
                    eventId={activeEvent.id}
                    distance={distanceFor(activeEvent)}
                    heroAspectRatio="4/3"
                    dragHandle={
                        <div
                            className="absolute inset-x-0 top-0 flex h-10 cursor-grab touch-none justify-center pt-2.5 active:cursor-grabbing"
                            onPointerDown={onPointerDown}
                            onPointerMove={onPointerMove}
                            onPointerUp={onPointerUp}
                            onPointerCancel={onPointerUp}
                        >
                            <div className="h-1.5 w-10 rounded-full bg-white/75" />
                        </div>
                    }
                    topRightAction={
                        <button
                            type="button"
                            onClick={requestClose}
                            aria-label="ปิด"
                            className="flex size-11 items-center justify-center rounded-full bg-white/92 shadow-[var(--shadow-float)]"
                        >
                            <XIcon className="size-5" />
                        </button>
                    }
                />
            </div>
        </div>
    );
});
