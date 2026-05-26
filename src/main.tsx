import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { enableMocking } from './mocks/init'
import { analytics } from './shared/analytics'
import { AppRouter } from './routes'

async function bootstrap() {
  await enableMocking()
  analytics.init()
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppRouter />
    </StrictMode>,
  )
}

void bootstrap()
