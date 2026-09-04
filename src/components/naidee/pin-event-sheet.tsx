"use client";

import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react";
import { EventSummary } from "@/lib/types";
import { EventDetailContent } from "@/components/event-detail-content";
import { formatEventDateDisplay } from "@/lib/date-filter";

const HALF_TOP = 40;
const FULL_TOP = 0;
const HIDDEN_TOP = 100;
const CLOSE_THRESHOLD = HALF_TOP + 14;

interface PinEventSheetProps {
	venueId: string;
	venueName: string;
	events: EventSummary[];
	initialEventId?: string | null;
	distanceFor: (event: EventSummary) => string | null;
	onClose: () => void;
}

export interface PinEventSheetHandle {
	requestClose: () => void;
}

export const PinEventSheet = forwardRef<
	PinEventSheetHandle,
	PinEventSheetProps
>(function PinEventSheet(
	{ venueId, venueName, events, initialEventId, distanceFor, onClose },
	ref,
) {
	const [expanded, setExpanded] = useState(false);
	const [dragTop, setDragTop] = useState<number | null>(null);
	const [entered, setEntered] = useState(false);
	const [closing, setClosing] = useState(false);
	const [activeEventId, setActiveEventId] = useState(
		initialEventId ?? events[0]?.id ?? null,
	);
	const [renderedVenueId, setRenderedVenueId] = useState(venueId);
	const [pickerOpen, setPickerOpen] = useState(false);
	const dragState = useRef<{ startY: number; startTop: number } | null>(null);

	if (venueId !== renderedVenueId) {
		setRenderedVenueId(venueId);
		setActiveEventId(initialEventId ?? events[0]?.id ?? null);
		setExpanded(false);
		setClosing(false);
		setPickerOpen(false);
	}

	useEffect(() => {
		const id = requestAnimationFrame(() => setEntered(true));
		return () => cancelAnimationFrame(id);
	}, []);

	const restTop = closing
		? HIDDEN_TOP
		: entered
			? expanded
				? FULL_TOP
				: HALF_TOP
			: HIDDEN_TOP;
	const top = dragTop ?? restTop;
	const dragging = dragTop != null;
	const activeEvent = events.find((e) => e.id === activeEventId) ?? events[0];

	function requestClose() {
		setDragTop(null);
		setClosing(true);
		window.setTimeout(onClose, 300);
	}

	useImperativeHandle(ref, () => ({ requestClose }));

	function onPointerDown(e: React.PointerEvent) {
		(e.currentTarget as Element).setPointerCapture(e.pointerId);
		dragState.current = {
			startY: e.clientY,
			startTop: expanded ? FULL_TOP : HALF_TOP,
		};
	}

	function onPointerMove(e: React.PointerEvent) {
		if (!dragState.current) return;
		const vh = window.innerHeight;
		const deltaPercent =
			((e.clientY - dragState.current.startY) / vh) * 100;
		const next = Math.min(
			100,
			Math.max(FULL_TOP, dragState.current.startTop + deltaPercent),
		);
		setDragTop(next);
	}

	function onPointerUp() {
		if (!dragState.current) return;
		const current = dragTop ?? restTop;
		dragState.current = null;
		setDragTop(null);
		if (current >= CLOSE_THRESHOLD) {
			setClosing(true);
			window.setTimeout(onClose, 300);
		} else if (current < HALF_TOP / 2) {
			setExpanded(true);
		} else {
			setExpanded(false);
		}
	}

	if (!activeEvent) return null;

	return (
		<div
			role="dialog"
			aria-label={venueName}
			className="absolute right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden rounded-t-[24px] bg-background shadow-[var(--shadow-sheet)] lg:hidden"
			style={{
				top: `${top}%`,
				transition: dragging
					? "none"
					: "top 280ms cubic-bezier(0.32,0.72,0,1)",
			}}
			onTransitionEnd={(e) => {
				if (e.propertyName === "top" && closing) onClose();
			}}
		>
			{events.length > 1 && (
				<div className="relative z-10 shrink-0 px-2 pt-2 pb-1">
					<button
						type="button"
						onClick={() => setPickerOpen((v) => !v)}
						className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors duration-150 ease-out"
					>
						<EventPickerThumb event={activeEvent} />
						<span className="min-w-0 flex-1">
							<span className="block truncate text-[12px] font-medium ">
								{activeEvent.venue?.name ?? venueName}
							</span>
							<span className="block truncate text-[13px] font-bold">
								{activeEvent.title ?? "ไม่มีชื่อกิจกรรม"}
							</span>
						</span>
						<ChevronDownIcon
							className="size-4 shrink-0 transition-transform duration-200 ease-out"
							style={{
								transform: pickerOpen
									? "rotate(180deg)"
									: "rotate(0deg)",
							}}
						/>
					</button>
					<div
						className="no-scrollbar absolute inset-x-2 top-full flex max-h-[192px] flex-col gap-1 overflow-y-auto rounded-sm bg-card p-1.5 shadow-[var(--shadow-float)] origin-top"
						style={{
							opacity: pickerOpen ? 1 : 0,
							transform: pickerOpen
								? "scale(1) translateY(4px)"
								: "scale(0.96) translateY(-4px)",
							pointerEvents: pickerOpen ? "auto" : "none",
							transition:
								"opacity 180ms ease-out, transform 180ms ease-out",
						}}
					>
						{events.map((event) => {
							const selected = event.id === activeEvent.id;
							return (
								<EventPickerRow
									key={event.id}
									event={event}
									selected={selected}
									onClick={() => {
										setActiveEventId(event.id);
										setPickerOpen(false);
									}}
								/>
							);
						})}
					</div>
				</div>
			)}
			<div className="flex-1 overflow-y-auto">
				<EventDetailContent
					eventId={activeEvent.id}
					distance={distanceFor(activeEvent)}
					heroAspectRatio="16/9"
					dragHandle={
						<div
							className="absolute inset-x-0 top-0 flex h-10 cursor-grab touch-none justify-center pt-2.5 active:cursor-grabbing"
							onPointerDown={onPointerDown}
							onPointerMove={onPointerMove}
							onPointerUp={onPointerUp}
							onPointerCancel={onPointerUp}
						>
							<div className="h-1.5 w-10 rounded-full bg-white/75" />
						</div>
					}
					topRightAction={
						<button
							type="button"
							onClick={requestClose}
							aria-label="ปิด"
							className="flex size-11 items-center justify-center rounded-full bg-white/92 shadow-[var(--shadow-float)]"
						>
							<XIcon className="size-5" />
						</button>
					}
				/>
			</div>
		</div>
	);
});

function EventPickerThumb({ event }: { event: EventSummary }) {
	return (
		<span className="relative size-9 shrink-0 overflow-hidden rounded-full bg-[var(--muted)]">
			{event.thumbnail_url && (
				// eslint-disable-next-line @next/next/no-img-element
				<img
					src={event.thumbnail_url}
					alt=""
					className="absolute inset-0 h-full w-full object-cover"
				/>
			)}
		</span>
	);
}

function EventPickerRow({
	event,
	selected,
	onClick,
}: {
	event: EventSummary;
	selected: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex items-center gap-2.5 rounded-sm px-2 py-1.5 text-left transition-colors duration-150 ease-out"
			style={{
				background: selected
					? "var(--naidee-orange-100)"
					: "transparent",
				color: "var(--foreground)",
			}}
		>
			<EventPickerThumb event={event} />
			<span className="min-w-0 flex-1">
				<span className="block truncate text-[13px] font-bold">
					{event.title ?? "ไม่มีชื่อกิจกรรม"}
				</span>
				<span
					className="block truncate text-[13px] font-medium"
					style={{ color: "var(--naidee-stone-500)" }}
				>
					{formatEventDateDisplay(
						event.start_at,
						event.end_at,
						event.start_time_known,
						event.end_time_known,
					)}
				</span>
			</span>
			{selected && (
				<CheckIcon
					className="size-4 shrink-0"
					style={{ color: "var(--primary)" }}
				/>
			)}
		</button>
	);
}
