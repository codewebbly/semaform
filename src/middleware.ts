import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/donor") && token?.role !== "DONOR") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    if (pathname.startsWith("/nonprofit") && token?.role !== "NONPROFIT") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/donor/:path*", "/nonprofit/:path*", "/admin/:path*"],
};
