import React, { useRef, useEffect } from 'react'
import Message from './Message'
import ChatInput from './ChatInput'
import { FileText, MoreHorizontal, Download } from 'lucide-react'

const ChatArea = ({ activeDoc, messages, onSendMessage, isTyping, token }) => {
  const messagesEndRef = useRef(null)

  const handleExport = async () => {
    if (!activeDoc || !token) return
    
    try {
      const res = await fetch(`/api/documents/${activeDoc.id}/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `LexAI_Report_${activeDoc.filename.replace('.pdf', '')}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (err) {
      console.error('Export failed', err)
    }
  }

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {activeDoc && messages.length > 0 && (
            <button 
              onClick={handleExport}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <Download size={16} />
              Export QnA
            </button>
          )}
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
                    <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
                      {typeof desc === 'object' ? (desc.description || JSON.stringify(desc)) : desc}
                    </div>
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
