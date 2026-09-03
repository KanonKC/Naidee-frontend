"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { LocateIcon } from "lucide-react";
import { EventSummary } from "@/lib/types";
import { createPinIcon, createClusterIcon, createUserLocationIcon } from "@/components/naidee/map-pin-icon";
import type { LatLng } from "@/lib/geo";

const BANGKOK_CENTER: [number, number] = [13.7563, 100.5018];

interface VenueGroup {
    venueId: string;
    name: string;
    lat: number;
    lng: number;
    category: string | null;
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
                category: event.category,
                events: [event]
            });
        }
    }
    return Array.from(groups.values());
}

function LocateControl({
    userLocation,
    onLocated,
    className
}: {
    userLocation: LatLng | null;
    onLocated: (loc: LatLng) => void;
    className?: string;
}) {
    const map = useMap();
    const [locating, setLocating] = useState(false);

    function handleClick() {
        if (!navigator.geolocation) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                onLocated(loc);
                map.flyTo([loc.lat, loc.lng], 15, { duration: 0.8 });
                setLocating(false);
            },
            () => setLocating(false),
            { enableHighAccuracy: true, timeout: 8000 }
        );
    }

    return (
        <>
            {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserLocationIcon()} />
            )}
            <button
                type="button"
                onClick={handleClick}
                aria-label="ตำแหน่งของฉัน"
                disabled={locating}
                className={className}
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    border: "none",
                    // Solid, not translucent + backdrop-blur: blur-over-map compositing is
                    // unreliable across browsers and can render this control near-invisible.
                    background: "#fff",
                    boxShadow: "var(--shadow-float)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--naidee-stone-800)",
                    cursor: "pointer",
                    // Leaflet's own panes (tiles, markers, popups) go up to z-index 700 inside
                    // .leaflet-container, so this control needs to clear that to stay visible.
                    zIndex: 1000
                }}
            >
                <LocateIcon className="size-5.5" />
            </button>
        </>
    );
}

function FitBounds({ groups }: { groups: VenueGroup[] }) {
    const map = useMap();
    const key = groups
        .map((g) => g.venueId)
        .sort()
        .join(",");

    useEffect(() => {
        if (groups.length === 0) return;
        const bounds = L.latLngBounds(groups.map((g) => [g.lat, g.lng]));
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return null;
}

interface EventMapProps {
    events: EventSummary[];
    selectedVenueId?: string | null;
    onSelectVenue?: (venueId: string) => void;
    userLocation: LatLng | null;
    onLocated: (loc: LatLng) => void;
    locateClassName?: string;
}

export default function EventMap({ events, selectedVenueId, onSelectVenue, userLocation, onLocated, locateClassName }: EventMapProps) {
    const venueGroups = groupByVenue(events);

    return (
        <MapContainer center={BANGKOK_CENTER} zoom={13} scrollWheelZoom zoomControl={false} className="h-full w-full">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {venueGroups.map((group) => {
                const selected = group.venueId === selectedVenueId;
                const icon =
                    group.events.length > 1
                        ? createClusterIcon(group.events.length)
                        : createPinIcon(group.category, selected);
                return (
                    <Marker
                        key={group.venueId}
                        position={[group.lat, group.lng]}
                        icon={icon}
                        eventHandlers={{ click: () => onSelectVenue?.(group.venueId) }}
                    />
                );
            })}
            <LocateControl userLocation={userLocation} onLocated={onLocated} className={locateClassName} />
            <FitBounds groups={venueGroups} />
        </MapContainer>
    );
}
