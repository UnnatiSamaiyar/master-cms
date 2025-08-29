import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { auth } from "./auth";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const pathname = request.nextUrl.pathname;

  if (!session && pathname !== "/auth/login") {
    const searchParams = new URLSearchParams({ url: pathname });
    return NextResponse.redirect(
      new URL(`/auth/login?${searchParams.toString()}`, request.nextUrl.origin),
    );
  }
  if (
    session &&
    session.user.role === "subadmin" &&
    pathname.startsWith("/dashboard/admins")
  ) {
    return NextResponse.json({
      error: "You don't have any permission to accesss admins.",
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
