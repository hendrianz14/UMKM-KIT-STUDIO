"use client";

import { useEffect } from "react";

export default function AuthFlash() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    const info = params.get("info");
    const errorTarget = document.querySelector<HTMLElement>("[data-auth-error]");
    const infoTarget = document.querySelector<HTMLElement>("[data-auth-info]");
    if (errorTarget) {
      errorTarget.textContent = err || "";
    }
    if (infoTarget) {
      infoTarget.textContent = info || "";
    }
  }, []);

  return null;
}
