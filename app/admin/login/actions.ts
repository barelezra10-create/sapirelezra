"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export async function login(formData: FormData) {
  const password = formData.get("password");
  if (password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin/login?error=1");
  }
  const session = await getSession();
  session.isAdmin = true;
  await session.save();
  redirect("/admin");
}
