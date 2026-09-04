"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Pane, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { LocateIcon, TrainFrontIcon } from "lucide-react";
import { EventSummary } from "@/lib/types";
import { createPinIcon, createClusterIcon, createUserLocationIcon } from "@/components/naidee/map-pin-icon";
import { primaryCategory } from "@/lib/categories";
import type { LatLng } from "@/lib/geo";

const BANGKOK_CENTER: [number, number] = [13.7563, 100.5018];

// OSM's subdomain form ({s}.tile.…) is deprecated; the bare host is the current
// recommendation and is fine over HTTP/2.
const OSM_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const BASE_MAX_ZOOM = 19;
// Desaturating the basemap is what buys the "calm map" look. It has to be scoped
// to the basemap's own pane rather than the whole map, so the railway overlay and
// the event pins keep their full colour and gain contrast against the grey.
// A ready-made flat basemap was the first choice, but CARTO now key-gates its
// tiles (they come back 200 with "API KEY REQUIRED" burnt into the image) and
// Esri's Light Gray stops at z16, so this filter gets the same effect key-free.
const BASEMAP_FILTER = "saturate(0.15) brightness(1.06) contrast(0.92)";
const BASEMAP_PANE_Z_INDEX = 200;

const RAILWAY_URL = "https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png";
const RAILWAY_ATTRIBUTION = '&copy; <a href="https://www.openrailwaymap.org/">OpenRailwayMap</a>';
// OpenRailwayMap 404s from z20 up. The basemap also stops at 19 so the map should
// never ask for 20, but pin the native zoom anyway: without it, raising
// BASE_MAX_ZOOM later would silently make the rail lines vanish at full zoom.
const RAILWAY_MAX_NATIVE_ZOOM = 19;
const RAILWAY_OPACITY = 0.85;
// Between tilePane (200) and overlayPane (400): above the basemap, still below
// markerPane (600) so event pins always win. Stacking two TileLayers in the
// default tilePane would depend on DOM mount order, which is not stable across
// the re-render that toggling this layer causes.
const RAILWAY_PANE_Z_INDEX = 250;

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

// Shared by both floating map controls so they read as one set.
// Solid, not translucent + backdrop-blur: blur-over-map compositing is
// unreliable across browsers and can render these controls near-invisible.
// Leaflet's own panes (tiles, markers, popups) go up to z-index 700 inside
// .leaflet-container, so these need to clear that to stay visible.
const FLOAT_BUTTON_STYLE: CSSProperties = {
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: "none",
    background: "#fff",
    boxShadow: "var(--shadow-float)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 1000
};

function RailwayToggle({
    active,
    onToggle,
    className
}: {
    active: boolean;
    onToggle: () => void;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-label="เส้นทางรถไฟฟ้า"
            aria-pressed={active}
            className={className}
            style={{
                ...FLOAT_BUTTON_STYLE,
                color: active ? "var(--naidee-stone-800)" : "var(--naidee-stone-400)"
            }}
        >
            <TrainFrontIcon className="size-5.5" />
        </button>
    );
}

function LocateControl({
    userLocation,
    onLocated,
    className,
    autoLocate
}: {
    userLocation: LatLng | null;
    onLocated: (loc: LatLng) => void;
    className?: string;
    autoLocate?: boolean;
}) {
    const map = useMap();
    const [locating, setLocating] = useState(false);
    const autoTriggered = useRef(false);

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
            <button
                type="button"
                onClick={handleClick}
                aria-label="ตำแหน่งของฉัน"
                disabled={locating}
                className={className}
                style={{ ...FLOAT_BUTTON_STYLE, color: "var(--naidee-stone-800)" }}
            >
                <LocateIcon className="size-5.5" />
            </button>
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
    locateClassName?: string;
    railwayClassName?: string;
    autoLocate?: boolean;
}

export default function EventMap({ events, selectedVenueId, onSelectVenue, onMapClick, userLocation, onLocated, locateClassName, railwayClassName, autoLocate }: EventMapProps) {
    const venueGroups = groupByVenue(events);
    const [showRailway, setShowRailway] = useState(true);

    return (
        <MapContainer center={BANGKOK_CENTER} zoom={13} scrollWheelZoom zoomControl={false} className="h-full w-full">
            <Pane name="basemap" style={{ zIndex: BASEMAP_PANE_Z_INDEX, filter: BASEMAP_FILTER }}>
                <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_URL} maxZoom={BASE_MAX_ZOOM} />
            </Pane>
            {showRailway && (
                <Pane name="railway" style={{ zIndex: RAILWAY_PANE_Z_INDEX, pointerEvents: "none" }}>
                    <TileLayer
                        attribution={RAILWAY_ATTRIBUTION}
                        url={RAILWAY_URL}
                        subdomains="abc"
                        opacity={RAILWAY_OPACITY}
                        maxNativeZoom={RAILWAY_MAX_NATIVE_ZOOM}
                        maxZoom={BASE_MAX_ZOOM}
                    />
                </Pane>
            )}
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
            <LocateControl userLocation={userLocation} onLocated={onLocated} className={locateClassName} autoLocate={autoLocate} />
            <RailwayToggle active={showRailway} onToggle={() => setShowRailway((v) => !v)} className={railwayClassName} />
            <FitBounds groups={venueGroups} />
            <PanToSelection groups={venueGroups} selectedVenueId={selectedVenueId} />
            <MapClickHandler onMapClick={onMapClick} />
        </MapContainer>
    );
}
