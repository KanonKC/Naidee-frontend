import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ExternalLinkIcon, MapPinIcon, TicketIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getEvent } from "@/lib/api";
import { formatEventDateRange } from "@/lib/format";

export default async function EventDetailPage({
    params
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const event = await getEvent(id).catch(() => null);
    if (!event) notFound();

    return (
        <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
            <Link href="/" className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeftIcon className="size-4" />
                กลับไปหน้าแผนที่
            </Link>

            {event.thumbnail_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={event.thumbnail_url}
                    alt={event.title ?? "event image"}
                    className="max-h-96 w-full rounded-lg border object-cover"
                />
            )}

            <div className="flex flex-wrap items-start justify-between gap-2">
                <h1 className="text-2xl font-semibold leading-tight">
                    {event.title ?? "ไม่มีชื่อกิจกรรม"}
                </h1>
                {event.category && <Badge variant="secondary">{event.category}</Badge>}
            </div>

            <p className="text-muted-foreground">{formatEventDateRange(event.start_at, event.end_at)}</p>

            {event.venue && (
                <div className="flex items-start gap-2 text-sm">
                    <MapPinIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                        <p className="font-medium">{event.venue.name}</p>
                        {event.venue.address_text && (
                            <p className="text-muted-foreground">{event.venue.address_text}</p>
                        )}
                    </div>
                </div>
            )}

            {event.price_text && (
                <div className="flex items-center gap-2 text-sm">
                    <TicketIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span>{event.price_text}</span>
                </div>
            )}

            <Separator />

            {event.caption && (
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{event.caption}</p>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
                {event.registration_url && (
                    <Button
                        nativeButton={false}
                        render={
                            <a href={event.registration_url} target="_blank" rel="noopener noreferrer" />
                        }
                    >
                        ลงทะเบียน / ดูเพิ่มเติม
                        <ExternalLinkIcon className="size-4" />
                    </Button>
                )}
                <Button
                    variant="outline"
                    nativeButton={false}
                    render={<a href={event.permalink} target="_blank" rel="noopener noreferrer" />}
                >
                    ดูโพสต์ต้นฉบับ (@{event.source_username})
                    <ExternalLinkIcon className="size-4" />
                </Button>
            </div>
        </div>
    );
}
