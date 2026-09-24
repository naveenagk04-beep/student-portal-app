"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase Storage integration.
 *
 * Files (profile avatars, and later circular attachments) are uploaded from
 * the client to this action, which streams them into a public Supabase
 * Storage bucket using the service-role key. The key never leaves the server.
 *
 * Required keys (Keys tab):
 *   SUPABASE_URL               e.g. https://abcd1234.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY  service_role secret (server-only)
 *   SUPABASE_ANON_KEY          optional today, used by future client features
 */

const BUCKET = "portal-assets";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB

function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the Keys tab.",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function ensureBucket(supabase: SupabaseClient): Promise<void> {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets?.some((b) => b.name === BUCKET)) return;
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_AVATAR_BYTES,
  });
  // Race with another concurrent create is fine.
  if (error && !`${error.message}`.toLowerCase().includes("already exists")) {
    throw new Error(`Could not create storage bucket: ${error.message}`);
  }
}

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}

/**
 * Upload a file (base64 body) to Supabase Storage and return its public URL.
 * Folder is a namespace inside the bucket, e.g. "avatars".
 */
export const uploadFile = action({
  args: {
    folder: v.string(),
    filename: v.string(),
    contentType: v.string(),
    /** Base64-encoded file body (no data: prefix). */
    base64: v.string(),
  },
  handler: async (_ctx, args) => {
    if (!args.contentType.startsWith("image/")) {
      throw new Error("Only image uploads are supported right now.");
    }

    const supabase = getSupabase();
    await ensureBucket(supabase);

    const bytes = Buffer.from(args.base64, "base64");
    if (bytes.length === 0) throw new Error("Empty file.");
    if (bytes.length > MAX_AVATAR_BYTES) {
      throw new Error("Image is too large. Maximum size is 2 MB.");
    }

    const path = `${args.folder.replace(/[^a-z0-9-]/gi, "")}/${Date.now()}-${safeName(
      args.filename,
    )}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: args.contentType, upsert: false });
    if (error) throw new Error(`Upload failed: ${error.message}`);

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, path };
  },
});
