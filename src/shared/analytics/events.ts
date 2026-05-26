export type AnalyticsEventName =
  | 'login_success'
  | 'logout'
  | 'challenge_created'
  | 'challenge_saved'
  | 'article_published'
  | 'article_saved'
  | 'lesson_created'
  | 'persona_publish_all'
  | 'settings_saved'
  | 'soon_clicked'

export interface AnalyticsEvent {
  name: AnalyticsEventName
  params?: Record<string, unknown>
}

export const event = (name: AnalyticsEventName, params?: Record<string, unknown>): AnalyticsEvent => ({
  name,
  params,
})
