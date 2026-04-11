"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function attemptLogin(formData: FormData) {
  const password = formData.get("password") as string;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (password === adminPassword) {
    (await cookies()).set("supernexus_admin_auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    redirect("/admin");
  } else {
    redirect("/login?error=true");
  }
}
