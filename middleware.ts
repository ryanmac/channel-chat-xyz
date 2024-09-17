// middleware.ts
import { NextResponse } from "next/server";
import { auth } from "./auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isAuthRoute = nextUrl.pathname.startsWith("/auth");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isPublicRoute = ["/", "/about", "/feedback"].includes(nextUrl.pathname) ||
    nextUrl.pathname.startsWith("/user") ||
    nextUrl.pathname.startsWith("/channel");

  // Allow API routes and public routes
  if (isApiRoute || isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth routes
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Redirect non-logged-in users to home page for protected routes
  if (!isLoggedIn && !isAuthRoute) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Handle admin routes
  if (isAdminRoute) {
    const user = req.auth?.user;
    console.log("User in admin route:", user);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};