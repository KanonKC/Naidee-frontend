"use client";

import { CalendarIcon } from "lucide-react";
import type { DatePreset } from "@/lib/date-filter";

const OPTS: { id: DatePreset; label: string }[] = [
    { id: "all", label: "ทุกวัน" },
    { id: "today", label: "วันนี้" },
    { id: "tomorrow", label: "พรุ่งนี้" },
    { id: "weekend", label: "สุดสัปดาห์นี้" }
];

interface DateChipsProps {
    value: DatePreset;
    customLabel: string | null;
    onSelect: (preset: DatePreset) => void;
    onPick: () => void;
}

export function DateChips({ value, customLabel, onSelect, onPick }: DateChipsProps) {
    return (
        <div className="no-scrollbar flex gap-2 overflow-x-auto p-0.5">
            {OPTS.map((o) => {
                const selected = value === o.id;
                return (
                    <button
                        key={o.id}
                        type="button"
                        onClick={() => onSelect(o.id)}
                        aria-pressed={selected}
                        className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 font-sans text-[13px] font-semibold tabular-nums transition-colors duration-150 ease-out"
                        style={{
                            minHeight: 34,
                            border: selected ? "1.5px solid transparent" : "1.5px solid var(--border)",
                            background: selected ? "var(--primary)" : "var(--card)",
                            color: selected ? "var(--primary-foreground)" : "var(--naidee-stone-700)"
                        }}
                    >
                        {o.label}
                    </button>
                );
            })}
            <button
                type="button"
                onClick={onPick}
                aria-pressed={value === "custom"}
                className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 font-sans text-[13px] font-semibold tabular-nums transition-colors duration-150 ease-out"
                style={{
                    minHeight: 34,
                    border: value === "custom" ? "1.5px solid transparent" : "1.5px solid var(--border)",
                    background: value === "custom" ? "var(--primary)" : "var(--card)",
                    color: value === "custom" ? "var(--primary-foreground)" : "var(--naidee-stone-700)"
                }}
            >
                <CalendarIcon className="size-3.5" />
                {value === "custom" && customLabel ? customLabel : "เลือกวัน"}
            </button>
        </div>
    );
}
