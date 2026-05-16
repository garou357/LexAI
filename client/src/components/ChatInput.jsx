import React, { useState } from 'react'
import { Send } from 'lucide-react'

const ChatInput = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (text.trim() && !disabled) {
      onSendMessage(text)
      setText('')
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={disabled ? "Select a document to start asking" : "Ask a question about this contract..."}
        disabled={disabled}
        style={{
          flex: 1,
          backgroundColor: '#1e1e1e',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '14px 48px 14px 16px',
          color: '#fff',
          fontSize: '15px',
          outline: 'none',
          transition: 'border-color 0.2s'
        }}
      />
      <button 
        type="submit" 
        disabled={disabled || !text.trim()}
        style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: text.trim() ? '#3b82f6' : 'transparent',
          border: 'none',
          borderRadius: '8px',
          padding: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: text.trim() ? '#fff' : 'var(--text-muted)',
          transition: 'all 0.2s'
        }}
      >
        <Send size={18} />
      </button>
    </form>
  )
}

export default ChatInput
