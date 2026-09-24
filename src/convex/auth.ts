import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { emailOtp } from "./auth/emailOtp";
import { verifyPasswordSync } from "./passwords";

/**
 * VCET credentials provider: sign in with email OR roll number + password.
 * Authenticates against the PBKDF2 hash stored on the user record.
 */
const vcetCredentials = ConvexCredentials({
  id: "password",
  authorize: async (params, ctx) => {
    const identifier = String(params.email ?? "").toLowerCase().trim();
    const password = String(params.password ?? "");
    if (!identifier || !password) {
      throw new Error("Missing credentials");
    }

    const users = await ctx.db.query("users").collect();
    const user = users.find(
      (u) => (u.email ?? "").toLowerCase() === identifier,
    );

    if (!user) throw new Error("Invalid credentials");

    const storedHash = (user as unknown as { passwordHash?: string })
      .passwordHash;
    if (!storedHash) throw new Error("Invalid credentials");
    const ok = verifyPasswordSync(password, storedHash);
    if (!ok) throw new Error("Invalid credentials");

    return { userId: user._id };
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [vcetCredentials, emailOtp, Anonymous],
});
