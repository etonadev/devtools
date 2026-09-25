import { Braces, Heart, Moon, Sun } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { PRODUCT_NAME, tools } from '../../app/config'
import { useTheme } from '../../hooks/useTheme'

const themeIcons = { light: Sun, dark: Moon }

export function AppShell() {
  const { theme, setTheme } = useTheme()
  const ThemeIcon = themeIcons[theme]
  const nextTheme = theme === 'light' ? 'dark' : 'light'
  return <div className="app-shell">
    <header className="site-header">
      <NavLink className="brand" to="/" aria-label={`${PRODUCT_NAME} home`}><span className="brand-mark"><Braces size={19} /></span><span>{PRODUCT_NAME}</span></NavLink>
      <nav className="tool-nav" aria-label="Developer tools">
        {tools.map((tool) => <NavLink key={tool.id} to={tool.path} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{tool.shortName}</NavLink>)}
      </nav>
      <div className="header-actions"><NavLink className="support-link" to="/support" aria-label={`Support ${PRODUCT_NAME}`}><Heart size={16} aria-hidden /><span>Support</span></NavLink><button className="icon-button theme-button" onClick={() => setTheme(nextTheme)} aria-label={`Theme: ${theme}. Switch to ${nextTheme}`} title={`Using ${theme} theme`}><ThemeIcon size={18} /></button></div>
    </header>
    <div className="mobile-tool-nav" aria-label="Developer tools">{tools.map((tool) => <NavLink key={tool.id} to={tool.path}>{tool.shortName}</NavLink>)}</div>
    <Outlet />
    <footer className="site-footer">
      <div><strong>{PRODUCT_NAME} © {new Date().getFullYear()}</strong></div>
      <nav aria-label="Footer navigation"><NavLink to="/about">About</NavLink><NavLink to="/privacy">Privacy</NavLink><NavLink to="/contact">Contact</NavLink><NavLink to="/support">Support</NavLink></nav>
    </footer>
  </div>
}
