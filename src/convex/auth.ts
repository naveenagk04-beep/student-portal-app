import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { emailOtp } from "./auth/emailOtp";
import { verifyPasswordSync } from "./passwords";
import { internal } from "./_generated/api";

/**
 * Portal credentials provider: sign in with email OR roll number + password.
 * The authorize callback runs inside an ACTION context, so DB access goes
 * through ctx.runQuery / ctx.runMutation against the `account` module.
 */
const portalCredentials = ConvexCredentials({
  id: "password",
  authorize: async (params, ctx) => {
    const rawEmail = String(params.email ?? "").toLowerCase().trim();
    const password = String(params.password ?? "");
    const flow = String(params.flow ?? "signIn");

    if (!rawEmail || !password) {
      throw new Error("Missing credentials");
    }

    if (flow === "signUp") {
      const userId = await ctx.runMutation(internal.account.createStudentAccount, {
        email: rawEmail,
        password,
        name: String(params.name ?? ""),
        phone: String(params.phone ?? ""),
        rollNo: String(params.rollNo ?? "").toUpperCase(),
        year: String(params.year ?? ""),
        department: String(params.department ?? ""),
      });
      return { userId };
    }

    // Default: sign in. Accepts a raw email or a roll number; roll numbers
    // are mapped to their configured college email domain on the client, but
    // we also resolve them here as a fallback.
    const user = await ctx.runQuery(internal.account.findByEmailOrRoll, {
      identifier: rawEmail,
    });
    if (!user) throw new Error("Invalid credentials");

    const storedHash = user.passwordHash;
    if (!storedHash || !verifyPasswordSync(password, storedHash)) {
      throw new Error("Invalid credentials");
    }
    return { userId: user._id };
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [portalCredentials, emailOtp, Anonymous],
});
