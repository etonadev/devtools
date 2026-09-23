import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function storedTheme(): Theme | null {
  try {
    const stored = localStorage.getItem('devtools-theme')
    if (stored === 'light' || stored === 'dark') return stored
    if (stored) localStorage.removeItem('devtools-theme')
  } catch { /* Theme preference storage is optional. */ }
  return null
}

export function useTheme() {
  const [manualTheme, setManualTheme] = useState<Theme | null>(() => storedTheme())
  const [theme, setActiveTheme] = useState<Theme>(() => storedTheme() || systemTheme())

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const followSystem = () => {
      if (!manualTheme) setActiveTheme(media.matches ? 'dark' : 'light')
    }
    media.addEventListener('change', followSystem)
    return () => media.removeEventListener('change', followSystem)
  }, [manualTheme])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b1020' : '#f4f7fb')
  }, [theme])

  const setTheme = (nextTheme: Theme) => {
    setManualTheme(nextTheme)
    setActiveTheme(nextTheme)
    try { localStorage.setItem('devtools-theme', nextTheme) } catch { /* Theme preference storage is optional. */ }
  }

  return { theme, setTheme }
}
