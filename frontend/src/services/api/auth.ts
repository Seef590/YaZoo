import type { AuthResponse, LoginPayload, RegisterPayload } from '../../types/auth'
import { apiClient } from './client'

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', payload)

  return response.data
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', payload)

  return response.data
}

export async function logout(): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>('/auth/logout')

  return response.data
}

export async function currentUser(): Promise<AuthResponse> {
  const response = await apiClient.get<AuthResponse>('/auth/me')

  return response.data
}
