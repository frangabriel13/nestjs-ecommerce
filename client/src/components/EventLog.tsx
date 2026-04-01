import { useEffect, useState } from 'react'

interface DomainEvent {
  event: string
  payload: unknown
  timestamp: string
}

export function EventLog() {
  const [events, setEvents] = useState<DomainEvent[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const es = new EventSource('http://localhost:3000/events')

    es.onopen = () => setConnected(true)

    es.onmessage = (e) => {
      const parsed = JSON.parse(e.data)
      setEvents((prev) => [
        { ...parsed, timestamp: new Date().toLocaleTimeString() },
        ...prev,
      ])
    }

    es.onerror = () => setConnected(false)

    return () => es.close()
  }, [])

  return (
    <div>
      <h3>
        Domain Events{' '}
        <small style={{ color: connected ? 'green' : 'red' }}>
          {connected ? '● connected' : '○ disconnected'}
        </small>
      </h3>
      {events.length === 0 && <p>Waiting for events...</p>}
      {events.map((ev, i) => (
        <div key={i} style={{ marginBottom: '0.75rem', borderLeft: '3px solid #888', paddingLeft: '0.5rem' }}>
          <strong>[{ev.timestamp}] {ev.event}</strong>
          <pre style={{ margin: 0, fontSize: '0.8rem' }}>
            {JSON.stringify(ev.payload, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  )
}
