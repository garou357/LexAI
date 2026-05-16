import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import Toast from './components/Toast'
import './App.css'

function App() {
  const [documents, setDocuments] = useState([])
  const [activeDoc, setActiveDoc] = useState(null)
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [toast, setToast] = useState({ isOpen: false, message: '' })

  const showToast = (message) => {
    setToast({ isOpen: true, message })
  }

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents')
      const data = await res.json()
      setDocuments(data)
      if (data.length > 0 && !activeDoc) {
        setActiveDoc(data[0])
      }
    } catch (err) {
      console.error('Failed to fetch documents', err)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  useEffect(() => {
    if (activeDoc) {
      const fetchMessages = async () => {
        try {
          const res = await fetch(`/api/documents/${activeDoc.id}/messages`)
          const data = await res.json()
          setMessages(data)
        } catch (err) {
          console.error('Failed to fetch messages', err)
        }
      }
      fetchMessages()
    } else {
      setMessages([])
    }
  }, [activeDoc])

  const handleSendMessage = async (text) => {
    if (!activeDoc) return
    
    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    try {
      const res = await fetch(`/api/ask?docId=${activeDoc.id}&q=${encodeURIComponent(text)}`)
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      
      let aiMsg = { role: 'ai', content: '' }
      setMessages(prev => [...prev, aiMsg])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const token = line.substring(6)
            if (token.trim() === '[DONE]') break
            if (token) {
              aiMsg.content += token
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { ...aiMsg }
                return updated
              })
            }
          }
        }
      }
    } catch (err) {
      console.error('Chat error', err)
    } finally {
      setIsTyping(false)
    }
  }

  const handleRemoveDoc = async (id) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      if (res.ok) {
        if (activeDoc?.id === id) {
          setActiveDoc(null)
        }
        fetchDocuments()
        showToast('Document deleted successfully')
      }
    } catch (err) {
      console.error('Failed to delete document', err)
    }
  }

  return (
    <div className="app-container">
      <Sidebar 
        documents={documents} 
        activeDoc={activeDoc} 
        setActiveDoc={setActiveDoc}
        onUploadSuccess={fetchDocuments}
        onRemoveDoc={handleRemoveDoc}
      />
      <ChatArea 
        activeDoc={activeDoc} 
        messages={messages} 
        onSendMessage={handleSendMessage}
        isTyping={isTyping}
      />
      <Toast 
        isOpen={toast.isOpen} 
        message={toast.message} 
        onClose={() => setToast({ ...toast, isOpen: false })} 
      />
    </div>
  )
}

export default App
