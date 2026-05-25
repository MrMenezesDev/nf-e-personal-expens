import { useState, useCallback } from 'react'

/**
 * Hook que replica a interface do useKV do GitHub Spark,
 * porém persiste os dados no localStorage do navegador.
 * Isso permite que o app funcione fora do ambiente Spark
 * (ex.: GitHub Pages, Vercel, etc.).
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item !== null ? (JSON.parse(item) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const newValue =
          typeof value === 'function'
            ? (value as (prev: T) => T)(prev)
            : value
        try {
          if (newValue === null || newValue === undefined) {
            localStorage.removeItem(key)
          } else {
            localStorage.setItem(key, JSON.stringify(newValue))
          }
        } catch {
          // localStorage pode estar indisponível (modo privado, cota excedida)
        }
        return newValue
      })
    },
    [key],
  )

  return [state, setValue]
}
