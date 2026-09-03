"use client";

interface EmptyStateProps {
    title?: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    title = "วันนี้แถวนี้เงียบไปหน่อย",
    message = "ลองเลื่อนวันหรือขยับแผนที่ดูนะ",
    actionLabel,
    onAction
}: EmptyStateProps) {
    return (
        <div className="px-6 py-8 text-center font-sans">
            <div
                className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full text-2xl font-bold"
                style={{ background: "var(--naidee-yellow-100)", color: "var(--naidee-orange-600)" }}
            >
                ?
            </div>
            <div className="text-[17px] leading-snug font-semibold text-foreground">{title}</div>
            <div className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{message}</div>
            {actionLabel && (
                <button
                    type="button"
                    onClick={onAction}
                    className="mt-4 inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold"
                    style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
