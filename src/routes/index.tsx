import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@shared/config/query-client'
import { RouteTracker } from '@shared/analytics/RouteTracker'
import { Toaster } from '@shared/components/Toaster'
import { LoginPage } from '@modules/auth/pages/LoginPage'
import { AuthCallbackPage } from '@modules/auth/pages/AuthCallbackPage'
import { AppLayout } from '@shared/components/Layout/AppLayout'
import { OverviewPage } from '@modules/overview/pages/OverviewPage'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminRoute } from './AdminRoute'
import { AppInit } from './AppInit'

// Lazy-load module pages — TipTap + 7-section editor là chunk lớn nhất
const ChallengeListPage = lazy(() => import('@modules/challenges/pages/ChallengeListPage').then((m) => ({ default: m.ChallengeListPage })))
const ChallengeEditorPage = lazy(() => import('@modules/challenges/pages/ChallengeEditorPage').then((m) => ({ default: m.ChallengeEditorPage })))
const ArticleListPage = lazy(() => import('@modules/articles/pages/ArticleListPage').then((m) => ({ default: m.ArticleListPage })))
const ArticleEditorPage = lazy(() => import('@modules/articles/pages/ArticleEditorPage').then((m) => ({ default: m.ArticleEditorPage })))
const LessonListPage = lazy(() => import('@modules/lessons/pages/LessonListPage').then((m) => ({ default: m.LessonListPage })))
const TestConfigPage = lazy(() => import('@modules/test-config/pages/TestConfigPage').then((m) => ({ default: m.TestConfigPage })))
const AlumniListPage = lazy(() => import('@modules/alumni/pages/AlumniListPage').then((m) => ({ default: m.AlumniListPage })))
const ReviewListPage = lazy(() => import('@modules/reviews/pages/ReviewListPage').then((m) => ({ default: m.ReviewListPage })))
const FaqListPage = lazy(() => import('@modules/faqs/pages/FaqListPage').then((m) => ({ default: m.FaqListPage })))
const SettingsPage = lazy(() => import('@modules/settings/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const NotificationConfigPage = lazy(() => import('@modules/notifications/pages/NotificationConfigPage').then((m) => ({ default: m.NotificationConfigPage })))
const EmailTemplateListPage = lazy(() => import('@modules/email-templates/pages/EmailTemplateListPage').then((m) => ({ default: m.EmailTemplateListPage })))
const EmailTemplateEditorPage = lazy(() => import('@modules/email-templates/pages/EmailTemplateEditorPage').then((m) => ({ default: m.EmailTemplateEditorPage })))

function PageFallback() {
  return (
    <div className="p-8 flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-[#2D6A8C] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export function AppRouter() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppInit />
        <RouteTracker />
        <Toaster />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth-callback" element={<AuthCallbackPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<AppLayout />}>
                <Route index element={<Navigate to="overview" replace />} />
                <Route path="overview" element={<OverviewPage />} />
                <Route path="challenges" element={<ChallengeListPage />} />
                <Route path="challenges/:id/edit" element={<ChallengeEditorPage />} />
                <Route path="articles" element={<ArticleListPage />} />
                <Route path="articles/:id/edit" element={<ArticleEditorPage />} />
                <Route path="lessons" element={<LessonListPage />} />
                <Route path="alumni" element={<AlumniListPage />} />
                <Route path="reviews" element={<ReviewListPage />} />
                <Route path="faqs" element={<FaqListPage />} />

                <Route element={<AdminRoute />}>
                  <Route path="test-config" element={<TestConfigPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="notifications" element={<NotificationConfigPage />} />
                  <Route path="email-templates" element={<EmailTemplateListPage />} />
                  <Route path="email-templates/new" element={<EmailTemplateEditorPage />} />
                  <Route path="email-templates/:id/edit" element={<EmailTemplateEditorPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
