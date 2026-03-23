import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

const STORAGE_KEY = "nomad-login-query";

const canUseSessionStorage = () => typeof window !== "undefined";

const readStoredLoginState = () => {
  if (!canUseSessionStorage()) {
    return false;
  }

  return window.sessionStorage.getItem(STORAGE_KEY) === "true";
};

export default function useNomadLoginState() {
  const location = useLocation();

  const hasLoginQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("login") === "true";
  }, [location.search]);

  useEffect(() => {
    if (!canUseSessionStorage()) {
      return;
    }

    if (hasLoginQuery) {
      window.sessionStorage.setItem(STORAGE_KEY, "true");
    }
  }, [hasLoginQuery]);

  return hasLoginQuery || readStoredLoginState();
}
