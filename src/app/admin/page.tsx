"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";

interface EventSummary {
  id: string;
  title: string;
  date: string;
  registrations: { guests: number }[];
  waitlist: { id: string }[];
}

export default function AdminHome() {
  const [events, setEvents] = useState<EventSummary[]>([]);

  useEffect(() => {
    adminFetch("/api/admin/events")
      .then((r) => r.json())
      .then(setEvents);
  }, []);

  const upcoming = events.filter((e) => new Date(e.date) >= new Date());
  const totalRegistrations = upcoming.reduce(
    (sum, e) => sum + e.registrations.reduce((s, r) => s + r.guests, 0),
    0
  );
  const totalWaitlist = upcoming.reduce((sum, e) => sum + e.waitlist.length, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-cream-dark p-5">
          <p className="text-sm text-gray-400 mb-1">Événements à venir</p>
          <p className="text-3xl font-bold text-wine">{upcoming.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-cream-dark p-5">
          <p className="text-sm text-gray-400 mb-1">Inscrits total</p>
          <p className="text-3xl font-bold text-gray-900">{totalRegistrations}</p>
        </div>
        <div className="bg-white rounded-xl border border-cream-dark p-5">
          <p className="text-sm text-gray-400 mb-1">En liste d&apos;attente</p>
          <p className="text-3xl font-bold text-gold">{totalWaitlist}</p>
        </div>
      </div>

      <Link
        href="/admin/events"
        className="block bg-white rounded-xl border border-cream-dark p-6 hover:border-gold/50 hover:shadow-md transition-all group"
      >
        <h2 className="text-lg font-semibold text-gray-900 group-hover:text-wine transition-colors">
          Gérer les événements
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Créer, modifier, voir les inscriptions et ajouter des produits
        </p>
      </Link>
    </div>
  );
}
