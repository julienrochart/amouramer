"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_password");
    if (saved) setAuthed(true);
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    sessionStorage.setItem("admin_password", password);
    setAuthed(true);
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-6 py-24">
        <div className="bg-white rounded-2xl border border-cream-dark p-8 text-center">
          <div className="w-12 h-12 bg-wine rounded-full flex items-center justify-center text-white text-sm font-bold mx-auto mb-4">
            AA
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Administration</h1>
          <p className="text-gray-400 text-sm mb-6">Log in to continue</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-cream-dark rounded-xl px-4 py-3 bg-cream/50 text-center text-gray-900 transition-all"
            />
            <button className="w-full bg-wine text-white px-6 py-3 rounded-xl font-medium hover:bg-wine-light transition-colors">
              Log in
            </button>
          </form>
        </div>
      </div>
    );
  }

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <nav className="flex items-center gap-1 mb-8 bg-white rounded-xl border border-cream-dark p-1.5">
        <Link
          href="/admin"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/admin"
              ? "bg-wine text-white"
              : "text-gray-600 hover:text-wine hover:bg-cream"
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/admin/events"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive("/admin/events")
              ? "bg-wine text-white"
              : "text-gray-600 hover:text-wine hover:bg-cream"
          }`}
        >
          Events
        </Link>
        <Link
          href="/"
          className="ml-auto px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-wine transition-colors"
        >
          View site &rarr;
        </Link>
      </nav>
      {children}
    </div>
  );
}
