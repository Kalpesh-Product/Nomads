import { api } from "../utils/axios";
import { useCallback } from "react";
import {
  clearStoredLoginState,
  storeLoginState,
} from "./useNomadLoginState";
import useAuth from "./useAuth";

export default function useRefresh() {
  const { setAuth } = useAuth();
  const refresh = useCallback(async () => {
    try {
      const response = await api.get("auth/refresh", {
        withCredentials: true,
      });
      setAuth((prevState) => {
        return {
          ...prevState,
          accessToken: response.data.accessToken,
          user: response.data.user,
        };
      });
      storeLoginState();
      return response.data;
    } catch (error) {
      setAuth((prevState) => {
        return {
          ...prevState,
          accessToken: "",
          user: null,
        };
      });
      clearStoredLoginState();
    }
  }, [setAuth]);
  return refresh;
}
