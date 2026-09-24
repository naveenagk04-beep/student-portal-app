import { vcetLogo } from "@/lib/vcet-assets";
import { cn } from "@/lib/utils";

/** Small VCET logo lockup used across the portal. */
export function VcetLogo({
  size = 40,
  light = false,
  className,
}: {
  size?: number;
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src={vcetLogo()}
        alt="VCET logo"
        width={size}
        height={size}
        className="shrink-0 rounded-md"
      />
      <div className="leading-none">
        <span
          className={cn(
            "block text-xl font-extrabold tracking-tight",
            light ? "text-white" : "text-[#0B3B78]",
          )}
        >
          VCET
        </span>
        <span
          className={cn(
            "mt-1 block text-[10px] font-medium",
            light ? "text-white/70" : "text-[#5B6B83]",
          )}
        >
          Empowering the Next Generation
        </span>
      </div>
    </div>
  );
}
