import { internalMutation, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { seedData } from "./seedData";
import { hashPasswordSync } from "./passwords";

export const seedAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("students")
      .withIndex("by_roll", (q) => q.eq("rollNo", "23CE017"))
      .first();
    if (existing) return { seeded: true, skipped: true };

    const D = seedData;

    for (const c of D.courses) await ctx.db.insert("courses", c);
    for (const t of D.timetable) await ctx.db.insert("timetable", t);
    for (const e of D.events) await ctx.db.insert("events", e);
    for (const c of D.circulars) await ctx.db.insert("circulars", c);
    for (const l of D.libraryItems) await ctx.db.insert("libraryItems", l);
    for (const e of D.extracurriculars) await ctx.db.insert("extracurriculars", e);

    // Admin account
    await ctx.db.insert("users", {
      name: "VCET Admin",
      email: "admin@vcet.edu.in",
      emailVerificationTime: Date.now(),
      role: "admin",
      portalRole: "admin",
      passwordHash: hashPasswordSync("portal123"),
    });

    // Main student: Naveena G K
    const studentUserId = await ctx.db.insert("users", {
      name: "Naveena G K",
      email: "23ce017@vcet.edu.in",
      emailVerificationTime: Date.now(),
      role: "user",
      portalRole: "student",
      phone: "9840012345",
      rollNo: "23CE017",
      image: seedAvatar("Naveena G K"),
      passwordHash: hashPasswordSync("portal123"),
    });
    const studentId = await ctx.db.insert("students", {
      userId: studentUserId,
      rollNo: "23CE017",
      name: "Naveena G K",
      year: "2",
      department: "CSE",
      program: "B.Tech Computer Science",
      section: "A",
    });

    // Parent linked to Naveena
    const parentUserId = await ctx.db.insert("users", {
      name: "Gopalakrishnan K",
      email: "parent@vcet.edu.in",
      emailVerificationTime: Date.now(),
      role: "user",
      portalRole: "parent",
      phone: "9840077777",
      passwordHash: hashPasswordSync("portal123"),
    });
    await ctx.db.insert("parents", {
      userId: parentUserId,
      name: "Gopalakrishnan K",
      phone: "9840077777",
    });
    await ctx.db.insert("studentParents", {
      studentId,
      parentUserId,
      relation: "Father",
    });

    // Other students
    for (const s of D.otherStudents) {
      const uid = await ctx.db.insert("users", {
        name: s.name,
        email: `${s.rollNo.toLowerCase()}@vcet.edu.in`,
        emailVerificationTime: Date.now(),
        role: "user",
        portalRole: "student",
        rollNo: s.rollNo,
        image: seedAvatar(s.name),
      });
      await ctx.db.insert("students", {
        userId: uid,
        rollNo: s.rollNo,
        name: s.name,
        year: s.year,
        department: s.department,
        program: s.program,
        section: s.section,
      });
    }

    // Assignments: 4 of 5 submitted
    const assignments = [
      { title: "Linked List Implementation", subject: "Data Structures", dueDate: "2026-09-18", submitted: true },
      { title: "Tree Traversal Worksheet", subject: "Data Structures", dueDate: "2026-09-22", submitted: true },
      { title: "Matrices Problem Set", subject: "Mathematics", dueDate: "2026-09-24", submitted: true },
      { title: "Communication Essay", subject: "English", dueDate: "2026-09-23", submitted: true },
      { title: "OS Scheduling Simulation", subject: "Operating Systems", dueDate: "2026-09-30", submitted: false },
    ];
    for (const a of assignments) {
      await ctx.db.insert("assignments", { studentId, ...a });
    }

    // Attendance: 23 of 25 => 92%
    await seedAttendanceForStudent(ctx, studentId);

    // Fees
    await ctx.db.insert("feeItems", {
      studentId,
      title: "College Fee (Semester)",
      amount: 12500,
      dueDate: "2026-09-30",
      status: "PENDING" as const,
    });
    await ctx.db.insert("feeItems", {
      studentId,
      title: "Library Fee",
      amount: 300,
      dueDate: "2026-08-15",
      status: "PAID" as const,
      paidAt: "2026-08-10",
      transactionId: "TXN-88112",
    });
    await ctx.db.insert("feeItems", {
      studentId,
      title: "Lab Fee",
      amount: 750,
      dueDate: "2026-07-30",
      status: "PAID" as const,
      paidAt: "2026-07-28",
      transactionId: "TXN-87430",
    });
    await ctx.db.insert("feeItems", {
      studentId,
      title: "Exam Fee",
      amount: 1500,
      dueDate: "2026-10-20",
      status: "PENDING" as const,
    });

    // Reminders
    const reminders = [
      { title: "Submit assignment – Data Structures", dueDate: "2026-09-24", done: false, color: "blue" },
      { title: "Library book return", dueDate: "2026-09-26", done: false, color: "green" },
      { title: "Project presentation", dueDate: "2026-09-30", done: false, color: "purple" },
    ];
    for (const r of reminders) await ctx.db.insert("reminders", { studentId, ...r });

    // Exam results
    const results = [
      { subject: "Mathematics", date: "2026-05-12", marks: 91, total: 100, grade: "A+" },
      { subject: "Data Structures", date: "2026-05-14", marks: 88, total: 100, grade: "A" },
      { subject: "English", date: "2026-05-16", marks: 84, total: 100, grade: "A" },
      { subject: "Digital Electronics", date: "2026-05-18", marks: 79, total: 100, grade: "B+" },
    ];
    for (const r of results) await ctx.db.insert("examResults", { studentId, ...r });

    // Extracurricular enrollments
    const coding = await ctx.db
      .query("extracurriculars")
      .filter((q) => q.eq(q.field("title"), "Coding Club"))
      .first();
    if (coding) {
      await ctx.db.insert("activityEnrollments", { studentId, activityId: coding._id });
    }
    const nss = await ctx.db
      .query("extracurriculars")
      .filter((q) => q.eq(q.field("title"), "NSS"))
      .first();
    if (nss) {
      await ctx.db.insert("activityEnrollments", { studentId, activityId: nss._id });
    }

    // Feedback ticket
    await ctx.db.insert("feedbackTickets", {
      studentId,
      category: "Academics",
      subject: "Lab equipment request",
      message: "Requesting additional lab hours for data structures practice.",
      status: "OPEN" as const,
      createdAt: Date.now() - 86400000,
    });

    // Notifications for student
    const notifications = [
      { title: "Assignment due soon", body: "OS Scheduling Simulation is due on 30 Sep 2026." },
      { title: "Fee reminder", body: "College Fee (Semester) of ₹12,500 is due on 30 Sep 2026." },
      { title: "New circular", body: "The semester examination timetable has been published." },
    ];
    for (let i = 0; i < notifications.length; i++) {
      await ctx.db.insert("notifications", {
        userId: studentUserId,
        ...notifications[i],
        read: i === notifications.length - 1,
        createdAt: Date.now() - i * 3600000,
      });
    }

    // Notification for parent
    await ctx.db.insert("notifications", {
      userId: parentUserId,
      title: "Welcome to Parent Mode",
      body: "You can now view Naveena's attendance, schedule and payments.",
      read: false,
      createdAt: Date.now(),
    });

    // Seed other students with attendance data
    for (const s of D.otherStudents) {
      const sid = await ctx.db
        .query("students")
        .withIndex("by_roll", (q) => q.eq("rollNo", s.rollNo))
        .first();
      if (sid) await seedAttendanceForStudent(ctx, sid._id);
    }

    return { seeded: true, skipped: false };
  },
});

/** Public bootstrap: schedules the idempotent seed at most once per call. */
export const ensureSeeded = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("students")
      .withIndex("by_roll", (q) => q.eq("rollNo", "23CE017"))
      .first();
    if (existing) return { ok: true, skipped: true };
    await ctx.scheduler.runAfter(0, internal.seed.seedAll, {});
    return { ok: true, skipped: false };
  },
});

function seedAvatar(name: string): string {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const palette = ["0B3B78", "064A9B", "5BAA3C", "1D4ED8", "0E7490"];
  const idx = name.length % palette.length;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#${palette[idx]}"/><text x="48" y="60" font-family="Arial, sans-serif" font-size="36" fill="#fff" text-anchor="middle">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

async function seedAttendanceForStudent(ctx: any, studentId: any) {
  // 23 present / 25 total => 92%
  const subjects = ["Mathematics", "Data Structures", "English", "Operating Systems"];
  const total = 25;
  const presentTotal = 23;
  const startDate = new Date("2026-09-01");
  for (let i = 0; i < total; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + Math.floor(i / 2));
    const isPresent = i < presentTotal;
    await ctx.db.insert("attendance", {
      studentId,
      subject: subjects[i % subjects.length],
      date: date.toISOString().slice(0, 10),
      status: isPresent ? "present" : "absent",
    });
  }
}
