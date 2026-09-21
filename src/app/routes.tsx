import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'

const HomePage = lazy(() => import('../pages/HomePage').then((module) => ({ default: module.HomePage })))
const ToolPage = lazy(() => import('../features/shared/ToolPage').then((module) => ({ default: module.ToolPage })))
const InfoPage = lazy(() => import('../pages/InfoPage').then((module) => ({ default: module.InfoPage })))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })))

export function AppRoutes() {
  return <Suspense fallback={<div className="route-loading">Heating the anvil…</div>}><Routes><Route element={<AppShell />}><Route index element={<HomePage />} /><Route path="json-formatter" element={<ToolPage id="json" />} /><Route path="yaml-formatter" element={<ToolPage id="yaml" />} /><Route path="xml-formatter" element={<ToolPage id="xml" />} /><Route path="sql-formatter" element={<ToolPage id="sql" />} /><Route path="markdown-editor" element={<ToolPage id="markdown" />} /><Route path="about" element={<InfoPage page="about" />} /><Route path="privacy" element={<InfoPage page="privacy" />} /><Route path="contact" element={<InfoPage page="contact" />} /><Route path="*" element={<NotFoundPage />} /></Route></Routes></Suspense>
}
