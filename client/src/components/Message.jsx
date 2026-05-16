import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Sparkles } from 'lucide-react'

const Message = ({ role, content }) => {
  const isAi = role === 'ai'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isAi ? 'flex-start' : 'flex-end',
      gap: '8px',
      maxWidth: '100%'
    }}>
      {isAi && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
          <Sparkles size={14} />
          LexAI
        </div>
      )}
      <div style={{
        backgroundColor: isAi ? 'transparent' : 'var(--bg-chat-bubble)',
        color: '#fff',
        padding: isAi ? '0' : '12px 16px',
        borderRadius: '12px',
        maxWidth: '80%',
        fontSize: '15px',
        lineHeight: '1.6',
        border: isAi ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  )
}

export default Message
