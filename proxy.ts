import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";

export async function proxy(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin/login") || req.nextUrl.pathname.startsWith("/admin/logout")) {
    return NextResponse.next();
  }
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const res = NextResponse.next();
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    if (!session.isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return res;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
