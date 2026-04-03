import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const events = await prisma.event.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    include: {
      _count: { select: { registrations: true } },
    },
  });

  const eventsWithAvailability = events.map((event) => {
    const totalGuests = event._count.registrations;
    return {
      ...event,
      spotsLeft: event.maxGuests - totalGuests,
      _count: undefined,
    };
  });

  return NextResponse.json(eventsWithAvailability);
}
