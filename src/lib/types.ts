export interface Venue {
    id: string;
    name: string;
    address_text: string | null;
    lat: number | null;
    lng: number | null;
}

export interface EventSummary {
    id: string;
    title: string | null;
    start_at: string | null;
    end_at: string | null;
    price_text: string | null;
    category: string | null;
    registration_url: string | null;
    venue: Venue | null;
}

export interface EventDetail extends EventSummary {
    caption: string | null;
    permalink: string;
    media_url: string | null;
    thumbnail_url: string | null;
    source_username: string;
}
