'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [message, setMessage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const fetchHello = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/hello')
      const data = await response.json()
      setMessage(data.message)
    } catch (error) {
      setMessage('Error fetching message')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHello()
  }, [])

  return (
    <main style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '1rem',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Hello Next.js!
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
          Full-stack application with frontend and backend
        </p>
        <div style={{ 
          padding: '1.5rem', 
          background: 'rgba(255, 255, 255, 0.2)', 
          borderRadius: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
            Backend Response:
          </p>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <p style={{ fontSize: '1.5rem', color: '#ffd700' }}>
              {message}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={fetchHello}
            disabled={loading}
            style={{
              padding: '0.75rem 2rem',
              fontSize: '1.1rem',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Refresh Message
          </button>
          <a 
            href="/audio-recording"
            style={{
              padding: '0.75rem 2rem',
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'transform 0.2s',
              textDecoration: 'none',
              display: 'inline-block'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            🎤 Gravar Áudio
          </a>
        </div>
      </div>
    </main>
  )
}
