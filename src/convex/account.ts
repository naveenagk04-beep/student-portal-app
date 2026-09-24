import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { hashPasswordSync } from "./passwords";

/**
 * Internal helpers used by the ConvexCredentials authorize callback (which
 * runs in an action context without direct DB access) and by the client
 * password-reset mutations.
 */

export const findByEmailOrRoll = internalQuery({
  args: { identifier: v.string() },
  handler: async (ctx, args) => {
    const id = args.identifier.toLowerCase().trim();
    const users = await ctx.db.query("users").collect();
    return (
      users.find((u) => (u.email ?? "").toLowerCase() === id) ??
      users.find((u) => (u.rollNo ?? "").toLowerCase() === id) ??
      null
    );
  },
});

export const createStudentAccount = internalMutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    phone: v.string(),
    rollNo: v.string(),
    year: v.string(),
    department: v.string(),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    const existing = users.find(
      (u) => (u.email ?? "").toLowerCase() === args.email,
    );

    // The register flow verifies the email via email-otp first, which already
    // creates a bare user record. Adopt it instead of failing.
    if (existing) {
      const hasPassword = Boolean(
        (existing as unknown as { passwordHash?: string }).passwordHash,
      );
      const existingStudent = await ctx.db
        .query("students")
        .withIndex("by_user", (q) => q.eq("userId", existing._id))
        .first();
      if (hasPassword || existingStudent) {
        throw new Error("An account with this email already exists");
      }
      await ctx.db.patch(existing._id, {
        name: args.name || existing.name || "New Student",
        emailVerificationTime: existing.emailVerificationTime ?? Date.now(),
        role: "user",
        portalRole: "student",
        phone: args.phone || existing.phone,
        rollNo: args.rollNo || existing.rollNo,
        passwordHash: hashPasswordSync(args.password),
      });
      await ctx.db.insert("students", {
        userId: existing._id,
        rollNo: args.rollNo || `NEW${Date.now() % 100000}`,
        name: args.name || "New Student",
        year: args.year || "1",
        department: args.department || "CSE",
        program: `B.Tech ${args.department || "CSE"}`,
        section: "A",
      });
      return existing._id;
    }

    const rollTaken = await ctx.db
      .query("students")
      .withIndex("by_roll", (q) => q.eq("rollNo", args.rollNo))
      .first();
    if (args.rollNo && rollTaken) {
      throw new Error("An account with this roll number already exists");
    }

    const userId = await ctx.db.insert("users", {
      name: args.name || "New Student",
      email: args.email,
      emailVerificationTime: Date.now(),
      role: "user",
      portalRole: "student",
      phone: args.phone || undefined,
      rollNo: args.rollNo || undefined,
      passwordHash: hashPasswordSync(args.password),
    });

    await ctx.db.insert("students", {
      userId,
      rollNo: args.rollNo || `NEW${Date.now() % 100000}`,
      name: args.name || "New Student",
      year: args.year || "1",
      department: args.department || "CSE",
      program: `B.Tech ${args.department || "CSE"}`,
      section: "A",
    });

    return userId;
  },
});
