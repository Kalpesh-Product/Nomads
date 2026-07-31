import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

const STORAGE_KEY = "nomad-login-query";

const canUseStorage = () => typeof window !== "undefined";

const storageValueIsTrue = (storage) => {
  try {
    return storage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

const setStorageLoginState = (storage) => {
  try {
    storage.setItem(STORAGE_KEY, "true");
  } catch {
    // Storage can be unavailable in restricted browser modes.
  }
};

const removeStorageLoginState = (storage) => {
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable in restricted browser modes.
  }
};

export const readStoredLoginState = () => {
  if (!canUseStorage()) {
    return false;
  }

  return (
    storageValueIsTrue(window.localStorage) ||
    storageValueIsTrue(window.sessionStorage)
  );
};

export const storeLoginState = () => {
  if (!canUseStorage()) {
    return;
  }

  setStorageLoginState(window.localStorage);
  setStorageLoginState(window.sessionStorage);
};

export const clearStoredLoginState = () => {
  if (!canUseStorage()) {
    return;
  }

  removeStorageLoginState(window.localStorage);
  removeStorageLoginState(window.sessionStorage);
};

export default function useNomadLoginState() {
  const location = useLocation();

  const hasLoginQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("login") === "true";
  }, [location.search]);

  useEffect(() => {
    if (!canUseStorage()) {
      return;
    }

    if (hasLoginQuery) {
      storeLoginState();
    }
  }, [hasLoginQuery]);

  return hasLoginQuery || readStoredLoginState();
}
