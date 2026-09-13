import { apiClient, setAccessToken } from '../client'
import {
  LoginResultSchema,
  MeResultSchema,
  type LoginInput,
  type GithubLoginInput,
  type LoginResult,
  type MeResult,
} from '../types/auth'

export async function login(input: LoginInput): Promise<LoginResult> {
  const response = await apiClient.post('/v1/auth/login', input)
  const result = LoginResultSchema.parse(response.data)
  setAccessToken(result.accessToken)

  return result
}

export async function githubLogin(input: GithubLoginInput): Promise<LoginResult> {
  const response = await apiClient.post('/v1/auth/external/login/github', input)
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
