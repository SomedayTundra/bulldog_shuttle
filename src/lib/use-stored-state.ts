import { useEffect, useState } from 'react'

const PREFIX = 'bulldog-shuttle:'

function read<T>(key: string, fallback: T, isValid: (v: unknown) => v is T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw == null) return fallback
    const parsed: unknown = JSON.parse(raw)
    return isValid(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

/** useState that remembers its value in localStorage across visits. */
export function useStoredState<T>(key: string, fallback: T, isValid: (v: unknown) => v is T) {
  const [value, setValue] = useState(() => read(key, fallback, isValid))
  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      // storage unavailable (private mode, quota); just don't persist
    }
  }, [key, value])
  return [value, setValue] as const
}
