import { AppShell } from "@/components/vcet/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { BookOpen, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const GRADE_STYLE: Record<string, string> = {
  "A+": "bg-[#E8F6E9] text-[#3E7A28]",
  A: "bg-[#EAF2FC] text-[#0B3B78]",
  "B+": "bg-[#FDF3E7] text-[#B4690E]",
  B: "bg-[#FDF3E7] text-[#B4690E]",
};

export default function Examinations() {
  const data = useQuery(api.portal.getExaminations, {});

  if (data === undefined) {
    return (
      <AppShell>
        <div className="space-y-5">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </AppShell>
    );
  }

  if (data === null) {
    return (
      <AppShell>
        <Card className="vcet-card mx-auto max-w-md p-8 text-center">
          <p className="text-sm text-[#5B6B83]">No student profile linked.</p>
        </Card>
      </AppShell>
    );
  }

  const avg =
    data.results.length > 0
      ? Math.round(
          data.results.reduce((acc, r) => acc + (r.marks / r.total) * 100, 0) /
            data.results.length,
        )
      : 0;

  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-[#0F2542]">Examinations</h1>
          <p className="text-sm text-[#5B6B83]">Results, upcoming exams and weekly timetable.</p>
        </div>

        {/* Upcoming exams */}
        <Card className="vcet-card border-[#E5EAF2] shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[15px] text-[#0F2542]">
              <CalendarDays className="size-4 text-[#0B3B78]" /> Upcoming exams & quizzes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {data.upcomingExams.length === 0 && (
              <p className="text-sm text-[#5B6B83]">No upcoming exams scheduled.</p>
            )}
            {data.upcomingExams.map((e) => (
              <div
                key={e._id}
                className="flex items-center justify-between rounded-lg border border-[#E5EAF2] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#0F2542]">{e.title}</p>
                  {e.description && (
                    <p className="truncate text-xs text-[#5B6B83]">{e.description}</p>
                  )}
                </div>
                <div className="ml-4 shrink-0 text-right">
                  <p className="text-sm font-semibold text-[#0B3B78]">{fmtDate(e.date)}</p>
                  <p className="text-[11px] uppercase tracking-wide text-[#5B6B83]">{e.type}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Results */}
          <Card className="vcet-card border-[#E5EAF2] shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[15px] text-[#0F2542]">
                <BookOpen className="size-4 text-[#0B3B78]" /> Results
                {data.results.length > 0 && (
                  <span className="ml-auto rounded-full bg-[#EAF2FC] px-2.5 py-0.5 text-xs font-semibold text-[#0B3B78]">
                    Avg {avg}%
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.results.length === 0 ? (
                <p className="text-sm text-[#5B6B83]">No results published yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5EAF2] text-left text-xs uppercase tracking-wide text-[#5B6B83]">
                      <th className="pb-2 font-medium">Subject</th>
                      <th className="pb-2 text-right font-medium">Marks</th>
                      <th className="pb-2 text-right font-medium">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.results.map((r) => (
                      <tr key={r._id} className="border-b border-[#E5EAF2]/60 last:border-0">
                        <td className="py-2.5">
                          <p className="font-medium text-[#0F2542]">{r.subject}</p>
                          <p className="text-[11px] text-[#5B6B83]">{fmtDate(r.date)}</p>
                        </td>
                        <td className="py-2.5 text-right font-semibold text-[#0F2542]">
                          {r.marks}/{r.total}
                        </td>
                        <td className="py-2.5 text-right">
                          <span
                            className={cn(
                              "inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                              GRADE_STYLE[r.grade] ?? "bg-[#F1F5FB] text-[#5B6B83]",
                            )}
                          >
                            {r.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* Timetable */}
          <Card className="vcet-card border-[#E5EAF2] shadow-none">
            <CardHeader>
              <CardTitle className="text-[15px] text-[#0F2542]">Monday timetable</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {data.timetable.length === 0 && (
                <p className="text-sm text-[#5B6B83]">No classes scheduled.</p>
              )}
              {data.timetable.map((s) => (
                <div key={s._id} className="flex items-center gap-3">
                  <span className="w-[92px] shrink-0 text-xs font-medium text-[#5B6B83]">
                    {s.startTime} – {s.endTime}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#0F2542]">
                    {s.subject}
                  </span>
                  <span className="shrink-0 text-xs text-[#5B6B83]">{s.room}</span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                      s.type === "LAB"
                        ? "bg-[#EAF2FC] text-[#0B3B78]"
                        : "bg-[#F1F5FB] text-[#5B6B83]",
                    )}
                  >
                    {s.type === "LAB" ? "Lab" : "Lecture"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
