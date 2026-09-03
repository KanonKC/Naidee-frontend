"use client";

import { useEffect, useState } from "react";

interface SearchOverlayProps {
    open: boolean;
    children: React.ReactNode;
}

export function SearchOverlay({ open, children }: SearchOverlayProps) {
    const [mounted, setMounted] = useState(open);
    const [entered, setEntered] = useState(false);
    const [prevOpen, setPrevOpen] = useState(open);

    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) setMounted(true);
        else setEntered(false);
    }

    useEffect(() => {
        if (!open) {
            const id = window.setTimeout(() => setMounted(false), 300);
            return () => window.clearTimeout(id);
        }
        const id = requestAnimationFrame(() => setEntered(true));
        return () => cancelAnimationFrame(id);
    }, [open]);

    if (!mounted) return null;

    return (
        <div
            className="absolute inset-0 z-50 flex flex-col bg-background lg:hidden"
            style={{
                transform: entered ? "translateX(0)" : "translateX(100%)",
                transition: "transform 280ms cubic-bezier(0.32,0.72,0,1)"
            }}
            onTransitionEnd={(e) => {
                if (e.propertyName === "transform" && !open) setMounted(false);
            }}
        >
            {children}
        </div>
    );
}
