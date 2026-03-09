"use client";

import { useCallback, useMemo, useRef, useSyncExternalStore } from "react";

interface ProfileData {
  nickname: string;
  profilePic: string | null;
}

const STORAGE_KEY_PREFIX = "zentrfi-profile-";

// Simple event emitter so all components stay in sync
const listeners = new Set<() => void>();
let version = 0;

function emitChange() {
  version++;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

function readProfile(address: string | undefined): ProfileData | null {
  if (!address || typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${address}`);
    if (!raw) return null;
    return JSON.parse(raw) as ProfileData;
  } catch {
    return null;
  }
}

export function saveProfile(address: string, data: ProfileData) {
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${address}`, JSON.stringify(data));
  emitChange();
}

export function useProfile(address: string | undefined) {
  const cacheRef = useRef<{ version: number; address: string | undefined; data: ProfileData | null }>({
    version: -1,
    address: undefined,
    data: null,
  });

  const getSnapshot = useMemo(() => {
    return () => {
      if (cacheRef.current.version === version && cacheRef.current.address === address) {
        return cacheRef.current.data;
      }
      const data = readProfile(address);
      cacheRef.current = { version, address, data };
      return data;
    };
  }, [address]);

  const getServerSnapshot = () => null;

  const profile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const update = useCallback(
    (data: ProfileData) => {
      if (address) saveProfile(address, data);
    },
    [address]
  );

  return { profile, update };
}
