import { AppShell } from "@/components/vcet/AppShell";
import { HeroBanner } from "@/components/vcet/HeroBanner";
import { AttendanceDonut } from "@/components/vcet/AttendanceDonut";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  CreditCard,
  Layers,
  Megaphone,
} from "lucide-react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

function CardShell({
  title,
  icon: Icon,
  to,
  children,
  className,
}: {
  title: string;
  icon: React.ElementType;
  to?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "vcet-card vcet-card-hover border-[#E5EAF2] shadow-none",
        className,
      )}
    >
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#EAF2FC]">
              <Icon className="size-4.5 text-[#0B3B78]" />
              <span className="sr-only">{title}</span>
            </span>
            <h2 className="text-[15px] font-semibold text-[#0F2542]">{title}</h2>
          </div>
          {to ? (
            <Link
              to={to}
              className="flex size-7 items-center justify-center rounded-full text-[#5B6B83] transition-colors hover:bg-[#EAF2FC] hover:text-[#0B3B78]"
              aria-label={`Open ${title}`}
            >
              <ChevronRight className="size-4" />
            </Link>
          ) : null}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <AppShell>
      <div className="space-y-5">
        <Skeleton className="h-52 rounded-2xl" />
        <div className="grid gap-5 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

const REMINDER_DOT: Record<string, string> = {
  blue: "bg-[#2563EB]",
  green: "bg-[#5BAA3C]",
  purple: "bg-[#7C3AED]",
};

const EVENT_DOT: Record<string, string> = {
  QUIZ: "bg-[#E4572E]",
  SYMPOSIUM: "bg-[#5BAA3C]",
  EXAM: "bg-[#E4572E]",
};

function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Dashboard() {
  const dashboard = useQuery(api.portal.getDashboard, {});
  const toggleReminder = useMutation(api.portal.toggleReminder);

  if (dashboard === undefined) return <DashboardSkeleton />;

  if (dashboard === null || !dashboard.student) {
    return (
      <AppShell>
        <div className="vcet-card mx-auto max-w-md p-8 text-center">
          <h1 className="text-lg font-semibold text-[#0F2542]">
            No student profile linked
          </h1>
          <p className="mt-2 text-sm text-[#5B6B83]">
            Your account isn't linked to a student record yet. Please contact the
            college office to complete your registration.
          </p>
          <Button
            className="mt-4 bg-[#0B3B78] hover:bg-[#08315F]"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </AppShell>
    );
  }

  const d = dashboard;
  const parentMode = d.viewer.kind === "parent";

  return (
    <AppShell>
      <div className="space-y-5">
        <HeroBanner name={d.student.name} parentMode={parentMode} />

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Attendance & Progress */}
          <CardShell
            title="Attendance & Progress"
            icon={CalendarDays}
            to="/attendance"
          >
            <div className="flex items-center gap-6">
              <AttendanceDonut percent={d.attendance.percent} />
              <div className="flex-1 space-y-4">
                <StatRow
                  dot="bg-[#5BAA3C]"
                  label="Classes Attended"
                  value={`${d.attendance.attended} / ${d.attendance.total}`}
                />
                <StatRow
                  dot="bg-[#7C3AED]"
                  label="Assignments"
                  value={`${d.assignments.submitted} / ${d.assignments.total}`}
                />
                <StatRow dot="bg-[#5BAA3C]" label="Progress" value={`${d.progress}%`} />
              </div>
            </div>
          </CardShell>

          {/* Today's Schedule */}
          <CardShell title="Today's Schedule" icon={CalendarDays} to="/examinations">
            <div className="space-y-3.5">
              {d.schedule.length === 0 && (
                <p className="text-sm text-[#5B6B83]">No classes scheduled today.</p>
              )}
              {d.schedule.map((s) => (
                <div key={s._id} className="flex items-center gap-3">
                  <span className="size-2 shrink-0 rounded-full bg-[#0B3B78]" />
                  <span className="w-[86px] shrink-0 text-xs font-medium text-[#5B6B83]">
                    {s.startTime} – {s.endTime}
                  </span>
                  <span className="flex-1 truncate text-sm font-medium text-[#0F2542]">
                    {s.subject}
                  </span>
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
            </div>
          </CardShell>

          {/* Upcoming Events / Exams */}
          <CardShell
            title="Upcoming Events / Exams"
            icon={Megaphone}
            to="/examinations"
          >
            <div className="space-y-1">
              {d.events.length === 0 && (
                <p className="text-sm text-[#5B6B83]">No upcoming events.</p>
              )}
              {d.events.map((e) => (
                <Link
                  key={e._id}
                  to="/examinations"
                  className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[#F4F7FC]"
                >
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      EVENT_DOT[e.type] ?? "bg-[#5BAA3C]",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-[#0F2542]">
                      {e.title}
                    </span>
                    <span className="block text-[11px] text-[#5B6B83]">
                      {fmtDate(e.date)}
                    </span>
                  </span>
                  <ChevronRight className="size-3.5 shrink-0 text-[#9AA7BC]" />
                </Link>
              ))}
            </div>
          </CardShell>

          {/* Reminders */}
          <CardShell title="Reminders" icon={Bell} to="/dashboard">
            <div className="space-y-3">
              {d.reminders.length === 0 && (
                <p className="text-sm text-[#5B6B83]">No open reminders.</p>
              )}
              {d.reminders.map((r) => (
                <div key={r._id} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      REMINDER_DOT[r.color] ?? "bg-[#2563EB]",
                    )}
                  />
                  <span className="flex-1 truncate text-sm font-medium text-[#0F2542]">
                    {r.title}
                  </span>
                  <span className="shrink-0 text-[11px] text-[#5B6B83]">
                    {fmtDate(r.dueDate)}
                  </span>
                  {!parentMode && (
                    <button
                      onClick={() => toggleReminder({ reminderId: r._id })}
                      className="shrink-0 rounded p-0.5 text-[#9AA7BC] transition-colors hover:text-[#5BAA3C]"
                      aria-label={`Mark “${r.title}” as done`}
                      title="Mark as done"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </CardShell>

          {/* Payments */}
          <CardShell title="Payments" icon={CreditCard} to="/payments">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-[#5B6B83]">Next due</p>
                  <p className="mt-1 text-sm font-semibold text-[#0F2542]">
                    {d.nextPayment?.title ?? "Nothing pending"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#0B3B78]">
                    {d.nextPayment
                      ? `₹ ${d.nextPayment.amount.toLocaleString("en-IN")}`
                      : "—"}
                  </p>
                  <p className="text-[11px] text-[#5B6B83]">
                    {d.nextPayment ? fmtDate(d.nextPayment.dueDate) : "All clear"}
                  </p>
                </div>
              </div>
              <Button
                asChild
                className="w-full bg-[#0B3B78] hover:bg-[#08315F]"
              >
                <Link to="/payments">
                  View All Payments
                  <ChevronRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
          </CardShell>

          {/* Quick Access */}
          <CardShell title="Quick Access" icon={BookOpen} to="/e-library">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-base font-semibold text-[#0B3B78]">E-Library</p>
                <p className="mt-1 text-sm leading-relaxed text-[#5B6B83]">
                  Access study materials, journals and more.
                </p>
                <Link
                  to="/e-library"
                  className="mt-4 flex w-full items-center justify-between rounded-lg bg-[#EAF2FC] px-4 py-2.5 text-sm font-medium text-[#0B3B78] transition-colors hover:bg-[#DCE9FA]"
                >
                  Go to E-Library
                  <ChevronRight className="size-4" />
                </Link>
              </div>
              <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#EAF2FC]">
                <Layers className="size-7 text-[#0B3B78]" />
              </span>
            </div>
          </CardShell>
        </div>
      </div>
    </AppShell>
  );
}

function StatRow({
  dot,
  label,
  value,
}: {
  dot: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={cn("size-2.5 shrink-0 rounded-full", dot)} />
      <span className="flex-1 text-sm text-[#5B6B83]">{label}</span>
      <span className="text-sm font-bold text-[#0F2542]">{value}</span>
    </div>
  );
}
