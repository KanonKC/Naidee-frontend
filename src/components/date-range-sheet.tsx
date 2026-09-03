"use client";

import type { DateRange as DayPickerRange } from "react-day-picker";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import type { DatePreset } from "@/lib/date-filter";

const PRESET_OPTS: { id: Exclude<DatePreset, "custom">; label: string }[] = [
    { id: "all", label: "ทุกวัน" },
    { id: "today", label: "วันนี้" },
    { id: "tomorrow", label: "พรุ่งนี้" },
    { id: "weekend", label: "สุดสัปดาห์นี้" }
];

interface DateRangeSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    datePreset: DatePreset;
    onSelectPreset: (preset: DatePreset) => void;
    range: DayPickerRange | undefined;
    onRangeChange: (range: DayPickerRange | undefined) => void;
    pendingCount: number;
    onApply: () => void;
    onClear: () => void;
    onClearFilter: () => void;
    maxDate: Date;
}

export function DateRangeSheet({
    open,
    onOpenChange,
    datePreset,
    onSelectPreset,
    range,
    onRangeChange,
    pendingCount,
    onApply,
    onClear,
    onClearFilter,
    maxDate
}: DateRangeSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                className="mx-auto max-w-[480px] rounded-t-[24px] border-none px-4 pt-2.5 pb-4 font-sans shadow-[var(--shadow-sheet)]"
            >
                <div className="mx-auto h-1.5 w-10 rounded-full" style={{ background: "var(--naidee-stone-300)" }} />
                <SheetHeader className="flex-row items-center justify-between p-0 pt-2.5">
                    <SheetTitle className="text-[17px] font-semibold">ไปช่วงไหนดี?</SheetTitle>
                    {datePreset !== "all" && (
                        <button
                            type="button"
                            onClick={onClearFilter}
                            className="text-[13px] font-semibold"
                            style={{ color: "var(--primary)" }}
                        >
                            ล้างตัวกรอง
                        </button>
                    )}
                </SheetHeader>
                <div className="no-scrollbar flex gap-2 overflow-x-auto py-1">
                    {PRESET_OPTS.map((o) => {
                        const selected = datePreset === o.id;
                        return (
                            <button
                                key={o.id}
                                type="button"
                                onClick={() => onSelectPreset(o.id)}
                                aria-pressed={selected}
                                className="inline-flex flex-shrink-0 items-center rounded-full px-3.5 font-sans text-[13px] font-semibold transition-colors duration-150 ease-out"
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
                </div>
                <div className="flex justify-center">
                    <Calendar
                        mode="range"
                        selected={range}
                        onSelect={onRangeChange}
                        numberOfMonths={1}
                        disabled={{ before: new Date(), after: maxDate }}
                        startMonth={new Date()}
                        endMonth={maxDate}
                    />
                </div>
                <div className="mt-2 flex items-center gap-2.5">
                    <Button variant="ghost" className="h-11 rounded-full px-5" onClick={onClear}>
                        ล้าง
                    </Button>
                    <Button
                        className="h-11 flex-1 rounded-full text-base font-semibold"
                        disabled={!range?.from}
                        onClick={onApply}
                    >
                        แสดง {pendingCount} งาน
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
