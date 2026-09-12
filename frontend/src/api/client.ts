import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// Kept in memory only — never persisted (localStorage/cookies readable by JS are an XSS target).
// The refresh token itself lives in an httpOnly cookie the browser sends automatically.
let accessToken: string | null = null

export const setAccessToken = (token: string | null): void => {
  accessToken = token
}

export const getAccessToken = (): string | null => accessToken

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return config
})

interface RefreshResponse {
  accessToken: string
}

let refreshInFlight: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  refreshInFlight ??= axios
    .post<RefreshResponse>(`${API_URL}/v1/auth/refresh`, undefined, {
      withCredentials: true,
    })
    .then((response) => response.data.accessToken)
    .catch(() => null)
    .finally(() => {
      refreshInFlight = null
    })
  return refreshInFlight
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined
    const isAuthEndpoint = config?.url?.startsWith('/v1/auth/') ?? false

    if (
      error.response?.status === 401 &&
      config &&
      !config._retried &&
      !isAuthEndpoint
    ) {
      config._retried = true
      const newToken = await refreshAccessToken()
      if (newToken) {
        setAccessToken(newToken)
        config.headers.set('Authorization', `Bearer ${newToken}`)
        return apiClient(config)
      }
      setAccessToken(null)
    }

    return Promise.reject(error)
  },
)
