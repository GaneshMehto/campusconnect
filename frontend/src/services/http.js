import axios from 'axios'
import { tokenStore } from '../utils/tokenStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

const refreshHttp = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

let refreshPromise = null

http.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err?.config
    if (err?.response?.status === 401 && original && !original._retry && tokenStore.getRefresh()) {
      original._retry = true
      try {
        refreshPromise =
          refreshPromise ||
          refreshHttp
            .post('/auth/refresh', { refresh_token: tokenStore.getRefresh() })
            .then(({ data }) => {
              tokenStore.set(data.access_token, data.refresh_token)
              return data.access_token
            })
            .finally(() => {
              refreshPromise = null
            })

        const accessToken = await refreshPromise
        original.headers = original.headers || {}
        original.headers.Authorization = `Bearer ${accessToken}`
        return http(original)
      } catch {
        tokenStore.clear()
        window.dispatchEvent(new Event('auth:expired'))
      }
    } else if (err?.response?.status === 401) {
      tokenStore.clear()
      window.dispatchEvent(new Event('auth:expired'))
    }
    return Promise.reject(err)
  }
)
