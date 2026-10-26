import { useState } from "react";
import { AppShell } from "@/components/vcet/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Trophy, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORY_STYLE: Record<string, string> = {
  CLUB: "bg-[#EAF2FC] text-[#0B3B78]",
  SPORTS: "bg-[#E8F6E9] text-[#3E7A28]",
  SERVICE: "bg-[#FDF3E7] text-[#B4690E]",
  SYMPOSIUM: "bg-[#F3EEFB] text-[#6D3FC0]",
};

export default function Extracurricular() {
  const activities = useQuery(api.portal.getExtracurricular, {});
  const toggle = useMutation(api.portal.toggleEnrollment);
  const [busy, setBusy] = useState<string | null>(null);

  const enrolledCount = activities?.filter((a) => a.enrolled).length ?? 0;
  const list = activities ?? [];

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0F2542]">Extracurricular</h1>
            <p className="text-sm text-[#5B6B83]">
              Clubs, sports and service activities at your college.
            </p>
          </div>
          <div className="rounded-xl bg-[#EAF2FC] px-5 py-3">
            <p className="text-xs text-[#5B6B83]">Enrolled activities</p>
            <p className="text-xl font-bold text-[#0B3B78]">{enrolledCount}</p>
          </div>
        </div>

        {activities === undefined ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((a) => (
              <Card
                key={a._id}
                className={cn(
                  "vcet-card border-[#E5EAF2] shadow-none transition-all",
                  a.enrolled && "ring-1 ring-[#5BAA3C]/40",
                )}
              >
                <CardContent className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                        CATEGORY_STYLE[a.category] ?? "bg-[#F1F5FB] text-[#5B6B83]",
                      )}
                    >
                      {a.category}
                    </span>
                    {a.enrolled && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[#5BAA3C]">
                        <Trophy className="size-3.5" /> Enrolled
                      </span>
                    )}
                  </div>
                  <h2 className="mt-3 text-[15px] font-semibold text-[#0F2542]">{a.title}</h2>
                  {a.description && (
                    <p className="mt-1 flex-1 text-sm leading-relaxed text-[#5B6B83]">
                      {a.description}
                    </p>
                  )}
                  <Button
                    variant={a.enrolled ? "outline" : "default"}
                    size="sm"
                    disabled={busy === a._id}
                    className={cn(
                      "mt-4 w-full",
                      a.enrolled
                        ? "border-[#E5EAF2] text-[#5B6B83] hover:bg-[#FDECEA] hover:text-[#C0392B]"
                        : "bg-[#0B3B78] hover:bg-[#08315F]",
                    )}
                    onClick={async () => {
                      setBusy(a._id);
                      try {
                        const res = await toggle({ activityId: a._id });
                        toast.success(
                          res.enrolled
                            ? `Enrolled in ${a.title}`
                            : `Left ${a.title}`,
                        );
                      } catch {
                        toast.error("Could not update enrollment");
                      } finally {
                        setBusy(null);
                      }
                    }}
                  >
                    {busy === a._id ? (
                      <Loader2 className="mr-2 size-3.5 animate-spin" />
                    ) : (
                      <Users className="mr-2 size-3.5" />
                    )}
                    {a.enrolled ? "Leave activity" : "Join activity"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
