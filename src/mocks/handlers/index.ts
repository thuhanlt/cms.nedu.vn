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
]
