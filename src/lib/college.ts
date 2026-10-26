/**
 * Central college/portal branding.
 *
 * The portal is intentionally institution-agnostic: change these values
 * to rebrand the whole app — no other code references a specific college.
 */
export const COLLEGE = {
  /** Short lockup name shown next to the logo. */
  shortName: "Portal",
  /** Full portal name (document titles, emails, etc.). */
  portalName: "Student Portal",
  /** Display name for the institution ("Your College" = deliberately generic). */
  institution: "Your College",
  /** Tagline shown under the logo lockup and in the footer. */
  tagline: "Empowering the Next Generation",
  /** Email domain used for mapped student-ID logins and seeded accounts. */
  emailDomain: "campus.edu.in",
} as const;

/** Domain used by the original seeded demo accounts — migrated away automatically. */
export const LEGACY_EMAIL_DOMAIN = "vcet.edu.in";
