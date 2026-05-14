const ACCESS_KEY = 'cc_access_token'
const REFRESH_KEY = 'cc_refresh_token'
const LEGACY_KEY = 'cc_token'

export const tokenStore = {
  get() {
    return localStorage.getItem(ACCESS_KEY) || localStorage.getItem(LEGACY_KEY)
  },
  getRefresh() {
    return localStorage.getItem(REFRESH_KEY)
  },
  set(accessToken, refreshToken) {
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken)
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
    localStorage.removeItem(LEGACY_KEY)
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(LEGACY_KEY)
  },
}
