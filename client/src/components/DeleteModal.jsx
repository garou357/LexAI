import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

const DeleteModal = ({ isOpen, onClose, onConfirm, filename }) => {
  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#1e1e1e',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        width: '400px',
        maxWidth: '90%',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            padding: '8px', 
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={20} color="#ef4444" />
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0', color: '#fff' }}>Delete Document?</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
            Are you sure you want to delete <span style={{ color: '#fff', fontWeight: '500' }}>"{filename}"</span>? 
            This action cannot be undone and will permanently remove all associated chat history.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button 
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'transparent',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#ef4444',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteModal
