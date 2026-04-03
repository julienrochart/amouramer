"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Registration {
  type: "registration" | "waitlist";
  name: string;
  email: string;
  guests: number;
  event: {
    title: string;
    date: string;
    location: string;
  };
}

export default function EditRegistration() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<Registration | null>(null);
  const [form, setForm] = useState({ name: "", email: "", guests: 1 });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/registrations/${token}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setForm({ name: d.name, email: d.email, guests: d.guests });
      });
  }, [token]);

  if (cancelled) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="bg-white rounded-2xl border border-cream-dark p-10">
          <div className="text-3xl mb-4">&#128075;</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registration cancelled</h1>
          <p className="text-gray-500">Your registration has been successfully cancelled.</p>
        </div>
      </div>
    );
  }

  if (!data)
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center text-gray-400">
        Loading...
      </div>
    );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(`/api/registrations/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel your registration?")) return;
    await fetch(`/api/registrations/${token}`, { method: "DELETE" });
    setCancelled(true);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="bg-white rounded-2xl border border-cream-dark p-8 sm:p-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Registration</h1>

        <div className="bg-cream rounded-xl p-5 mb-8">
          <h2 className="font-semibold text-gray-900 text-lg">{data.event.title}</h2>
          <div className="flex flex-wrap gap-3 mt-2">
            <span className="text-sm text-gray-600 flex items-center gap-1.5">
              <span className="text-gold">&#128197;</span>
              {new Date(data.event.date).toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="text-sm text-gray-500 flex items-center gap-1.5">
              <span className="text-gold">&#128205;</span>
              {data.event.location}
            </span>
          </div>
          {data.type === "waitlist" && (
            <span className="inline-block mt-3 text-xs font-medium text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full">
              Waitlist
            </span>
          )}
        </div>

        {data.type === "registration" && (
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-cream-dark rounded-xl px-4 py-3 bg-cream/50 text-gray-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-cream-dark rounded-xl px-4 py-3 bg-cream/50 text-gray-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Number of guests
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

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {saved && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
                Changes saved!
              </div>
            )}

            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-wine text-white px-8 py-3 rounded-xl font-medium hover:bg-wine-light transition-colors disabled:opacity-50"
              >
                {saving ? "..." : "Save"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                Cancel my registration
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
