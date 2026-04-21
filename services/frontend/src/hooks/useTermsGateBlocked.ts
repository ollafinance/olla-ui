import { useEffect, useState } from "react";

const EVENT = "olla:terms-gate-blocked";
let blocked = false;
const listeners = new Set<() => void>();

function notify() {
  for (const fn of listeners) fn();
}

if (typeof window !== "undefined") {
  window.addEventListener(EVENT, () => {
    blocked = true;
    notify();
  });
}

export function clearTermsGateBlocked() {
  if (!blocked) return;
  blocked = false;
  notify();
}

export function useTermsGateBlocked(): boolean {
  const [value, setValue] = useState(blocked);
  useEffect(() => {
    const fn = () => setValue(blocked);
    listeners.add(fn);
    fn();
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return value;
}
