import { API_URL, apiClient, setAccessToken } from '../client'
import { LoginResultSchema, MeResultSchema } from '../types/auth'
import type {
  LoginInput,
  LoginResult,
  MeResult,
  RegisterInput,
} from '../types/auth'

/** Full-page navigation target: the backend redirects to GitHub, then back to the app. */
export const GITHUB_LOGIN_URL = `${API_URL}/v1/auth/github`

export async function login(input: LoginInput): Promise<LoginResult> {
  const response = await apiClient.post('/v1/auth/login', input)
  const result = LoginResultSchema.parse(response.data)
  setAccessToken(result.accessToken)
  return result
}

export async function register(input: RegisterInput): Promise<LoginResult> {
  const response = await apiClient.post('/v1/auth/register', input)
  const result = LoginResultSchema.parse(response.data)
  setAccessToken(result.accessToken)
  return result
}

export async function logout(): Promise<void> {
  await apiClient.post('/v1/auth/logout')
  setAccessToken(null)
}

export async function getMe(): Promise<MeResult> {
  const response = await apiClient.get('/v1/me')
  return MeResultSchema.parse(response.data)
}
