"use client";

import { categoryColorVar, categoryLabel } from "@/lib/categories";

interface CategoryChipProps {
    category: string;
    selected: boolean;
    onClick: () => void;
}

export function CategoryChip({ category, selected, onClick }: CategoryChipProps) {
    const color = categoryColorVar(category);
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-4.5 font-sans text-sm font-semibold transition-colors duration-150 ease-out"
            style={{
                minHeight: 44,
                border: selected ? "1.5px solid transparent" : "1.5px solid var(--border)",
                background: selected ? color : "var(--card)",
                color: selected ? "#fff" : "var(--naidee-stone-700)"
            }}
        >
            <span
                className="size-2 rounded-full"
                style={{ background: selected ? "#fff" : color }}
            />
            {categoryLabel(category)}
        </button>
    );
}
