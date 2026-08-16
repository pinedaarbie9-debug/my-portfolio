import { useState, useEffect, useCallback } from 'react'
import { type PortfolioData, DEFAULT_DATA } from './types'
import { supabase, PORTFOLIO_BUCKET, PORTFOLIO_ROW_ID } from './supabaseClient'

const STORAGE_KEY = 'portfolio_data' // still used as a local fallback cache only

function loadLocalCache(): PortfolioData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_DATA, ...JSON.parse(raw) }
  } catch {}
  return DEFAULT_DATA
}

function cacheLocally(next: PortfolioData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch (err) {
    // Local cache is best-effort only — Supabase is the real source of truth now,
    // so a full quota here is not fatal, just log it.
    console.warn('[usePortfolioData] local cache write failed', err)
  }
}

export function usePortfolioData() {
  // Start from the local cache so the page isn't blank while Supabase loads.
  const [data, setData] = useState<PortfolioData>(loadLocalCache)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load the real, shared data from Supabase on mount — this is what every
  // visitor sees, not just the editor's own browser.
  useEffect(() => {
    let cancelled = false

    async function loadFromSupabase() {
      const { data: row, error: fetchError } = await supabase
        .from('portfolio')
        .select('content')
        .eq('id', PORTFOLIO_ROW_ID)
        .maybeSingle()

      if (cancelled) return

      if (fetchError) {
        console.error('[usePortfolioData] failed to load from Supabase', fetchError)
        setError('Could not load live data — showing local/default content.')
        setLoading(false)
        return
      }

      if (row?.content) {
        const merged = { ...DEFAULT_DATA, ...(row.content as Partial<PortfolioData>) }
        setData(merged)
        cacheLocally(merged)
      } else {
        // No row yet (first run) — seed it with whatever we have (default or local cache).
        await supabase.from('portfolio').upsert({ id: PORTFOLIO_ROW_ID, content: data })
      }
      setLoading(false)
    }

    loadFromSupabase()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const persist = useCallback(async (next: PortfolioData) => {
    setData(next)
    cacheLocally(next)
    setSaving(true)
    const { error: upsertError } = await supabase
      .from('portfolio')
      .upsert({ id: PORTFOLIO_ROW_ID, content: next })
    setSaving(false)
    if (upsertError) {
      console.error('[usePortfolioData] failed to save to Supabase', upsertError)
      setError('Saved locally, but failed to publish changes live. Check your connection.')
    } else {
      setError(null)
    }
  }, [])

  const update = useCallback(<K extends keyof PortfolioData>(key: K, value: PortfolioData[K]) => {
    setData(prev => {
      const next = { ...prev, [key]: value }
      persist(next)
      return next
    })
  }, [persist])

  const reset = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY)
    setData(DEFAULT_DATA)
    await supabase.from('portfolio').upsert({ id: PORTFOLIO_ROW_ID, content: DEFAULT_DATA })
  }, [])

  return { data, update, reset, loading, saving, error }
}

/**
 * Uploads a file to Supabase Storage and returns its public URL.
 * Replaces the old fileToDataUrl() base64 approach — base64 strings only ever
 * lived in the uploader's own browser (localStorage), so nobody else who
 * opened the deployed site could ever see them. A real uploaded file with a
 * public URL is visible to every visitor.
 */
export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(PORTFOLIO_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (uploadError) {
    throw new Error(`Image upload failed: ${uploadError.message}`)
  }

  const { data: publicUrlData } = supabase.storage
    .from(PORTFOLIO_BUCKET)
    .getPublicUrl(path)

  return publicUrlData.publicUrl
}