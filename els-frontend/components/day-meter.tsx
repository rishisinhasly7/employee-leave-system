import { cn } from "@/lib/utils";

/** One block per leave day. Solid blocks are days left, faded blocks are days used. */
export function DayMeter({ total, used }: { total: number; used: number }) {
  const count = Math.max(0, Math.min(total, 40));
  return (
    <div className="flex gap-1" role="img" aria-label={`${used} of ${total} leave days used`}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={cn("h-9 flex-1 rounded-sm", i < used ? "bg-primary/20" : "bg-primary")}
        />
      ))}
    </div>
  );
}
