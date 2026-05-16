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
