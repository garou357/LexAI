import React, { useState } from 'react'
import { LayoutGrid, Mail, Lock, ArrowRight } from 'lucide-react'

const AuthForm = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const API_BASE = import.meta.env.VITE_API_URL || ''
    const endpoint = isLogin ? `${API_BASE}/api/auth/login` : `${API_BASE}/api/auth/signup`
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        localStorage.setItem('lexai_token', data.token)
        localStorage.setItem('lexai_user', JSON.stringify(data.user))
        onAuthSuccess(data.token, data.user)
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#1e1e1e',
        border: '1px solid var(--border-color)',
        borderRadius: '24px',
        width: '440px',
        padding: '48px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ 
            backgroundColor: '#3b82f6', 
            padding: '10px', 
            borderRadius: '12px',
            marginBottom: '16px',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
          }}>
            <LayoutGrid size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#fff' }}>LexAI</h1>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
            {isLogin ? 'Sign in to access your contracts' : 'Start analyzing your legal documents today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              color: '#ef4444', 
              padding: '12px', 
              borderRadius: '10px', 
              fontSize: '14px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              {error}
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  backgroundColor: '#252525',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px 12px 12px 44px',
                  color: '#fff',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  backgroundColor: '#252525',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px 12px 12px 44px',
                  color: '#fff',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign in' : 'Create account')}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              fontWeight: '600',
              cursor: 'pointer',
              padding: 0
            }}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthForm
