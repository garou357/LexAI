import React, { useRef, useEffect } from 'react'
import Message from './Message'
import ChatInput from './ChatInput'
import { FileText, MoreHorizontal } from 'lucide-react'

const ChatArea = ({ activeDoc, messages, onSendMessage, isTyping }) => {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="chat-area">
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Asking about</span>
          {activeDoc && (
            <div style={{
              backgroundColor: '#fff',
              color: '#1e3a5f',
              padding: '4px 12px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              <FileText size={14} />
              {activeDoc.filename}
            </div>
          )}
        </div>
        <div style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>
          <MoreHorizontal size={20} />
        </div>
      </div>

      <div className="messages-container">
        {activeDoc?.summary && (
          <div style={{
            backgroundColor: '#1e1e1e',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '12px',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} /> Plain English Summary
            </h4>
            <p style={{ color: '#e2e8f0', margin: 0 }}>{activeDoc.summary}</p>
            
            {activeDoc.clauses && (
              <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {Object.entries(activeDoc.clauses).map(([name, desc]) => (
                  <div key={name} style={{ backgroundColor: '#252525', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontWeight: '600', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{name}</div>
                    <div style={{ fontSize: '13px', color: '#cbd5e1' }}>{desc}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg, idx) => (
          <Message key={idx} role={msg.role} content={msg.content} />
        ))}
        {isTyping && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '4px' }}>
            LexAI is thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <ChatInput onSendMessage={onSendMessage} disabled={!activeDoc} />
      </div>
    </div>
  )
}

export default ChatArea
