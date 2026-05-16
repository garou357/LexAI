import React, { useEffect } from 'react'
import { CheckCircle, X } from 'lucide-react'

const Toast = ({ message, isOpen, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose, duration])

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      backgroundColor: '#1e1e1e',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
      zIndex: 2000,
      animation: 'slideIn 0.3s ease-out'
    }}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <CheckCircle size={18} color="#10b981" />
      <span style={{ fontSize: '14px', color: '#fff', fontWeight: '500' }}>{message}</span>
      <button 
        onClick={onClose}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--text-muted)', 
          cursor: 'pointer',
          padding: '2px',
          display: 'flex'
        }}
      >
        <X size={16} />
      </button>
    </div>
  )
}

export default Toast
