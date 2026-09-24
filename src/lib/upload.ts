import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export function isBlobUploadEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

/**
 * Stores an uploaded image and returns a browser-loadable URL.
 *
 * - On Vercel (when `BLOB_READ_WRITE_TOKEN` is set): files go to Vercel Blob
 *   and the returned URL is an absolute https URL.
 * - Locally: files are written to `public/uploads/<folder>` and the returned
 *   URL is a normal `/uploads/<folder>/...` path.
 */
export async function storeImage(
  file: File,
  folder: string,
  namePrefix = ""
): Promise<string> {
  const safeFolder =
    folder.replace(/[^a-z0-9-]/gi, "").slice(0, 24) || "general";
  const ext =
    file.type === "image/webp"
      ? "webp"
      : file.type === "image/png"
        ? "png"
        : file.type === "image/gif"
          ? "gif"
          : "jpg";
  const filename = `${namePrefix}${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isBlobUploadEnabled()) {
    const blob = await put(`uploads/${safeFolder}/${filename}`, buffer, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  const dir = path.join(process.cwd(), "public", "uploads", safeFolder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${safeFolder}/${filename}`;
}