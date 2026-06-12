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
import { emailDeliveriesHandlers } from './email-deliveries'
import { flowsHandlers } from './flows'

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
  // email-templates + email-deliveries TRƯỚC flows: các path explicit
  // (trigger-catalog, anchor-catalog, runs) phải match trước GET /cms/flows/:id
  ...emailTemplatesHandlers,
  ...emailDeliveriesHandlers,
  ...flowsHandlers,
]
