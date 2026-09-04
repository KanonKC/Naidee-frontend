import L from "leaflet";
import { categoryColorVar } from "@/lib/categories";

export function createPinIcon(category: string | null, selected: boolean): L.DivIcon {
    const color = categoryColorVar(category);
    const size = selected ? 44 : 32;
    const height = size + 8;
    return L.divIcon({
        className: "",
        html: `
      <div style="position:relative;width:${size}px;height:${height}px;transform:${selected ? "translateY(-6px)" : "none"}">
        <span style="position:absolute;left:50%;bottom:2px;width:10px;height:10px;background:${color};transform:translateX(-50%) rotate(45deg);border-radius:2px"></span>
        <span style="position:absolute;inset:0 0 6px 0;border-radius:50%;background:${color};border:3px solid #fff;box-sizing:border-box;box-shadow:${selected ? "var(--shadow-pin-selected)" : "var(--shadow-pin)"};display:flex;align-items:center;justify-content:center">
          <span style="width:${selected ? 10 : 8}px;height:${selected ? 10 : 8}px;border-radius:50%;background:#fff"></span>
        </span>
      </div>`,
        iconSize: [size, height],
        iconAnchor: [size / 2, height]
    });
}

export function createClusterIcon(count: number, categories: string[] = []): L.DivIcon {
    const colors = categories.slice(0, 4).map(categoryColorVar);
    const ring =
        colors.length > 1
            ? `conic-gradient(${colors
                  .map((color, index) => `${color} ${(index * 100) / colors.length}% ${((index + 1) * 100) / colors.length}%`)
                  .join(",")})`
            : colors[0] ?? "var(--naidee-orange-600)";
    return L.divIcon({
        className: "",
        html: `
      <div style="width:40px;height:40px;border-radius:50%;border:3px solid #fff;background:${ring};box-shadow:var(--shadow-pin);display:flex;align-items:center;justify-content:center">
        <span style="width:26px;height:26px;border-radius:50%;background:#fff;color:var(--naidee-stone-900);font-family:var(--font-sans);font-size:13px;font-weight:700;font-variant-numeric:tabular-nums;display:flex;align-items:center;justify-content:center">${count}</span>
      </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
}

export function createUserLocationIcon(): L.DivIcon {
    return L.divIcon({
        className: "",
        html: `<div style="width:16px;height:16px;border-radius:50%;background:#3B82F6;border:3px solid #fff;box-shadow:var(--shadow-pin)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
}
