"use client";

import { SearchIcon } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { CategoryChip } from "@/components/naidee/category-chip";
import { DateChips } from "@/components/naidee/date-chips";
import type { DatePreset } from "@/lib/date-filter";
import { cn } from "@/lib/utils";

interface FilterBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    datePreset: DatePreset;
    customLabel: string | null;
    onDateSelect: (preset: DatePreset) => void;
    onDatePick: () => void;
    categories: Set<string>;
    onToggleCategory: (id: string) => void;
    onSelectAll: () => void;
    variant?: "floating" | "sidebar";
}

export function FilterBar({
    search,
    onSearchChange,
    datePreset,
    customLabel,
    onDateSelect,
    onDatePick,
    categories,
    onToggleCategory,
    onSelectAll,
    variant = "floating"
}: FilterBarProps) {
    const allSelected = categories.size === 0;

    return (
        <div className="flex flex-col gap-2.5">
            <div
                className={cn(
                    "flex items-center gap-2.5 rounded-full px-4",
                    variant === "floating" ? "bg-card shadow-[var(--shadow-float)]" : "border border-border bg-card shadow-[var(--shadow-card)]"
                )}
                style={{ minHeight: 48 }}
            >
                <SearchIcon className="size-5 shrink-0 text-muted-foreground" />
                <input
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="หาอีเวนต์ สถานที่ หรือย่าน"
                    className="h-full w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
            </div>
            <DateChips value={datePreset} customLabel={customLabel} onSelect={onDateSelect} onPick={onDatePick} />
            <div className={cn("no-scrollbar flex gap-2 p-0.5", variant === "floating" ? "overflow-x-auto" : "flex-wrap")}>
                <button
                    type="button"
                    onClick={onSelectAll}
                    aria-pressed={allSelected}
                    className="inline-flex flex-shrink-0 items-center rounded-full px-4.5 font-sans text-sm font-semibold transition-colors duration-150 ease-out"
                    style={{
                        minHeight: 44,
                        border: allSelected ? "1.5px solid transparent" : "1.5px solid var(--border)",
                        background: allSelected ? "var(--primary)" : "var(--card)",
                        color: allSelected ? "var(--primary-foreground)" : "var(--naidee-stone-700)"
                    }}
                >
                    ทั้งหมด
                </button>
                {CATEGORIES.map((c) => (
                    <CategoryChip
                        key={c.id}
                        category={c.id}
                        selected={categories.has(c.id)}
                        onClick={() => onToggleCategory(c.id)}
                    />
                ))}
            </div>
        </div>
    );
}
