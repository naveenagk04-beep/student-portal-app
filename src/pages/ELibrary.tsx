import { useState } from "react";
import { AppShell } from "@/components/vcet/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Book, FileText, Library, NotebookPen } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPES = ["All", "BOOK", "JOURNAL", "NOTES"] as const;

const TYPE_META: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  BOOK: { label: "Book", icon: Book, cls: "bg-[#EAF2FC] text-[#0B3B78]" },
  JOURNAL: { label: "Journal", icon: FileText, cls: "bg-[#F3EEFB] text-[#6D3FC0]" },
  NOTES: { label: "Notes", icon: NotebookPen, cls: "bg-[#E8F6E9] text-[#3E7A28]" },
};

export default function ELibrary() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("All");

  const items = useQuery(api.portal.getLibrary, {
    search: search.trim() || undefined,
    type,
  });

  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-[#0F2542]">E-Library</h1>
          <p className="text-sm text-[#5B6B83]">
            Books, journals and lecture notes from the digital library.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  type === t
                    ? "bg-[#0B3B78] text-white"
                    : "border border-[#E5EAF2] bg-white text-[#5B6B83] hover:bg-[#EAF2FC] hover:text-[#0B3B78]",
                )}
              >
                {t === "All" ? "All" : TYPE_META[t].label + "s"}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, author or category…"
            className="h-10 w-full rounded-lg border border-[#E5EAF2] bg-white px-4 text-sm text-[#0F2542] outline-none placeholder:text-[#9AA7BC] focus:ring-2 focus:ring-[#0B3B78]/30 sm:w-72"
          />
        </div>

        {items === undefined ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="vcet-card p-10 text-center">
            <Library className="mx-auto size-8 text-[#9AA7BC]" />
            <p className="mt-3 text-sm text-[#5B6B83]">No resources found.</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((l) => {
              const meta = TYPE_META[l.type] ?? TYPE_META.BOOK;
              const Icon = meta.icon;
              return (
                <Card
                  key={l._id}
                  className="vcet-card vcet-card-hover border-[#E5EAF2] shadow-none"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={cn(
                          "flex size-10 items-center justify-center rounded-lg",
                          meta.cls,
                        )}
                      >
                        <Icon className="size-5" />
                      </span>
                      <span className="rounded-full bg-[#F1F5FB] px-2.5 py-0.5 text-[11px] font-medium text-[#5B6B83]">
                        {l.category}
                      </span>
                    </div>
                    <h2 className="mt-3 text-[15px] font-semibold leading-snug text-[#0F2542]">
                      {l.title}
                    </h2>
                    <p className="mt-1 text-sm text-[#5B6B83]">{l.author}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
