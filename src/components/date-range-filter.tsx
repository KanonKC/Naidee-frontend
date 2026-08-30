"use client";

import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatEventDate } from "@/lib/format";

interface DateRangeFilterProps {
    range: DateRange | undefined;
    onChange: (range: DateRange | undefined) => void;
}

export function DateRangeFilter({ range, onChange }: DateRangeFilterProps) {
    const label =
        range?.from && range?.to
            ? `${formatEventDate(range.from.toISOString())} - ${formatEventDate(range.to.toISOString())}`
            : range?.from
              ? formatEventDate(range.from.toISOString())
              : "เลือกช่วงวันที่";

    return (
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger
                    render={<Button variant="outline" className="justify-start gap-2 font-normal" />}
                >
                    <CalendarIcon className="size-4" />
                    {label}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="range" selected={range} onSelect={onChange} numberOfMonths={2} />
                </PopoverContent>
            </Popover>
            {range?.from && (
                <Button variant="ghost" onClick={() => onChange(undefined)}>
                    ล้างตัวกรอง
                </Button>
            )}
        </div>
    );
}
