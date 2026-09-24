import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

export const PORTAL_ROLES = {
  STUDENT: "student",
  PARENT: "parent",
  ADMIN: "admin",
} as const;

export const portalRoleValidator = v.union(
  v.literal(PORTAL_ROLES.STUDENT),
  v.literal(PORTAL_ROLES.PARENT),
  v.literal(PORTAL_ROLES.ADMIN),
);
export type PortalRole = Infer<typeof portalRoleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      // VCET portal fields
      portalRole: v.optional(portalRoleValidator),
      phone: v.optional(v.string()),
      rollNo: v.optional(v.string()),
      passwordHash: v.optional(v.string()),
    }).index("email", ["email"]),

    /** Short-lived OTP codes for the forgot-password flow. */
    passwordResets: defineTable({
      email: v.string(),
      codeHash: v.string(),
      expiresAt: v.number(),
      used: v.boolean(),
    }).index("by_email", ["email"]),

    students: defineTable({
      userId: v.id("users"),
      rollNo: v.string(),
      name: v.string(),
      year: v.string(),
      department: v.string(),
      program: v.string(),
      section: v.string(),
    })
      .index("by_user", ["userId"])
      .index("by_roll", ["rollNo"]),

    parents: defineTable({
      userId: v.id("users"),
      name: v.string(),
      phone: v.string(),
    }).index("by_user", ["userId"]),

    studentParents: defineTable({
      studentId: v.id("students"),
      parentUserId: v.id("users"),
      relation: v.optional(v.string()),
    })
      .index("by_parent_user", ["parentUserId"])
      .index("by_student", ["studentId"]),

    courses: defineTable({
      code: v.string(),
      title: v.string(),
      department: v.string(),
      year: v.string(),
    }).index("by_code", ["code"]),

    timetable: defineTable({
      day: v.string(),
      startTime: v.string(),
      endTime: v.string(),
      subject: v.string(),
      type: v.union(v.literal("LECTURE"), v.literal("LAB")),
      room: v.string(),
      department: v.string(),
      year: v.string(),
    }).index("by_dept_year_day", ["department", "year", "day"]),

    attendance: defineTable({
      studentId: v.id("students"),
      subject: v.string(),
      date: v.string(),
      status: v.union(v.literal("present"), v.literal("absent")),
    }).index("by_student", ["studentId"]),

    assignments: defineTable({
      studentId: v.id("students"),
      title: v.string(),
      subject: v.string(),
      dueDate: v.string(),
      submitted: v.boolean(),
    }).index("by_student", ["studentId"]),

    events: defineTable({
      title: v.string(),
      date: v.string(),
      type: v.union(v.literal("QUIZ"), v.literal("SYMPOSIUM"), v.literal("EXAM")),
      description: v.optional(v.string()),
    }).index("by_date", ["date"]),

    examResults: defineTable({
      studentId: v.id("students"),
      subject: v.string(),
      date: v.string(),
      marks: v.number(),
      total: v.number(),
      grade: v.string(),
    }).index("by_student", ["studentId"]),

    circulars: defineTable({
      title: v.string(),
      body: v.string(),
      category: v.string(),
      publishedAt: v.string(),
      targetDepartment: v.optional(v.string()),
      targetYear: v.optional(v.string()),
    }).index("by_published", ["publishedAt"]),

    feeItems: defineTable({
      studentId: v.id("students"),
      title: v.string(),
      amount: v.number(),
      dueDate: v.string(),
      status: v.union(v.literal("PAID"), v.literal("PENDING"), v.literal("OVERDUE")),
      paidAt: v.optional(v.string()),
      transactionId: v.optional(v.string()),
    }).index("by_student", ["studentId"]),

    reminders: defineTable({
      studentId: v.id("students"),
      title: v.string(),
      dueDate: v.string(),
      done: v.boolean(),
      color: v.optional(v.string()),
    }).index("by_student", ["studentId"]),

    libraryItems: defineTable({
      title: v.string(),
      author: v.string(),
      type: v.union(v.literal("BOOK"), v.literal("JOURNAL"), v.literal("NOTES")),
      category: v.string(),
    }).index("by_category", ["category"]),

    extracurriculars: defineTable({
      title: v.string(),
      category: v.string(),
      description: v.optional(v.string()),
    }),

    activityEnrollments: defineTable({
      studentId: v.id("students"),
      activityId: v.id("extracurriculars"),
    })
      .index("by_student", ["studentId"])
      .index("by_activity", ["activityId"]),

    feedbackTickets: defineTable({
      studentId: v.id("students"),
      category: v.string(),
      subject: v.string(),
      message: v.string(),
      status: v.union(v.literal("OPEN"), v.literal("IN_PROGRESS"), v.literal("RESOLVED")),
      adminReply: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_student", ["studentId"]),

    notifications: defineTable({
      userId: v.id("users"),
      title: v.string(),
      body: v.string(),
      read: v.boolean(),
      createdAt: v.number(),
    }).index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
