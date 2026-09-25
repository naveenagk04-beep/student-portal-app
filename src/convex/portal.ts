import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import {
  query,
  mutation,
  QueryCtx,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

/* ---------- Viewer resolution ---------- */

export interface Viewer {
  kind: "student" | "parent" | "admin" | "none";
  userId: Id<"users"> | null;
  user: Doc<"users"> | null;
  student: Doc<"students"> | null;
}

async function resolveViewer(ctx: QueryCtx): Promise<Viewer> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return { kind: "none", userId: null, user: null, student: null };
  const user = await ctx.db.get(userId);
  if (!user) return { kind: "none", userId: null, user: null, student: null };

  const portalRole = user.portalRole ?? "student";

  if (portalRole === "parent") {
    const link = await ctx.db
      .query("studentParents")
      .withIndex("by_parent_user", (q) => q.eq("parentUserId", userId))
      .first();
    const student: Doc<"students"> | null = link
      ? await ctx.db.get(link.studentId)
      : null;
    return { kind: "parent", userId, user, student };
  }
  if (portalRole === "admin") {
    return { kind: "admin", userId, user, student: null };
  }
  const student: Doc<"students"> | null = await ctx.db
    .query("students")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  return { kind: "student", userId, user, student };
}

/** The student whose data the viewer may see (own for students, linked child for parents). */
export async function visibleStudent(
  ctx: QueryCtx,
): Promise<Doc<"students"> | null> {
  const viewer = await resolveViewer(ctx);
  return viewer.student;
}

/* ---------- Auth helpers ---------- */

async function requireAuthUser(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Unauthenticated");
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("Unauthenticated");
  return user;
}

/* ---------- Bootstrap ---------- */

export const bootstrap = mutation({
  args: {},
  handler: async (ctx) => {
    await ctx.scheduler.runAfter(0, internal.seed.seedAll, {});
    return { ok: true };
  },
});

/* ---------- Viewer ---------- */

export const getViewer = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await resolveViewer(ctx);
    if (viewer.kind === "none" || !viewer.user) return null;
    return {
      kind: viewer.kind,
      user: {
        _id: viewer.user._id,
        name: viewer.user.name ?? null,
        email: viewer.user.email ?? null,
        image: viewer.user.image ?? null,
        phone: viewer.user.phone ?? null,
        rollNo: viewer.user.rollNo ?? null,
      },
      student: viewer.student
        ? {
            _id: viewer.student._id,
            rollNo: viewer.student.rollNo,
            name: viewer.student.name,
            year: viewer.student.year,
            department: viewer.student.department,
            program: viewer.student.program,
            section: viewer.student.section,
          }
        : null,
      // Students with a linked parent account can toggle; parents cannot.
      canToggleParent: viewer.kind === "parent",
    };
  },
});

/* ---------- Dashboard (aggregated) ---------- */

function pct(attended: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((attended / total) * 100);
}

export const getDashboard = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await resolveViewer(ctx);
    if (viewer.kind === "none") return null;
    const student = viewer.student;
    if (!student) {
      return {
        viewer: {
          kind: viewer.kind,
          name: viewer.user?.name ?? "",
          email: viewer.user?.email ?? "",
          image: viewer.user?.image ?? null,
        },
        student: null,
      };
    }

    const sid = student._id;

    // Attendance summary
    const attendanceRows = await ctx.db
      .query("attendance")
      .withIndex("by_student", (q) => q.eq("studentId", sid))
      .collect();
    const totalClasses = attendanceRows.length;
    const attended = attendanceRows.filter((r) => r.status === "present").length;

    // Assignments summary
    const assignments = await ctx.db
      .query("assignments")
      .withIndex("by_student", (q) => q.eq("studentId", sid))
      .collect();
    const submitted = assignments.filter((a) => a.submitted).length;

    // Progress heuristic: (attendancePct + assignmentPct + avgGradePct) / 3
    const results = await ctx.db
      .query("examResults")
      .withIndex("by_student", (q) => q.eq("studentId", sid))
      .collect();
    const avgGrade = results.length
      ? results.reduce((acc, r) => acc + (r.marks / r.total) * 100, 0) / results.length
      : 0;
    const attendancePct = pct(attended, totalClasses);
    const assignmentPct = pct(submitted, assignments.length);
    const progress = Math.round((attendancePct + assignmentPct + avgGrade) / 3);

    // Today's schedule (fixed to reference day for demo consistency)
    const dayName = "Monday";
    const schedule = await ctx.db
      .query("timetable")
      .withIndex("by_dept_year_day", (q) =>
        q.eq("department", student.department).eq("year", student.year).eq("day", dayName),
      )
      .collect();
    schedule.sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Upcoming events
    const events = await ctx.db.query("events").collect();
    events.sort((a, b) => a.date.localeCompare(b.date));
    const today = "2026-09-24";
    const upcoming = events.filter((e) => e.date >= today).slice(0, 4);

    // Reminders
    const reminders = await ctx.db
      .query("reminders")
      .withIndex("by_student", (q) => q.eq("studentId", sid))
      .collect();
    reminders.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const openReminders = reminders.filter((r) => !r.done).slice(0, 3);

    // Next payment
    const fees = await ctx.db
      .query("feeItems")
      .withIndex("by_student", (q) => q.eq("studentId", sid))
      .collect();
    const pendingFees = fees
      .filter((f) => f.status !== "PAID")
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const nextPayment = pendingFees[0] ?? null;

    // Recent circulars
    const circulars = await ctx.db.query("circulars").collect();
    circulars.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

    return {
      viewer: {
        kind: viewer.kind,
        name: viewer.user?.name ?? "",
        email: viewer.user?.email ?? "",
        image: viewer.user?.image ?? null,
      },
      student: {
        _id: student._id,
        name: student.name,
        rollNo: student.rollNo,
        program: student.program,
        department: student.department,
        year: student.year,
        section: student.section,
      },
      attendance: {
        attended,
        total: totalClasses,
        percent: attendancePct,
      },
      assignments: { submitted, total: assignments.length },
      progress,
      schedule: schedule.map((s) => ({
        _id: s._id,
        startTime: s.startTime,
        endTime: s.endTime,
        subject: s.subject,
        type: s.type,
        room: s.room,
      })),
      events: upcoming.map((e) => ({
        _id: e._id,
        title: e.title,
        date: e.date,
        type: e.type,
        description: e.description ?? null,
      })),
      reminders: openReminders.map((r) => ({
        _id: r._id,
        title: r.title,
        dueDate: r.dueDate,
        color: r.color ?? "blue",
        done: r.done,
      })),
      nextPayment: nextPayment
        ? {
            _id: nextPayment._id,
            title: nextPayment.title,
            amount: nextPayment.amount,
            dueDate: nextPayment.dueDate,
            status: nextPayment.status,
          }
        : null,
      circulars: circulars.slice(0, 4).map((c) => ({
        _id: c._id,
        title: c.title,
        category: c.category,
        publishedAt: c.publishedAt,
      })),
    };
  },
});

/* ---------- Profile ---------- */

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await resolveViewer(ctx);
    if (viewer.kind === "none" || !viewer.student) return null;
    return {
      user: {
        name: viewer.user?.name ?? null,
        email: viewer.user?.email ?? null,
        phone: viewer.user?.phone ?? null,
        image: viewer.user?.image ?? null,
      },
      student: {
        rollNo: viewer.student.rollNo,
        name: viewer.student.name,
        year: viewer.student.year,
        department: viewer.student.department,
        program: viewer.student.program,
        section: viewer.student.section,
      },
    };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    const patch: Record<string, string> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.phone !== undefined) patch.phone = args.phone;
    if (args.image !== undefined) patch.image = args.image;
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(user._id, patch);
    }
    return { ok: true };
  },
});

/* ---------- Attendance ---------- */

export const getAttendance = query({
  args: {},
  handler: async (ctx) => {
    const student = await visibleStudent(ctx);
    if (!student) return null;
    const rows = await ctx.db
      .query("attendance")
      .withIndex("by_student", (q) => q.eq("studentId", student._id))
      .collect();

    const bySubject = new Map<string, { present: number; total: number }>();
    for (const r of rows) {
      const cur = bySubject.get(r.subject) ?? { present: 0, total: 0 };
      cur.total += 1;
      if (r.status === "present") cur.present += 1;
      bySubject.set(r.subject, cur);
    }

    const total = rows.length;
    const attended = rows.filter((r) => r.status === "present").length;

    return {
      summary: { attended, total, percent: pct(attended, total) },
      subjects: [...bySubject.entries()]
        .map(([subject, s]) => ({
          subject,
          present: s.present,
          total: s.total,
          percent: pct(s.present, s.total),
        }))
        .sort((a, b) => a.subject.localeCompare(b.subject)),
      records: rows
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 60)
        .map((r) => ({ _id: r._id, subject: r.subject, date: r.date, status: r.status })),
    };
  },
});

/* ---------- Assignments ---------- */

export const getAssignments = query({
  args: {},
  handler: async (ctx) => {
    const student = await visibleStudent(ctx);
    if (!student) return null;
    const rows = await ctx.db
      .query("assignments")
      .withIndex("by_student", (q) => q.eq("studentId", student._id))
      .collect();
    rows.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return rows.map((r) => ({
      _id: r._id,
      title: r.title,
      subject: r.subject,
      dueDate: r.dueDate,
      submitted: r.submitted,
    }));
  },
});

/* ---------- Circulars ---------- */

export const getCirculars = query({
  args: {
    search: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let rows = await ctx.db.query("circulars").collect();
    if (args.search) {
      const q = args.search.toLowerCase();
      rows = rows.filter(
        (r) => r.title.toLowerCase().includes(q) || r.body.toLowerCase().includes(q),
      );
    }
    if (args.category && args.category !== "All") {
      rows = rows.filter((r) => r.category === args.category);
    }
    rows.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    return rows.map((r) => ({
      _id: r._id,
      title: r.title,
      body: r.body,
      category: r.category,
      publishedAt: r.publishedAt,
    }));
  },
});

/* ---------- Examinations ---------- */

export const getExaminations = query({
  args: {},
  handler: async (ctx) => {
    const student = await visibleStudent(ctx);
    if (!student) return null;
    const results = await ctx.db
      .query("examResults")
      .withIndex("by_student", (q) => q.eq("studentId", student._id))
      .collect();
    results.sort((a, b) => b.date.localeCompare(a.date));

    const events = await ctx.db.query("events").collect();
    events.sort((a, b) => a.date.localeCompare(b.date));
    const today = "2026-09-24";
    const upcomingExams = events.filter((e) => e.date >= today && e.type !== "SYMPOSIUM");
    const schedule = await ctx.db
      .query("timetable")
      .withIndex("by_dept_year_day", (q) =>
        q.eq("department", student.department).eq("year", student.year).eq("day", "Monday"),
      )
      .collect();
    schedule.sort((a, b) => a.startTime.localeCompare(b.startTime));

    return {
      results: results.map((r) => ({
        _id: r._id,
        subject: r.subject,
        date: r.date,
        marks: r.marks,
        total: r.total,
        grade: r.grade,
      })),
      upcomingExams: upcomingExams.map((e) => ({
        _id: e._id,
        title: e.title,
        date: e.date,
        type: e.type,
        description: e.description ?? null,
      })),
      timetable: schedule.map((s) => ({
        _id: s._id,
        day: s.day,
        startTime: s.startTime,
        endTime: s.endTime,
        subject: s.subject,
        type: s.type,
        room: s.room,
      })),
    };
  },
});

/* ---------- Payments ---------- */

export const getPayments = query({
  args: {},
  handler: async (ctx) => {
    const student = await visibleStudent(ctx);
    if (!student) return null;
    const fees = await ctx.db
      .query("feeItems")
      .withIndex("by_student", (q) => q.eq("studentId", student._id))
      .collect();
    fees.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return fees.map((f) => ({
      _id: f._id,
      title: f.title,
      amount: f.amount,
      dueDate: f.dueDate,
      status: f.status,
      paidAt: f.paidAt ?? null,
      transactionId: f.transactionId ?? null,
    }));
  },
});

export const payFee = mutation({
  args: { feeId: v.id("feeItems") },
  handler: async (ctx, args) => {
    const student = await visibleStudent(ctx);
    if (!student) throw new Error("Not allowed");
    const fee = await ctx.db.get(args.feeId);
    if (!fee || fee.studentId !== student._id) throw new Error("Not allowed");
    if (fee.status === "PAID") return { ok: true };
    // Mock Razorpay fallback: mark paid with a generated transaction id.
    const txn = `TXN-${Math.floor(Math.random() * 900000 + 100000)}`;
    await ctx.db.patch(args.feeId, {
      status: "PAID",
      paidAt: "2026-09-24",
      transactionId: txn,
    });
    return { ok: true, transactionId: txn };
  },
});

/* ---------- Reminders ---------- */

export const getReminders = query({
  args: {},
  handler: async (ctx) => {
    const student = await visibleStudent(ctx);
    if (!student) return null;
    const rows = await ctx.db
      .query("reminders")
      .withIndex("by_student", (q) => q.eq("studentId", student._id))
      .collect();
    rows.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return rows.map((r) => ({
      _id: r._id,
      title: r.title,
      dueDate: r.dueDate,
      done: r.done,
      color: r.color ?? "blue",
    }));
  },
});

export const toggleReminder = mutation({
  args: { reminderId: v.id("reminders") },
  handler: async (ctx, args) => {
    const student = await visibleStudent(ctx);
    if (!student) throw new Error("Not allowed");
    const r = await ctx.db.get(args.reminderId);
    if (!r || r.studentId !== student._id) throw new Error("Not allowed");
    await ctx.db.patch(args.reminderId, { done: !r.done });
    return { ok: true };
  },
});

export const addReminder = mutation({
  args: {
    title: v.string(),
    dueDate: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    if (user.portalRole === "parent") throw new Error("Parents are read-only");
    const student = await visibleStudent(ctx);
    if (!student) throw new Error("Not allowed");
    await ctx.db.insert("reminders", {
      studentId: student._id,
      title: args.title,
      dueDate: args.dueDate,
      done: false,
      color: args.color ?? "blue",
    });
    return { ok: true };
  },
});

/* ---------- Library ---------- */

export const getLibrary = query({
  args: {
    search: v.optional(v.string()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let rows = await ctx.db.query("libraryItems").collect();
    if (args.search) {
      const q = args.search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.author.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q),
      );
    }
    if (args.type && args.type !== "All") {
      rows = rows.filter((r) => r.type === args.type);
    }
    rows.sort((a, b) => a.title.localeCompare(b.title));
    return rows.map((r) => ({
      _id: r._id,
      title: r.title,
      author: r.author,
      type: r.type,
      category: r.category,
    }));
  },
});

/* ---------- Extracurricular ---------- */

export const getExtracurricular = query({
  args: {},
  handler: async (ctx) => {
    const student = await visibleStudent(ctx);
    if (!student) return null;
    const activities = await ctx.db.query("extracurriculars").collect();
    activities.sort((a, b) => a.title.localeCompare(b.title));
    const enrollments = await ctx.db
      .query("activityEnrollments")
      .withIndex("by_student", (q) => q.eq("studentId", student._id))
      .collect();
    const enrolledIds = new Set(enrollments.map((e) => e.activityId));
    return activities.map((a) => ({
      _id: a._id,
      title: a.title,
      category: a.category,
      description: a.description ?? null,
      enrolled: enrolledIds.has(a._id),
    }));
  },
});

export const toggleEnrollment = mutation({
  args: { activityId: v.id("extracurriculars") },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    if (user.portalRole === "parent") throw new Error("Parents are read-only");
    const student = await visibleStudent(ctx);
    if (!student) throw new Error("Not allowed");
    const existing = await ctx.db
      .query("activityEnrollments")
      .withIndex("by_student", (q) => q.eq("studentId", student._id))
      .filter((q) => q.eq(q.field("activityId"), args.activityId))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
      return { enrolled: false };
    }
    await ctx.db.insert("activityEnrollments", {
      studentId: student._id,
      activityId: args.activityId,
    });
    return { enrolled: true };
  },
});

/* ---------- Feedback ---------- */

export const getFeedback = query({
  args: {},
  handler: async (ctx) => {
    const student = await visibleStudent(ctx);
    if (!student) return null;
    const rows = await ctx.db
      .query("feedbackTickets")
      .withIndex("by_student", (q) => q.eq("studentId", student._id))
      .collect();
    rows.sort((a, b) => b.createdAt - a.createdAt);
    return rows.map((r) => ({
      _id: r._id,
      category: r.category,
      subject: r.subject,
      message: r.message,
      status: r.status,
      adminReply: r.adminReply ?? null,
      createdAt: r.createdAt,
    }));
  },
});

export const createFeedback = mutation({
  args: {
    category: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    if (user.portalRole === "parent") throw new Error("Parents are read-only");
    const student = await visibleStudent(ctx);
    if (!student) throw new Error("Not allowed");
    await ctx.db.insert("feedbackTickets", {
      studentId: student._id,
      category: args.category,
      subject: args.subject,
      message: args.message,
      status: "OPEN",
      createdAt: Date.now(),
    });
    return { ok: true };
  },
});

/* ---------- Notifications ---------- */

export const getNotifications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    rows.sort((a, b) => b.createdAt - a.createdAt);
    return rows.map((r) => ({
      _id: r._id,
      title: r.title,
      body: r.body,
      read: r.read,
      createdAt: r.createdAt,
    }));
  },
});

export const markNotificationRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    const n = await ctx.db.get(args.notificationId);
    if (!n || n.userId !== userId) throw new Error("Not allowed");
    await ctx.db.patch(args.notificationId, { read: true });
    return { ok: true };
  },
});

export const markAllNotificationsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const r of rows) {
      if (!r.read) await ctx.db.patch(r._id, { read: true });
    }
    return { ok: true };
  },
});

/* ---------- Global search ---------- */

export const globalSearch = query({
  args: { q: v.string() },
  handler: async (ctx, args) => {
    const q = args.q.trim().toLowerCase();
    if (q.length < 2) return { circulars: [], events: [], library: [], pages: [] };

    const circulars = (await ctx.db.query("circulars").collect())
      .filter(
        (c) =>
          c.title.toLowerCase().includes(q) || c.body.toLowerCase().includes(q),
      )
      .slice(0, 4)
      .map((c) => ({ _id: c._id, title: c.title, category: c.category }));

    const events = (await ctx.db.query("events").collect())
      .filter((e) => e.title.toLowerCase().includes(q))
      .slice(0, 4)
      .map((e) => ({ _id: e._id, title: e.title, date: e.date }));

    const library = (await ctx.db.query("libraryItems").collect())
      .filter(
        (l) =>
          l.title.toLowerCase().includes(q) || l.author.toLowerCase().includes(q),
      )
      .slice(0, 4)
      .map((l) => ({ _id: l._id, title: l.title, author: l.author }));

    const pages = [
      { path: "/attendance", label: "Attendance" },
      { path: "/circulars", label: "Circulars" },
      { path: "/payments", label: "Payments" },
      { path: "/examinations", label: "Examinations" },
      { path: "/e-library", label: "E-Library" },
      { path: "/extracurricular", label: "Extracurricular" },
      { path: "/feedback", label: "Feedback & Support" },
      { path: "/profile", label: "Profile" },
    ].filter((p) => p.label.toLowerCase().includes(q));

    return { circulars, events, library, pages };
  },
});
