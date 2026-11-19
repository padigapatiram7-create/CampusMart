import Cookies from 'js-cookie'

export const BASE_URL = import.meta.env.VITE_API_BASE_URL
export const apiUrl = path => `${BASE_URL}${path}`
const ACCESS_TOKEN_KEY = 'jwt_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export const getAccessToken = () => Cookies.get(ACCESS_TOKEN_KEY)
export const getRefreshToken = () => Cookies.get(REFRESH_TOKEN_KEY)
export const saveTokens = ({ access, refresh }) => {
  Cookies.set(ACCESS_TOKEN_KEY, access, { expires: 30 })
  if (refresh) Cookies.set(REFRESH_TOKEN_KEY, refresh, { expires: 30 })
}
export const clearTokens = () => {
  Cookies.remove(ACCESS_TOKEN_KEY)
  Cookies.remove(REFRESH_TOKEN_KEY)
  localStorage.removeItem('campusmart_user')
}

export const apiFetch = async (path, options = {}) => {
  const request = async () => {
    const headers = { ...(options.headers || {}) }
    let body = options.body
    if (body && typeof body !== 'string') {
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(body)
    }
    const token = getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
    const response = await fetch(apiUrl(path), { ...options, body, headers })
    let data = null
    if (response.status !== 204) {
      try { data = await response.json() } catch { data = null }
    }
    return { response, data }
  }

  let { response, data } = await request()

  if (response.status === 401 && !path.includes('/api/users/login/') && !path.includes('/api/users/refresh/') && getRefreshToken()) {
    try {
      const refreshResponse = await fetch(apiUrl('/api/users/refresh/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: getRefreshToken() }),
      })
      if (refreshResponse.ok) {
        const refreshed = await refreshResponse.json()
        saveTokens(refreshed)
        ;({ response, data } = await request())
      } else {
        clearTokens()
        if (typeof window !== 'undefined') window.location.assign('/login')
      }
    } catch {
      clearTokens()
      if (typeof window !== 'undefined') window.location.assign('/login')
    }
  } else if (response.status === 401 && !path.includes('/api/users/login/') && !path.includes('/api/users/refresh/')) {
    clearTokens()
    if (typeof window !== 'undefined') window.location.assign('/login')
  }

  if (!response.ok) {
    const detail = data?.detail || (data && typeof data === 'object' ? Object.values(data)[0]?.[0] || Object.values(data)[0] : 'Something went wrong')
    const error = new Error(detail)
    error.status = response.status
    error.data = data
    throw error
  }
  return data
}
