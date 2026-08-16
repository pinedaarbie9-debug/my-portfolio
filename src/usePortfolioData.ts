import { useState, useCallback } from 'react'
import { type PortfolioData, DEFAULT_DATA } from './types'

const STORAGE_KEY = 'portfolio_data'

function load(): PortfolioData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_DATA, ...JSON.parse(raw) }
  } catch {}
  return DEFAULT_DATA
}

export function usePortfolioData() {
  const [data, setData] = useState<PortfolioData>(load)

  const save = useCallback((next: PortfolioData) => {
    setData(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
  }, [])

  const update = useCallback(<K extends keyof PortfolioData>(key: K, value: PortfolioData[K]) => {
    setData(prev => {
      const next = { ...prev, [key]: value }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setData(DEFAULT_DATA)
  }, [])

  return { data, save, update, reset }
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
