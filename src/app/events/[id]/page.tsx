"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
  maxGuests: number;
  totalGuests: number;
  spotsLeft: number;
  products: { id: string; name: string; description: string | null; price: number | null }[];
}

export default function EventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [form, setForm] = useState({ name: "", email: "", guests: 1 });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ status: string; token?: string } | null>(null);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((r) => r.json())
      .then(setEvent);
  }, [id]);

  if (!event)
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center text-gray-400">
        Chargement...
      </div>
    );

  const isPast = new Date(event.date) < new Date();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, eventId: id }),
    });

    const data = await res.json();
    setResult(data);
    setSubmitting(false);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <button
        onClick={() => router.push("/")}
        className="text-sm text-gray-400 hover:text-wine transition-colors mb-8 flex items-center gap-1"
      >
        &larr; Tous les événements
      </button>

      <div className="bg-white rounded-2xl border border-cream-dark p-8 sm:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm bg-cream rounded-lg px-4 py-2">
              <span className="text-gold text-base">&#128197;</span>
              <span className="text-gray-700">
                {new Date(event.date).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm bg-cream rounded-lg px-4 py-2">
              <span className="text-gold text-base">&#128205;</span>
              <span className="text-gray-700">{event.location}</span>
            </div>
          </div>

          {event.description && (
            <p className="mt-6 text-gray-600 leading-relaxed">{event.description}</p>
          )}

          <div className="mt-6">
            <span
              className={`inline-block text-sm font-medium px-4 py-1.5 rounded-full ${
                event.spotsLeft > 0
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-wine/10 text-wine border border-wine/20"
              }`}
            >
              {event.spotsLeft > 0
                ? `${event.spotsLeft} places restantes sur ${event.maxGuests}`
                : "Complet — inscription en liste d'attente"}
            </span>
          </div>
        </div>

        {/* Products (past events) */}
        {isPast && event.products.length > 0 && (
          <div className="border-t border-cream-dark pt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Produits dégustés
            </h2>
            <div className="grid gap-3">
              {event.products.map((p) => (
                <div
                  key={p.id}
                  className="bg-cream rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <span className="font-medium text-gray-900">{p.name}</span>
                    {p.description && (
                      <span className="text-gray-500 text-sm ml-2">— {p.description}</span>
                    )}
                  </div>
                  {p.price && (
                    <span className="text-wine font-semibold">{p.price.toFixed(2)} €</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Registration form */}
        {!isPast && !result && (
          <div className="border-t border-cream-dark pt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {event.spotsLeft > 0 ? "S'inscrire" : "Rejoindre la liste d'attente"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-cream-dark rounded-xl px-4 py-3 bg-cream/50 text-gray-900 placeholder-gray-400 transition-all"
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-cream-dark rounded-xl px-4 py-3 bg-cream/50 text-gray-900 placeholder-gray-400 transition-all"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nombre de personnes
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={form.guests}
                  onChange={(e) =>
                    setForm({ ...form, guests: parseInt(e.target.value) || 1 })
                  }
                  className="w-32 border border-cream-dark rounded-xl px-4 py-3 bg-cream/50 text-gray-900 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto bg-wine text-white px-8 py-3 rounded-xl font-medium hover:bg-wine-light transition-colors disabled:opacity-50"
              >
                {submitting
                  ? "Inscription..."
                  : event.spotsLeft > 0
                    ? "S'inscrire"
                    : "Rejoindre la liste d'attente"}
              </button>
            </form>
          </div>
        )}

        {/* Success */}
        {result && (
          <div className="border-t border-cream-dark pt-8">
            {result.status === "registered" ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-3">&#127870;</div>
                <h2 className="text-xl font-semibold text-green-800 mb-2">
                  Inscription confirmée !
                </h2>
                <p className="text-green-700">
                  Un email de confirmation vous a été envoyé.
                </p>
                {result.token && (
                  <a
                    href={`/registration/${result.token}`}
                    className="inline-block mt-4 text-sm text-wine hover:text-wine-light underline underline-offset-4"
                  >
                    Modifier mon inscription
                  </a>
                )}
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-3">&#128221;</div>
                <h2 className="text-xl font-semibold text-amber-800 mb-2">
                  Liste d&apos;attente
                </h2>
                <p className="text-amber-700">
                  L&apos;événement est complet. Vous serez notifié si une place se libère.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
