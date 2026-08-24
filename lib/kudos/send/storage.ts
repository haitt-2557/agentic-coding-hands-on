// INT-002, BR-005 — uploads validated image attachments to the private `kudos-images`
// bucket (supabase/migrations/*_kudos_images_bucket.sql) at submit time only; there is no
// draft-upload flow, so there is never an "uploaded but unsubmitted" orphan.
//
// Path convention (fixed in phase-01, restated here): the first path segment MUST equal the
// uploading user's uid — the bucket's storage.objects policies key off exactly that shape via
// `storage.foldername(name)[1] = auth.uid()::text`. A path missing that prefix is rejected by
// RLS regardless of what this function intends.

import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET_ID = 'kudos-images';

export interface UploadedKudosImage {
  path: string;
  originalFilename: string;
}

/** Strips characters Storage object keys don't like, keeping the upload path predictable. */
function safeFileName(originalFilename: string): string {
  return originalFilename.replace(/[^a-zA-Z0-9.\-_]/g, '-');
}

/**
 * Uploads each file under `${userId}/...` and returns the stored path alongside the
 * original filename (kept for display; the path itself is generated to avoid collisions).
 * Uploads run sequentially — safe and simple for the ≤5 small files this form allows (YAGNI).
 */
export async function uploadKudosImages(
  supabase: SupabaseClient,
  userId: string,
  files: File[]
): Promise<UploadedKudosImage[]> {
  const uploaded: UploadedKudosImage[] = [];

  for (const file of files) {
    const path = `${userId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const { error } = await supabase.storage.from(BUCKET_ID).upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      throw new Error(`Failed to upload image "${file.name}": ${error.message}`);
    }

    uploaded.push({ path, originalFilename: file.name });
  }

  return uploaded;
}
