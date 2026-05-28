import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorized } from "@/lib/auth";
import { parseAsAmsterdam } from "@/lib/timezone";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await prisma.event.findMany({
    orderBy: { date: "desc" },
    include: {
      registrations: true,
      waitlist: true,
      _count: { select: { products: true } },
    },
  });

  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, date, location, maxGuests } = body;

  const event = await prisma.event.create({
    data: { title, description, date: parseAsAmsterdam(date), location, maxGuests },
  });

  return NextResponse.json(event);
}
