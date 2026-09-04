import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:8081";

export async function GET(request: NextRequest) {
    const query = request.nextUrl.search;
    const res = await fetch(`${API_URL}/api/events${query}`, { cache: "no-store" });
    const body = await res.json().catch(() => null);
    return NextResponse.json(body, { status: res.status });
}
