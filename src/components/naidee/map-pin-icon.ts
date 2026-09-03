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

export function createClusterIcon(count: number): L.DivIcon {
    return L.divIcon({
        className: "",
        html: `
      <div style="width:40px;height:40px;border-radius:50%;border:3px solid #fff;background:var(--naidee-orange-600);color:#fff;font-family:var(--font-sans);font-size:14px;font-weight:700;font-variant-numeric:tabular-nums;box-shadow:var(--shadow-pin);display:flex;align-items:center;justify-content:center">
        ${count}
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
