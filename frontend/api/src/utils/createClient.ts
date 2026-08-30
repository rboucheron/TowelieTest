import axios from "axios";
import type { AxiosInstance } from "axios";

const getTokenFromCookie = (): string | null => {
  if (typeof document === "undefined") {
    return null;
  }

  const tokenMatch = document.cookie.match(/(?:^|; )token_auth=([^;]+)/) || [''];
  return tokenMatch[1] ? decodeURIComponent(tokenMatch[1]) : null;
};

export const createClient = (baseURL: string) => {
  const client = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use((config) => {
    const token = getTokenFromCookie();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  return client;
};

export const apiClient: AxiosInstance = createClient(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
);
