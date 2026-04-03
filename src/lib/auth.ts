import { NextRequest } from "next/server";

export function isAuthorized(request: NextRequest): boolean {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  return token === process.env.ADMIN_PASSWORD;
}

export function checkAdminCookie(cookieValue: string | undefined): boolean {
  return cookieValue === process.env.ADMIN_PASSWORD;
}
