"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/categories";
import { CategoryChip } from "@/components/naidee/category-chip";

interface CategoryFilterSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: Set<string>;
    onToggleCategory: (id: string) => void;
    onSelectAll: () => void;
}

export function CategoryFilterSheet({
    open,
    onOpenChange,
    categories,
    onToggleCategory,
    onSelectAll
}: CategoryFilterSheetProps) {
    const allSelected = categories.size === 0;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                className="mx-auto max-w-[480px] rounded-t-[24px] border-none px-4 pt-2.5 pb-5 font-sans shadow-[var(--shadow-sheet)]"
            >
                <div className="mx-auto h-1.5 w-10 rounded-full" style={{ background: "var(--naidee-stone-300)" }} />
                <SheetHeader className="flex-row items-center justify-between p-0 pt-2.5">
                    <SheetTitle className="text-[17px] font-semibold">หมวดหมู่</SheetTitle>
                    {!allSelected && (
                        <button
                            type="button"
                            onClick={onSelectAll}
                            className="text-[13px] font-semibold"
                            style={{ color: "var(--primary)" }}
                        >
                            ล้างตัวกรอง
                        </button>
                    )}
                </SheetHeader>
                <div className="flex flex-wrap gap-2 py-1">
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
                <Button className="mt-2 h-11 rounded-full text-base font-semibold" onClick={() => onOpenChange(false)}>
                    เสร็จสิ้น
                </Button>
            </SheetContent>
        </Sheet>
    );
}
