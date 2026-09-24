import { useMemo, useState } from "react";
import { AppShell } from "@/components/vcet/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Academics", "Events", "Library", "Administration"];

const CATEGORY_STYLE: Record<string, string> = {
  Academics: "bg-[#EAF2FC] text-[#0B3B78]",
  Events: "bg-[#E8F6E9] text-[#3E7A28]",
  Library: "bg-[#F3EEFB] text-[#6D3FC0]",
  Administration: "bg-[#FDF3E7] text-[#B4690E]",
};

function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function Circulars() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const circulars = useQuery(api.portal.getCirculars, {
    category,
    search: search.trim() || undefined,
  });

  const filtered = useMemo(() => circulars ?? [], [circulars]);

  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-[#0F2542]">Circulars</h1>
          <p className="text-sm text-[#5B6B83]">
            Official announcements from the college administration.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  category === c
                    ? "bg-[#0B3B78] text-white"
                    : "border border-[#E5EAF2] bg-white text-[#5B6B83] hover:bg-[#EAF2FC] hover:text-[#0B3B78]",
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search circulars…"
            className="h-10 w-full rounded-lg border border-[#E5EAF2] bg-white px-4 text-sm text-[#0F2542] outline-none placeholder:text-[#9AA7BC] focus:ring-2 focus:ring-[#0B3B78]/30 sm:w-64"
          />
        </div>

        {circulars === undefined ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="vcet-card p-10 text-center">
            <Megaphone className="mx-auto size-8 text-[#9AA7BC]" />
            <p className="mt-3 text-sm text-[#5B6B83]">No circulars found.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((c) => (
              <Card
                key={c._id}
                className="vcet-card vcet-card-hover border-[#E5EAF2] shadow-none"
              >
                <CardContent className="p-5">
                  <div className="mb-2.5 flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                        CATEGORY_STYLE[c.category] ?? "bg-[#F1F5FB] text-[#5B6B83]",
                      )}
                    >
                      {c.category}
                    </span>
                    <span className="text-[11px] text-[#5B6B83]">
                      {fmtDate(c.publishedAt)}
                    </span>
                  </div>
                  <h2 className="text-[15px] font-semibold text-[#0F2542]">{c.title}</h2>
                  <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-[#5B6B83]">
                    {c.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
