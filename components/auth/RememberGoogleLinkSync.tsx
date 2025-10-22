"use client";
import { useEffect } from "react";

export default function RememberGoogleLinkSync() {
  useEffect(() => {
    const cb = document.querySelector<HTMLInputElement>('input[name="remember"]');
    const link = document.getElementById("google-login-link") as HTMLAnchorElement | null;
    const update = () => {
      if (!link) return;
      const u = new URL(link.href, window.location.origin);
      if (cb?.checked) {
        u.searchParams.set("remember", "1");
      } else {
        u.searchParams.set("remember", "0");
      }
      const query = u.searchParams.toString();
      link.href = query ? `${u.pathname}?${query}` : u.pathname;
    };
    update(); cb?.addEventListener("change", update);
    return () => cb?.removeEventListener("change", update);
  }, []);
  return null;
}
