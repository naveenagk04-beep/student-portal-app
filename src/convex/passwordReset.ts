import { internal } from "./_generated/api";
import { action, internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";
import { hashPasswordSync, verifyPasswordSync } from "./passwords";

/**
 * Forgot-password flow: an action emails a 6-digit OTP via the Freebuff OTP
 * endpoint, mutations verify the code and update the stored password hash.
 */

const CODE_TTL_MS = 15 * 60 * 1000;

async function sendOtpEmail(email: string, code: string) {
  try {
    await fetch("https://auth.freebuff.app/send_otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "fb_email_2crN1hqIArZP2bEfvjp5Qik4",
      },
      body: JSON.stringify({
        to: email,
        otp: code,
        appName: process.env.VLY_APP_NAME || "VCET Student Portal",
      }),
    });
  } catch (err) {
    console.error("[passwordReset] OTP email failed:", err);
  }
}

/** Public mutation: create a reset code for an email and send it by email. */
export const requestReset = action({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    const user = await ctx.runQuery(internal.account.findByEmailOrRoll, {
      identifier: email,
    });
    if (!user) {
      // Don't leak which emails exist — pretend success.
      return { ok: true };
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await ctx.runMutation(internal.passwordReset.storeCode, {
      email: (user.email ?? email).toLowerCase(),
      codeHash: hashPasswordSync(code),
    });
    await sendOtpEmail((user.email ?? email).toLowerCase(), code);
    return { ok: true };
  },
});

export const storeCode = internalMutation({
  args: { email: v.string(), codeHash: v.string() },
  handler: async (ctx, args) => {
    // Invalidate previous codes for this email.
    const existing = await ctx.db
      .query("passwordResets")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();
    for (const row of existing) {
      await ctx.db.delete(row._id);
    }
    await ctx.db.insert("passwordResets", {
      email: args.email,
      codeHash: args.codeHash,
      expiresAt: Date.now() + CODE_TTL_MS,
      used: false,
    });
    return { ok: true };
  },
});

/** Public mutation: verify code + set the new password. */
export const resetPassword = mutation({
  args: { email: v.string(), code: v.string(), newPassword: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    const rows = await ctx.db
      .query("passwordResets")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();
    const valid = rows.find(
      (r) =>
        !r.used &&
        r.expiresAt > Date.now() &&
        verifyPasswordSync(args.code, r.codeHash),
    );
    if (!valid) {
      return { ok: false as const, error: "Invalid or expired code." };
    }
    const users = await ctx.db.query("users").collect();
    const user = users.find((u) => (u.email ?? "").toLowerCase() === email);
    if (!user) {
      return { ok: false as const, error: "Account not found." };
    }
    if (args.newPassword.length < 6) {
      return { ok: false as const, error: "Password must be at least 6 characters." };
    }
    await ctx.db.patch(user._id, { passwordHash: hashPasswordSync(args.newPassword) });
    await ctx.db.patch(valid._id, { used: true });
    return { ok: true as const };
  },
});
