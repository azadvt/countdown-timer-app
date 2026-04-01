import { useMemo } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";

/*
  Thin wrapper around fetch that grabs the session token
  from App Bridge so every request to our backend is authenticated.
*/
export function useAuthenticatedFetch() {
  const app = useAppBridge();

  return useMemo(() => {
    return async (url, options = {}) => {
      const token = await app.idToken();
      const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const response = await fetch(url, { ...options, headers });
      return response;
    };
  }, [app]);
}
