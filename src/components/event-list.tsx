"use client";

import Link from "next/link";
import { MapPinIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EventSummary } from "@/lib/types";
import { formatEventDateRange } from "@/lib/format";

export function EventList({ events }: { events: EventSummary[] }) {
    if (events.length === 0) {
        return (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
ไม่พบกิจกรรมที่ตรงกับตัวกรอง
            </div>
        );
    }

    return (
        <ScrollArea className="h-full">
            <div className="flex flex-col gap-3 p-3">
                {events.map((event) => (
                    <Link key={event.id} href={`/events/${event.id}`}>
                        <Card className="gap-2 p-4 transition-colors hover:bg-accent">
                            <div className="flex items-start justify-between gap-2">
                                <p className="font-medium leading-tight">
                                    {event.title ?? "ไม่มีชื่อกิจกรรม"}
                                </p>
                                {event.category && (
                                    <Badge variant="secondary" className="shrink-0">
                                        {event.category}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {formatEventDateRange(event.start_at, event.end_at)}
                            </p>
                            {event.venue && (
                                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <MapPinIcon className="size-3.5 shrink-0" />
                                    <span className="truncate">{event.venue.name}</span>
                                </p>
                            )}
                        </Card>
                    </Link>
                ))}
            </div>
        </ScrollArea>
    );
}
