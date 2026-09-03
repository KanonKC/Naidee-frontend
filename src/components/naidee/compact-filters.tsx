"use client";

import type { CSSProperties } from "react";
import { CalendarIcon, TagIcon, ChevronDownIcon } from "lucide-react";
import type { DatePreset } from "@/lib/date-filter";

const PRESET_LABEL: Record<Exclude<DatePreset, "custom">, string> = {
    all: "ทุกวัน",
    today: "วันนี้",
    tomorrow: "พรุ่งนี้",
    weekend: "สุดสัปดาห์นี้"
};

function chipStyle(active: boolean) {
    return {
        minHeight: 34,
        border: active ? "1.5px solid transparent" : "1.5px solid var(--border)",
        background: active ? "var(--primary)" : "var(--card)",
        color: active ? "var(--primary-foreground)" : "var(--naidee-stone-700)"
    } as CSSProperties;
}

interface DateTriggerChipProps {
    datePreset: DatePreset;
    customLabel: string | null;
    onClick: () => void;
}

export function DateTriggerChip({ datePreset, customLabel, onClick }: DateTriggerChipProps) {
    const active = datePreset !== "all";
    const label = datePreset === "custom" ? (customLabel ?? "เลือกวัน") : PRESET_LABEL[datePreset];
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 font-sans text-[13px] font-semibold tabular-nums transition-colors duration-150 ease-out"
            style={chipStyle(active)}
        >
            <CalendarIcon className="size-3.5" />
            {label}
            <ChevronDownIcon className="size-3.5 opacity-70" />
        </button>
    );
}

interface CategoryTriggerChipProps {
    count: number;
    onClick: () => void;
}

export function CategoryTriggerChip({ count, onClick }: CategoryTriggerChipProps) {
    const active = count > 0;
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 font-sans text-[13px] font-semibold tabular-nums transition-colors duration-150 ease-out"
            style={chipStyle(active)}
        >
            <TagIcon className="size-3.5" />
            หมวดหมู่{active ? ` (${count})` : ""}
            <ChevronDownIcon className="size-3.5 opacity-70" />
        </button>
    );
}
