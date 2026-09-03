"use client";

import type { DateRange as DayPickerRange } from "react-day-picker";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

interface DateRangeSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    range: DayPickerRange | undefined;
    onRangeChange: (range: DayPickerRange | undefined) => void;
    pendingCount: number;
    onApply: () => void;
    onClear: () => void;
    maxDate: Date;
}

export function DateRangeSheet({
    open,
    onOpenChange,
    range,
    onRangeChange,
    pendingCount,
    onApply,
    onClear,
    maxDate
}: DateRangeSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                className="mx-auto max-w-[480px] rounded-t-[24px] border-none px-4 pt-2.5 pb-4 font-sans shadow-[var(--shadow-sheet)]"
            >
                <div className="mx-auto h-1.5 w-10 rounded-full" style={{ background: "var(--naidee-stone-300)" }} />
                <SheetHeader className="p-0 pt-2.5">
                    <SheetTitle className="text-[17px] font-semibold">ไปช่วงไหนดี?</SheetTitle>
                </SheetHeader>
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
