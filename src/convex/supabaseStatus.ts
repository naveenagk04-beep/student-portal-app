import { query } from "./_generated/server";

/**
 * Reports whether the Supabase env vars are present in this deployment.
 * Returns booleans only — key values are never exposed to the client.
 * Lives in a V8 module because queries cannot be defined in "use node" files.
 */
export const storageStatus = query({
  args: {},
  handler: async () => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return {
      configured: Boolean(url && key),
      urlConfigured: Boolean(url),
      keyConfigured: Boolean(key),
      bucket: "portal-assets",
    };
  },
});
