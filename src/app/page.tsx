import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const events = await prisma.event.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    include: {
      registrations: { select: { guests: true } },
    },
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-wine tracking-tight mb-3">
          Our Tastings
        </h1>
        <p className="text-gray-500 text-lg">
          Discover our upcoming wine pairing events
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-cream-dark">
          <p className="text-gray-400 text-lg">No upcoming events at the moment.</p>
          <p className="text-gray-400 text-sm mt-2">Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const totalGuests = event.registrations.reduce(
              (sum, r) => sum + r.guests,
              0
            );
            const spotsLeft = event.maxGuests - totalGuests;

            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group block bg-white rounded-2xl border border-cream-dark p-6 hover:shadow-lg hover:border-gold/50 transition-all duration-300"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 group-hover:text-wine transition-colors">
                      {event.title}
                    </h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-2">
                      <span className="text-sm text-gray-600 flex items-center gap-1.5">
                        <span className="text-gold">&#9679;</span>
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-sm text-gray-400 flex items-center gap-1.5">
                        <span className="hidden sm:inline">&middot;</span>
                        {event.location}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-gray-500 text-sm mt-3 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full ${
                      spotsLeft > 0
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-wine/10 text-wine border border-wine/20"
                    }`}
                  >
                    {spotsLeft > 0 ? `${spotsLeft} spots` : "Full"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
