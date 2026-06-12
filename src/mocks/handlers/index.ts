import { authHandlers } from './auth'
import { challengesHandlers } from './challenges'
import { articlesHandlers } from './articles'
import { lessonsHandlers } from './lessons'
import { personasHandlers } from './personas'
import { alumniHandlers } from './alumni'
import { reviewsHandlers } from './reviews'
import { faqsHandlers } from './faqs'
import { settingsHandlers } from './settings'
import { notificationHandlers } from './notifications'
import { emailTemplatesHandlers } from './email-templates'
import { emailWorkflowsHandlers } from './email-workflows'

export const handlers = [
  ...authHandlers,
  ...challengesHandlers,
  ...articlesHandlers,
  ...lessonsHandlers,
  ...personasHandlers,
  ...alumniHandlers,
  ...reviewsHandlers,
  ...faqsHandlers,
  ...settingsHandlers,
  ...notificationHandlers,
  // email-templates TRƯỚC email-workflows: GET trigger-catalog (explicit path)
  // phải match trước GET /cms/email-workflows/:id
  ...emailTemplatesHandlers,
  ...emailWorkflowsHandlers,
]
