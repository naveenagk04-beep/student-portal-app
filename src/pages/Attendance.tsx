import { AppShell } from "@/components/vcet/AppShell";
import { AttendanceDonut } from "@/components/vcet/AttendanceDonut";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function Attendance() {
  const data = useQuery(api.portal.getAttendance, {});

  if (data === undefined) {
    return (
      <AppShell>
        <div className="space-y-5">
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-72 rounded-xl" />
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

  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-[#0F2542]">Attendance</h1>
          <p className="text-sm text-[#5B6B83]">
            Overall attendance across all subjects this semester.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Summary donut */}
          <Card className="vcet-card border-[#E5EAF2] shadow-none">
            <CardHeader>
              <CardTitle className="text-[15px] text-[#0F2542]">Overall</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <AttendanceDonut percent={data.summary.percent} />
              <p className="text-sm text-[#5B6B83]">
                <span className="font-semibold text-[#0F2542]">{data.summary.attended}</span>{" "}
                of <span className="font-semibold text-[#0F2542]">{data.summary.total}</span>{" "}
                classes attended
              </p>
              {data.summary.percent < 75 && (
                <p className="rounded-md bg-[#FDECEA] px-3 py-1.5 text-xs font-medium text-[#C0392B]">
                  Below the 75% requirement
                </p>
              )}
            </CardContent>
          </Card>

          {/* Subject-wise */}
          <Card className="vcet-card border-[#E5EAF2] shadow-none lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-[15px] text-[#0F2542]">Subject-wise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.subjects.length === 0 && (
                <p className="text-sm text-[#5B6B83]">No attendance recorded yet.</p>
              )}
              {data.subjects.map((s) => (
                <div key={s.subject}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-[#0F2542]">{s.subject}</span>
                    <span className="text-[#5B6B83]">
                      {s.present}/{s.total} ·{" "}
                      <span
                        className={cn(
                          "font-semibold",
                          s.percent >= 75 ? "text-[#5BAA3C]" : "text-[#C0392B]",
                        )}
                      >
                        {s.percent}%
                      </span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#EAF2FC]">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        s.percent >= 75 ? "bg-[#5BAA3C]" : "bg-[#C0392B]",
                      )}
                      style={{ width: `${s.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent records */}
        <Card className="vcet-card border-[#E5EAF2] shadow-none">
          <CardHeader>
            <CardTitle className="text-[15px] text-[#0F2542]">Recent records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.records.slice(0, 30).map((r) => (
                <div
                  key={r._id}
                  className="flex items-center justify-between rounded-lg border border-[#E5EAF2] px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#0F2542]">{r.subject}</p>
                    <p className="text-[11px] text-[#5B6B83]">{fmtDate(r.date)}</p>
                  </div>
                  {r.status === "present" ? (
                    <CheckCircle2 className="size-4 shrink-0 text-[#5BAA3C]" />
                  ) : (
                    <XCircle className="size-4 shrink-0 text-[#C0392B]" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
