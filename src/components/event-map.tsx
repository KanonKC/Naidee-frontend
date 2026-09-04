"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { LocateIcon, Loader2Icon } from "lucide-react";
import { EventSummary } from "@/lib/types";
import { createPinIcon, createClusterIcon, createUserLocationIcon } from "@/components/naidee/map-pin-icon";
import { primaryCategory } from "@/lib/categories";
import type { LatLng } from "@/lib/geo";

const BANGKOK_CENTER: [number, number] = [13.7563, 100.5018];

interface VenueGroup {
    venueId: string;
    name: string;
    lat: number;
    lng: number;
    category: string | null;
    categories: string[];
    events: EventSummary[];
}

function groupByVenue(events: EventSummary[]): VenueGroup[] {
    const groups = new Map<string, VenueGroup>();
    for (const event of events) {
        const venue = event.venue;
        if (!venue || venue.lat == null || venue.lng == null) continue;
        const existing = groups.get(venue.id);
        const category = primaryCategory(event.categories);
        if (existing) {
            existing.events.push(event);
            if (category && !existing.categories.includes(category)) existing.categories.push(category);
        } else {
            groups.set(venue.id, {
                venueId: venue.id,
                name: venue.name,
                lat: venue.lat,
                lng: venue.lng,
                category,
                categories: category ? [category] : [],
                events: [event]
            });
        }
    }
    return Array.from(groups.values());
}

function LocateControl({
    userLocation,
    onLocated,
    bottomOffset,
    autoLocate
}: {
    userLocation: LatLng | null;
    onLocated: (loc: LatLng) => void;
    bottomOffset?: string;
    autoLocate?: boolean;
}) {
    const map = useMap();
    const [locating, setLocating] = useState(false);
    const [mounted, setMounted] = useState(false);
    const autoTriggered = useRef(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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

    useEffect(() => {
        if (!autoLocate || autoTriggered.current) return;
        autoTriggered.current = true;
        handleClick();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoLocate]);

    return (
        <>
            {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserLocationIcon()} />
            )}
            {mounted &&
                createPortal(
                    <button
                        type="button"
                        onClick={handleClick}
                        aria-label="ตำแหน่งของฉัน"
                        disabled={locating}
                        className="fixed right-3 z-50 lg:right-[432px]"
                        style={{
                            bottom: bottomOffset ?? "1rem",
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
                            cursor: locating ? "default" : "pointer",
                            opacity: locating ? 0.7 : 1,
                            transition:
                                "bottom 280ms cubic-bezier(0.32,0.72,0,1), opacity 180ms ease-out"
                        }}
                    >
                        <span
                            className="relative flex items-center justify-center"
                            style={{ width: 22, height: 22 }}
                        >
                            <LocateIcon
                                className="absolute size-5.5"
                                style={{
                                    opacity: locating ? 0 : 1,
                                    transform: locating ? "scale(0.7)" : "scale(1)",
                                    transition: "opacity 180ms ease-out, transform 180ms ease-out"
                                }}
                            />
                            <Loader2Icon
                                className="absolute size-5.5 animate-spin"
                                style={{
                                    opacity: locating ? 1 : 0,
                                    transform: locating ? "scale(1)" : "scale(0.7)",
                                    transition: "opacity 180ms ease-out, transform 180ms ease-out"
                                }}
                            />
                        </span>
                    </button>,
                    document.body
                )}
        </>
    );
}

function MapClickHandler({ onMapClick }: { onMapClick?: () => void }) {
    useMapEvents({
        click: () => onMapClick?.()
    });
    return null;
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

const CHIPS_BOTTOM_PX = 180;
const SHEET_TOP_FRACTION = 0.5;
// Where the pin lands in the gap between the filter bar and the sheet: 0 = right at the filter bar, 1 = right at the sheet edge.
const PIN_VERTICAL_BIAS = 0.15;

function PanToSelection({ groups, selectedVenueId }: { groups: VenueGroup[]; selectedVenueId?: string | null }) {
    const map = useMap();

    useEffect(() => {
        if (!selectedVenueId) return;
        if (window.innerWidth >= 1024) return;
        const group = groups.find((g) => g.venueId === selectedVenueId);
        if (!group) return;

        const size = map.getSize();
        const sheetTop = size.y * SHEET_TOP_FRACTION;
        const targetY = CHIPS_BOTTOM_PX + (sheetTop - CHIPS_BOTTOM_PX) * PIN_VERTICAL_BIAS;
        const currentPoint = map.latLngToContainerPoint([group.lat, group.lng]);
        const desiredPoint = L.point(size.x / 2, targetY);
        const offset = currentPoint.subtract(desiredPoint);
        map.panBy(offset, { animate: true, duration: 0.4 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedVenueId]);

    return null;
}

interface EventMapProps {
    events: EventSummary[];
    selectedVenueId?: string | null;
    onSelectVenue?: (venueId: string) => void;
    onMapClick?: () => void;
    userLocation: LatLng | null;
    onLocated: (loc: LatLng) => void;
    locateBottomOffset?: string;
    autoLocate?: boolean;
}

export default function EventMap({ events, selectedVenueId, onSelectVenue, onMapClick, userLocation, onLocated, locateBottomOffset, autoLocate }: EventMapProps) {
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
                        ? createClusterIcon(group.events.length, group.categories)
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
            <LocateControl userLocation={userLocation} onLocated={onLocated} bottomOffset={locateBottomOffset} autoLocate={autoLocate} />
            <FitBounds groups={venueGroups} />
            <PanToSelection groups={venueGroups} selectedVenueId={selectedVenueId} />
            <MapClickHandler onMapClick={onMapClick} />
        </MapContainer>
    );
}
