"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";

interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
  productsSentAt: string | null;
  maxGuests: number;
  registrations: {
    id: string;
    name: string;
    email: string;
    guests: number;
    token: string;
    createdAt: string;
  }[];
  waitlist: {
    id: string;
    name: string;
    email: string;
    guests: number;
    createdAt: string;
  }[];
  products: {
    id: string;
    name: string;
    description: string | null;
    price: number | null;
  }[];
}

export default function AdminEventDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [productForm, setProductForm] = useState({ name: "", description: "", price: "" });
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    maxGuests: 20,
  });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [id]);

  async function loadEvent() {
    const res = await adminFetch(`/api/admin/events/${id}`);
    if (res.ok) setEvent(await res.json());
  }

  async function handleDelete() {
    if (!event) return;

    const totalRegistered = event.registrations.reduce((sum, r) => sum + r.guests, 0);
    const waitlistCount = event.waitlist.length;
    const hasPeople = event.registrations.length > 0 || waitlistCount > 0;

    const confirmMsg = hasPeople
      ? `Delete "${event.title}"?\n\n${event.registrations.length} registration(s) (${totalRegistered} guest(s)) and ${waitlistCount} waitlist entry/entries will be removed.\n\nThis cannot be undone.`
      : `Delete "${event.title}"? This cannot be undone.`;
    if (!confirm(confirmMsg)) return;

    let notify = false;
    if (hasPeople) {
      notify = confirm(
        `Send an apology email to all ${event.registrations.length + waitlistCount} participant(s)?`
      );
    }

    const res = await adminFetch(`/api/admin/events/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ notify }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(`Failed to delete: ${err.error || res.statusText}`);
      return;
    }

    const data = await res.json().catch(() => ({ notified: 0 }));
    if (notify && data.notified !== undefined) {
      alert(`Event deleted. Apology email sent to ${data.notified} participant(s).`);
    }
    router.push("/admin/events");
  }

  function startEdit() {
    if (!event) return;
    const d = new Date(event.date);
    const pad = (n: number) => String(n).padStart(2, "0");
    const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setEditForm({
      title: event.title,
      description: event.description ?? "",
      date: local,
      location: event.location,
      maxGuests: event.maxGuests,
    });
    setEditing(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    setSavingEdit(true);
    const res = await adminFetch(`/api/admin/events/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: editForm.title,
        description: editForm.description || null,
        date: editForm.date,
        location: editForm.location,
        maxGuests: editForm.maxGuests,
      }),
    });
    setSavingEdit(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(`Failed to update: ${err.error || res.statusText}`);
      return;
    }
    setEditing(false);
    loadEvent();
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    await adminFetch(`/api/admin/events/${id}/products`, {
      method: "POST",
      body: JSON.stringify({
        name: productForm.name,
        description: productForm.description || null,
        price: productForm.price ? parseFloat(productForm.price) : null,
      }),
    });
    setProductForm({ name: "", description: "", price: "" });
    loadEvent();
  }

  async function removeProduct(productId: string) {
    await adminFetch(`/api/admin/events/${id}/products`, {
      method: "DELETE",
      body: JSON.stringify({ productId }),
    });
    loadEvent();
  }

  async function sendProductEmails() {
    if (!confirm("Send the product list to all participants?")) return;
    setSending(true);
    const res = await adminFetch(`/api/admin/events/${id}/send-products`, {
      method: "POST",
    });
    const data = await res.json();
    setSentCount(data.sent);
    setSending(false);
  }

  if (!event)
    return (
      <div className="text-center py-20 text-gray-400">Loading...</div>
    );

  const totalGuests = event.registrations.reduce((sum, r) => sum + r.guests, 0);
  const isPast = new Date(event.date) < new Date();

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <button
            onClick={() => router.push("/admin/events")}
            className="text-sm text-gray-400 hover:text-wine transition-colors mb-3 block"
          >
            &larr; Events
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
          <div className="flex flex-wrap gap-3 mt-2">
            <span className="text-sm text-gray-500">
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="text-sm text-gray-400">&middot; {event.location}</span>
          </div>
          {event.description && (
            <p className="text-gray-500 text-sm mt-2">{event.description}</p>
          )}
          <div className="flex gap-4 mt-3">
            <span className="text-sm font-medium text-gray-700">
              {totalGuests}/{event.maxGuests} registered
            </span>
            {event.waitlist.length > 0 && (
              <span className="text-sm font-medium text-gold">
                +{event.waitlist.length} waitlisted
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={startEdit}
            className="text-sm text-gray-600 hover:text-wine transition-colors border border-cream-dark rounded-lg px-3 py-1.5 hover:bg-cream"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-sm text-red-400 hover:text-red-600 transition-colors border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      {editing && (
        <form
          onSubmit={handleEdit}
          className="bg-white border border-cream-dark rounded-2xl p-8 mb-6 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <input
              type="text"
              required
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full border border-cream-dark rounded-xl px-4 py-3 bg-cream/50 text-gray-900 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full border border-cream-dark rounded-xl px-4 py-3 bg-cream/50 text-gray-900 transition-all"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date & time</label>
              <input
                type="datetime-local"
                required
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                className="w-full border border-cream-dark rounded-xl px-4 py-3 bg-cream/50 text-gray-900 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
              <input
                type="text"
                required
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="w-full border border-cream-dark rounded-xl px-4 py-3 bg-cream/50 text-gray-900 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Max guests</label>
            <input
              type="number"
              min={1}
              required
              value={editForm.maxGuests}
              onChange={(e) =>
                setEditForm({ ...editForm, maxGuests: parseInt(e.target.value) || 1 })
              }
              className="w-32 border border-cream-dark rounded-xl px-4 py-3 bg-cream/50 text-gray-900 transition-all"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={savingEdit}
              className="bg-wine text-white px-8 py-3 rounded-xl font-medium hover:bg-wine-light transition-colors disabled:opacity-50"
            >
              {savingEdit ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="bg-cream text-gray-600 px-6 py-3 rounded-xl font-medium hover:bg-cream-dark transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Registrations */}
      <section className="bg-white border border-cream-dark rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Registrations</h2>
        {event.registrations.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">No registrations</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-dark text-left text-gray-400 text-xs uppercase tracking-wider">
                  <th className="py-3 pr-4">Name</th>
                  <th className="pr-4">Email</th>
                  <th className="pr-4">Guests</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {event.registrations.map((r) => (
                  <tr key={r.id} className="border-b border-cream-dark last:border-0">
                    <td className="py-3 pr-4 font-medium text-gray-900">{r.name}</td>
                    <td className="pr-4 text-gray-600">{r.email}</td>
                    <td className="pr-4 text-gray-700">{r.guests}</td>
                    <td className="text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("en-US")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Waitlist */}
      {event.waitlist.length > 0 && (
        <section className="bg-white border border-cream-dark rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Waitlist
            <span className="text-gold text-sm font-normal ml-2">
              ({event.waitlist.length})
            </span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-dark text-left text-gray-400 text-xs uppercase tracking-wider">
                  <th className="py-3 pr-4">Name</th>
                  <th className="pr-4">Email</th>
                  <th>Guests</th>
                </tr>
              </thead>
              <tbody>
                {event.waitlist.map((w) => (
                  <tr key={w.id} className="border-b border-cream-dark last:border-0">
                    <td className="py-3 pr-4 font-medium text-gray-900">{w.name}</td>
                    <td className="pr-4 text-gray-600">{w.email}</td>
                    <td className="text-gray-700">{w.guests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Products */}
      <section className="bg-white border border-cream-dark rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Products tasted</h2>

        {event.products.length > 0 && (
          <div className="space-y-2 mb-6">
            {event.products.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center bg-cream rounded-xl px-4 py-3"
              >
                <div>
                  <span className="font-medium text-gray-900">{p.name}</span>
                  {p.description && (
                    <span className="text-gray-500 text-sm ml-2">— {p.description}</span>
                  )}
                  {p.price && (
                    <span className="text-wine font-medium ml-3">
                      {p.price.toFixed(2)} €
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeProduct(p.id)}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={addProduct} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Product name</label>
            <input
              type="text"
              required
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              className="w-full border border-cream-dark rounded-lg px-3 py-2 text-sm bg-cream/50 transition-all"
              placeholder="e.g. Domaine Ganevat, Chardonnay 2021"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <input
              type="text"
              value={productForm.description}
              onChange={(e) =>
                setProductForm({ ...productForm, description: e.target.value })
              }
              className="w-full border border-cream-dark rounded-lg px-3 py-2 text-sm bg-cream/50 transition-all"
              placeholder="Notes, grape variety..."
            />
          </div>
          <div className="w-24">
            <label className="block text-xs text-gray-400 mb-1">Price €</label>
            <input
              type="number"
              step="0.01"
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
              className="w-full border border-cream-dark rounded-lg px-3 py-2 text-sm bg-cream/50 transition-all"
            />
          </div>
          <button className="bg-wine text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-wine-light transition-colors shrink-0">
            Add
          </button>
        </form>

        {event.products.length > 0 && (
          <div className="mt-6 pt-6 border-t border-cream-dark">
            {event.productsSentAt ? (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <span>&#9989;</span>
                <span>
                  Product list sent on{" "}
                  {new Date(event.productsSentAt).toLocaleDateString("en-US", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ) : (
              <>
                <button
                  onClick={sendProductEmails}
                  disabled={sending}
                  className="bg-gold text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gold-light transition-colors disabled:opacity-50"
                >
                  {sending
                    ? "Sending..."
                    : "Send product list to participants"}
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  Not sent yet
                </p>
              </>
            )}
            {sentCount !== null && (
              <p className="text-green-600 text-sm mt-3">
                Email sent to {sentCount} participant(s)!
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
