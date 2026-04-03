"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/admin-fetch";

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  maxGuests: number;
  registrations: { guests: number }[];
  waitlist: { id: string }[];
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    maxGuests: 20,
  });

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const res = await adminFetch("/api/admin/events");
    if (res.ok) setEvents(await res.json());
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await adminFetch("/api/admin/events", {
      method: "POST",
      body: JSON.stringify(form),
    });
    setForm({ title: "", description: "", date: "", location: "", maxGuests: 20 });
    setShowForm(false);
    loadEvents();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Événements</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            showForm
              ? "bg-cream text-gray-600 hover:bg-cream-dark"
              : "bg-wine text-white hover:bg-wine-light"
          }`}
        >
          {showForm ? "Annuler" : "+ Nouvel événement"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-cream-dark rounded-2xl p-8 mb-6 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-cream-dark rounded-xl px-4 py-3 bg-cream/50 text-gray-900 transition-all"
              placeholder="Ex: Vins naturels du Jura"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-cream-dark rounded-xl px-4 py-3 bg-cream/50 text-gray-900 transition-all"
              rows={2}
              placeholder="Décrivez l'événement..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date & heure
              </label>
              <input
                type="datetime-local"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-cream-dark rounded-xl px-4 py-3 bg-cream/50 text-gray-900 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Lieu</label>
              <input
                type="text"
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border border-cream-dark rounded-xl px-4 py-3 bg-cream/50 text-gray-900 transition-all"
                placeholder="Adresse ou nom du lieu"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre de places
            </label>
            <input
              type="number"
              min={1}
              required
              value={form.maxGuests}
              onChange={(e) =>
                setForm({ ...form, maxGuests: parseInt(e.target.value) || 1 })
              }
              className="w-32 border border-cream-dark rounded-xl px-4 py-3 bg-cream/50 text-gray-900 transition-all"
            />
          </div>
          <button className="bg-wine text-white px-8 py-3 rounded-xl font-medium hover:bg-wine-light transition-colors">
            Créer l&apos;événement
          </button>
        </form>
      )}

      <div className="space-y-3">
        {events.map((event) => {
          const totalGuests = event.registrations.reduce(
            (sum, r) => sum + r.guests,
            0
          );
          const isPast = new Date(event.date) < new Date();

          return (
            <Link
              key={event.id}
              href={`/admin/events/${event.id}`}
              className="group block bg-white border border-cream-dark rounded-xl p-5 hover:border-gold/50 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-gray-900 group-hover:text-wine transition-colors">
                    {event.title}
                    {isPast && (
                      <span className="text-gray-400 text-xs font-normal ml-2">(passé)</span>
                    )}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {new Date(event.date).toLocaleDateString("fr-FR", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" — "}
                    {event.location}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-gray-700 font-medium">
                    {totalGuests}/{event.maxGuests}
                  </p>
                  {event.waitlist.length > 0 && (
                    <p className="text-gold text-xs">
                      +{event.waitlist.length} en attente
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
        {events.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            Aucun événement. Créez-en un !
          </div>
        )}
      </div>
    </div>
  );
}
