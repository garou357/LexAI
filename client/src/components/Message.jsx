import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Sparkles } from 'lucide-react'

const Message = ({ role, content }) => {
  const isAi = role === 'ai'

  // Helper to highlight citations in text strings
  const highlightCitations = (text) => {
    if (typeof text !== 'string') return text
    const parts = text.split(/(\[Page \d+\])/g)
    return parts.map((part, i) => {
      if (part.match(/\[Page \d+\]/)) {
        return <span key={i} style={{
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          color: '#3b82f6',
          padding: '1px 5px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          margin: '0 2px',
          whiteSpace: 'nowrap',
          verticalAlign: 'middle'
        }}>{part}</span>
      }
      return part
    })
  }

  // Recursive helper to walk through the React tree from markdown
  const processNodes = (children) => {
    return React.Children.map(children, (child) => {
      if (typeof child === 'string') {
        return highlightCitations(child)
      }
      if (React.isValidElement(child) && child.props.children) {
        return React.cloneElement(child, {
          children: processNodes(child.props.children)
        })
      }
      return child
    })
  }

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
        <ReactMarkdown 
          components={{
            p: ({children}) => <p style={{margin: '0 0 12px 0'}}>{processNodes(children)}</p>,
            li: ({children}) => <li style={{marginBottom: '4px'}}>{processNodes(children)}</li>
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export default Message
