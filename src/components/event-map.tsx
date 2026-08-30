"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import Link from "next/link";
import { EventSummary } from "@/lib/types";
import { formatEventDateRange } from "@/lib/format";

const BANGKOK_CENTER: [number, number] = [13.7563, 100.5018];

const markerIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface VenueGroup {
    venueId: string;
    name: string;
    lat: number;
    lng: number;
    events: EventSummary[];
}

function groupByVenue(events: EventSummary[]): VenueGroup[] {
    const groups = new Map<string, VenueGroup>();
    for (const event of events) {
        const venue = event.venue;
        if (!venue || venue.lat == null || venue.lng == null) continue;
        const existing = groups.get(venue.id);
        if (existing) {
            existing.events.push(event);
        } else {
            groups.set(venue.id, {
                venueId: venue.id,
                name: venue.name,
                lat: venue.lat,
                lng: venue.lng,
                events: [event]
            });
        }
    }
    return Array.from(groups.values());
}

interface EventMapProps {
    events: EventSummary[];
    selectedVenueId?: string | null;
    onSelectVenue?: (venueId: string) => void;
}

export default function EventMap({ events, selectedVenueId, onSelectVenue }: EventMapProps) {
    const venueGroups = groupByVenue(events);

    return (
        <MapContainer
            center={BANGKOK_CENTER}
            zoom={12}
            scrollWheelZoom
            className="h-full w-full rounded-lg"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {venueGroups.map((group) => (
                <Marker
                    key={group.venueId}
                    position={[group.lat, group.lng]}
                    icon={markerIcon}
                    opacity={selectedVenueId && selectedVenueId !== group.venueId ? 0.5 : 1}
                    eventHandlers={{
                        click: () => onSelectVenue?.(group.venueId)
                    }}
                >
                    <Popup minWidth={220}>
                        <div className="space-y-2">
                            <p className="font-semibold leading-tight">{group.name}</p>
                            <ul className="space-y-1.5">
                                {group.events.map((event) => (
                                    <li key={event.id} className="border-t pt-1.5 first:border-t-0 first:pt-0">
                                        <Link
                                            href={`/events/${event.id}`}
                                            className="text-sm font-medium text-blue-600 hover:underline"
                                        >
                                            {event.title ?? "ไม่มีชื่อกิจกรรม"}
                                        </Link>
                                        <p className="text-xs text-muted-foreground">
                                            {formatEventDateRange(event.start_at, event.end_at)}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
