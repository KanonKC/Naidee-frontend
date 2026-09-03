export interface CategoryDef {
    id: string;
    label: string;
}

export const CATEGORIES: CategoryDef[] = [
    { id: "music", label: "Music" },
    { id: "art", label: "Art" },
    { id: "workshop", label: "Workshop" },
    { id: "market", label: "Market" },
    { id: "film", label: "Film" },
    { id: "talk", label: "Talk" }
];

const KNOWN_IDS = new Set(CATEGORIES.map((c) => c.id));

export function categoryColorVar(category: string | null): string {
    if (category && KNOWN_IDS.has(category)) return `var(--cat-${category})`;
    return "var(--naidee-stone-500)";
}

export function categorySoftVar(category: string | null): string {
    if (category && KNOWN_IDS.has(category)) return `var(--cat-${category}-soft)`;
    return "var(--muted)";
}

export function categoryLabel(category: string | null): string {
    const known = CATEGORIES.find((c) => c.id === category);
    if (known) return known.label;
    if (!category) return "อื่นๆ";
    return category.charAt(0).toUpperCase() + category.slice(1);
}
