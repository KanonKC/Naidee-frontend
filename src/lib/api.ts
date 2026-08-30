import { EventDetail, EventSummary } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

export interface EventFilters {
    from?: string;
    to?: string;
    category?: string;
}

async function apiFetch<T>(path: string): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
    if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Request failed with status ${res.status}`);
    }
    const body = await res.json();
    return body.data as T;
}

export function listEvents(filters: EventFilters): Promise<EventSummary[]> {
    const params = new URLSearchParams();
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    if (filters.category) params.set("category", filters.category);
    const query = params.toString();
    return apiFetch<EventSummary[]>(`/api/events${query ? `?${query}` : ""}`);
}

export function getEvent(id: string): Promise<EventDetail> {
    return apiFetch<EventDetail>(`/api/events/${id}`);
}
