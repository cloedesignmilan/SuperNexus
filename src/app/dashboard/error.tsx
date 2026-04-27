'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard Error Caught:', error)
  }, [error])

  return (
    <div style={{ padding: '2rem', color: '#ff4444', backgroundColor: '#111', height: '100%' }}>
      <h2>Something went wrong in the Dashboard!</h2>
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', marginTop: '1rem', padding: '1rem', background: '#222', borderRadius: '8px' }}>
        {error.message}
        <br/>
        {error.stack}
      </pre>
      <button
        onClick={() => reset()}
        style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Try again
      </button>
    </div>
  )
}
