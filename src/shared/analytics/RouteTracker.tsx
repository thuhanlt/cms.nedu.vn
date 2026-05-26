import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { analytics } from './index'

export function RouteTracker() {
  const location = useLocation()
  useEffect(() => {
    analytics.pageView(location.pathname + location.search)
  }, [location.pathname, location.search])
  return null
}
