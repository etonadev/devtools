import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('devtools-theme') as Theme) || 'system')

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => document.documentElement.dataset.theme = resolveTheme(theme)
    apply()
    localStorage.setItem('devtools-theme', theme)
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  return { theme, setTheme }
}
