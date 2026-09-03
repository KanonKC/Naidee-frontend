"use client";

import { ChevronLeftIcon } from "lucide-react";
import { EventDetailContent } from "@/components/event-detail-content";

interface EventDetailOverlayProps {
    eventId: string;
    distance?: string | null;
    onClose: () => void;
}

export function EventDetailOverlay({ eventId, distance, onClose }: EventDetailOverlayProps) {
    return (
        <div className="absolute inset-0 z-[70] overflow-y-auto bg-[rgba(28,25,23,.35)]">
            <div className="mx-auto min-h-full max-w-[520px] bg-background">
                <EventDetailContent
                    eventId={eventId}
                    distance={distance}
                    topLeftAction={
                        <button
                            onClick={onClose}
                            aria-label="กลับ"
                            className="flex size-11 items-center justify-center rounded-full bg-white/92 shadow-[var(--shadow-float)]"
                        >
                            <ChevronLeftIcon className="size-5.5" />
                        </button>
                    }
                />
            </div>
        </div>
    );
}
