import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { uploadImage } from "@/lib/r2";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "no file" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "only image files allowed" }, { status: 400 });
  }
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImage(buffer, file.type);
    return NextResponse.json({ url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "upload failed" }, { status: 500 });
  }
}
