export function adminFetch(url: string, options: RequestInit = {}) {
  const password = sessionStorage.getItem("admin_password") || "";
  return fetch(url, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${password}`,
      ...options.headers,
    },
  });
}
