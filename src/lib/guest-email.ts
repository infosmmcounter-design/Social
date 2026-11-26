const KEY = "sf_guest_email";

export function readGuestEmail() {
  if (typeof window === "undefined") return "";
  return (localStorage.getItem(KEY) || "").trim().toLowerCase();
}

export function saveGuestEmail(email: string) {
  const value = email.trim().toLowerCase();
  if (!value || typeof window === "undefined") return;
  localStorage.setItem(KEY, value);
}
