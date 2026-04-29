//缓存
export const cache_fn = (key: string, data?: any) => {
  if (data !== undefined) {
    localStorage.setItem(key, JSON.stringify(data))
    return data
  }
  const val = localStorage.getItem(key)
  return val ? JSON.parse(val) : null
}