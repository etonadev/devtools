import { Braces, ChevronDown, Github, Monitor, Moon, Sun } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { PRODUCT_NAME, tools } from '../../app/config'
import { useTheme, type Theme } from '../../hooks/useTheme'
import { AnalyticsPreferencesButton } from '../analytics/AnalyticsManager'

const themeIcons = { light: Sun, dark: Moon, system: Monitor }

export function AppShell() {
  const { theme, setTheme } = useTheme()
  const ThemeIcon = themeIcons[theme]
  const nextTheme: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' }
  return <div className="app-shell">
    <header className="site-header">
      <NavLink className="brand" to="/" aria-label={`${PRODUCT_NAME} home`}><span className="brand-mark"><Braces size={19} /></span><span>{PRODUCT_NAME}</span><span className="beta">beta</span></NavLink>
      <nav className="tool-nav" aria-label="Developer tools">
        {tools.map((tool) => <NavLink key={tool.id} to={tool.path} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{tool.shortName}</NavLink>)}
      </nav>
      <button className="icon-button theme-button" onClick={() => setTheme(nextTheme[theme])} aria-label={`Theme: ${theme}. Change theme`} title={`Theme: ${theme}`}><ThemeIcon size={18} /><ChevronDown size={12} /></button>
    </header>
    <div className="mobile-tool-nav" aria-label="Developer tools">{tools.map((tool) => <NavLink key={tool.id} to={tool.path}>{tool.shortName}</NavLink>)}</div>
    <Outlet />
    <footer className="site-footer">
      <div><strong>{PRODUCT_NAME}</strong><span>Local-first tools for careful work.</span></div>
      <nav aria-label="Footer navigation"><NavLink to="/about">About</NavLink><NavLink to="/privacy">Privacy</NavLink><NavLink to="/contact">Contact</NavLink><AnalyticsPreferencesButton /><a href="https://github.com" aria-label="GitHub"><Github size={16} /></a></nav>
    </footer>
  </div>
}
