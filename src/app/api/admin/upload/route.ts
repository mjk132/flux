import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import {
  storeImage,
  MAX_IMAGE_BYTES,
  ALLOWED_IMAGE_TYPES,
} from "@/lib/upload";

// Admin-only generic image upload (PayPal QR, banners, product art, ...).
// Stores to Vercel Blob when deployed (BLOB_READ_WRITE_TOKEN) or to
// public/uploads/<folder> when run locally.
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || (session.role !== "OWNER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") || "general");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WEBP or GIF images allowed" },
        { status: 400 }
      );
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "File must be smaller than 5MB" },
        { status: 400 }
      );
    }

    const url = await storeImage(file, folder);
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Upload POST error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}