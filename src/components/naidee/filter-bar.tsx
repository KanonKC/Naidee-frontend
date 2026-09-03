"use client";

import { SearchIcon } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { CategoryChip } from "@/components/naidee/category-chip";
import { DateChips } from "@/components/naidee/date-chips";
import { DateTriggerChip, CategoryTriggerChip } from "@/components/naidee/compact-filters";
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
    variant?: "compact" | "full" | "sidebar";
    onSearchOpen?: () => void;
    onCategoryOpen?: () => void;
    trailingAction?: React.ReactNode;
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
    variant = "full",
    onSearchOpen,
    onCategoryOpen,
    trailingAction
}: FilterBarProps) {
    const allSelected = categories.size === 0;

    if (variant === "compact") {
        return (
            <div className="flex flex-col gap-2">
                <button
                    type="button"
                    onClick={onSearchOpen}
                    className="flex items-center gap-2.5 rounded-full bg-card px-4 text-left shadow-[var(--shadow-float)]"
                    style={{ minHeight: 40 }}
                >
                    <SearchIcon className="size-4.5 shrink-0 text-muted-foreground" />
                    <span className="truncate text-[14px] text-muted-foreground">
                        {search || "หาอีเวนต์ สถานที่ หรือย่าน"}
                    </span>
                </button>
                <div className="no-scrollbar flex gap-2 overflow-x-auto p-0.5">
                    <DateTriggerChip datePreset={datePreset} customLabel={customLabel} onClick={onDatePick} />
                    <CategoryTriggerChip count={categories.size} onClick={() => onCategoryOpen?.()} />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
                <div
                    className={cn(
                        "flex flex-1 items-center gap-2.5 rounded-full px-4",
                        variant === "full" ? "bg-card shadow-[var(--shadow-float)]" : "border border-border bg-card shadow-[var(--shadow-card)]"
                    )}
                    style={{ minHeight: 44 }}
                >
                    <SearchIcon className="size-4.5 shrink-0 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="หาอีเวนต์ สถานที่ หรือย่าน"
                        className="h-full w-full bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                </div>
                {trailingAction}
            </div>
            <DateChips value={datePreset} customLabel={customLabel} onSelect={onDateSelect} onPick={onDatePick} />
            <div className={cn("no-scrollbar flex gap-2 p-0.5", variant === "full" ? "overflow-x-auto" : "flex-wrap")}>
                <button
                    type="button"
                    onClick={onSelectAll}
                    aria-pressed={allSelected}
                    className="inline-flex flex-shrink-0 items-center rounded-full px-3.5 font-sans text-[13px] font-semibold transition-colors duration-150 ease-out"
                    style={{
                        minHeight: 34,
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
