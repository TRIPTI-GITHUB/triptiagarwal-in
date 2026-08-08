"use client";

import { useSyncExternalStore } from "react";

function eventName(key: string) {
  return "museum-storage:" + key;
}

function subscribe(key: string) {
  return (callback: () => void) => {
    const event = eventName(key);
    window.addEventListener(event, callback);
    window.addEventListener("storage", callback);
    return () => {
      window.removeEventListener(event, callback);
      window.removeEventListener("storage", callback);
    };
  };
}

/**
 * useSyncedLocalStorage
 * A single localStorage-backed value kept in sync with React via
 * useSyncExternalStore, so reading it doesn't need a mount-time
 * setState-in-effect (which the stricter react-hooks lint rejects) and
 * doesn't risk a server/client hydration mismatch the way a plain
 * useState+useEffect read of `window.localStorage` would - the third
 * argument gives React a stable value to use for the server/initial
 * render. Since `storage` events don't fire in the tab that made the
 * change, `setValue` also dispatches a same-tab custom event so this
 * tab's own toggle updates immediately.
 */
export function useSyncedLocalStorage<T>(
  key: string,
  decode: (raw: string | null) => T,
  encode: (value: T) => string | null
): [T, (value: T) => void] {
  const value = useSyncExternalStore(
    subscribe(key),
    () => decode(window.localStorage.getItem(key)),
    () => decode(null)
  );

  function setValue(next: T) {
    const encoded = encode(next);
    if (encoded === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, encoded);
    }
    window.dispatchEvent(new Event(eventName(key)));
  }

  return [value, setValue];
}
