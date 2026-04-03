export function adminFetch(url: string, options: RequestInit = {}) {
  const password = sessionStorage.getItem("admin_password") || "";
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${password}`,
      ...options.headers,
    },
  });
}
