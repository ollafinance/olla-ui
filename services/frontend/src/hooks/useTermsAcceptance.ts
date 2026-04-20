import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "olla:terms-accepted-v1";
const EVENT = "olla:terms-accepted-change";

function readAccepted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function useTermsAcceptance() {
  const [accepted, setAccepted] = useState<boolean>(() => readAccepted());

  useEffect(() => {
    const sync = () => setAccepted(readAccepted());
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT, sync);
    };
  }, []);

  const accept = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      /* noop */
    }
    setAccepted(true);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { accepted, accept };
}
